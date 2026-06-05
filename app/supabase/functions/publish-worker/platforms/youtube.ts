/**
 * YouTube Data API v3 publisher — Shorts & regular video uploads
 *
 * Auth model: OAuth 2.0
 *   - access_token in social_accounts.access_token_enc
 *   - refresh_token for renewal (YouTube tokens expire in 1 hour)
 *   - Requires scopes: https://www.googleapis.com/auth/youtube.upload
 *
 * Upload strategy: Resumable upload (recommended by Google for all files > 5 MB)
 *   1. POST /upload/youtube/v3/videos?uploadType=resumable
 *      Body: metadata JSON, headers include X-Upload-Content-Type & X-Upload-Content-Length
 *      Response: 200 with Location header = session URI
 *   2. PUT {session-uri} with binary chunks (Content-Range header)
 *      → 308 Resume Incomplete if more chunks needed
 *      → 200/201 with video resource when complete
 *
 * This implementation:
 *   - Fetches the video binary from Supabase Storage public URL
 *   - Sends it in a SINGLE PUT (works for files < ~500 MB within Edge Function memory)
 *   - For larger files, replace the single PUT with the chunked loop marked TODO below
 *
 * Shorts detection: Videos ≤ 60 s with #Shorts in title/description are promoted as Shorts.
 *
 * Token refresh: Google tokens expire in 3600 s. Implement using:
 *   POST https://oauth2.googleapis.com/token  with grant_type=refresh_token
 *   Store the new access_token back to social_accounts.access_token_enc
 */

import type { AccountCredentials, MediaAssetRow, PublishResult } from '../_types.ts';

const YT_UPLOAD_BASE = 'https://www.googleapis.com/upload/youtube/v3';
const YT_API_BASE    = 'https://www.googleapis.com/youtube/v3';

// ---------------------------------------------------------------------------
// Token refresh helper (Google tokens expire in 1 h)
// Call this before any upload attempt. Returns fresh token.
//
// TODO: persist the new token back to social_accounts via DB callback.
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

export async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Google token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

// ---------------------------------------------------------------------------
// Resumable upload
// ---------------------------------------------------------------------------

async function initiateResumableUpload(
  metadata: Record<string, unknown>,
  mimeType: string,
  contentLength: number,
  accessToken: string,
): Promise<string> {
  const res = await fetch(
    `${YT_UPLOAD_BASE}/videos?uploadType=resumable&part=snippet,status`,
    {
      method: 'POST',
      headers: {
        Authorization:             `Bearer ${accessToken}`,
        'Content-Type':            'application/json; charset=UTF-8',
        'X-Upload-Content-Type':   mimeType,
        'X-Upload-Content-Length': String(contentLength),
      },
      body: JSON.stringify(metadata),
    },
  );
  if (!res.ok) {
    throw new Error(`YouTube initiate upload failed (${res.status}): ${await res.text()}`);
  }
  const location = res.headers.get('Location');
  if (!location) throw new Error('YouTube: no Location header in resumable upload response');
  return location;
}

async function uploadVideoChunks(
  sessionUri: string,
  videoBytes: ArrayBuffer,
  mimeType: string,
): Promise<{ id: string }> {
  // Single-chunk upload (fits in Edge Function memory for files < ~500 MB)
  // TODO: for large files, split into chunks of 256 KB * N and loop,
  //   sending Content-Range: bytes 0-<end>/<total> on each PUT,
  //   handling 308 Resume Incomplete responses.
  const res = await fetch(sessionUri, {
    method: 'PUT',
    headers: {
      'Content-Type':   mimeType,
      'Content-Length': String(videoBytes.byteLength),
      'Content-Range':  `bytes 0-${videoBytes.byteLength - 1}/${videoBytes.byteLength}`,
    },
    body: videoBytes,
  });

  if (!res.ok && res.status !== 201) {
    throw new Error(`YouTube video upload failed (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Publish video / Short
// ---------------------------------------------------------------------------

export async function publishToYouTube(
  caption: string,
  mediaAssets: MediaAssetRow[],
  creds: AccountCredentials,
): Promise<PublishResult> {
  const asset = mediaAssets[0];
  if (!asset?.public_url) throw new Error('YouTube: a video asset with public URL is required');
  if (!asset.mime_type.startsWith('video/')) {
    throw new Error('YouTube: only video assets are supported');
  }

  // Refresh token before upload (YouTube tokens expire in 1 h)
  let accessToken = creds.accessToken;
  if (creds.refreshToken) {
    accessToken = await refreshGoogleToken(creds.refreshToken);
  }

  const isShort = (asset.duration_sec ?? 0) <= 60;
  const title   = caption.split('\n')[0].slice(0, 100) || 'منشور جديد';
  const desc    = [caption, isShort ? '#Shorts' : ''].filter(Boolean).join('\n\n');

  const metadata = {
    snippet: {
      title,
      description: desc,
      tags: isShort ? ['Shorts', 'شورتس'] : [],
      defaultLanguage: 'ar',
      defaultAudioLanguage: 'ar',
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false,
    },
  };

  // Fetch video binary from storage
  const videoBytes = await fetch(asset.public_url).then(r => r.arrayBuffer());

  // Initiate resumable session
  const sessionUri = await initiateResumableUpload(
    metadata,
    asset.mime_type,
    videoBytes.byteLength,
    accessToken,
  );

  // Upload
  const video = await uploadVideoChunks(sessionUri, videoBytes, asset.mime_type);

  return {
    platformPostId:  video.id,
    platformPostUrl: `https://www.youtube.com/shorts/${video.id}`,
  };
}
