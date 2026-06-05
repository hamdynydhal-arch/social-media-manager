// ---------------------------------------------------------------------------
// Shared types for the publish-worker and all platform handlers
// ---------------------------------------------------------------------------

export type Platform =
  | 'x'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'threads';

export type PostStatus =
  | 'draft'
  | 'pending'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled';

export interface PostRow {
  id: string;
  user_id: string;
  social_account_id: string;
  platform: Platform;
  adapted_text: string | null;
  base_text: string | null;
  media_asset_ids: string[] | null;
  status: PostStatus;
  scheduled_at: string | null;
}

export interface SocialAccountRow {
  id: string;
  user_id: string;
  platform: Platform;
  platform_user_id: string | null;
  platform_username: string | null;
  access_token_enc: string;
  refresh_token_enc: string | null;
  token_expires_at: string | null;
  scope: string | null;
}

export interface MediaAssetRow {
  id: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string;
  size_bytes: number | null;
  duration_sec: number | null;
}

/** What every platform handler must return on success */
export interface PublishResult {
  platformPostId: string;
  platformPostUrl: string;
}

/** Decrypted credentials ready for API calls */
export interface AccountCredentials {
  accessToken: string;
  refreshToken: string | null;
  platformUserId: string | null;
  platformUsername: string | null;
  scope: string | null;
}
