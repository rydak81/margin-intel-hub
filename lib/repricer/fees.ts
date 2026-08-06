// Marketplace fee schedules, per marketplace and per category.
//
// VERIFY: every rate below is a placeholder seeded from public fee schedules as
// of the 2026-08-05 audit and MUST be verified against each marketplace's
// current published schedule before any live repricing decision. None of these
// rates should be treated as authoritative.

import type { Category, Marketplace } from "./types"

export interface FeeSchedule {
  /** Marketplace commission as a decimal of the sale price. */
  referralRate: number
  /** Flat per-unit fee (e.g. closing/listing fees, payment fixed fee). */
  fixedFees: number
  label: string
}

type CategoryRates = Record<Category, FeeSchedule>

const uniform = (referralRate: number, fixedFees: number, label: string): CategoryRates => ({
  iPad: { referralRate, fixedFees, label },
  iPhone: { referralRate, fixedFees, label },
  "MacBook Air": { referralRate, fixedFees, label },
  "MacBook Pro": { referralRate, fixedFees, label },
  "Apple Watch": { referralRate, fixedFees, label },
})

export const FEE_SCHEDULES: Record<Marketplace, CategoryRates> = {
  // VERIFY: Amazon consumer electronics referral 8%; Apple Watch sits in a
  // category Amazon may treat as electronics accessories at a higher rate.
  amazon: {
    ...uniform(0.08, 0.0, "Amazon Renewed (FBM)"),
    "Apple Watch": { referralRate: 0.16, fixedFees: 0.0, label: "Amazon Renewed (FBM)" }, // VERIFY tier
  },
  // VERIFY: Walmart consumer electronics referral 8%.
  walmart: uniform(0.08, 0.0, "Walmart Marketplace"),
  // VERIFY: eBay final value fee ~13.25% + $0.30 per order for most categories;
  // computers/tablets tiers can be lower.
  ebay: uniform(0.1325, 0.3, "eBay Store"),
  // VERIFY: Back Market commission ~10% plus per-order fee.
  backmarket: uniform(0.1, 0.0, "Back Market"),
  // VERIFY: Newegg Marketplace electronics commission ~9%.
  newegg: uniform(0.09, 0.0, "Newegg Marketplace"),
  // VERIFY: direct-to-consumer at tekreplay.com — card processing only (~2.9% + $0.30).
  direct: uniform(0.029, 0.3, "tekreplay.com (DTC)"),
}

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  amazon: "Amazon",
  walmart: "Walmart",
  ebay: "eBay",
  backmarket: "Back Market",
  newegg: "Newegg",
  direct: "tekreplay.com",
}

export const MARKETPLACES: Marketplace[] = [
  "amazon",
  "walmart",
  "ebay",
  "backmarket",
  "newegg",
  "direct",
]

export function feesFor(marketplace: Marketplace, category: Category): FeeSchedule {
  return FEE_SCHEDULES[marketplace][category]
}
