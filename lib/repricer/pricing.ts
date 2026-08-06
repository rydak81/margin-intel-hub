// The pricing math — pure functions, no I/O.
//
// Derivation:
//   profit = price - (variable_rate * price) - fixed_costs
//   margin = profit / price = 1 - variable_rate - fixed_costs / price
//   solving for price at margin m:
//   price(m) = fixed_costs / (1 - variable_rate - m)

import type { PriceLadder, PricingInputs } from "./types"

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

export function variableRate(inputs: PricingInputs): number {
  return inputs.referralRate + inputs.acosRate + inputs.returnReserveRate
}

export function fixedCosts(inputs: PricingInputs): number {
  return inputs.landedCost + inputs.outboundShipping + inputs.fixedFees
}

/**
 * The lowest price that still yields net margin `m` (as a decimal of revenue).
 * Guards the denominator: if variable_rate + m >= 1 the SKU cannot be sold at
 * that margin at any price — throws rather than returning a negative/infinite price.
 */
export function priceForMargin(inputs: PricingInputs, m: number, sku = "?"): number {
  const vr = variableRate(inputs)
  const denominator = 1 - vr - m
  if (denominator <= 0) {
    throw new UnsellableSkuError(sku, vr, m)
  }
  const price = fixedCosts(inputs) / denominator
  return roundPrice(price)
}

/** Net margin (decimal of revenue) realized at a given price. */
export function marginAtPrice(inputs: PricingInputs, price: number): number {
  if (price <= 0) return Number.NEGATIVE_INFINITY
  return 1 - variableRate(inputs) - fixedCosts(inputs) / price
}

/** Net profit in dollars at a given price. */
export function profitAtPrice(inputs: PricingInputs, price: number): number {
  return price - variableRate(inputs) * price - fixedCosts(inputs)
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
    variableRate: variableRate(inputs),
    fixedCosts: fixedCosts(inputs),
  }
}

/** Round to cents. Matches the spec's worked example (106.23 from 106.2318...). */
export function roundPrice(value: number): number {
  return Math.round(value * 100) / 100
}
