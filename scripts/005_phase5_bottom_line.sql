-- Migration: Phase 5 — Add bottom_line column for AI brief redesign
-- Run this in the Supabase SQL editor before deploying code changes

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS bottom_line TEXT;
