import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type {
  PostRow,
  SocialAccountRow,
  MediaAssetRow,
  AccountCredentials,
  PostStatus,
} from './_types.ts';

// ---------------------------------------------------------------------------
// Token decryption
// Calls the SECURITY DEFINER decrypt_token() Postgres function via RPC.
// The service-role client bypasses RLS so the function can read vault secrets.
// ---------------------------------------------------------------------------

export async function decryptToken(
  db: SupabaseClient,
  ciphertext: string,
): Promise<string> {
  const { data, error } = await db.rpc('decrypt_token', { ciphertext });
  if (error) throw new Error(`Token decryption failed: ${error.message}`);
  if (!data) throw new Error('decrypt_token returned null — check Vault key setup');
  return data as string;
}

// ---------------------------------------------------------------------------
// Fetch a post with its linked social_account in one round-trip
// ---------------------------------------------------------------------------

export async function fetchPost(
  db: SupabaseClient,
  postId: string,
): Promise<PostRow> {
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();
  if (error) throw new Error(`Cannot load post ${postId}: ${error.message}`);
  return data as PostRow;
}

export async function fetchSocialAccount(
  db: SupabaseClient,
  accountId: string,
): Promise<SocialAccountRow> {
  const { data, error } = await db
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .single();
  if (error) throw new Error(`Cannot load social_account ${accountId}: ${error.message}`);
  return data as SocialAccountRow;
}

// Resolve account when social_account_id is NULL (legacy or mobile-created posts)
export async function fetchSocialAccountByPlatform(
  db: SupabaseClient,
  userId: string,
  platform: string,
): Promise<SocialAccountRow> {
  const { data, error } = await db
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(`No active ${platform} account for user ${userId}: ${error.message}`);
  return data as SocialAccountRow;
}

export async function fetchMediaAssets(
  db: SupabaseClient,
  assetIds: string[],
): Promise<MediaAssetRow[]> {
  if (!assetIds.length) return [];
  const { data, error } = await db
    .from('media_assets')
    .select('*')
    .in('id', assetIds);
  if (error) throw new Error(`Cannot load media assets: ${error.message}`);
  return (data ?? []) as MediaAssetRow[];
}

// ---------------------------------------------------------------------------
// Resolve decrypted credentials for a social account
// ---------------------------------------------------------------------------

export async function resolveCredentials(
  db: SupabaseClient,
  account: SocialAccountRow,
): Promise<AccountCredentials> {
  const accessToken = await decryptToken(db, account.access_token_enc);
  const refreshToken = account.refresh_token_enc
    ? await decryptToken(db, account.refresh_token_enc)
    : null;
  return {
    accessToken,
    refreshToken,
    platformUserId: account.platform_user_id,
    platformUsername: account.platform_username,
    scope: account.scope,
  };
}

// ---------------------------------------------------------------------------
// Post status helpers
// ---------------------------------------------------------------------------

export async function markPublishing(db: SupabaseClient, postId: string) {
  await db.from('posts').update({ status: 'publishing' }).eq('id', postId);
}

export async function markPublished(
  db: SupabaseClient,
  postId: string,
  platformPostId: string,
  platformPostUrl: string,
) {
  await db.from('posts').update({
    status: 'published',
    published_at: new Date().toISOString(),
    platform_post_id: platformPostId,
    platform_post_url: platformPostUrl,
  }).eq('id', postId);
}

export async function markFailed(
  db: SupabaseClient,
  postId: string,
  reason: string,
) {
  await db.from('posts').update({
    status: 'failed',
    failure_reason: reason.slice(0, 2000),
  }).eq('id', postId);
}

// ---------------------------------------------------------------------------
// Fetch all pending posts due for publishing (used by scheduled invocations)
// ---------------------------------------------------------------------------

export async function fetchDuePendingPosts(
  db: SupabaseClient,
  limit = 50,
): Promise<PostRow[]> {
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('status', 'pending')
    .or('scheduled_at.is.null,scheduled_at.lte.' + new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(`Cannot fetch pending posts: ${error.message}`);
  return (data ?? []) as PostRow[];
}

export async function fetchPendingPostsByGroup(
  db: SupabaseClient,
  postGroupId: string,
): Promise<PostRow[]> {
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('post_group_id', postGroupId)
    .eq('status', 'pending');
  if (error) throw new Error(`Cannot fetch group posts: ${error.message}`);
  return (data ?? []) as PostRow[];
}
