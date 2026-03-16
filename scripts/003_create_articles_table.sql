-- Create articles table for persistent storage of AI-classified articles
-- This allows articles to persist across server restarts and enables
-- full-text search, historical browsing, and building a content archive.

CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,                            -- hash-based ID from URL (art_xxxxx)
  title TEXT NOT NULL,
  summary TEXT,                                    -- Original RSS summary/excerpt
  full_content TEXT,                               -- Full RSS HTML content
  ai_summary TEXT,                                 -- AI-generated analyst summary
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,                 -- Original article URL (dedup key)
  published_at TIMESTAMPTZ NOT NULL,
  image_url TEXT,                                  -- Best available image URL
  original_rss_image TEXT,                         -- Original RSS image before fallback
  has_real_image BOOLEAN DEFAULT FALSE,            -- Whether image is from source (not stock)

  -- AI Classification fields
  relevant BOOLEAN DEFAULT TRUE,
  relevance_score INTEGER DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  category TEXT NOT NULL DEFAULT 'platform_updates',
  platforms TEXT[] DEFAULT '{}',
  is_breaking BOOLEAN DEFAULT FALSE,
  audience TEXT[] DEFAULT '{}',
  impact_level TEXT DEFAULT 'medium' CHECK (impact_level IN ('high', 'medium', 'low')),
  impact_detail TEXT,
  action_item TEXT,
  key_stat TEXT,
  rejection_reason TEXT,

  -- Source metadata
  tier INTEGER DEFAULT 3,
  source_type TEXT DEFAULT 'industry' CHECK (source_type IN ('industry', 'google')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search vector (auto-populated by trigger)
  search_vector TSVECTOR
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_relevance ON public.articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON public.articles(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_impact ON public.articles(impact_level);
CREATE INDEX IF NOT EXISTS idx_articles_platforms ON public.articles USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_articles_audience ON public.articles USING GIN(audience);
CREATE INDEX IF NOT EXISTS idx_articles_source_url ON public.articles(source_url);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_articles_search ON public.articles USING GIN(search_vector);

-- Auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION update_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.ai_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.source_name, '')), 'D');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_articles_search_vector
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_search_vector();

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public reads (articles are public content)
CREATE POLICY "Allow public reads" ON public.articles
  FOR SELECT
  USING (true);

-- Allow service role to insert/update (API routes use admin client)
CREATE POLICY "Allow service role writes" ON public.articles
  FOR ALL
  USING (true)
  WITH CHECK (true);
