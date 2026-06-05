-- =============================================================================
-- Migration 003: make social_account_id nullable on posts
--
-- The publish-worker resolves the correct social_account at publish time by
-- matching platform to the user's connected accounts. Requiring the ID at
-- insertion time is premature — the user may connect the account after queueing.
-- =============================================================================

ALTER TABLE public.posts
  ALTER COLUMN social_account_id DROP NOT NULL;
