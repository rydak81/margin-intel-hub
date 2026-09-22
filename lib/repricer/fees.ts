// Marketplace fee schedules, per marketplace and per category, with tiered
// referral rates (some categories charge one rate up to a threshold and a
// different rate above it).
//
// Rates below were checked against published schedules on 2026-08-07 (see
// `source` on each entry) but marketplaces change fees quickly and often —
// Walmart cut 14 categories' referral fees in June 2026 with little notice.
// Every rate is editable in the app (Fees editor) and MUST be re-verified
// against the marketplace's own fee preview before live repricing decisions.

import type { Category, Marketplace, ReferralTier } from "./types"

export interface FeeSchedule {
  /** Marginal referral tiers, in order. `upTo: null` = no upper bound. */
  tiers: ReferralTier[]
  /** Flat per-unit fee (per-order fees, payment fixed fees). */
  fixedFees: number
  /** Marketplace's minimum referral fee per unit, if published. */
  minReferralFee?: number
  label: string
  /** Date the rate was last checked against the published schedule. */
  lastVerified: string
  source: string
  note?: string
}

const flat = (rate: number): ReferralTier[] => [{ upTo: null, rate }]

type CategoryRates = Record<Category, FeeSchedule>

const forAll = (schedule: Omit<FeeSchedule, "label">, label: string): CategoryRates => ({
  iPad: { ...schedule, label },
  iPhone: { ...schedule, label },
  "MacBook Air": { ...schedule, label },
  "MacBook Pro": { ...schedule, label },
  "Apple Watch": { ...schedule, label },
})

