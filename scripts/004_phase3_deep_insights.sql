-- Migration: Phase 3 — Deep AI insights, image sourcing, and full-text search improvements
-- Run this in the Supabase SQL editor before deploying code changes

-- 1. Add new columns for deeper AI insights
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS our_take TEXT,
  ADD COLUMN IF NOT EXISTS what_this_means TEXT,
  ADD COLUMN IF NOT EXISTS key_takeaways TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_context TEXT,
  ADD COLUMN IF NOT EXISTS image_source TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- 2. Update search_vector trigger to include new AI text fields with proper weighting
CREATE OR REPLACE FUNCTION update_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.ai_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.our_take, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.what_this_means, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.source_name, '')), 'D');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate the trigger to use updated function
DROP TRIGGER IF EXISTS trigger_articles_search_vector ON articles;
CREATE TRIGGER trigger_articles_search_vector
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_search_vector();

-- 4. Backfill search_vector for existing articles (triggers the updated function)
UPDATE articles SET updated_at = NOW();

-- 5. Ensure GIN index exists on search_vector
CREATE INDEX IF NOT EXISTS idx_articles_search_vector ON articles USING gin(search_vector);
