-- One-off backfill schema. NOT executed against production by this change.
-- Apply this entire file (including on databases with the original audit table).
-- Existing audit entries remain unverified; only the RPC writes atomic_version = 1.
BEGIN;
CREATE TABLE IF NOT EXISTS public.article_classification_audit (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('unclassified', 'overwritten')),
  before JSONB NOT NULL,
  after JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.article_classification_audit
  ADD COLUMN IF NOT EXISTS atomic_version SMALLINT,
  ADD COLUMN IF NOT EXISTS after_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS restored_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_article_classification_audit_article ON public.article_classification_audit(article_id);
CREATE INDEX IF NOT EXISTS idx_article_classification_audit_run ON public.article_classification_audit(run_id, created_at);
ALTER TABLE public.article_classification_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.article_classification_audit FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.article_classification_audit TO service_role;
REVOKE ALL ON SEQUENCE public.article_classification_audit_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.article_classification_audit_id_seq TO service_role;

-- Shared typed snapshot: timestamp spellings from PostgREST are normalized through
-- jsonb_populate_record before comparison. Includes inputs, all classification fields,
-- and updated_at, so a concurrent edit that still matches the mode is not clobbered.
CREATE OR REPLACE FUNCTION public.article_backfill_snapshot(p_row public.articles)
RETURNS JSONB LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT jsonb_object_agg(k, to_jsonb(p_row)->k)
  FROM unnest(ARRAY['id', 'title', 'summary', 'full_content', 'source_name', 'published_at', 'ai_summary', 'our_take', 'key_takeaways', 'bottom_line', 'what_this_means', 'key_stat', 'category', 'platforms', 'audience', 'impact_level', 'relevant', 'relevance_score', 'rejection_reason', 'classified_at', 'updated_at']::text[]) AS k;
$$;

