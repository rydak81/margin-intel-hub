// The pricing math — pure functions, no I/O.
//
// Flat-rate derivation:
//   profit = price - (variable_rate * price) - fixed_costs
//   margin = profit / price = 1 - variable_rate - fixed_costs / price
//   solving for price at margin m:
//   price(m) = fixed_costs / (1 - variable_rate - m)
//
// Tiered referral rates make the fee piecewise linear in price: within tier k
// the fee is r_k * price + K_k, where K_k re-prices the lower tiers at their
// own rates. Solving price(m) per tier and keeping the solution that lands
// inside its own tier's bounds handles e.g. Amazon watches (16% to $1,500,
// then 3%) exactly, including SKUs that straddle the boundary.

import type { PriceLadder, PricingInputs, ReferralTier } from "./types"

export class UnsellableSkuError extends Error {
  constructor(
    public readonly sku: string,
    public readonly variableRate: number,
    public readonly margin: number,
  ) {
    super(
      `SKU ${sku} is mathematically unsellable at margin ${(margin * 100).toFixed(1)}%: ` +
        `variable rate ${(variableRate * 100).toFixed(1)}% + margin >= 100% of price`,
    )
    this.name = "UnsellableSkuError"
  }
}

/** Referral fee in dollars at a given price, summing marginal tiers. */
export function referralFeeAt(tiers: ReferralTier[], price: number): number {
  let fee = 0
  let lower = 0
  for (const tier of tiers) {
    const upper = tier.upTo ?? Number.POSITIVE_INFINITY
    if (price <= lower) break
    fee += tier.rate * (Math.min(price, upper) - lower)
    lower = upper
  }
  return fee
}

/** The marginal referral rate that applies at a given price. */
export function marginalReferralRateAt(tiers: ReferralTier[], price: number): number {
  for (const tier of tiers) {
    if (tier.upTo === null || price <= tier.upTo) return tier.rate
  }
  return tiers[tiers.length - 1]?.rate ?? 0
}

/** Effective (blended) referral rate at a price. */
export function effectiveReferralRateAt(tiers: ReferralTier[], price: number): number {
  return price > 0 ? referralFeeAt(tiers, price) / price : (tiers[0]?.rate ?? 0)
}

export function fixedCosts(inputs: PricingInputs): number {
  return inputs.landedCost + inputs.outboundShipping + inputs.fixedFees
}

/** Marginal variable rate at a price: referral tier rate + ACoS + return reserve. */
export function variableRateAt(inputs: PricingInputs, price: number): number {
  return (
    marginalReferralRateAt(inputs.referralTiers, price) +
    inputs.acosRate +
    inputs.returnReserveRate
  )
}

/**
 * The lowest price that still yields net margin `m` (as a decimal of revenue).
 *
 * Solves per referral tier: within tier k the total fee is linear in price
 * (rate r_k plus a constant from lower tiers), so
 *   price = (fixed_costs + fee_below - r_k * tier_lower_bound) / (1 - r_k - acos - reserve - m)
 * and the valid solution is the one lying inside tier k's own bounds. The fee
 * function is continuous and increasing, so at most one tier is consistent.
 *
 * Guards the denominator: if the rates plus m reach 100% of price in every
 * candidate tier, the SKU cannot be sold at that margin — throws rather than
 * returning a negative or infinite price.
 */
export function priceForMargin(inputs: PricingInputs, m: number, sku = "?"): number {
  const fc = fixedCosts(inputs)
  const otherRates = inputs.acosRate + inputs.returnReserveRate
  let lower = 0
  let feeBelow = 0 // referral dollars accrued across tiers below the current one
  let worstRate = 0

  for (const tier of inputs.referralTiers) {
    const upper = tier.upTo ?? Number.POSITIVE_INFINITY
    const denominator = 1 - tier.rate - otherRates - m
    worstRate = Math.max(worstRate, tier.rate + otherRates)
    if (denominator > 0) {
      // Within this tier: fee = feeBelow + rate * (price - lower)
      const price = (fc + feeBelow - tier.rate * lower) / denominator
      const epsilon = 1e-9
      if (price >= lower - epsilon && price <= upper + epsilon) {
        return roundPrice(price)
      }
    }
    feeBelow += tier.rate * (upper - lower)
    lower = upper
  }

  throw new UnsellableSkuError(sku, worstRate, m)
}

/** Net margin (decimal of revenue) realized at a given price. */
export function marginAtPrice(inputs: PricingInputs, price: number): number {
  if (price <= 0) return Number.NEGATIVE_INFINITY
  return profitAtPrice(inputs, price) / price
}

/** Net profit in dollars at a given price. */
export function profitAtPrice(inputs: PricingInputs, price: number): number {
  return (
    price -
    referralFeeAt(inputs.referralTiers, price) -
    (inputs.acosRate + inputs.returnReserveRate) * price -
    fixedCosts(inputs)
  )
}

export interface LadderOptions {
  floorMargin: number
  targetMargin: number
  ceilingMultiplier: number
  /** Highest observed market price (e.g. Buy Box price), if known. */
  marketHigh?: number | null
}

export function computeLadder(
  inputs: PricingInputs,
  opts: LadderOptions,
  sku = "?",
): PriceLadder {
  const floorPrice = priceForMargin(inputs, opts.floorMargin, sku)
  const targetPrice = priceForMargin(inputs, opts.targetMargin, sku)
  const ceilingPrice = roundPrice(
    Math.max(targetPrice * opts.ceilingMultiplier, opts.marketHigh ?? 0),
  )
  return {
    floorPrice,
    targetPrice,
    ceilingPrice,
    variableRate: variableRateAt(inputs, targetPrice),
    fixedCosts: fixedCosts(inputs),
  }
}

/** Round to cents. Matches the spec's worked example (106.23 from 106.2318...). */
export function roundPrice(value: number): number {
  return Math.round(value * 100) / 100
}
