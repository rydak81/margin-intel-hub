import { describe, expect, it } from 'vitest'
import { dedupeByTitle, isIndexableNewsArticle, splitSourceSuffix, withheldSummaryDescription } from '@/lib/seo-indexing'

describe('news indexing rule', () => {
  it('keeps ingested third-party briefings out of the index', () => {
    expect(isIndexableNewsArticle({ source_type: 'industry' })).toBe(false)
    expect(isIndexableNewsArticle({ source_type: 'google' })).toBe(false)
    expect(isIndexableNewsArticle({ source_type: null })).toBe(false)
    expect(isIndexableNewsArticle({})).toBe(false)
  })
  it('indexes first-party posts', () => {
    expect(isIndexableNewsArticle({ source_type: 'original' })).toBe(true)
  })
})

describe('news metadata helpers', () => {
  it('keeps the earliest copy of a re-ingested story', () => {
    const rows = [
      { id: 'b', title: 'Same Story!', published_at: '2026-10-02T00:00:00Z' },
      { id: 'a', title: 'same story', published_at: '2026-10-01T00:00:00Z' },
      { id: 'c', title: 'Other story', published_at: null },
    ]
    expect(dedupeByTitle(rows).map(r => r.id)).toEqual(['a', 'c'])
  })
  it('strips the publisher suffix from aggregator titles only', () => {
    expect(splitSourceSuffix('How to Sell on Amazon - Shopify', 'Google News - Shopify Sellers')).toEqual({ headline: 'How to Sell on Amazon', publisher: 'Shopify' })
    expect(splitSourceSuffix('Q4 recap - Marketplace Pulse', 'Marketplace Pulse').headline).toBe('Q4 recap')
    expect(splitSourceSuffix('Buy-side vs sell-side - a primer', 'Supply Chain Dive').headline).toBe('Buy-side vs sell-side - a primer')
  })
  it('builds a unique fallback description without aggregator feed names', () => {
    expect(withheldSummaryDescription('Walmart adds carriers', 'Google News - Supply Chain', '2026-10-09T12:00:00Z')).toBe('Report from 2026-10-09: Walmart adds carriers. Operator impact, why it matters and what to check next.')
    expect(withheldSummaryDescription('Walmart adds carriers', 'Supply Chain Dive', '2026-10-09T12:00:00Z')).toContain('Supply Chain Dive report from 2026-10-09')
  })
})
