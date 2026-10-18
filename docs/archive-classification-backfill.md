# Archive classification backfill (one-off)

**This PR does not run the backfill or apply SQL to production. Final approval, deployment, and a separately authorized operator run are still required.**

## Scope and prerequisites

- `unclassified`: selects `ai_summary IS NULL` and fills structured classification, AI text, and `classified_at`.
- `overwritten`: selects non-null `ai_summary` plus the old feed marker `brand_sellers`; replaces only structured classification values. It preserves AI text and `classified_at`. The marker is a heuristic, not proof of every historical overwrite, and cannot recover records whose marker was removed by another writer. Review samples before committing to the scope.
- Neither mode deletes or inserts articles, edits source material/images, generates images, or rewrites `article_keywords` / `article_categories`. Existing article triggers can refresh `updated_at` and search vectors.
- The documented October 17 estimates (5,009 unclassified, potentially up to 4,278 already-classified records to inspect) are **not current verified database counts**.
- Deploy the ingestion fixes in this PR first: existing articles must no longer be overwritten by feed-default upserts. Schedule a quiet maintenance window for the classify cron and other article writers, especially during restoration. The backfill protects itself from stale snapshots; older unrelated writers may still overwrite a committed result later. Completion is a point-in-time count, not a guarantee against future writes.

## Setup and preview (operator run after approval)

1. Verify the deployed branch contains the ingestion fix and protocol-v2 backfill endpoint. Keep a database backup and export any pre-existing audit rows before repair.
2. Apply the **entire revised** `scripts/011_classification_backfill_audit.sql` once. It creates/upgrades the audit table and installs service-role-only, security-invoker functions in a transaction. It does not repair article data. Reapply the full file if the original version was already installed. Existing audit rows retain `atomic_version = NULL`; they are unverified and cannot be restored automatically.
3. Verify permissions and expected columns in a staging database first. The existing `articles` schema must include `classified_at` and `updated_at`, as used by the classifier. Confirm that the normal article update trigger maintains `updated_at`.
4. Get current read-only counts:

   ```sql
   SELECT count(*) FILTER (WHERE ai_summary IS NULL) AS unclassified,
          count(*) FILTER (WHERE ai_summary IS NOT NULL AND 'brand_sellers' = ANY(audience)) AS overwritten
   FROM public.articles;
   ```

5. With `CRON_SECRET` supplied through the environment, preview each mode. These commands make no AI calls or classification writes:

   ```bash
   BASE_URL=https://marketplacebeta.com node scripts/backfill-classification.mjs --mode overwritten --dry-run
   BASE_URL=https://marketplacebeta.com node scripts/backfill-classification.mjs --mode unclassified --dry-run
   ```

Dry-run costs are rough estimates using the historical assumptions of 2,000 input / 450 output tokens and $3 / $15 per million tokens (~$0.01275/article). Verify current model pricing and quotas separately; the printed estimate is not actual spend. Failed calls and repeated attempts can add cost.

## Processing and resuming

After reviewing samples, run overwritten records first, then unclassified records, using separate state files. Example for the first mode:

```bash
BASE_URL=https://marketplacebeta.com node scripts/backfill-classification.mjs \
  --mode overwritten --state-file .backfill-state-overwritten.json \
  --max-passes 2 --max-calls 50 --limit 40 --concurrency 8
```

The driver generates a unique run ID (or accepts `--run-id`, maximum 64 characters). It saves target URL, mode, run ID, cursor, pass, and totals **before the first request**, then atomically replaces the checkpoint after responses. Use one driver per state file. Keep checkpoints outside source control. Re-run the same command to resume. Do not delete a checkpoint merely to hide an incomplete run.

- Exit **0**: dry run succeeded, or a fresh database count confirmed `remainingAfter = 0`. Only the latter prints `done`.
- Exit **2**: five consecutive API/protocol failures. Progress remains at the last confirmed cursor.
- Exit **3**: incomplete because `--max-calls` or `--max-passes` was exhausted. Inspect errors before retrying. Call-budget stops resume directly; after pass exhaustion, increase `--max-passes` above the saved pass budget to authorize additional attempts. The retry cursor has already been reset.
- Exit **130/143**: interrupted by SIGINT/SIGTERM. Resume with the same state file. Exit **1** indicates invalid options/state or a local failure requiring attention.

