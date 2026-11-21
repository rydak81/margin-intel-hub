import { describe, expect, it } from 'vitest'
import { MARKETPLACES, computeFeeBreakdown, getCategory, getMarketplace } from '@/lib/marketplace-fees'
import {
  DEFAULT_CALCULATOR_MARKETPLACE,
  computeCalculatorMarketplaceFees,
  defaultCategorySlug,
  resolveCalculatorCategory,
} from '@/lib/profit-calculator-fees'

/** The /fees pages' own number for the same sale, straight from the canonical tables. */
function feePageTotal(marketplace: string, category: string, salePrice: number): number {
  return computeFeeBreakdown({
    salePrice,
    unitCost: 0,
    marketplace: getMarketplace(marketplace)!,
    category: getCategory(marketplace, category)!,
  }).totalFees
}

describe('profit calculator marketplace fees', () => {
  it('defaults to Amazon Everything Else, the catch-all row in the fee table', () => {
    expect(DEFAULT_CALCULATOR_MARKETPLACE).toBe('amazon')
    expect(defaultCategorySlug('amazon')).toBe('everything-else')
    const { category, isDefaultCategory } = resolveCalculatorCategory('amazon', 'not-a-category')
    expect(category.slug).toBe('everything-else')
    expect(isDefaultCategory).toBe(true)
    expect(getCategory('amazon', 'everything-else')).toMatchObject({ referralPct: 15, minFee: 0.3 })
    expect(defaultCategorySlug('walmart')).toBe('everything-else')
    expect(resolveCalculatorCategory('walmart', 'not-a-category').category.slug).toBe('everything-else')
  })

  it('applies the $0.30 Amazon minimum on a cheap item', () => {
    // 15% of $1.50 is $0.23, below the $0.30 minimum in the Amazon fee table.
    const fees = computeCalculatorMarketplaceFees('amazon', 'everything-else', 1.5)
    expect(fees.referralFee).toBe(0.3)
    expect(fees.minFeeApplied).toBe(true)
    expect(fees.referralDetail).toContain('$0.30 minimum')
    expect(fees.totalMarketplaceFees).toBe(feePageTotal('amazon', 'everything-else', 1.5))
  })

  it('uses the category rate for a normal Amazon sale', () => {
    // Kitchen is 15% flat: $29.99 -> $4.50.
    const kitchen = computeCalculatorMarketplaceFees('amazon', 'kitchen', 29.99)
    expect(kitchen.referralFee).toBe(4.5)
    expect(kitchen.minFeeApplied).toBe(false)
    expect(kitchen.otherFeesTotal).toBe(0)
    expect(kitchen.totalMarketplaceFees).toBe(feePageTotal('amazon', 'kitchen', 29.99))

    // Beauty is tiered on the whole price: 15% above $10 -> $3.75 on $25 (old flat 8% gave $2.00).
    const beauty = computeCalculatorMarketplaceFees('amazon', 'beauty', 25)
    expect(beauty.referralFee).toBe(3.75)
    expect(beauty.rateLabel).toBe('8%–15%')
    expect(beauty.totalMarketplaceFees).toBe(feePageTotal('amazon', 'beauty', 25))
  })

  it('stacks Etsy transaction, listing and processing fees from the fee table', () => {
    // $20 sale: 6.5% = $1.30, $0.20 listing, 3% + $0.25 = $0.85 processing -> $2.35.
    const fees = computeCalculatorMarketplaceFees('etsy', 'all-categories', 20)
    expect(fees.referralFee).toBe(1.3)
    expect(fees.otherLines.map((l) => [l.label, l.amount])).toEqual([
      ['Listing fee', 0.2],
      ['Payment processing', 0.85],
    ])
    expect(fees.totalMarketplaceFees).toBe(2.35)
    expect(fees.totalMarketplaceFees).toBe(feePageTotal('etsy', 'all-categories', 20))
  })

  it('adds the eBay per-order fee to the final value fee', () => {
    // $50 in Most Categories: 13.6% = $6.80, plus $0.40 per order -> $7.20.
    const fees = computeCalculatorMarketplaceFees('ebay', 'most-categories', 50)
    expect(fees.referralFee).toBe(6.8)
    expect(fees.otherLines).toEqual([expect.objectContaining({ label: 'Per-order fee', amount: 0.4 })])
    expect(fees.totalMarketplaceFees).toBe(7.2)
    expect(fees.totalMarketplaceFees).toBe(feePageTotal('ebay', 'most-categories', 50))

    // $8 order: $1.09 + the $0.30 small-order fee.
    const small = computeCalculatorMarketplaceFees('ebay', 'most-categories', 8)
    expect(small.totalMarketplaceFees).toBe(1.39)
  })

  it('matches the fee tables for every marketplace and category', () => {
    for (const marketplace of MARKETPLACES) {
      for (const category of marketplace.categories) {
        for (const price of [1, 9.99, 25, 120, 2000]) {
          const fees = computeCalculatorMarketplaceFees(marketplace.slug, category.slug, price)
          expect(fees.totalMarketplaceFees, `${marketplace.slug}/${category.slug} @ $${price}`).toBe(
            feePageTotal(marketplace.slug, category.slug, price),
          )
          expect(Math.round((fees.referralFee + fees.otherFeesTotal) * 100) / 100).toBe(fees.totalMarketplaceFees)
        }
      }
    }
  })
})
