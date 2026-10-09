import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native TS runner uses explicit extensions.
import { filterIntelligence, safeSourceUrl, type IntelligenceArticle } from '../lib/intelligence.ts'
const now = Date.parse('2026-10-09T12:00:00Z')
const base: IntelligenceArticle = { id: 'a', title: 'Amazon fulfillment fees change', summary: 'Shipping costs', sourceName: 'Official source', sourceUrl: 'https://example.com', publishedAt: '2026-10-08T12:00:00Z', category: 'logistics', platforms: ['amazon', 'walmart'], audience: ['sellers'], impactLevel: 'high', actionItem: 'Review costs' }
const all = { days: 7, platform: 'all', audience: 'all', category: 'all', query: '' }
const ids = (rows: IntelligenceArticle[]) => rows.map(row => row.id)
test('filters by publication window, excludes invalid and future records, newest first', () => {
  const rows = [base, { ...base, id: 'old', publishedAt: '2026-09-10' }, { ...base, id: 'future', publishedAt: '2026-10-10' }, { ...base, id: 'invalid', publishedAt: 'invalid' }, { ...base, id: 'new', publishedAt: '2026-10-09T11:00:00Z' }]
  assert.deepEqual(ids(filterIntelligence(rows, all, now)), ['new', 'a'])
  assert.deepEqual(ids(filterIntelligence(rows, { ...all, days: 30 }, now)), ['new', 'a', 'old'])
})
test('combines platform, role, category and text without assuming missing coverage', () => {
  const rows = [base, { ...base, id: 'etsy', platforms: ['etsy'], audience: ['agencies'], category: 'advertising' }]
  assert.deepEqual(ids(filterIntelligence(rows, { ...all, platform: 'walmart', audience: 'logistics', query: ' SHIPPING ' }, now)), ['a'])
  assert.equal(filterIntelligence(rows, { ...all, platform: 'alibaba' }, now).length, 0)
  assert.equal(filterIntelligence(rows, { ...all, audience: 'agencies', category: 'logistics' }, now).length, 0)
})
test('only renders safe outbound source protocols', () => {
  assert.equal(safeSourceUrl('javascript:alert(1)'), null)
  assert.equal(safeSourceUrl('/relative'), null)
  assert.equal(safeSourceUrl('https://example.com/report'), 'https://example.com/report')
})

// @ts-expect-error Native TS runner uses explicit extensions.
import { normalizeIntelligenceTags } from '../lib/intelligence.ts'
test('legacy broad tags remain usable without pretending rule routing is source classification', () => {
  const legacy = { title: 'Retail media advertising costs', category: 'ecommerce', platforms: ['general'], audience: ['brand_sellers', 'brands'] }
  assert.deepEqual(normalizeIntelligenceTags(legacy), { category: 'advertising', categoryBasis: 'headline_rule', platforms: ['multi_platform'], audience: ['sellers'] })
  assert.equal(normalizeIntelligenceTags({ ...legacy, title: 'Executive appointments' }).category, 'commerce_context')
  assert.equal(normalizeIntelligenceTags({ ...legacy, category: 'logistics' }).categoryBasis, 'stored')
  const tech = { ...base, category: 'tools_technology', audience: [] }
  assert.equal(filterIntelligence([tech], { ...all, audience: 'saas' }, now).length, 1)
})