CREATE OR REPLACE FUNCTION public.apply_article_classification_backfill(
  p_run_id TEXT, p_article_id TEXT, p_mode TEXT, p_expected JSONB, p_update JSONB
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  current_row public.articles;
  expected_row public.articles;
  next_row public.articles;
  changed_row public.articles;
  write_keys TEXT[] := ARRAY['category', 'platforms', 'audience', 'impact_level', 'relevant', 'relevance_score', 'rejection_reason']::text[];
  before_values JSONB;
  after_values JSONB;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('unclassified', 'overwritten')
    OR p_run_id IS NULL OR length(btrim(p_run_id)) = 0 OR length(p_run_id) > 64 THEN
    RAISE EXCEPTION 'Invalid mode or run ID';
  END IF;
  IF p_mode = 'unclassified' THEN write_keys := write_keys || ARRAY['ai_summary', 'our_take', 'key_takeaways', 'bottom_line', 'what_this_means', 'key_stat', 'classified_at']::text[]; END IF;
  IF p_expected IS NULL OR jsonb_typeof(p_expected) <> 'object'
    OR NOT (p_expected ?& ARRAY['id', 'title', 'summary', 'full_content', 'source_name', 'published_at', 'ai_summary', 'our_take', 'key_takeaways', 'bottom_line', 'what_this_means', 'key_stat', 'category', 'platforms', 'audience', 'impact_level', 'relevant', 'relevance_score', 'rejection_reason', 'classified_at', 'updated_at']::text[])
    OR p_update IS NULL OR jsonb_typeof(p_update) <> 'object' THEN
    RAISE EXCEPTION 'Complete expected snapshot and classification object required';
  END IF;
  IF NOT (p_update ?& write_keys) OR (p_update - write_keys) <> '{}'::jsonb THEN
    RAISE EXCEPTION 'Unexpected classification fields';
  END IF;
  expected_row := jsonb_populate_record(NULL::public.articles, p_expected);
  SELECT * INTO current_row FROM public.articles WHERE id = p_article_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF public.article_backfill_snapshot(current_row) IS DISTINCT FROM public.article_backfill_snapshot(expected_row)
    OR (p_mode = 'unclassified' AND current_row.ai_summary IS NOT NULL)
    OR (p_mode = 'overwritten' AND (current_row.ai_summary IS NULL
        OR NOT COALESCE('brand_sellers' = ANY(current_row.audience), false))) THEN
    RETURN false;
  END IF;
  next_row := jsonb_populate_record(current_row, p_update);
  IF p_mode = 'unclassified' AND (
    COALESCE(btrim(next_row.our_take), '') = '' OR COALESCE(btrim(next_row.bottom_line), '') = ''
    OR COALESCE(cardinality(next_row.key_takeaways), 0) = 0
    OR EXISTS (SELECT 1 FROM unnest(next_row.key_takeaways) t WHERE COALESCE(btrim(t), '') = '')
  ) THEN
    RAISE EXCEPTION 'Incomplete classification text; article left pending';
  END IF;
  IF (p_mode = 'unclassified' AND COALESCE(btrim(next_row.ai_summary), '') = '')
    OR COALESCE('brand_sellers' = ANY(next_row.audience), false) THEN
    RAISE EXCEPTION 'Classification must leave the pending selector';
  END IF;
  SELECT jsonb_object_agg(k, to_jsonb(current_row)->k) INTO before_values FROM unnest(write_keys) AS k;
  -- AI work happens before this RPC, outside the row lock. An exception in either
  -- the UPDATE or INSERT rolls back both; zero affected rows never creates an audit.
  UPDATE public.articles SET
    category = next_row.category,
    platforms = next_row.platforms,
    audience = next_row.audience,
    impact_level = next_row.impact_level,
    relevant = next_row.relevant,
    relevance_score = next_row.relevance_score,
    rejection_reason = next_row.rejection_reason,
    ai_summary = next_row.ai_summary,
    our_take = next_row.our_take,
    key_takeaways = next_row.key_takeaways,
    bottom_line = next_row.bottom_line,
    what_this_means = next_row.what_this_means,
    key_stat = next_row.key_stat,
    classified_at = next_row.classified_at
  WHERE id = p_article_id RETURNING * INTO changed_row;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT jsonb_object_agg(k, to_jsonb(changed_row)->k) INTO after_values FROM unnest(write_keys) AS k;
  INSERT INTO public.article_classification_audit
    (run_id, article_id, mode, before, after, atomic_version, after_snapshot)
  VALUES (p_run_id, p_article_id, p_mode, before_values, after_values, 1,
          public.article_backfill_snapshot(changed_row));
  RETURN true;
END;
$$;

-- Restore one reviewed audit ID, never an ambiguous UPDATE ... FROM an entire run.
-- Both modes restore exact SQL NULLs/arrays/timestamps. The snapshot guard refuses
-- subsequent edits. Legacy pre-transaction audit entries are not trusted.
CREATE OR REPLACE FUNCTION public.restore_article_classification_backfill(p_audit_id BIGINT)
RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  audit_row public.article_classification_audit;
  current_row public.articles;
  next_row public.articles;
  changed_row public.articles;
  write_keys TEXT[] := ARRAY['category', 'platforms', 'audience', 'impact_level', 'relevant', 'relevance_score', 'rejection_reason']::text[];
BEGIN
  SELECT * INTO audit_row FROM public.article_classification_audit WHERE id = p_audit_id;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  -- Match apply's lock order: article, then audit. Re-read audit after taking locks.
  SELECT * INTO current_row FROM public.articles WHERE id = audit_row.article_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
  SELECT * INTO audit_row FROM public.article_classification_audit WHERE id = p_audit_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF audit_row.restored_at IS NOT NULL THEN RETURN 'already_restored'; END IF;
  IF audit_row.atomic_version IS DISTINCT FROM 1 OR audit_row.after_snapshot IS NULL THEN RETURN 'legacy_unverified'; END IF;
  IF public.article_backfill_snapshot(current_row) IS DISTINCT FROM audit_row.after_snapshot
    OR EXISTS (SELECT 1 FROM public.article_classification_audit x
               WHERE x.article_id = audit_row.article_id AND x.id > audit_row.id
                 AND x.restored_at IS NULL) THEN
    RETURN 'conflict';
  END IF;
  IF audit_row.mode = 'unclassified' THEN write_keys := write_keys || ARRAY['ai_summary', 'our_take', 'key_takeaways', 'bottom_line', 'what_this_means', 'key_stat', 'classified_at']::text[]; END IF;
  IF NOT (audit_row.before ?& write_keys) OR (audit_row.before - write_keys) <> '{}'::jsonb THEN
    RAISE EXCEPTION 'Incomplete restoration snapshot';
  END IF;
  next_row := jsonb_populate_record(current_row, audit_row.before);
  UPDATE public.articles SET
    category = next_row.category,
    platforms = next_row.platforms,
    audience = next_row.audience,
    impact_level = next_row.impact_level,
    relevant = next_row.relevant,
    relevance_score = next_row.relevance_score,
    rejection_reason = next_row.rejection_reason,
    ai_summary = next_row.ai_summary,
    our_take = next_row.our_take,
    key_takeaways = next_row.key_takeaways,
    bottom_line = next_row.bottom_line,
    what_this_means = next_row.what_this_means,
    key_stat = next_row.key_stat,
    classified_at = next_row.classified_at
  WHERE id = audit_row.article_id RETURNING * INTO changed_row;
  IF NOT FOUND THEN RETURN 'conflict'; END IF;
  -- A trigger may veto/alter the restoration. Never mark that as restored.
  IF EXISTS (SELECT 1 FROM unnest(write_keys) k
             WHERE to_jsonb(changed_row)->k IS DISTINCT FROM audit_row.before->k) THEN
    RAISE EXCEPTION 'Restored values differ from audit snapshot';
  END IF;
  UPDATE public.article_classification_audit SET restored_at = clock_timestamp() WHERE id = p_audit_id;
  RETURN 'restored';
END;
$$;

REVOKE ALL ON FUNCTION public.article_backfill_snapshot(public.articles) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_article_classification_backfill(TEXT, TEXT, TEXT, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restore_article_classification_backfill(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.article_backfill_snapshot(public.articles) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_article_classification_backfill(TEXT, TEXT, TEXT, JSONB, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.restore_article_classification_backfill(BIGINT) TO service_role;
COMMIT;
