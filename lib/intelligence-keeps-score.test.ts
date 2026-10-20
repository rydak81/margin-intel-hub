import { describe, expect, it } from 'vitest'
import { FORECASTS, scoreForecasts, type Forecast } from '@/lib/forecasts'
import { computePressureIndex } from '@/lib/pressure-index'
import { FEE_CHANGELOG, feeChangelogNewestFirst } from '@/lib/fee-changelog'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { newsletterSource } from '@/lib/newsletter-source'

describe('forecast ledger', () => {
  it('seeds the 12 Edition 1 forecasts, all open, with valid dates and no probabilities', () => {
    expect(FORECASTS.map(f => f.id)).toEqual(Array.from({ length: 12 }, (_, i) => `F${i + 1}`))
    for (const f of FORECASTS) {
      expect(f.status).toBe('open')
      expect(f).not.toHaveProperty('probability')
      expect(Number.isFinite(Date.parse(f.resolveBy))).toBe(true)
    }
  })
  it('reports zero hits and misses until something resolves', () => {
    const s = scoreForecasts()
    expect(s).toEqual({ total: 12, open: 12, resolved: 0, hits: 0, misses: 0, unresolvable: 0 }) // page shows 'First forecasts resolve January 2027'
  })
  it('counts hits and misses once resolved', () => {
    const resolved: Forecast[] = [
      { ...FORECASTS[0], status: 'hit' },
      { ...FORECASTS[1], status: 'miss' },
      ...FORECASTS.slice(2),
    ]
    const s = scoreForecasts(resolved)
    expect(s).toEqual({ total: 12, open: 10, resolved: 2, hits: 1, misses: 1, unresolvable: 0 })
  })
  it('counts unresolvable forecasts as resolved, not open, and as neither hit nor miss', () => {
    const resolved: Forecast[] = [
      { ...FORECASTS[0], status: 'unresolvable' },
      ...FORECASTS.slice(1),
    ]
    const s = scoreForecasts(resolved)
    expect(s).toEqual({ total: 12, open: 11, resolved: 1, hits: 0, misses: 0, unresolvable: 1 })
  })
  it('accepts the campaign_forecasts and campaign_pressure_index sources', () => {
    expect(newsletterSource('?source=campaign_forecasts')).toBe('newsletter_campaign_forecasts')
    expect(newsletterSource('?source=campaign_pressure_index')).toBe('newsletter_campaign_pressure_index')
  })
})

describe('pressure index', () => {
  const now = new Date('2026-10-16T00:00:00Z')
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
  it('returns an empty state with no data', () => {
    expect(computePressureIndex([], now).status).toBe('empty')
  })
  it('ranks keys by last-7-day count over trailing weekly average', () => {
    const articles = [
      // logistics: 1/week for 4 prior weeks, 4 this week -> index 4
      ...[10, 17, 24, 27].map(d => ({ published_at: daysAgo(d), category: 'logistics', platforms: ['amazon'] })),
      ...[1, 2, 3, 4].map(d => ({ published_at: daysAgo(d), category: 'logistics', platforms: [] })),
      // advertising: 2/week prior, 2 this week -> index 1
      ...[8, 9, 15, 16, 22, 23, 26, 27].map(d => ({ published_at: daysAgo(d), category: 'advertising', platforms: null })),
      ...[1, 2].map(d => ({ published_at: daysAgo(d), category: 'advertising', platforms: null })),
    ]
    const r = computePressureIndex(articles, now)
    expect(r.status).toBe('ok')
    expect(r.weeksOfHistory).toBe(3)
    expect(r.rows[0].key).toBe('topic:logistics')
    expect(r.rows[0].current).toBe(4)
    expect(r.rows.find(x => x.key === 'topic:advertising')?.current).toBe(2)
    expect(r.rows[0].weekly.at(-1)).toBe(4)
  })
})

describe('fee changelog', () => {
  it('has dated entries no newer than the newest verified fee table', () => {
    const newest = Math.max(...MARKETPLACES.map(m => Date.parse(m.lastVerified)))
    for (const e of FEE_CHANGELOG) {
      expect(e.changes.length).toBeGreaterThan(0)
      expect(Date.parse(e.date)).toBeLessThanOrEqual(newest)
    }
    expect(feeChangelogNewestFirst()[0]).toBe(FEE_CHANGELOG.at(-1))
  })
})
