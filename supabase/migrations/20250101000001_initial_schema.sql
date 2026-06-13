-- =============================================================================
-- Social Media Manager SaaS – Initial Schema
-- Requires: pgcrypto extension (for token encryption)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- HELPER: Encryption wrapper using app-level secret stored in Vault
-- We use Supabase Vault (pgsodium) for the master key.
-- The functions below wrap encrypt/decrypt so callers never touch raw keys.
-- =============================================================================

-- Store the encryption key name in a config row so it can be rotated.
-- In practice set this via: SELECT vault.create_secret('your-32-byte-key', 'token_encryption_key');
-- Then reference it by name only.

CREATE OR REPLACE FUNCTION encrypt_token(plaintext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_key TEXT;
BEGIN
  -- Retrieve key from Supabase Vault (never exposed to application layer)
  SELECT decrypted_secret INTO secret_key
  FROM vault.decrypted_secrets
  WHERE name = 'token_encryption_key'
  LIMIT 1;

  IF secret_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in Vault. Run: SELECT vault.create_secret(''<key>'', ''token_encryption_key'');';
  END IF;

  RETURN encode(
    pgp_sym_encrypt(plaintext, secret_key),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_token(ciphertext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_key TEXT;
BEGIN
  SELECT decrypted_secret INTO secret_key
  FROM vault.decrypted_secrets
  WHERE name = 'token_encryption_key'
  LIMIT 1;

  IF secret_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in Vault.';
  END IF;

  RETURN pgp_sym_decrypt(
    decode(ciphertext, 'base64'),
    secret_key
  );
END;
$$;

-- =============================================================================
-- TABLE: profiles
-- Extends Supabase auth.users with app-specific metadata.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  timezone      TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TABLE: social_accounts
-- One row per connected platform per user.
-- Tokens are encrypted at rest via encrypt_token() before INSERT/UPDATE.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Which platform this account belongs to
  platform            TEXT NOT NULL CHECK (platform IN (
                        'x', 'instagram', 'facebook', 'tiktok',
                        'youtube', 'linkedin', 'threads'
                      )),

  -- Human-readable handle, e.g. "@masbar_show"
  platform_username   TEXT,
  platform_user_id    TEXT,            -- The platform's own numeric/string UID

  -- Encrypted OAuth tokens (application layer calls encrypt_token() before storing)
  access_token_enc    TEXT NOT NULL,   -- pgp_sym_encrypt'd access token
  refresh_token_enc   TEXT,            -- pgp_sym_encrypt'd refresh token (NULL if not issued)

  token_expires_at    TIMESTAMPTZ,     -- When the access token expires
  scope               TEXT,            -- Space-separated granted OAuth scopes

  is_active           BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One connected account per platform per user
  UNIQUE (user_id, platform, platform_user_id)
);

-- =============================================================================
-- TABLE: media_assets
-- Tracks uploaded files stored in Supabase Storage.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,           -- path inside the Supabase Storage bucket
  public_url   TEXT,
  mime_type    TEXT NOT NULL,
  size_bytes   BIGINT,
  duration_sec NUMERIC(8,2),            -- for video/audio assets
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABLE: posts
-- A "post" is one publish job. One base submission may spawn multiple posts
-- (one per target platform), each tracked independently.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  social_account_id   UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,

  -- Content
  base_text           TEXT,
  adapted_text        TEXT,             -- AI-rewritten version for this platform
  media_asset_ids     UUID[],           -- references to media_assets.id

  -- Scheduling & status
  platform            TEXT NOT NULL,    -- denormalized for fast queries
  status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'pending', 'publishing', 'published', 'failed', 'cancelled')),
  scheduled_at        TIMESTAMPTZ,      -- NULL = post immediately
  published_at        TIMESTAMPTZ,
  failure_reason      TEXT,

  -- Platform response
  platform_post_id    TEXT,            -- the ID returned by the platform API after publish
  platform_post_url   TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABLE: post_groups
-- Groups multiple platform-specific posts that share one base submission,
-- so the UI can show "this batch was posted to 4 platforms".
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.post_groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT,                    -- optional user-defined label
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS post_group_id UUID REFERENCES public.post_groups(id) ON DELETE SET NULL;

-- =============================================================================
-- TABLE: ai_adaptations  (audit log)
-- Stores every LLM prompt/response for debugging, cost tracking, and replay.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ai_adaptations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id      UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  prompt       TEXT NOT NULL,
  response     TEXT NOT NULL,
  model        TEXT NOT NULL,
  tokens_used  INTEGER,
  cost_usd     NUMERIC(10, 6),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- Users can only see and modify their own data.
-- =============================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_groups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_adaptations  ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- social_accounts
CREATE POLICY "Users manage own social accounts"
  ON public.social_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- media_assets
CREATE POLICY "Users manage own media"
  ON public.media_assets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- posts
CREATE POLICY "Users manage own posts"
  ON public.posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- post_groups
CREATE POLICY "Users manage own post groups"
  ON public.post_groups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_adaptations: read-only for users; written only by service-role (edge functions)
CREATE POLICY "Users read own ai adaptations"
  ON public.ai_adaptations FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.posts WHERE id = post_id)
  );

-- =============================================================================
-- INDEXES for common query patterns
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_social_accounts_user    ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_status       ON public.posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled         ON public.posts(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_posts_group             ON public.posts(post_group_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_user       ON public.media_assets(user_id);

-- =============================================================================
-- updated_at auto-maintenance trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
