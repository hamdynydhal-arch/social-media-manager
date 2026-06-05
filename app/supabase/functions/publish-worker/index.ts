/**
 * publish-worker — Supabase Edge Function
 *
 * Triggered two ways:
 *   1. Direct HTTP POST from process-post-queue (immediate, after AI adaptation)
 *      Body: { postGroupId: string }  or  { postIds: string[] }
 *
 *   2. pg_cron scheduled sweep every 5 minutes (catches scheduled posts)
 *      Body: { sweep: true }
 *      Cron setup (run once in Supabase SQL editor):
 *        SELECT cron.schedule(
 *          'publish-worker-sweep',
 *          '* /5 * * * *',
 *          $$
 *            SELECT net.http_post(
 *              url := 'https://<project-ref>.supabase.co/functions/v1/publish-worker',
 *              headers := '{"Authorization": "Bearer <service-role-key>", "Content-Type": "application/json"}'::jsonb,
 *              body := '{"sweep": true}'::jsonb
 *            )
 *          $$
 *        );
 *
 * Environment variables required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   X_CONSUMER_KEY, X_CONSUMER_SECRET           (X / Twitter app credentials)
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET       (Google OAuth app credentials)
 *   (LinkedIn and Meta don't need app-level secrets here — token is per-user)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { Platform, PostRow, PublishResult } from './_types.ts';
import {
  fetchPost,
  fetchSocialAccount,
  fetchMediaAssets,
  resolveCredentials,
  fetchDuePendingPosts,
  fetchPendingPostsByGroup,
  markPublishing,
  markPublished,
  markFailed,
} from './_db.ts';
import { publishToX }         from './platforms/x.ts';
import { publishToLinkedIn }  from './platforms/linkedin.ts';
import { publishToFacebook }  from './platforms/facebook.ts';
import { publishToInstagram } from './platforms/instagram.ts';
import { publishToYouTube }   from './platforms/youtube.ts';

// ---------------------------------------------------------------------------
// Platform dispatcher
// ---------------------------------------------------------------------------

async function dispatchToPlatform(
  platform: Platform,
  text: string,
  mediaUrls: import('./_types.ts').MediaAssetRow[],
  creds: import('./_types.ts').AccountCredentials,
): Promise<PublishResult> {
  switch (platform) {
    case 'x':         return publishToX(text, mediaUrls, creds);
    case 'linkedin':  return publishToLinkedIn(text, mediaUrls, creds);
    case 'facebook':  return publishToFacebook(text, mediaUrls, creds);
    case 'instagram': return publishToInstagram(text, mediaUrls, creds);
    case 'youtube':   return publishToYouTube(text, mediaUrls, creds);
    // TikTok and Threads require separate OAuth apps — stubbed for now
    case 'tiktok':    throw new Error('TikTok publishing not yet implemented');
    case 'threads':   throw new Error('Threads publishing not yet implemented');
    default:          throw new Error(`Unknown platform: ${platform}`);
  }
}

// ---------------------------------------------------------------------------
// Process a single post
// ---------------------------------------------------------------------------

async function processPost(
  db: ReturnType<typeof createClient>,
  post: PostRow,
): Promise<{ postId: string; ok: boolean; error?: string }> {
  try {
    await markPublishing(db, post.id);

    const account    = await fetchSocialAccount(db, post.social_account_id);
    const creds      = await resolveCredentials(db, account);
    const mediaAssets = post.media_asset_ids?.length
      ? await fetchMediaAssets(db, post.media_asset_ids)
      : [];

    const text   = post.adapted_text ?? post.base_text ?? '';
    const result = await dispatchToPlatform(post.platform, text, mediaAssets, creds);

    await markPublished(db, post.id, result.platformPostId, result.platformPostUrl);

    console.log(`[publish-worker] ✓ ${post.platform} post ${post.id} → ${result.platformPostUrl}`);
    return { postId: post.id, ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[publish-worker] ✗ post ${post.id} (${post.platform}): ${msg}`);
    await markFailed(db, post.id, msg);
    return { postId: post.id, ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  let body: { sweep?: boolean; postGroupId?: string; postIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  // Resolve which posts to process
  let posts: PostRow[];
  if (body.sweep) {
    posts = await fetchDuePendingPosts(db, 50);
  } else if (body.postGroupId) {
    posts = await fetchPendingPostsByGroup(db, body.postGroupId);
  } else if (body.postIds?.length) {
    posts = await Promise.all(body.postIds.map(id => fetchPost(db, id)));
  } else {
    return new Response(JSON.stringify({ error: 'Provide sweep, postGroupId, or postIds' }), { status: 400 });
  }

  if (!posts.length) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
  }

  // Process posts sequentially to avoid hammering platform rate limits
  const results: { postId: string; ok: boolean; error?: string }[] = [];
  for (const post of posts) {
    results.push(await processPost(db, post));
  }

  const ok      = results.filter(r => r.ok).length;
  const failed  = results.filter(r => !r.ok).length;

  return new Response(
    JSON.stringify({ processed: results.length, ok, failed, results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
