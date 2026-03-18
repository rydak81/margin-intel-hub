-- ============================================================================
-- Migration 007: Ensure all required columns exist (safe, idempotent)
-- ============================================================================
-- Run this in the Supabase SQL editor if AI summaries are not appearing.
-- This combines and supersedes scripts 004 and 005.
-- All statements use IF NOT EXISTS / IF NOT EXISTS — safe to run multiple times.
-- ============================================================================

-- Core AI fields (should exist from script 003, but ensured here for safety)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS action_item TEXT,
  ADD COLUMN IF NOT EXISTS key_stat TEXT,
  ADD COLUMN IF NOT EXISTS impact_detail TEXT,
  ADD COLUMN IF NOT EXISTS full_content TEXT;

-- Deep insight fields (added by script 004)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS our_take TEXT,
  ADD COLUMN IF NOT EXISTS what_this_means TEXT,
  ADD COLUMN IF NOT EXISTS key_takeaways TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_context TEXT,
  ADD COLUMN IF NOT EXISTS image_source TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Bottom line field (added by script 005)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS bottom_line TEXT;

-- ============================================================================
-- Update full-text search trigger to include all AI insight fields
-- ============================================================================
CREATE OR REPLACE FUNCTION update_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.ai_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.our_take, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.bottom_line, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.what_this_means, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.source_name, '')), 'D');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger with updated function
DROP TRIGGER IF EXISTS trigger_articles_search_vector ON public.articles;
CREATE TRIGGER trigger_articles_search_vector
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_search_vector();

-- Backfill search_vector for existing articles
UPDATE public.articles SET updated_at = NOW();

-- Ensure all indexes exist
CREATE INDEX IF NOT EXISTS idx_articles_search_vector ON public.articles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_relevance ON public.articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON public.articles(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_impact ON public.articles(impact_level);
CREATE INDEX IF NOT EXISTS idx_articles_platforms ON public.articles USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_articles_audience ON public.articles USING GIN(audience);

-- ============================================================================
-- DONE. After running this, trigger /api/news/classify to process articles.
-- ============================================================================
