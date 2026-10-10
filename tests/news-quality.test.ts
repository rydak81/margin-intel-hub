import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native TS runner requires explicit extensions.
import { recentArticles, datedSummary } from '../lib/news-freshness.ts'
// @ts-expect-error Native TS runner requires explicit extensions.
import { buildOperatorBriefing } from '../lib/operator-briefing.ts'
import type { ClassifiedArticle } from '../lib/ai-classifier'
const now = Date.parse('2026-10-10T12:00:00Z')
test('news windows exclude invalid, future, and stale dates and sort newest first', () => {
  const records = ['2026-10-02', '2026-10-09', '2026-10-08', '2026-10-11', 'invalid'].map(publishedAt => ({ publishedAt }))
  assert.deepEqual(recentArticles(records, 7, now).map(a => a.publishedAt), ['2026-10-09', '2026-10-08'])
})
test('old relative-date summaries are withheld rather than presented as current', () => {
  const text = 'Prime Day ends tonight. Adjust your campaigns now.'
  assert.doesNotMatch(datedSummary(text, '2026-10-07', now), /ends tonight/)
  assert.match(datedSummary(text, '2026-10-07', now), /2026-10-07/)
  assert.equal(datedSummary('Amazon reported a fee change.', '2026-10-07', now), 'Amazon reported a fee change.')
  assert.match(datedSummary(text, 'invalid', now), /unavailable/)
})
test('briefing counts only its dated snapshot, carries source dates, and never invents urgency', () => {
  const input = [
    { id: 'recent', title: 'Amazon fee changes', publishedAt: '2026-10-08T12:00:00Z', category: 'profitability', sourceName: 'Amazon', summary: 'Ends tonight', impactLevel: 'high', platforms: ['amazon'], actionItem: 'Act now' },
    { id: 'old', title: 'Old event', publishedAt: '2026-09-01', category: 'events', sourceName: 'Old source' },
  ] as ClassifiedArticle[]
  const { briefing, articles } = buildOperatorBriefing(input, now)
  assert.equal(articles.length, 1)
  assert.equal(briefing.metrics[0].value, '1')
  assert.equal(briefing.metrics[1].value, '1')
  assert.equal(briefing.signals[0].publishedAt, input[0].publishedAt)
  assert.doesNotMatch(JSON.stringify(briefing), /Ends tonight|Act now/)
  const empty = buildOperatorBriefing([], now).briefing
  assert.match(empty.dek, /unavailable/)
  assert.equal(empty.signals.length, 0)
  assert.equal(empty.sellerAlerts.length, 0)
})
