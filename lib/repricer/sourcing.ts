// Sourcing math: the pricing formula run in reverse. Given the price the
// market will actually pay (e.g. today's Buy Box), the target margin, and a
// platform's fee schedule, compute the maximum landed cost — the most you can
// pay to acquire + refurb the unit and still clear the margin.
//
// Derivation (fee tiers make referral a function of price, but price is KNOWN
// here, so no solving is needed):
//   profit = P - referralFee(P) - (acos + reserve) * P - (landed + shipping + fixed)
//   set profit = m * P and solve for landed:
//   maxLanded = P - referralFee(P) - (acos + reserve + m) * P - shipping - fixed

import { referralFeeAt } from "./pricing"
import type { ReferralTier } from "./types"

export interface SourcingFees {
  tiers: ReferralTier[]
  fixedFees: number
  acosRate: number
  returnReserveRate: number
  outboundShipping: number
}

/**
 * Maximum landed cost (purchase + inbound freight + refurb parts + labor)
 * that still yields net margin `m` when selling at `price`. Can be negative
 * or zero — meaning the SKU cannot hit that margin at that selling price no
 * matter how cheaply it is acquired; callers should surface that, not clamp it.
 */
export function maxLandedCost(price: number, fees: SourcingFees, m: number): number {
  const referral = referralFeeAt(fees.tiers, price)
  const variable = (fees.acosRate + fees.returnReserveRate + m) * price
  return round2(price - referral - variable - fees.outboundShipping - fees.fixedFees)
}

/** Profit in dollars when buying at `landed` and selling at `price`. */
export function profitBuyingAt(
  price: number,
  landed: number,
  fees: SourcingFees,
): number {
  return round2(
    price -
      referralFeeAt(fees.tiers, price) -
      (fees.acosRate + fees.returnReserveRate) * price -
      fees.outboundShipping -
      fees.fixedFees -
      landed,
  )
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/** Classify a sourcing query: ASIN, barcode (UPC/EAN digits), or title term. */
export function classifyQuery(q: string): "asin" | "code" | "term" {
  const t = q.trim()
  if (/^B0[A-Z0-9]{8}$/i.test(t)) return "asin"
  if (/^\d{8,14}$/.test(t.replace(/[\s-]/g, ""))) return "code"
  return "term"
}
