import { describe, expect, it } from 'vitest'
import { computePressureIndex, type PressureArticle } from '@/lib/pressure-index'

const now = new Date('2026-10-16T00:00:00Z')
const DAY = 86400000

/** Spread `n` articles evenly inside week k (week 0 = last 7 days). */
function week(k: number, n: number, make: (i: number) => Omit<PressureArticle, 'published_at'>): PressureArticle[] {
  return Array.from({ length: n }, (_, i) => ({
    published_at: new Date(now.getTime() - (k * 7 + 0.5 + (6 * i) / Math.max(1, n)) * DAY).toISOString(),
    ...make(i),
  }))
}

/** A synthetic week with a fixed mix: 40% amazon, 20% walmart, 10% ebay, rest untagged; topics split logistics/advertising. */
function mixedWeek(k: number, total: number): PressureArticle[] {
  return week(k, total, i => {
    const r = i / total
    const platforms = r < 0.4 ? ['amazon'] : r < 0.6 ? ['walmart'] : r < 0.7 ? ['ebay'] : []
    return { category: i % 2 ? 'logistics' : 'advertising', platforms }
  })
}

describe('pressure index normalization', () => {
  it('uniform volume growth yields ~1.0x for every key', () => {
    // Volume grows 10x across the baseline and current week, with the same mix every week.
    const articles = Array.from({ length: 13 }, (_, k) => mixedWeek(k, 20 * (13 - k))).flat()
    const r = computePressureIndex(articles, now)
    expect(r.status).toBe('ok')
    expect(r.baselineWeeks).toBeGreaterThanOrEqual(10) // the thinnest early ramp-up week may be filtered
    expect(r.totalCurrent).toBe(260)
    for (const row of r.rows) {
      expect(row.index).toBeGreaterThan(0.95)
      expect(row.index).toBeLessThan(1.05)
      // ...while the raw count ratio is inflated by our own growth.
      expect(row.rawRatio).toBeGreaterThan(1.5)
    }
  })

  it('a stray ancient article does not dilute the baseline (the 2014 bug)', () => {
    const articles = [
      { published_at: '2014-05-07T00:00:00Z', category: 'logistics', platforms: ['ebay'] },
      ...Array.from({ length: 13 }, (_, k) => mixedWeek(k, 100)).flat(),
    ]
    const r = computePressureIndex(articles, now)
    expect(r.weeksOfHistory).toBeGreaterThan(600)
    expect(r.baselineWeeks).toBe(12)
    const ebay = r.rows.find(x => x.key === 'platform:ebay')!
    expect(ebay.baseline).toBe(10)
    expect(ebay.index).toBeCloseTo(1, 1)
  })

  it('detects a genuine shift in share even when total volume is flat', () => {
    const prior = Array.from({ length: 12 }, (_, i) => mixedWeek(i + 1, 100)).flat()
    // This week: same 100 articles, but eBay takes 30% instead of 10% (Amazon drops to 20%).
    const current = week(0, 100, i => ({ category: 'advertising', platforms: i < 20 ? ['amazon'] : i < 40 ? ['walmart'] : i < 70 ? ['ebay'] : [] }))
    const r = computePressureIndex([...prior, ...current], now)
    expect(r.rows[0].key).toBe('platform:ebay')
    expect(r.rows[0].index).toBe(3)
    expect(r.rows[0].share).toBe(0.3)
    expect(r.rows[0].baselineShare).toBe(0.1)
    expect(r.rows.find(x => x.key === 'platform:amazon')!.index).toBe(0.5)
  })

  it('uses only the trailing baseline window', () => {
    // Old weeks (13-30) had eBay at 50%; the last 12 weeks at 10%. A 12-week baseline ignores the old regime.
    const old = Array.from({ length: 18 }, (_, i) => week(i + 13, 100, j => ({ category: 'advertising', platforms: j < 50 ? ['ebay'] : [] }))).flat()
    const recent = Array.from({ length: 13 }, (_, k) => mixedWeek(k, 100)).flat()
    const r12 = computePressureIndex([...old, ...recent], now)
    expect(r12.rows.find(x => x.key === 'platform:ebay')!.index).toBeCloseTo(1, 1)
    const r30 = computePressureIndex([...old, ...recent], now, { baselineWeeks: 30 })
    expect(r30.rows.find(x => x.key === 'platform:ebay')!.index).toBeLessThan(0.5)
  })

  it('skips thin baseline weeks and does not rank low-volume keys', () => {
    const articles = [
      ...Array.from({ length: 10 }, (_, k) => mixedWeek(k, 100)).flat(),
      // Weeks 10-12: ingestion ramp-up with almost nothing, all eBay. Would skew eBay's share if counted.
      ...[10, 11, 12].flatMap(k => week(k, 2, () => ({ category: 'logistics', platforms: ['ebay'] }))),
      // Etsy: 2 articles this week, 1-2 per baseline week -> listed but not ranked.
      ...Array.from({ length: 10 }, (_, k) => week(k, k === 0 ? 2 : 1 + (k % 2), () => ({ category: null, platforms: ['etsy'] }))).flat(),
    ]
    const r = computePressureIndex(articles, now)
    expect(r.baselineWeeks).toBe(9)
    const etsy = r.rows.find(x => x.key === 'platform:etsy')!
    expect(etsy.ranked).toBe(false)
    expect(r.rows.at(-1)!.ranked).toBe(false)
    expect(r.rows[0].ranked).toBe(true)
    expect(r.rows.find(x => x.key === 'platform:ebay')!.index).toBeCloseTo(1, 1)
  })
})
