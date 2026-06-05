/**
 * Meta Graph API publisher — Facebook Pages
 *
 * Auth model: OAuth 2.0
 *   - access_token in social_accounts.access_token_enc is a PAGE access token
 *     (not a user token). Use "Get Page Access Token" exchange during OAuth.
 *   - platform_user_id should store the Page ID (not the personal user ID)
 *   - Required permissions: pages_manage_posts, pages_read_engagement
 *
 * Endpoints used:
 *   Text + link:  POST /{page-id}/feed
 *   Photo:        POST /{page-id}/photos
 *   Video:        POST /{page-id}/videos  (file_url param — async processing)
 *     ↑ For large videos use the Resumable Upload API:
 *       POST /video-uploads  (start session) → PATCH chunks → POST finish
 *       TODO: implement chunked video for files > 1 GB
 */

import type { AccountCredentials, MediaAssetRow, PublishResult } from '../_types.ts';

const GRAPH = 'https://graph.facebook.com/v20.0';

function graphUrl(path: string, token: string) {
  return `${GRAPH}${path}?access_token=${encodeURIComponent(token)}`;
}

async function graphPost<T>(url: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Facebook API error (${res.status}): ${JSON.stringify(json.error ?? json)}`);
  }
  return json as T;
}

// ---------------------------------------------------------------------------
// Publish text post (with optional link)
// ---------------------------------------------------------------------------

async function publishFeedPost(
  pageId: string,
  message: string,
  token: string,
): Promise<PublishResult> {
  const url  = graphUrl(`/${pageId}/feed`, token);
  const data = await graphPost<{ id: string }>(url, { message });
  return {
    platformPostId:  data.id,
    platformPostUrl: `https://www.facebook.com/${data.id}`,
  };
}

// ---------------------------------------------------------------------------
// Publish photo post
// ---------------------------------------------------------------------------

async function publishPhotoPost(
  pageId: string,
  message: string,
  photoUrl: string,
  token: string,
): Promise<PublishResult> {
  const url  = graphUrl(`/${pageId}/photos`, token);
  const data = await graphPost<{ id: string; post_id?: string }>(url, {
    message,
    url: photoUrl,
    published: 'true',
  });
  const postId = data.post_id ?? data.id;
  return {
    platformPostId:  postId,
    platformPostUrl: `https://www.facebook.com/${postId}`,
  };
}

// ---------------------------------------------------------------------------
// Publish video post (file_url — Meta fetches the video from our Storage URL)
//
// NOTE on large videos:
//   The file_url approach works for videos Meta can download publicly.
//   For videos > 1 GB or private storage, implement the Resumable Upload API:
//   1. POST /video-uploads  → returns upload_session_id + video_file_chunk_size
//   2. PATCH /{upload_session_id}  with binary chunks (Content-Range header)
//   3. POST /{page-id}/videos  with upload_session_id instead of file_url
// ---------------------------------------------------------------------------

async function publishVideoPost(
  pageId: string,
  message: string,
  videoUrl: string,
  token: string,
): Promise<PublishResult> {
  const url  = graphUrl(`/${pageId}/videos`, token);
  // Meta processes the video asynchronously; the returned id is the video node ID
  const data = await graphPost<{ id: string }>(url, {
    description: message,
    file_url: videoUrl,
    published: 'true',
  });
  return {
    platformPostId:  data.id,
    platformPostUrl: `https://www.facebook.com/video/${data.id}`,
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export async function publishToFacebook(
  text: string,
  mediaAssets: MediaAssetRow[],
  creds: AccountCredentials,
): Promise<PublishResult> {
  const pageId = creds.platformUserId;
  if (!pageId) throw new Error('Facebook: platform_user_id (Page ID) is missing');

  const token = creds.accessToken;

  if (!mediaAssets.length) {
    return publishFeedPost(pageId, text, token);
  }

  const asset = mediaAssets[0];
  if (!asset.public_url) throw new Error('Facebook: media asset has no public URL');

  if (asset.mime_type.startsWith('video/')) {
    return publishVideoPost(pageId, text, asset.public_url, token);
  }
  return publishPhotoPost(pageId, text, asset.public_url, token);
}
