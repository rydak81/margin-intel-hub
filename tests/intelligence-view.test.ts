import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Native TypeScript tests use explicit extensions.
import { DEFAULT_INTELLIGENCE_VIEW, validateIntelligenceView, viewFromSearch, viewSearch } from '../lib/intelligence-view.ts'
test('platform entry links and shared views preserve validated filters', () => {
  const view = { days: 30, platform: 'amazon', audience: 'sellers', category: 'profitability', query: 'fees & returns' }
  assert.deepEqual(viewFromSearch(viewSearch(view)), view)
  assert.equal(viewFromSearch('?platform=etsy')?.platform, 'etsy')
  assert.equal(viewFromSearch('?utm_source=newsletter'), null)
})
test('malformed saved values and invalid links cannot become unsupported filters', () => {
  assert.deepEqual(validateIntelligenceView(null), DEFAULT_INTELLIGENCE_VIEW)
  assert.deepEqual(validateIntelligenceView({days:-5,platform:'anything',audience:[],category:'unknown',query:42}), DEFAULT_INTELLIGENCE_VIEW)
  assert.equal(validateIntelligenceView({query:'x'.repeat(4000)}).query.length,120)
  assert.equal(viewSearch(DEFAULT_INTELLIGENCE_VIEW),'')
})
