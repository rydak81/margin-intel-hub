import { describe, expect, it } from 'vitest'
import { MARKETPLACES, computeFeeBreakdown } from '@/lib/marketplace-fees'
import { SALE_PRICES, getAllSaleRoutes, parseSalePrice, saleFeeSummary, salePath } from '@/lib/sale-fee-pages'

describe('sale fee pages', () => {
  it('enumerates every marketplace x price', () => {
    expect(getAllSaleRoutes()).toHaveLength(MARKETPLACES.length * SALE_PRICES.length)
    expect(salePath('amazon', 30)).toBe('/fees/amazon/on-a-30-sale')
  })
  it('only accepts the published prices', () => {
    expect(parseSalePrice('30')).toBe(30)
    expect(parseSalePrice('31')).toBeNull()
    expect(parseSalePrice('abc')).toBeNull()
  })
  it('matches the calculator engine exactly', () => {
    for (const m of MARKETPLACES) for (const p of SALE_PRICES) {
      const s = saleFeeSummary(m.slug, p)!
      for (const r of s.rows) {
        expect(r.totalFees).toBe(computeFeeBreakdown({ salePrice: p, unitCost: 0, marketplace: m, category: r.category }).totalFees)
      }
      expect(s.min.totalFees).toBeLessThanOrEqual(s.max.totalFees)
    }
  })
})
