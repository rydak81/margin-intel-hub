-- ============================================================================
-- 016: Allow source_type = 'original' on articles
--
-- The news indexing rule (lib/seo-indexing.ts) makes a /news/[id] page
-- indexable only when articles.source_type = 'original' — a first-party
-- post rather than an ingested briefing. The check constraint from
-- scripts/008 predates that rule and rejects the value, so no row could
-- ever qualify. This widens the constraint; everything else (sitemap,
-- robots meta) already keys off the value with no further change.
-- ============================================================================

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_source_type_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_source_type_check
  CHECK (source_type IN ('industry', 'google', 'community_pulse', 'original'));
