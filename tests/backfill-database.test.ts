// Real PostgreSQL execution in WASM. No network, credentials, or production data.
import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { buildBackfillUpdate } from '@/lib/news-backfill'
const db = new PGlite()
const sql = readFileSync(new URL('../scripts/011_classification_backfill_audit.sql', import.meta.url), 'utf8')
const classified = { aiSummary: 'Fees changed.', ourTake: 'Review costs.', keyTakeaways: ['Reprice'], bottomLine: 'Act now.', whatThisMeans: null,
  keyStat: null, category: 'profitability', platforms: ['amazon'], audience: ['sellers'], impactLevel: 'high', relevanceScore: 0.8, relevant: true, rejectionReason: null }
const overwritten = buildBackfillUpdate('overwritten', classified, '2026-10-18T00:00:00Z')
const unclassified = buildBackfillUpdate('unclassified', classified, '2026-10-18T00:00:00Z')
async function row() { return (await db.query<any>("SELECT public.article_backfill_snapshot(a) AS value FROM public.articles a WHERE id='art_a'")).rows[0].value }
async function audit() { return (await db.query<any>('SELECT * FROM public.article_classification_audit ORDER BY id')).rows }
async function apply(expected: any, update = overwritten, mode = 'overwritten') {
  return (await db.query<any>('SELECT public.apply_article_classification_backfill($1,$2,$3,$4,$5) AS changed', ['test-run', 'art_a', mode, expected, update])).rows[0].changed
}
async function restore(id: number) { return (await db.query<any>('SELECT public.restore_article_classification_backfill($1) AS status', [id])).rows[0].status }
before(async () => {
  // Focused fixture follows scripts/003,004,005,007 and the existing classified_at
  // column used by the deployed classifier. No production migrations are applied.
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE TABLE public.articles (
      id text PRIMARY KEY, title text NOT NULL, summary text, full_content text, source_name text, published_at timestamptz,
      ai_summary text, our_take text, key_takeaways text[], bottom_line text, what_this_means text, key_stat text,
      category text NOT NULL, platforms text[], audience text[], impact_level text CHECK (impact_level IN ('low','medium','high')),
      relevant boolean, relevance_score integer CHECK (relevance_score BETWEEN 0 AND 100), rejection_reason text,
      classified_at timestamptz, updated_at timestamptz, image_url text);
    CREATE FUNCTION public.touch_article() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = clock_timestamp(); RETURN NEW; END $$;
    CREATE TRIGGER touch BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.touch_article();
    GRANT SELECT, UPDATE ON public.articles TO service_role;`)
  await db.exec(sql)
  await db.exec(sql) // upgrading/reapplying the schema is safe
})
after(async () => { await db.close() })
beforeEach(async () => {
  await db.exec(`DROP TRIGGER IF EXISTS fail_audit ON public.article_classification_audit;
    DROP TRIGGER IF EXISTS veto_article ON public.articles;
    TRUNCATE public.article_classification_audit RESTART IDENTITY;
    TRUNCATE public.articles;
    INSERT INTO public.articles(id,title,summary,source_name,published_at,ai_summary,our_take,category,platforms,audience,impact_level,relevant,relevance_score,classified_at,updated_at,image_url)
    VALUES ('art_a','Original title','Original summary','Source','2026-10-01T00:00:00Z','Original AI','Original take','ecommerce',NULL,ARRAY['brand_sellers'],'medium',true,50,'2026-10-01T01:00:00Z','2026-10-01T02:00:00Z','keep.jpg');`)
})
test('atomic update captures exact committed values and preserves untouched fields', async () => {
  const before = await row(); assert.equal(await apply(before), true)
  const a = (await audit())[0], current = await row()
  for (const key of Object.keys(overwritten)) { assert.deepEqual(a.before[key], before[key]); assert.deepEqual(a.after[key], current[key]) }
  assert.deepEqual(a.after_snapshot, current); assert.equal(current.ai_summary, before.ai_summary); assert.equal(current.classified_at, before.classified_at)
  assert.equal(a.atomic_version, 1); assert.equal(await apply(before), false); assert.equal((await audit()).length, 1)
})
test('concurrent workers using the same snapshot commit only one audit', async () => {
  const expected = await row()
  const outcomes = await Promise.all([apply(expected), apply(expected)])
  assert.deepEqual(outcomes.sort(), [false, true]); assert.equal((await audit()).length, 1)
})
test('edits between selection and commit are skipped even if the mode still matches', async () => {
  const expected = await row(); await db.exec("UPDATE public.articles SET title='Concurrent title', category='logistics' WHERE id='art_a'")
  assert.equal(await apply(expected), false); assert.equal((await row()).category, 'logistics'); assert.equal((await audit()).length, 0)
})
test('deleted or nonmatching articles create no audit', async () => {
  const expected = await row(); await db.exec("UPDATE public.articles SET audience=ARRAY['sellers'] WHERE id='art_a'")
  assert.equal(await apply(await row()), false)
  await db.exec("DELETE FROM public.articles WHERE id='art_a'")
  assert.equal(await apply(expected), false); assert.equal((await audit()).length, 0)
})
test('article constraint failure rolls back without an audit', async () => {
  const expected = await row(); await assert.rejects(apply(expected, { ...overwritten, impact_level: 'invalid' }))
  assert.deepEqual(await row(), expected); assert.equal((await audit()).length, 0)
})
test('audit insertion failure rolls back the article update', async () => {
  const expected = await row()
  await db.exec(`CREATE OR REPLACE FUNCTION public.reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected audit failure'; END $$;
    CREATE TRIGGER fail_audit BEFORE INSERT ON public.article_classification_audit FOR EACH ROW EXECUTE FUNCTION public.reject_audit();`)
  await assert.rejects(apply(expected), /injected audit failure/)
  assert.deepEqual(await row(), expected); assert.equal((await audit()).length, 0)
})
test('a trigger skipping an article update produces no audit', async () => {
  const expected = await row()
  await db.exec(`CREATE OR REPLACE FUNCTION public.veto_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NULL; END $$;
    CREATE TRIGGER veto_article BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.veto_update();`)
  assert.equal(await apply(expected), false); assert.deepEqual(await row(), expected); assert.equal((await audit()).length, 0)
})
test('interrupted transaction rolls back both; replay after a lost response is idempotent', async () => {
  const expected = await row(); await db.exec('BEGIN'); await apply(expected); await db.exec('ROLLBACK')
  assert.deepEqual(await row(), expected); assert.equal((await audit()).length, 0)
  assert.equal(await apply(expected), true); assert.equal(await apply(expected), false); assert.equal((await audit()).length, 1)
})
test('overwritten restoration preserves null arrays, original text, and unrelated fields; retry is idempotent', async () => {
  const expected = await row(); await apply(expected); const a = (await audit())[0]
  assert.equal(await restore(a.id), 'restored'); const current = await row()
  for (const key of Object.keys(overwritten)) assert.deepEqual(current[key], expected[key])
  assert.equal(current.ai_summary, expected.ai_summary); assert.equal(current.classified_at, expected.classified_at)
  assert.equal((await db.query<any>('SELECT image_url FROM public.articles')).rows[0].image_url, 'keep.jpg')
  assert.equal(await restore(a.id), 'already_restored'); assert.ok((await audit())[0].restored_at)
})
test('unclassified restoration restores all changed fields including null text, arrays, and classified_at', async () => {
  await db.exec("UPDATE public.articles SET ai_summary=NULL,our_take=NULL,key_takeaways=NULL,classified_at=NULL WHERE id='art_a'")
  const expected = await row(); assert.equal(await apply(expected, unclassified, 'unclassified'), true)
  const a = (await audit())[0]; assert.equal(await restore(a.id), 'restored')
  for (const key of Object.keys(unclassified)) assert.deepEqual((await row())[key], expected[key])
})
test('restoration refuses later edits, duplicate later audits, and unverified legacy records', async () => {
  await apply(await row()); const a = (await audit())[0]
  await db.exec("UPDATE public.articles SET our_take='Newer analyst take' WHERE id='art_a'")
  assert.equal(await restore(a.id), 'conflict'); assert.equal((await row()).our_take, 'Newer analyst take')
  await db.exec('UPDATE public.article_classification_audit SET atomic_version=NULL')
  assert.equal(await restore(a.id), 'legacy_unverified')
})
test('multiple entries for an article never choose an arbitrary restoration row', async () => {
  await apply(await row()); const a = (await audit())[0]
  await db.exec(`INSERT INTO public.article_classification_audit(run_id,article_id,mode,before,after)
    SELECT run_id,article_id,mode,before,after FROM public.article_classification_audit`)
  assert.equal(await restore(a.id), 'conflict'); assert.equal((await row()).category, 'profitability')
})
test('restoration marker failure rolls back the restored article', async () => {
  await apply(await row()); const a = (await audit())[0], expected = await row()
  await db.exec(`CREATE OR REPLACE FUNCTION public.reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected marker failure'; END $$;
    CREATE TRIGGER fail_audit BEFORE UPDATE ON public.article_classification_audit FOR EACH ROW EXECUTE FUNCTION public.reject_audit();`)
  await assert.rejects(restore(a.id), /injected marker failure/); assert.deepEqual(await row(), expected)
  assert.equal((await audit())[0].restored_at, null)
})
test('RPC rejects extra fields, incomplete snapshots, and an empty unclassified result', async () => {
  const expected = await row(); await assert.rejects(apply(expected, { ...overwritten, title: 'tamper' }), /Unexpected classification/)
  await assert.rejects(apply({ id: expected.id }), /Complete expected snapshot/)
  await db.exec("UPDATE public.articles SET ai_summary=NULL WHERE id='art_a'")
  await assert.rejects(apply(await row(), { ...unclassified, ai_summary: '' }, 'unclassified'), /pending selector/)
  assert.equal((await audit()).length, 0)
})
test('only service role can invoke mutations, with no SECURITY DEFINER bypass', async () => {
  const expected = await row()
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`SET ROLE ${role}`)
    await assert.rejects(apply(expected), /permission denied/)
    await assert.rejects(restore(1), /permission denied/)
    await db.exec('RESET ROLE')
  }
  await db.exec('SET ROLE service_role'); assert.equal(await apply(expected), true); await db.exec('RESET ROLE')
  assert.equal((await db.query<any>("SELECT bool_or(prosecdef) AS elevated FROM pg_proc WHERE proname IN ('apply_article_classification_backfill','restore_article_classification_backfill')")).rows[0].elevated, false)
})
