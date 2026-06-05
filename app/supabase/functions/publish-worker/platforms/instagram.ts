/**
 * Meta Graph API publisher — Instagram Business / Creator accounts
 *
 * Auth model: OAuth 2.0
 *   - access_token is the Instagram User Access Token (tied to a Facebook Page)
 *   - platform_user_id is the Instagram Business Account ID (IG User ID)
 *   - Required permissions: instagram_basic, instagram_content_publish,
 *       pages_show_list, business_management
 *
 * Publish flow (two-step):
 *   1. Create Media Container  POST /{ig-user-id}/media
 *      → returns creation_id
 *   2. Publish Container       POST /{ig-user-id}/media_publish
 *      → returns media_id (the published post)
 *
 * Supported types:
 *   IMAGE   → image_url param
 *   REEL    → video_url param + media_type=REELS
 *   VIDEO   → video_url param (carousel items only in feed videos)
 *
 * Rate limit: 25 API-created posts per 24 hours per IG account.
 *
 * NOTE: For Reels the container status is async. Poll GET /{creation_id}?fields=status_code
 *   until status_code = 'FINISHED' (typically 10-30 s). Max allowed polling: 5 min.
 */

import type { AccountCredentials, MediaAssetRow, PublishResult } from '../_types.ts';

const GRAPH = 'https://graph.facebook.com/v20.0';

function graphUrl(path: string, token: string) {
  return `${GRAPH}${path}?access_token=${encodeURIComponent(token)}`;
}

async function graphPost<T>(url: string, body: Record<string, string>): Promise<T> {
  const res  = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Instagram API error (${res.status}): ${JSON.stringify(json.error ?? json)}`);
  }
  return json as T;
}

// ---------------------------------------------------------------------------
// Poll container status (required for Reels / video)
// ---------------------------------------------------------------------------

async function waitForContainer(
  creationId: string,
  igUserId: string,
  token: string,
): Promise<void> {
  const statusUrl = graphUrl(`/${creationId}`, token) + '&fields=status_code,status';
  for (let i = 0; i < 30; i++) { // max ~5 min with 10 s intervals
    await new Promise(r => setTimeout(r, 10_000));
    const res  = await fetch(statusUrl);
    const data = await res.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
      throw new Error(`Instagram container failed: ${JSON.stringify(data)}`);
    }
  }
  throw new Error('Instagram container processing timed out (5 min)');
}

// ---------------------------------------------------------------------------
// Create container + publish
// ---------------------------------------------------------------------------

export async function publishToInstagram(
  caption: string,
  mediaAssets: MediaAssetRow[],
  creds: AccountCredentials,
): Promise<PublishResult> {
  const igUserId = creds.platformUserId;
  if (!igUserId) throw new Error('Instagram: platform_user_id (IG User ID) is missing');

  const token = creds.accessToken;
  const asset = mediaAssets[0]; // Instagram posts require exactly one media item
  if (!asset?.public_url) throw new Error('Instagram: a media asset with public URL is required');

  const isVideo = asset.mime_type.startsWith('video/');

  // Step 1: Create container
  const containerParams: Record<string, string> = {
    caption,
    ...(isVideo
      ? { video_url: asset.public_url, media_type: 'REELS' }
      : { image_url: asset.public_url }),
  };

  const containerUrl = graphUrl(`/${igUserId}/media`, token);
  const container = await graphPost<{ id: string }>(containerUrl, containerParams);
  const creationId = container.id;

  // Reels need async processing; poll until FINISHED
  if (isVideo) {
    await waitForContainer(creationId, igUserId, token);
  }

  // Step 2: Publish container
  const publishUrl = graphUrl(`/${igUserId}/media_publish`, token);
  const published  = await graphPost<{ id: string }>(publishUrl, {
    creation_id: creationId,
  });

  return {
    platformPostId:  published.id,
    platformPostUrl: `https://www.instagram.com/p/${published.id}/`,
  };
}
