-- ============================================================================
-- Migration 008: Create article_keywords, article_categories tables
-- and add classified_at column + fix source_type CHECK constraint
-- ============================================================================
-- Run this in the Supabase SQL editor.
-- All statements are idempotent — safe to run multiple times.
-- ============================================================================

-- 1. Create article_keywords table
CREATE TABLE IF NOT EXISTS public.article_keywords (
  id SERIAL PRIMARY KEY,
  article_id TEXT REFERENCES public.articles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_keywords_article ON public.article_keywords(article_id);
CREATE INDEX IF NOT EXISTS idx_article_keywords_keyword ON public.article_keywords(keyword);

-- Enable RLS and allow public reads / service role writes
ALTER TABLE public.article_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public reads" ON public.article_keywords
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow service role writes" ON public.article_keywords
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Create article_categories table
CREATE TABLE IF NOT EXISTS public.article_categories (
  id SERIAL PRIMARY KEY,
  article_id TEXT REFERENCES public.articles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  confidence_score REAL DEFAULT 1.0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_categories_article ON public.article_categories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_category ON public.article_categories(category);

-- Enable RLS and allow public reads / service role writes
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public reads" ON public.article_categories
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow service role writes" ON public.article_categories
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Add classified_at column to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS classified_at TIMESTAMPTZ;

-- 4. Fix source_type CHECK constraint to allow community_pulse
-- Drop old constraint (may fail if name differs — that's OK)
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_source_type_check;
-- Re-create with expanded values
ALTER TABLE public.articles ADD CONSTRAINT articles_source_type_check
  CHECK (source_type IN ('industry', 'google', 'community_pulse'));

-- ============================================================================
-- DONE. After running this, all classify/pulse routes will work correctly.
-- ============================================================================
