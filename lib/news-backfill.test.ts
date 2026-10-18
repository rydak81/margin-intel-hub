import { describe, expect, it } from 'vitest'
import { buildBackfillUpdate, estimateCostUsd, isFeedDefaultOverwrite, matchesMode, toRelevanceInt } from './news-backfill'

const classified = {
  aiSummary: 'Amazon raised FBA fees 3%.', ourTake: 'Re-check margins.', keyTakeaways: ['a', 'b'], bottomLine: 'Fees up.',
  whatThisMeans: 'Margin compression.', category: 'profitability', platforms: ['amazon'], audience: ['sellers', 'brand_sellers'],
  impactLevel: 'high', keyStat: '3% fee increase', relevanceScore: 0.82, relevant: true, rejectionReason: null,
}

describe('mode selectors', () => {
  it('detects feed-default overwrites only on classified rows', () => {
    expect(isFeedDefaultOverwrite({ ai_summary: 'x', audience: ['brand_sellers', 'agencies'] })).toBe(true)
    expect(isFeedDefaultOverwrite({ ai_summary: 'x', audience: ['brand_sellers'] })).toBe(true) // NewsAPI default
    expect(isFeedDefaultOverwrite({ ai_summary: 'x', audience: ['sellers', 'agencies'] })).toBe(false)
    expect(isFeedDefaultOverwrite({ ai_summary: null, audience: ['brand_sellers', 'agencies'] })).toBe(false)
    expect(matchesMode({ id: '1', ai_summary: null, audience: [] }, 'unclassified')).toBe(true)
  })
})

describe('buildBackfillUpdate', () => {
  it('overwritten mode restores structured fields only and leaves AI text + classified_at alone', () => {
    const u = buildBackfillUpdate('overwritten', classified, '2026-10-18T00:00:00Z')
    expect(Object.keys(u).sort()).toEqual(['audience', 'category', 'impact_level', 'platforms', 'rejection_reason', 'relevance_score', 'relevant'])
    expect(u.audience).toEqual(['sellers'])
    expect(u.relevance_score).toBe(82)
  })

  it('unclassified mode fills text fields but never touches title/summary/content/images', () => {
    const u = buildBackfillUpdate('unclassified', classified, '2026-10-18T00:00:00Z')
    expect(u.ai_summary).toBe(classified.aiSummary)
    expect(u.classified_at).toBe('2026-10-18T00:00:00Z')
    for (const k of ['title', 'summary', 'full_content', 'image_url', 'published_at', 'source_url', 'source_name']) expect(u).not.toHaveProperty(k)
  })

  it('a processed row no longer matches its selector (idempotent)', () => {
    const u = buildBackfillUpdate('overwritten', classified, 'now')
    expect(isFeedDefaultOverwrite({ ai_summary: 'x', audience: u.audience as string[] })).toBe(false)
  })
})

describe('helpers', () => {
  it('rejects empty or malformed classifications instead of marking them complete', () => {
    expect(() => buildBackfillUpdate('unclassified', { ...classified, aiSummary: '' }, 'now')).toThrow('Invalid classification')
    expect(() => buildBackfillUpdate('overwritten', { ...classified, relevanceScore: NaN }, 'now')).toThrow('Invalid classification')
  })
  it('clamps relevance', () => {
    expect(toRelevanceInt(0.456)).toBe(46)
    expect(toRelevanceInt(74)).toBe(74)
    expect(toRelevanceInt(5)).toBe(5)
    expect(toRelevanceInt(-1)).toBe(0)
  })
  it('estimates Sonnet 4.6 cost', () => {
    expect(estimateCostUsd(1000)).toBe(12.75)
  })
})

