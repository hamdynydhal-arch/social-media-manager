/**
 * LinkedIn API publisher — UGC Posts endpoint
 *
 * Auth model: OAuth 2.0
 *   - access_token stored in social_accounts.access_token_enc
 *   - Requires scopes: r_liteprofile, w_member_social
 *   - For organization pages also requires: rw_organization_admin, w_organization_social
 *
 * Media upload:
 *   1. Register upload  POST /v2/assets?action=registerUpload
 *   2. PUT binary to the returned upload URL
 *   3. Reference asset URN in the UGC post body
 *
 * TODO: LinkedIn access tokens expire in 60 days; implement refresh flow using
 *   the refresh_token stored in social_accounts.refresh_token_enc.
 */

import type { AccountCredentials, MediaAssetRow, PublishResult } from '../_types.ts';

const LI_API = 'https://api.linkedin.com/v2';

async function liPost<T>(
  path: string,
  body: unknown,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${LI_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn POST ${path} failed (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Register and upload a media asset, returns the LinkedIn asset URN
// ---------------------------------------------------------------------------

async function uploadMediaToLinkedIn(
  asset: MediaAssetRow,
  authorUrn: string,
  accessToken: string,
): Promise<string> {
  if (!asset.public_url) throw new Error('Media asset has no public URL');

  const isVideo = asset.mime_type.startsWith('video/');

  // Step 1: Register upload
  const registerBody = {
    registerUploadRequest: {
      owner: authorUrn,
      recipes: [isVideo ? 'urn:li:digitalmediaRecipe:feedshare-video' : 'urn:li:digitalmediaRecipe:feedshare-image'],
      serviceRelationships: [{
        identifier: 'urn:li:userGeneratedContent',
        relationshipType: 'OWNER',
      }],
      supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
    },
  };

  const registerResult = await liPost<{
    value: {
      asset: string;
      mediaArtifact: string;
      uploadMechanism: { 'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': { uploadUrl: string } };
    };
  }>('/assets?action=registerUpload', registerBody, accessToken);

  const uploadUrl  = registerResult.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn   = registerResult.value.asset;

  // Step 2: PUT the binary
  const mediaBytes = await fetch(asset.public_url).then(r => r.arrayBuffer());
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': asset.mime_type },
    body: mediaBytes,
  });
  if (!putRes.ok) throw new Error(`LinkedIn media PUT failed (${putRes.status}): ${await putRes.text()}`);

  return assetUrn;
}

// ---------------------------------------------------------------------------
// Publish UGC post
// ---------------------------------------------------------------------------

export async function publishToLinkedIn(
  text: string,
  mediaAssets: MediaAssetRow[],
  creds: AccountCredentials,
): Promise<PublishResult> {
  const personUrn = `urn:li:person:${creds.platformUserId}`;

  // Build media content if any
  const mediaContent: unknown[] = [];
  for (const asset of mediaAssets.slice(0, 1)) { // LinkedIn UGC supports 1 media item per post
    const assetUrn = await uploadMediaToLinkedIn(asset, personUrn, creds.accessToken);
    const isVideo  = asset.mime_type.startsWith('video/');
    mediaContent.push({
      status: 'READY',
      description: { text: '' },
      media: assetUrn,
      title: { text: isVideo ? 'فيديو' : 'صورة' },
    });
  }

  const shareMediaCategory = mediaContent.length > 0
    ? (mediaAssets[0].mime_type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
    : 'NONE';

  const ugcPost = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory,
        ...(mediaContent.length > 0 ? { media: mediaContent } : {}),
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const result = await liPost<{ id: string }>('/ugcPosts', ugcPost, creds.accessToken);
  const postId  = result.id;

  return {
    platformPostId: postId,
    // LinkedIn post URLs follow this pattern
    platformPostUrl: `https://www.linkedin.com/feed/update/${postId}/`,
  };
}
