// Marketplace-vs-marketplace comparison data, derived only from lib/marketplace-fees.ts.
import {
  MARKETPLACES,
  computeFeeBreakdown,
  getComparableCategories,
  getMarketplace,
  orderFeeLabel,
  type FeeCategory,
  type Marketplace,
} from '@/lib/marketplace-fees'

export interface MarketplacePair { slug: string; a: Marketplace; b: Marketplace }

export const pairSlug = (a: string, b: string) => `${a}-vs-${b}`

/** Every unordered pair, in MARKETPLACES order (canonical slug). */
export function getAllPairs(): MarketplacePair[] {
  const pairs: MarketplacePair[] = []
  MARKETPLACES.forEach((a, i) => MARKETPLACES.slice(i + 1).forEach(b => pairs.push({ slug: pairSlug(a.slug, b.slug), a, b })))
  return pairs
}

/** Resolves a slug in either order. `canonical` is the slug to redirect to when reversed. */
export function resolvePair(slug: string): { pair: MarketplacePair; reversed: boolean } | null {
  for (const p of getAllPairs()) {
    if (p.slug === slug) return { pair: p, reversed: false }
    if (pairSlug(p.b.slug, p.a.slug) === slug) return { pair: p, reversed: true }
  }
  return null
}

export function getPairsFor(marketplaceSlug: string): MarketplacePair[] {
  return getAllPairs().filter(p => p.a.slug === marketplaceSlug || p.b.slug === marketplaceSlug)
}

export function rateRange(m: Marketplace): { min: number; max: number } {
  const rates = m.categories.flatMap(c => [c.referralPct, ...(c.tiers ?? []).map(t => t.pct)])
  return { min: Math.min(...rates), max: Math.max(...rates) }
}

export interface MatchedCategoryRow {
  label: string
  aCategory: FeeCategory
  bCategory: FeeCategory
  aFees: number
  bFees: number
}

export const EXAMPLE_PRICE = 29.99

/** Categories both marketplaces carry, with total fees on an EXAMPLE_PRICE sale (no fulfillment). */
export function matchedCategories(a: Marketplace, b: Marketplace): MatchedCategoryRow[] {
  const rows: MatchedCategoryRow[] = []
  for (const aCategory of a.categories) {
    const match = getComparableCategories(a.slug, aCategory.label).find(e => e.marketplace.slug === b.slug)
    if (!match) continue
    rows.push({
      label: aCategory.label,
      aCategory,
      bCategory: match.category,
      aFees: computeFeeBreakdown({ salePrice: EXAMPLE_PRICE, unitCost: 0, marketplace: a, category: aCategory }).totalFees,
      bFees: computeFeeBreakdown({ salePrice: EXAMPLE_PRICE, unitCost: 0, marketplace: b, category: match.category }).totalFees,
    })
  }
  return rows
}

export function money(n: number): string {
  return `$${n.toFixed(2)}`
}

/** Plain-language cell values for the side-by-side table. Only reports what the dataset holds. */
export function overviewRows(a: Marketplace, b: Marketplace): { label: string; a: string; b: string }[] {
  const cell = (m: Marketplace, key: string): string => {
    switch (key) {
      case 'fee': return m.feeName.charAt(0).toUpperCase() + m.feeName.slice(1)
      case 'range': { const r = rateRange(m); return r.min === r.max ? `${r.min}%` : `${r.min}% to ${r.max}%` }
      case 'categories': return String(m.categories.length)
      case 'account': return m.accountFee ? `${money(m.accountFee.amount)} / ${m.accountFee.period}${m.accountFee.note ? ` (${m.accountFee.note})` : ''}` : 'None in fee schedule'
      case 'order': return orderFeeLabel(m)
      case 'listing': return m.listingFee ? `${money(m.listingFee)} per listing` : 'None in fee schedule'
      case 'processing': return m.paymentProcessingPct ? `${m.paymentProcessingPct}%${m.paymentProcessingFlat ? ` + ${money(m.paymentProcessingFlat)}` : ''}` : 'Not charged as a separate line'
      case 'fulfillment': return m.fulfillmentName ?? 'No first-party program'
      case 'verified': return m.lastVerified
      default: return ''
    }
  }
  return [
    ['fee', 'Commission name'],
    ['range', 'Commission rate range'],
    ['categories', 'Categories tracked'],
    ['account', 'Account / subscription fee'],
    ['order', 'Per-order fee'],
    ['listing', 'Listing fee'],
    ['processing', 'Payment processing'],
    ['fulfillment', 'Fulfillment program'],
    ['verified', 'Schedule last verified'],
  ].map(([key, label]) => ({ label, a: cell(a, key), b: cell(b, key) }))
}

export { getMarketplace }

/** Search copy must describe only the comparisons actually available. */
export function comparisonDescription(a: Marketplace, b: Marketplace): string {
  const scope = matchedCategories(a, b).length
    ? `supported category comparisons and modeled total fees on a $${EXAMPLE_PRICE} sale`
    : 'schedule information only; no verified same-product category comparison is available'
  return `Compare ${a.name} and ${b.name} seller fees: account, listing and processing fees, plus ${scope}.`
}