export const FEE_SCHEDULES: Record<Marketplace, CategoryRates> = {
  amazon: {
    // Consumer Electronics / Cell Phone Devices: 8%. Laptops may qualify for
    // the lower Personal Computers rate (6% per several published tables) —
    // VERIFY against Seller Central's fee preview for the actual ASINs.
    iPad: {
      tiers: flat(0.08),
      fixedFees: 0,
      minReferralFee: 0.3,
      label: "Amazon Renewed (FBM)",
      lastVerified: "2026-08-07",
      source: "Published referral fee tables (Consumer Electronics 8%)",
    },
    iPhone: {
      tiers: flat(0.08),
      fixedFees: 0,
      minReferralFee: 0.3,
      label: "Amazon Renewed (FBM)",
      lastVerified: "2026-08-07",
      source: "Published referral fee tables (Cell Phone Devices 8%)",
    },
    "MacBook Air": {
      tiers: flat(0.08),
      fixedFees: 0,
      minReferralFee: 0.3,
      label: "Amazon Renewed (FBM)",
      lastVerified: "2026-08-07",
      source: "Consumer Electronics 8%; some tables list Personal Computers at 6%",
      note: "VERIFY: if these ASINs bill as Personal Computers (6%), floors drop ~2% of price",
    },
    "MacBook Pro": {
      tiers: flat(0.08),
      fixedFees: 0,
      minReferralFee: 0.3,
      label: "Amazon Renewed (FBM)",
      lastVerified: "2026-08-07",
      source: "Consumer Electronics 8%; some tables list Personal Computers at 6%",
      note: "VERIFY: if these ASINs bill as Personal Computers (6%), floors drop ~2% of price",
    },
    // Watches: 16% of the price up to $1,500, 3% on the portion above.
    "Apple Watch": {
      tiers: [
        { upTo: 1500, rate: 0.16 },
        { upTo: null, rate: 0.03 },
      ],
      fixedFees: 0,
      minReferralFee: 0.3,
      label: "Amazon Renewed (FBM)",
      lastVerified: "2026-08-07",
      source: "Published referral fee tables (Watches: 16% to $1,500, 3% above)",
    },
  },
  // Walmart: Consumer Electronics and Cell Phones 8%. Walmart cut referral
  // fees on 14 categories in June 2026 — re-check often; cuts are quiet.
  walmart: forAll(
    {
      tiers: flat(0.08),
      fixedFees: 0,
      lastVerified: "2026-08-07",
      source: "Walmart Marketplace fee schedule (electronics/cell phones 8%)",
      note: "June 2026 category cuts may apply — verify current contract rates",
    },
    "Walmart Marketplace",
  ),
  // eBay managed payments: category final value fee (incl. payment processing)
  // plus a per-order fee (~$0.30-0.40). FVF applies to the TOTAL the buyer
  // pays including shipping — model buyer-paid shipping accordingly.
  ebay: {
    iPad: {
      tiers: flat(0.109),
      fixedFees: 0.4,
      label: "eBay Store",
      lastVerified: "2026-08-07",
      source: "eBay FVF: Computers/Tablets ~10.9% + per-order fee",
    },
    iPhone: {
      tiers: flat(0.12),
      fixedFees: 0.4,
      label: "eBay Store",
      lastVerified: "2026-08-07",
      source: "eBay FVF: Cell Phones ~12% + per-order fee",
    },
    "MacBook Air": {
      tiers: flat(0.109),
      fixedFees: 0.4,
      label: "eBay Store",
      lastVerified: "2026-08-07",
      source: "eBay FVF: Computers/Laptops ~10.9% + per-order fee",
    },
    "MacBook Pro": {
      tiers: flat(0.109),
      fixedFees: 0.4,
      label: "eBay Store",
      lastVerified: "2026-08-07",
      source: "eBay FVF: Computers/Laptops ~10.9% + per-order fee",
    },
    "Apple Watch": {
      tiers: [
        { upTo: 1000, rate: 0.15 },
        { upTo: null, rate: 0.065 },
      ],
      fixedFees: 0.4,
      label: "eBay Store",
      lastVerified: "2026-08-07",
      source: "eBay FVF: Watches ~15% first $1,000 (store rates lower)",
      note: "VERIFY: store-subscription discounts change watch tiers materially",
    },
  },
  // Back Market: ~10% commission (contract-dependent) + monthly fee.
  backmarket: forAll(
    {
      tiers: flat(0.1),
      fixedFees: 0,
      lastVerified: "2026-08-07",
      source: "Reported Back Market commission ~10% (contract-specific)",
      note: "VERIFY: actual rate is set in your Back Market contract",
    },
    "Back Market",
  ),
  // Newegg: commission varies by subcategory (~8-10% electronics); 6%
  // promotional flat rate for the first 90 days after activation.
  newegg: forAll(
    {
      tiers: flat(0.09),
      fixedFees: 0,
      lastVerified: "2026-08-07",
      source: "Newegg commission varies by subcategory; check Seller Portal",
      note: "VERIFY: subcategory-specific; 6% promo may apply first 90 days",
    },
    "Newegg Marketplace",
  ),
  // Direct at tekreplay.com: card processing only (~2.9% + $0.30).
  direct: forAll(
    {
      tiers: flat(0.029),
      fixedFees: 0.3,
      lastVerified: "2026-08-07",
      source: "Typical card processing 2.9% + $0.30 (processor-dependent)",
    },
    "tekreplay.com (DTC)",
  ),
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

/**
 * User-editable overrides, keyed marketplace → category. `rate` replaces the
 * FIRST tier's rate (upper tiers keep their defaults); `fixedFees` replaces
 * the flat per-unit fee. Persisted by the UI so a schedule change on any
 * platform is a 10-second edit, not a code change.
 */
export type FeeOverrides = Partial<
  Record<Marketplace, Partial<Record<Category, { rate?: number; fixedFees?: number }>>>
>

export function feesFor(
  marketplace: Marketplace,
  category: Category,
  overrides?: FeeOverrides,
): FeeSchedule {
  const base = FEE_SCHEDULES[marketplace][category]
  const o = overrides?.[marketplace]?.[category]
  if (!o || (o.rate === undefined && o.fixedFees === undefined)) return base
  const tiers = base.tiers.map((t, i) =>
    i === 0 && o.rate !== undefined ? { ...t, rate: o.rate } : t,
  )
  return {
    ...base,
    tiers,
    fixedFees: o.fixedFees ?? base.fixedFees,
    note: `${base.note ? `${base.note} · ` : ""}rate customized by user`,
  }
}

/** Short human label for a tier structure, e.g. "16% to $1.5K, then 3%". */
export function describeTiers(tiers: ReferralTier[]): string {
  if (tiers.length === 1) return `${(tiers[0].rate * 100).toFixed(1)}%`
  return tiers
    .map((t) =>
      t.upTo === null
        ? `then ${(t.rate * 100).toFixed(1)}%`
        : `${(t.rate * 100).toFixed(1)}% to $${t.upTo >= 1000 ? `${t.upTo / 1000}K` : t.upTo}`,
    )
    .join(", ")
}
