// "How much does X take from a $N sale" pages. Every number is computed with
// computeFeeBreakdown from lib/marketplace-fees.ts — nothing is hand-entered.
import { MARKETPLACES, computeFeeBreakdown, getMarketplace, type FeeCategory, type Marketplace } from '@/lib/marketplace-fees'

export const SALE_PRICES = [10, 20, 30, 50, 100] as const

export const saleSlug = (price: number) => `on-a-${price}-sale`
export const salePath = (marketplace: string, price: number) => `/fees/${marketplace}/${saleSlug(price)}`

export function parseSalePrice(raw: string): number | null {
  const n = Number(raw)
  return (SALE_PRICES as readonly number[]).includes(n) ? n : null
}

export interface SaleCategoryRow { category: FeeCategory; totalFees: number; takeRatePct: number; netProceeds: number; detail: string }

export interface SaleFeeSummary {
  marketplace: Marketplace
  price: number
  rows: SaleCategoryRow[]
  min: SaleCategoryRow
  max: SaleCategoryRow
}

/** Fees on a single-item sale at `price`: no buyer shipping, unit cost 0, no fulfillment. */
export function saleFeeSummary(marketplaceSlug: string, price: number): SaleFeeSummary | null {
  const marketplace = getMarketplace(marketplaceSlug)
  if (!marketplace) return null
  const rows = marketplace.categories.map(category => {
    const b = computeFeeBreakdown({ salePrice: price, unitCost: 0, marketplace, category })
    return {
      category,
      totalFees: b.totalFees,
      takeRatePct: b.takeRatePct,
      netProceeds: b.netProceeds,
      detail: b.lines.map(l => `${l.label} $${l.amount.toFixed(2)}`).join(' + '),
    }
  })
  const sorted = [...rows].sort((x, y) => x.totalFees - y.totalFees)
  return { marketplace, price, rows, min: sorted[0], max: sorted[sorted.length - 1] }
}

export const money = (v: number) => `$${v.toFixed(2)}`

/** "$1.50" when flat across categories, "$0.80–$4.50" otherwise. */
export function feeRangeLabel(s: SaleFeeSummary): string {
  return s.min.totalFees === s.max.totalFees ? money(s.min.totalFees) : `${money(s.min.totalFees)}–${money(s.max.totalFees)}`
}

export function getAllSaleRoutes(): { marketplace: string; price: string }[] {
  return MARKETPLACES.flatMap(m => SALE_PRICES.map(p => ({ marketplace: m.slug, price: String(p) })))
}

/** Same-origin OG image URL for a headline fee number. */
export function ogImageUrl(title: string, headline: string, category = 'Seller fees'): string {
  const q = new URLSearchParams({ title, headline, category })
  return `/api/og?${q.toString()}`
}
