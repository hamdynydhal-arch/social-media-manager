-- =============================================================================
-- Run this ONCE in the Supabase SQL Editor after enabling the Vault extension.
-- Replace <YOUR_32_BYTE_SECRET> with a cryptographically random 32-byte key.
-- Generate one with: openssl rand -base64 32
-- NEVER commit the actual key value to source control.
-- =============================================================================

-- 1. Enable Vault (if not already enabled via the Supabase dashboard)
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- 2. Store the encryption key
SELECT vault.create_secret(
  '<YOUR_32_BYTE_SECRET>',   -- replace this
  'token_encryption_key',
  'Master key for encrypting OAuth access/refresh tokens'
);

-- 3. Verify (returns the secret name, NOT the value)
SELECT name, description FROM vault.secrets WHERE name = 'token_encryption_key';
