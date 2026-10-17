-- Audit log for the one-off classification backfill (/api/news/backfill-classify).
-- Additive only: creates a new table, changes nothing in public.articles.
-- Every backfill write records the exact before/after values so any change can be
-- reviewed or reverted. Run once in the Supabase SQL editor before the backfill.

CREATE TABLE IF NOT EXISTS public.article_classification_audit (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  article_id TEXT NOT NULL,          -- no FK on purpose: audit rows must outlive anything
  mode TEXT NOT NULL CHECK (mode IN ('unclassified', 'overwritten')),
  before JSONB NOT NULL,
  after JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_classification_audit_article ON public.article_classification_audit(article_id);
CREATE INDEX IF NOT EXISTS idx_article_classification_audit_run ON public.article_classification_audit(run_id, created_at);

-- Service role only (bypasses RLS); no anon/authenticated policies.
ALTER TABLE public.article_classification_audit ENABLE ROW LEVEL SECURITY;

-- Pre-flight counts (read-only):
-- SELECT count(*) FILTER (WHERE ai_summary IS NULL) AS unclassified,
--        count(*) FILTER (WHERE ai_summary IS NOT NULL AND 'brand_sellers' = ANY(audience)) AS overwritten
-- FROM public.articles;

-- Revert one run's 'overwritten' changes (example; review before using):
-- UPDATE public.articles a SET
--   category = (x.before->>'category'),
--   platforms = ARRAY(SELECT jsonb_array_elements_text(x.before->'platforms')),
--   audience = ARRAY(SELECT jsonb_array_elements_text(x.before->'audience')),
--   impact_level = (x.before->>'impact_level'),
--   relevant = (x.before->>'relevant')::boolean,
--   relevance_score = (x.before->>'relevance_score')::int,
--   rejection_reason = (x.before->>'rejection_reason')
-- FROM public.article_classification_audit x
-- WHERE x.article_id = a.id AND x.run_id = '<run id>' AND x.mode = 'overwritten';
