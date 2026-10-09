import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native TS runner uses explicit extensions.
import { curateArticleFeed } from '../lib/feed-curation.ts'
const base = { id: 'first', title: 'Amazon raises fulfillment fees for oversized products', category: 'profitability', platforms: ['amazon'], publishedAt: '2026-10-09T12:00:00Z', sourceName: 'Amazon Seller News', sourceType: 'industry' as const, relevanceScore: 80, impactLevel: 'high' as const, isBreaking: false }
test('filters irrelevant records and collapses syndicated headlines, preserving requested order', () => {
  const rows = [base, { ...base, id: 'duplicate', relevanceScore: 100, title: `${base.title} | Different Publisher` }, { ...base, id: 'other', title: 'Walmart adds delivery options', platforms: ['walmart'] }, { ...base, id: 'excluded', title: 'Prime Video releases movie trailer' }]
  assert.deepEqual(curateArticleFeed(rows, { preserveOrder: true }).map(row => row.id), ['first', 'other'])
})
test('shared repeated words do not collapse distinct operational developments', () => {
  const rows = [{ ...base, title: 'Amazon Amazon Amazon fee pricing campaign changes' }, { ...base, id: 'distinct', title: 'Amazon inventory compliance returns warehouse deadlines' }]
  assert.equal(curateArticleFeed(rows).length, 2)
})
