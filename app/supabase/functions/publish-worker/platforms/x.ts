/**
 * X (Twitter) API v2 publisher
 *
 * Auth model: OAuth 1.0a User Context
 *   - access_token  → stored as "oauth_token" from the 3-legged flow
 *   - refresh_token → stored as "oauth_token_secret" (X doesn't rotate these)
 *
 * Media upload: Twitter v1.1 chunked INIT → APPEND → FINALIZE
 *   The FINALIZE step may require polling for video processing.
 *   Videos > 5 MB MUST use chunked upload; images can use simple upload.
 *
 * TODO (production): implement token refresh if you switch to OAuth 2.0 PKCE.
 */

import type { AccountCredentials, MediaAssetRow, PublishResult } from '../_types.ts';

// ---------------------------------------------------------------------------
// OAuth 1.0a signature helper
// X requires every request to carry a signed Authorization header.
// ---------------------------------------------------------------------------

const X_CONSUMER_KEY    = Deno.env.get('X_CONSUMER_KEY')!;
const X_CONSUMER_SECRET = Deno.env.get('X_CONSUMER_SECRET')!;

async function hmacSha1(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function pctEncode(s: string): string {
  return encodeURIComponent(s)
    .replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28').replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

async function buildOAuth1Header(
  method: string,
  url: string,
  oauthToken: string,
  oauthTokenSecret: string,
  extraParams: Record<string, string> = {},
): Promise<string> {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const timestamp = String(Math.floor(Date.now() / 1000));

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: X_CONSUMER_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: oauthToken,
    oauth_version: '1.0',
    ...extraParams,
  };

  // Build the parameter string (all params sorted, pct-encoded)
  const paramStr = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pctEncode(k)}=${pctEncode(v)}`)
    .join('&');

  const baseStr = [
    method.toUpperCase(),
    pctEncode(url.split('?')[0]),
    pctEncode(paramStr),
  ].join('&');

  const signingKey = `${pctEncode(X_CONSUMER_SECRET)}&${pctEncode(oauthTokenSecret)}`;
  const signature = await hmacSha1(signingKey, baseStr);

  const headerParts = { ...oauthParams, oauth_signature: signature };
  const header = Object.entries(headerParts)
    .map(([k, v]) => `${pctEncode(k)}="${pctEncode(v)}"`)
    .join(', ');

  return `OAuth ${header}`;
}

// ---------------------------------------------------------------------------
// v1.1 Media upload — chunked (required for video, works for images too)
// ---------------------------------------------------------------------------

const MEDIA_UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json';
const CHUNK_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB chunks

async function uploadMediaToX(
  mediaAsset: MediaAssetRow,
  creds: AccountCredentials,
): Promise<string> {
  if (!mediaAsset.public_url) throw new Error('Media asset has no public URL');

  const mediaBytes = await fetch(mediaAsset.public_url).then(r => r.arrayBuffer());
  const totalBytes = mediaBytes.byteLength;
  const isVideo    = mediaAsset.mime_type.startsWith('video/');
  const mediaType  = mediaAsset.mime_type;
  const category   = isVideo ? 'tweet_video' : 'tweet_image';

  // --- INIT ---
  const initAuth = await buildOAuth1Header('POST', MEDIA_UPLOAD_URL, creds.accessToken, creds.refreshToken ?? '');
  const initBody = new URLSearchParams({
    command: 'INIT',
    total_bytes: String(totalBytes),
    media_type: mediaType,
    media_category: category,
  });
  const initRes  = await fetch(MEDIA_UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: initAuth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: initBody,
  });
  if (!initRes.ok) throw new Error(`X INIT failed: ${await initRes.text()}`);
  const { media_id_string: mediaId } = await initRes.json();

  // --- APPEND (chunked) ---
  let segmentIndex = 0;
  let offset = 0;
  while (offset < totalBytes) {
    const chunk      = mediaBytes.slice(offset, offset + CHUNK_SIZE_BYTES);
    const appendAuth = await buildOAuth1Header('POST', MEDIA_UPLOAD_URL, creds.accessToken, creds.refreshToken ?? '');
    const form       = new FormData();
    form.append('command', 'APPEND');
    form.append('media_id', mediaId);
    form.append('segment_index', String(segmentIndex));
    form.append('media', new Blob([chunk], { type: mediaType }));

    const appendRes = await fetch(MEDIA_UPLOAD_URL, {
      method: 'POST',
      headers: { Authorization: appendAuth },
      body: form,
    });
    if (!appendRes.ok) throw new Error(`X APPEND (seg ${segmentIndex}) failed: ${await appendRes.text()}`);

    offset        += CHUNK_SIZE_BYTES;
    segmentIndex  += 1;
  }

  // --- FINALIZE ---
  const finalAuth = await buildOAuth1Header('POST', MEDIA_UPLOAD_URL, creds.accessToken, creds.refreshToken ?? '');
  const finalBody = new URLSearchParams({ command: 'FINALIZE', media_id: mediaId });
  const finalRes  = await fetch(MEDIA_UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: finalAuth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: finalBody,
  });
  if (!finalRes.ok) throw new Error(`X FINALIZE failed: ${await finalRes.text()}`);
  const finalData = await finalRes.json();

  // Video processing is async — poll until state != 'in_progress'
  if (finalData.processing_info?.state === 'in_progress') {
    await pollXMediaProcessing(mediaId, creds, finalData.processing_info.check_after_secs ?? 5);
  }

  return mediaId;
}

async function pollXMediaProcessing(
  mediaId: string,
  creds: AccountCredentials,
  waitSecs: number,
): Promise<void> {
  const statusUrl = `${MEDIA_UPLOAD_URL}?command=STATUS&media_id=${mediaId}`;
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise(r => setTimeout(r, waitSecs * 1000));
    const auth   = await buildOAuth1Header('GET', MEDIA_UPLOAD_URL, creds.accessToken, creds.refreshToken ?? '');
    const res    = await fetch(statusUrl, { headers: { Authorization: auth } });
    const data   = await res.json();
    const state  = data.processing_info?.state;
    if (state === 'succeeded') return;
    if (state === 'failed') throw new Error(`X media processing failed: ${JSON.stringify(data.processing_info)}`);
    waitSecs = data.processing_info?.check_after_secs ?? 5;
  }
  throw new Error('X media processing timed out after 20 polls');
}

// ---------------------------------------------------------------------------
// Publish tweet
// ---------------------------------------------------------------------------

export async function publishToX(
  text: string,
  mediaAssets: MediaAssetRow[],
  creds: AccountCredentials,
): Promise<PublishResult> {
  const mediaIds: string[] = [];
  for (const asset of mediaAssets.slice(0, 4)) { // X allows max 4 images or 1 video
    mediaIds.push(await uploadMediaToX(asset, creds));
  }

  const tweetUrl = 'https://api.twitter.com/2/tweets';
  const body: Record<string, unknown> = { text: text ?? '' };
  if (mediaIds.length) body.media = { media_ids: mediaIds };

  const auth  = await buildOAuth1Header('POST', tweetUrl, creds.accessToken, creds.refreshToken ?? '');
  const res   = await fetch(tweetUrl, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => res.text());
    throw new Error(`X tweet failed (${res.status}): ${JSON.stringify(err)}`);
  }

  const { data } = await res.json();
  const tweetId  = data.id as string;
  const username = creds.platformUsername ?? creds.platformUserId ?? 'i';
  return {
    platformPostId:  tweetId,
    platformPostUrl: `https://x.com/${username}/status/${tweetId}`,
  };
}
