-- NOT executed. Review before running in the Supabase SQL editor.
--
-- Problem: scripts/003 and 008 create policies named "Allow service role writes" as
--   FOR ALL USING (true) WITH CHECK (true)
-- with no TO clause, so they apply to every role, including `anon`. The anon key ships to
-- browsers (lib/supabase/client.ts), so anyone could UPDATE or DELETE archive rows through
-- PostgREST. The service role bypasses RLS and does not need these policies at all.
--
-- First, confirm what is live:
--   SELECT tablename, policyname, roles, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND tablename IN ('articles','article_keywords','article_categories','news_sources');
--
-- Fix: scope the write policies to service_role (public SELECT policies are untouched).
-- Policies are permission rules only; no row data is changed.

ALTER POLICY "Allow service role writes" ON public.articles TO service_role;
ALTER POLICY "Allow service role writes" ON public.article_keywords TO service_role;
ALTER POLICY "Allow service role writes" ON public.article_categories TO service_role;

-- If news_sources has a similar policy (check pg_policies output above), scope it too:
-- ALTER POLICY "<policy name>" ON public.news_sources TO service_role;
