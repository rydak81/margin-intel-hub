/**
 * Marketplace fee math for the profit calculator on /tools#profit.
 *
 * Every rate here comes from the canonical fee tables in lib/marketplace-fees.ts
 * via computeFeeBreakdown, so the calculator cannot drift from the /fees pages:
 * category referral rates, tiered schedules, per-category minimum fees, per-order
 * fees, listing fees and payment processing are all read from that dataset.
 *
 * What this module does NOT cover (the calculator keeps these as labelled
 * seller inputs or estimates): FBA fulfillment, fuel surcharge, storage,
 * advertising, COGS and monthly account fees.
 */
import {
  MARKETPLACES,
  computeFeeBreakdown,
  getMarketplace,
  rateLabel,
  referralFee as rawReferralFee,
  type FeeCategory,
  type Marketplace,
  type MarketplaceSlug,
} from '@/lib/marketplace-fees'

export const DEFAULT_CALCULATOR_MARKETPLACE: MarketplaceSlug = 'amazon'

/**
 * Default category per marketplace when the seller has not picked one. Same
 * reference categories as /fees/compare-by-item-price: the catch-all or the
 * row at the rate most of that marketplace's categories share.
 */
const DEFAULT_CATEGORY: Record<MarketplaceSlug, string> = {
  amazon: 'everything-else',
  walmart: 'home-garden',
  'tiktok-shop': 'apparel-accessories',
  ebay: 'most-categories',
  etsy: 'all-categories',
}

export const CALCULATOR_MARKETPLACES: Marketplace[] = MARKETPLACES

export function defaultCategorySlug(marketplaceSlug: string): string {
  const marketplace = getMarketplace(marketplaceSlug)
  if (!marketplace) return DEFAULT_CATEGORY[DEFAULT_CALCULATOR_MARKETPLACE]
  const preferred = DEFAULT_CATEGORY[marketplace.slug]
  return marketplace.categories.some((c) => c.slug === preferred) ? preferred : marketplace.categories[0].slug
}

/** Resolve a marketplace/category pair, falling back to the labelled defaults. */
export function resolveCalculatorCategory(
  marketplaceSlug: string,
  categorySlug: string,
): { marketplace: Marketplace; category: FeeCategory; isDefaultCategory: boolean } {
  const marketplace = getMarketplace(marketplaceSlug) ?? getMarketplace(DEFAULT_CALCULATOR_MARKETPLACE)!
  const fallbackSlug = defaultCategorySlug(marketplace.slug)
  const category =
    marketplace.categories.find((c) => c.slug === categorySlug) ??
    marketplace.categories.find((c) => c.slug === fallbackSlug)!
  return { marketplace, category, isDefaultCategory: category.slug === fallbackSlug }
}

export interface CalculatorFeeLine {
  label: string
  amount: number
  detail?: string
}

export interface CalculatorMarketplaceFees {
  marketplace: Marketplace
  category: FeeCategory
  /** Rate label honest about tiers, e.g. "15%" or "8%–15%". */
  rateLabel: string
  /** Referral / commission / final value / transaction fee, after any minimum. */
  referralFee: number
  referralDetail: string
  /** True when the category's per-unit minimum fee set the referral amount. */
  minFeeApplied: boolean
  /** Per-order, listing and payment-processing lines, as the fee tables define them. */
  otherLines: CalculatorFeeLine[]
  otherFeesTotal: number
  /** Everything the marketplace's fee table charges on this sale. */
  totalMarketplaceFees: number
}

/**
 * Marketplace fees on one unit sold at `salePrice`, with no buyer-paid shipping
 * (the calculator models free-shipping listings). Delegates to
 * computeFeeBreakdown so the result equals the /fees pages to the cent.
 */
export function computeCalculatorMarketplaceFees(
  marketplaceSlug: string,
  categorySlug: string,
  salePrice: number,
): CalculatorMarketplaceFees {
  const { marketplace, category } = resolveCalculatorCategory(marketplaceSlug, categorySlug)
  const price = Number.isFinite(salePrice) && salePrice > 0 ? salePrice : 0
  const breakdown = computeFeeBreakdown({ salePrice: price, unitCost: 0, marketplace, category })
  const [referralLine, ...otherLines] = breakdown.lines
  // computeFeeBreakdown already applies max(referral, minFee); the raw
  // tiered amount tells us whether the minimum is what set the fee.
  const raw = rawReferralFee(price, category)
  const minFeeApplied = Boolean(category.minFee && price > 0 && raw.amount < category.minFee)
  const otherFeesTotal = Math.round(otherLines.reduce((sum, line) => sum + line.amount, 0) * 100) / 100
  return {
    marketplace,
    category,
    rateLabel: rateLabel(category),
    referralFee: referralLine.amount,
    referralDetail: minFeeApplied
      ? `$${category.minFee!.toFixed(2)} minimum fee applies (${raw.detail} = $${raw.amount.toFixed(2)})`
      : referralLine.detail ?? '',
    minFeeApplied,
    otherLines,
    otherFeesTotal,
    totalMarketplaceFees: breakdown.totalFees,
  }
}
