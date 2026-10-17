# Archive classification backfill (one-off)

**Don't run until the fix PR (`fix/news-pipeline-starvation`) is merged and deployed.** Until then the old aggregate re-upsert would keep overwriting the rows being repaired.

What it does:
- **`unclassified`**: classifies rows with `ai_summary IS NULL` (about 5,009 as of Oct 17). It fills only the AI fields and `classified_at`.
- **`overwritten`**: rows that have an `ai_summary` but still carry the feed-default audience marker `brand_sellers`, meaning the old aggregate re-upsert reset their category, relevance and similar fields. It restores only `category, platforms, audience, impact_level, relevant, relevance_score, rejection_reason`. The original AI text and `classified_at` are kept.
- It never deletes rows and never inserts articles. Title, summary, content, source, dates and images are never touched. It doesn't generate images and doesn't rewrite `article_keywords` or `article_categories`.
- Every change writes a before/after row to `article_classification_audit` before the article is updated. `scripts/011` includes a revert query.
- It's idempotent: processed rows stop matching the selector, and every UPDATE repeats the selector as a guard.

Steps:
1. Run `scripts/011_classification_backfill_audit.sql`. It only creates a table.
2. Do a dry run, which reports counts and estimated cost and writes nothing:
   `BASE_URL=https://marketplacebeta.com CRON_SECRET=… node scripts/backfill-classification.mjs --mode overwritten --dry-run`
3. Run `--mode overwritten` first, since it's smaller and repairs the history. Then run `--mode unclassified`.
   Progress is logged per call and saved to `.backfill-state-<mode>.json`. Re-running resumes from that file. Ctrl-C is safe.
4. Spot-check: `SELECT mode, count(*) FROM article_classification_audit GROUP BY 1;`

Cost (Sonnet 4.6 through AI Gateway, $3/$15 per million tokens, about 2,000 input and 450 output tokens per article) comes to roughly $0.013 per article: about $64 for 5,009 unclassified rows, and up to about $55 more if all 4,278 classified rows need repair. The dry run prints the real figure.