Protocol-v1 state files lack target binding and must not be silently reused. Preserve them for review, then choose a new `--state-file` for an intentional fresh run against the v2 endpoint. Already-processed rows no longer match the selector. A mismatched URL/mode/run ID or corrupt checkpoint fails before processing.

`passComplete` means the current ID range ended; it does **not** mean the archive is complete. Errors and guarded skips can leave rows behind the cursor. Subsequent passes start at the beginning. Time-budget stops leave unattempted rows after the saved cursor. Repeating a request after a lost response cannot double-apply a stale snapshot. Driver totals include acknowledged responses only; a commit whose HTTP response was lost may be absent from local totals. Use the atomic audit for authoritative committed-change counts.

## Audit and verification

The endpoint calls `apply_article_classification_backfill` once per result. The database locks the article, checks its eligibility and full selected snapshot (inputs, classification fields, timestamps), writes classification values, and inserts the actual before/after values in one transaction. A skip creates no audit record. An update or audit failure rolls back the change. AI calls occur outside the lock. Malformed/empty classification results remain pending.

After a run, repeat the read-only counts and review the run's committed rows:

```sql
SELECT run_id, mode,
       count(*) FILTER (WHERE atomic_version = 1) AS committed,
       count(*) FILTER (WHERE atomic_version = 1 AND restored_at IS NULL) AS not_restored,
       count(*) FILTER (WHERE restored_at IS NOT NULL) AS restored,
       count(*) FILTER (WHERE atomic_version IS DISTINCT FROM 1) AS legacy_unverified
FROM public.article_classification_audit
GROUP BY run_id, mode;
```

Spot-check exact before/after values and source articles across both modes. `committed` describes historical transactions, not a claim that every after-state is still current. Concurrent or later edits are possible. Do not count legacy audit rows as successful repairs without independent evidence.

## Guarded restoration

Do **not** use the old unconditional `UPDATE ... FROM audit WHERE run_id = ...` example. It could choose arbitrary values from multiple audit entries, overwrite newer edits, and turn SQL NULL arrays into empty arrays. It also failed to cover the unclassified mode.

1. Stop backfill drivers and quiesce other article writers for the recovery window. Restored articles become eligible for classification again; resume processing only intentionally.
2. Export and review the precise audit IDs for the chosen run, including `before`, `after`, `after_snapshot`, `atomic_version`, and `restored_at`. Do not infer applied changes from legacy rows.
3. For **one reviewed audit ID at a time**, use the restore function. Preview inside a transaction first; replace `:audit_id` with a reviewed psql variable (or the reviewed numeric ID in the SQL editor):

   ```sql
   BEGIN;
   SELECT public.restore_article_classification_backfill(:audit_id);
   -- Inspect the article and audit entry in this same transaction.
   ROLLBACK;
   ```

4. If the preview returns `restored` and the values are correct, repeat the same reviewed call in a new transaction and `COMMIT`. The article update and `restored_at` marker commit together. The function covers both modes and preserves null arrays, empty arrays, null text, and timestamps exactly. Normal `updated_at` / search triggers still run.
5. Handle the result explicitly: `already_restored` is an idempotent no-op; `conflict` means a later edit or later unrestored audit exists; `legacy_unverified`, `missing`, and `not_found` require investigation. No status other than `restored` applies a change. Do not remove guards to force restoration.

Restore only the newest eligible entry for an article. Earlier history is not automatically replayed in reverse: restoring a newer entry changes the row timestamp, so older guards can remain conflicted. Investigate those cases individually using the exported history and database backup. Recheck pending counts after recovery; a rolled-back repair is intentionally no longer complete.

## Regression checks (no production access)

`npm run test:backfill` runs the driver, endpoint, and PostgreSQL regression tests. PGlite is a pinned development-only PostgreSQL WASM dependency; database fixtures live only in process memory. Tests exercise real SQL transactions, constraints, triggers, grants, and stale-snapshot interleavings. PGlite serializes calls, so these tests do not measure multi-session lock scheduling on a hosted Postgres instance. Before the separately approved production run, validate schema/permissions and a small synthetic staging fixture on the actual database version.
