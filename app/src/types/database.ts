import type { Platform } from '../constants/platforms';

export type PostStatus = 'draft' | 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';
export type UserPlan   = 'free' | 'pro' | 'agency';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: UserPlan;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: Platform;
  platform_username: string | null;
  platform_user_id: string | null;
  /** Encrypted – never expose raw value to UI */
  access_token_enc: string;
  refresh_token_enc: string | null;
  token_expires_at: string | null;
  scope: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  user_id: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string;
  size_bytes: number | null;
  duration_sec: number | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  social_account_id: string;
  base_text: string | null;
  adapted_text: string | null;
  media_asset_ids: string[] | null;
  platform: Platform;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  failure_reason: string | null;
  platform_post_id: string | null;
  platform_post_url: string | null;
  post_group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostGroup {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
}
