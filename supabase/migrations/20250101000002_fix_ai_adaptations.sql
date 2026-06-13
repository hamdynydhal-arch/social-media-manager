-- =============================================================================
-- Migration 002: align ai_adaptations columns with edge function code
--
-- The initial schema used generic `prompt`/`response` column names.
-- The edge function code uses the more descriptive `original_text`/`adapted_text`.
-- This migration also makes prompt/original_text nullable since visual-only
-- platforms may have no base text.
-- =============================================================================

ALTER TABLE public.ai_adaptations
  RENAME COLUMN prompt   TO original_text;

ALTER TABLE public.ai_adaptations
  RENAME COLUMN response TO adapted_text;

-- Allow NULL for visual platform captions generated without a user-provided text
ALTER TABLE public.ai_adaptations
  ALTER COLUMN original_text DROP NOT NULL;

ALTER TABLE public.ai_adaptations
  ALTER COLUMN adapted_text DROP NOT NULL;
