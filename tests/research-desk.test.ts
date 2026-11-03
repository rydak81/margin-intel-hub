import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native Node TypeScript imports require the explicit extension.
import { buildResearchBrief, type ResearchRow } from '../lib/research-desk.ts'

function fixture(): ResearchRow[] {
  return ['one.example', 'two.example', 'three.example'].flatMap((source, s) =>
    ['2026-10-10', '2026-10-25'].flatMap((date, p) => Array.from({ length: 10 }, (_, i) => ({
      id: `${s}-${p}-${i}`, title: `${i < (p ? 4 : 2) ? 'AI agents' : 'Seller operations'} report ${s}-${p}-${i}`,
      source_url: `https://${source}/article/${p}/${i}`, source_name: source,
      published_at: `${date}T00:00:00Z`, relevant: true, relevance_score: 80,
    }))))
}
const run = (rows: ResearchRow[], complete = true, asOf = '2026-10-27T00:00:00Z') => buildResearchBrief({ rows, complete, asOf, days: 14 })

test('uses equal half-open windows, actual denominators and source-balanced shares', () => {
  const brief = run(fixture()), topic = brief.metrics[0]
  assert.equal(topic.currentN, 30); assert.equal(topic.baselineN, 30)
  assert.equal(topic.currentHits, 12); assert.equal(topic.baselineHits, 6)
  assert.ok(Math.abs(topic.pooledChangePP! - 20) < 1e-9)
  assert.ok(Math.abs(topic.balancedChangePP! - 20) < 1e-9)
  assert.equal(topic.status, 'candidate')
  assert.equal(brief.metrics[1].status, 'hold')
})
test('removes tracking duplicates, syndicated exact titles and duplicate ids deterministically', () => {
  const rows = fixture(), first = rows[0]
  const duplicates = [
    { ...first, id: 'dup1', title: 'Changed headline', source_url: first.source_url + '?utm_source=mail' },
    { ...first, id: 'dup2', source_url: 'https://elsewhere.example/new' },
    { ...first, title: 'Another version', source_url: 'https://elsewhere.example/id' },
  ]
  const a = run([...rows, ...duplicates]), b = run([...duplicates, ...rows].reverse())
  assert.deepEqual(a, b); assert.equal(a.eligibleCount, 60); assert.equal(a.omitted.duplicates, 3)
})
test('excludes invalid, future, irrelevant and low-confidence records', () => {
  const r = fixture()[0]
  const b = run([...fixture(),
    { ...r, id: 'future', published_at: '2026-10-27T00:00:00Z' },
    { ...r, id: 'bad', published_at: 'bad-date' },
    { ...r, id: 'irrelevant', relevant: false },
    { ...r, id: 'null', relevance_score: null },
    { ...r, id: 'promo', title: 'Amazon coupon code for today' },
  ])
  assert.equal(b.eligibleCount, 60); assert.equal(b.omitted.outsideWindow, 1)
  assert.equal(b.omitted.invalid, 1); assert.equal(b.omitted.notEligible, 3)
})
test('holds incomplete, stale and thin-source comparisons; missing is null', () => {
  assert.ok(run(fixture(), false).metrics.every(t => t.status === 'hold'))
  assert.ok(run(fixture(), true, '2026-11-03T00:00:00Z').issues.some(i => i.includes('seventy-two')))
  const empty = run([])
  assert.equal(empty.metrics[0].currentShare, null)
  assert.equal(empty.metrics[0].balancedChangePP, null)
  assert.ok(empty.metrics.every(t => t.status === 'hold'))
  assert.ok(run(fixture().filter(r => r.source_name === 'one.example')).issues.some(i => i.includes('three sources')))
})
test('source additions cannot masquerade as a comparable trend', () => {
  const rows = fixture()
  const addition = Array.from({ length: 60 }, (_, i) => ({ ...rows[0], id: `new-${i}`, title: `AI agents new-${i}`, source_url: `https://new.example/${i}`, published_at: '2026-10-26T00:00:00Z' }))
  const b = run([...rows, ...addition])
  assert.equal(b.matchedArticleCount, 60)
  assert.equal(b.metrics[0].currentHits, 12)
  assert.ok(b.issues.some(i => i.includes('source mix')))
})
test('refuses ambiguous cutoffs and invalid windows', () => {
  assert.throws(() => run([], true, '2026-11-03'), /UTC/)
  assert.throws(() => buildResearchBrief({ rows: [], complete: true, asOf: '2026-11-03T00:00:00Z', days: 0 }), /7–90/)
})

test('holds Simpson reversal even when pooled volume looks decisive', () => {
  const rows: ResearchRow[] = []
  for (const [s, bn, bh, cn, ch] of [['a', 90, 81, 10, 10], ['b', 10, 1, 90, 18], ['c', 10, 1, 10, 2]] as const) {
    for (const [p, n, hits, date] of [['base', bn, bh, '2026-10-10'], ['cur', cn, ch, '2026-10-25']] as const) {
      for (let i = 0; i < n; i++) rows.push({ id: `${s}-${p}-${i}`, title: `${i < hits ? 'AI agents' : 'Operations'} ${s}-${p}-${i}`, source_name: s, source_url: `https://${s}.example/${p}/${i}`, published_at: `${date}T00:00:00Z`, relevant: true, relevance_score: 80 })
    }
  }
  const topic = run(rows).metrics[0]
  assert.ok(topic.pooledChangePP! < 0); assert.ok(topic.balancedChangePP! > 0)
  assert.ok(topic.review.some(x => x.includes('disagree'))); assert.equal(topic.status, 'hold')
})

test('assigns exact boundary timestamps to the correct half-open period', () => {
  const r = fixture()[0]
  const b = run([{ ...r, published_at: '2026-10-13T00:00:00Z' }])
  assert.equal(b.eligibleCount, 1)
  assert.equal(b.omitted.outsideWindow, 0)
  assert.equal(run([{ ...r, published_at: '2026-09-28T23:59:59Z' }]).eligibleCount, 0)
  assert.equal(run([{ ...r, published_at: '2026-09-29T00:00:00Z' }]).eligibleCount, 1)
})
