-- ============================================================================
-- Phase 6: Community Intelligence Pipeline
-- Creates community_topics and seller_pulse_articles tables
-- ============================================================================

-- Community Topics — aggregated from Reddit, Seller Central forums, etc.
CREATE TABLE IF NOT EXISTS public.community_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body_snippet TEXT,
  source_platform TEXT NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  author TEXT,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  sentiment TEXT,
  theme_tags TEXT[] DEFAULT '{}',
  relevance_score INTEGER DEFAULT 50,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_topics_source ON public.community_topics(source_platform);
CREATE INDEX IF NOT EXISTS idx_community_topics_published ON public.community_topics(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_topics_themes ON public.community_topics USING GIN(theme_tags);
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_topics_url ON public.community_topics(source_url);

-- Seller Pulse Articles — AI-generated articles based on community themes
CREATE TABLE IF NOT EXISTS public.seller_pulse_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  themes TEXT[] DEFAULT '{}',
  source_topic_ids TEXT[] DEFAULT '{}',
  topic_count INTEGER DEFAULT 0,
  sentiment_summary TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_pulse_articles ENABLE ROW LEVEL SECURITY;

-- RLS policies — allow public read, service role write
CREATE POLICY "Anyone can view community topics" ON public.community_topics
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert community topics" ON public.community_topics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update community topics" ON public.community_topics
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can view pulse articles" ON public.seller_pulse_articles
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert pulse articles" ON public.seller_pulse_articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update pulse articles" ON public.seller_pulse_articles
  FOR UPDATE USING (true);
