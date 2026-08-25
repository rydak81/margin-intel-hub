-- Ranked full-text search over articles.
--
-- Uses the weighted search_vector maintained by trigger since 003/007
-- (title=A, ai_summary=B, summary=C, source=D) with websearch syntax:
-- multi-word queries, "quoted phrases", OR, and -exclusions all work.
-- Rank blends match quality with a 30-day recency decay so a strong match
-- from last week beats a weak match from yesterday.
--
-- Already applied to the production database via migration
-- `search_articles_ranked_fn`; checked in here so a database provisioned
-- from these scripts has it too. The API route also falls back to plain
-- full-text filtering if this function is absent.
CREATE OR REPLACE FUNCTION public.search_articles_ranked(
  search_query text,
  filter_category text DEFAULT NULL,
  filter_platforms text[] DEFAULT NULL,
  filter_impact text DEFAULT NULL,
  filter_audience text DEFAULT NULL,
  max_rows int DEFAULT 320
)
RETURNS TABLE (
  id text,
  title text,
  summary text,
  category text,
  source_name text,
  source_type text,
  published_at timestamptz,
  image_url text,
  platforms text[],
  impact_level text,
  relevance_score int,
  audience text[],
  is_breaking boolean,
  search_rank real
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    a.id,
    a.title,
    a.summary,
    a.category,
    a.source_name,
    a.source_type,
    a.published_at,
    a.image_url,
    a.platforms,
    a.impact_level,
    a.relevance_score,
    a.audience,
    a.is_breaking,
    (
      ts_rank_cd(a.search_vector, websearch_to_tsquery('english', search_query))
      * (1.0 / (1.0 + EXTRACT(EPOCH FROM (now() - a.published_at)) / 2592000.0))::real
    ) AS search_rank
  FROM public.articles a
  WHERE a.search_vector @@ websearch_to_tsquery('english', search_query)
    AND a.relevant = true
    AND a.relevance_score >= 40
    AND (filter_category IS NULL OR a.category = filter_category)
    AND (filter_platforms IS NULL OR a.platforms @> filter_platforms)
    AND (filter_impact IS NULL OR a.impact_level = filter_impact)
    AND (filter_audience IS NULL OR a.audience @> ARRAY[filter_audience])
  ORDER BY search_rank DESC, a.published_at DESC
  LIMIT LEAST(max_rows, 500)
$$;
