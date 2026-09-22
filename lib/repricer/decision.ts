// The repricing decision engine.
//
// Given a SKU's computed price ladder plus market data, decide the price:
// compete at lowest * (1 + proximityTarget), but only within [floor, ceiling].
// When the market sits below our floor, hold at the floor and accept losing
// the Buy Box — closing the gap would deepen a loss, not fix one. Surfacing
// that situation, instead of blindly chasing the lowest offer, is the single
// most important behaviour in the system.

import type {
  CatalogItem,
  CostRecord,
  Decision,
  Marketplace,
  PricingInputs,
  StrategyConfig,
} from "./types"
import { feesFor, type FeeOverrides } from "./fees"
import { computeLadder, marginAtPrice, UnsellableSkuError } from "./pricing"
import { clampToGuardrails } from "./guardrails"

export const DEFAULT_STRATEGY: StrategyConfig = {
  targetMargin: 0.18,
  floorMargin: 0.12,
  proximityTarget: 0.02,
  ceilingMultiplier: 1.25,
  // VERIFY: ACoS of 0 assumes no advertising on Renewed listings.
  acosRate: 0,
  // Refurb return/defect reserve typically 0.05-0.08 of price.
  returnReserveRate: 0.06,
  circuitBreakerPct: 0.1,
  minCompetitorReviews: 10,
  cooldownHours: 2,
  maxDailyChanges: 12,
}

export function pricingInputsFor(
  item: CatalogItem,
  cost: CostRecord,
  marketplace: Marketplace,
  strategy: StrategyConfig,
  feeOverrides?: FeeOverrides,
): PricingInputs {
  const fees = feesFor(marketplace, item.category, feeOverrides)
  return {
    landedCost: cost.landedCost,
    outboundShipping: cost.outboundShipping,
    referralTiers: fees.tiers,
    fixedFees: fees.fixedFees,
    acosRate: strategy.acosRate,
    returnReserveRate: strategy.returnReserveRate,
  }
}

/**
 * Decide the price for one SKU. `cost` is null when no cost record exists —
 * such SKUs are excluded from repricing entirely and reported separately.
 * Guessing a floor is worse than not repricing.
 */
export function decide(
  item: CatalogItem,
  cost: CostRecord | null,
  marketplace: Marketplace,
  strategy: StrategyConfig,
  feeOverrides?: FeeOverrides,
): Decision {
  const flags: string[] = []

  if (!cost) {
    return {
      asin: item.asin,
      action: "EXCLUDED_NO_COST",
      currentPrice: item.currentPrice,
      newPrice: null,
      ladder: null,
      competitivePrice: null,
      marginAtNewPrice: null,
      estimatedCost: false,
      flags: ["No cost data — excluded from repricing until landed cost is entered"],
    }
  }
  if (cost.estimated) {
    flags.push("ESTIMATED cost from category default — floor is not trustworthy")
  }

  const inputs = pricingInputsFor(item, cost, marketplace, strategy, feeOverrides)
  let ladder
  try {
    ladder = computeLadder(
      inputs,
      {
        floorMargin: strategy.floorMargin,
        targetMargin: strategy.targetMargin,
        ceilingMultiplier: strategy.ceilingMultiplier,
        marketHigh: item.buyboxPrice,
      },
      item.asin,
    )
  } catch (err) {
    if (err instanceof UnsellableSkuError) {
      return {
        asin: item.asin,
        action: "EXCLUDED_NO_COST",
        currentPrice: item.currentPrice,
        newPrice: null,
        ladder: null,
        competitivePrice: null,
        marginAtNewPrice: null,
        estimatedCost: cost.estimated,
        flags: [...flags, err.message],
      }
    }
    throw err
  }

  const lowest = usableLowestCompetitor(item, strategy)
  if (lowest === null) {
    // No competitor offer to chase: sit at target (still through the guardrails).
    const newPrice = clampToGuardrails(ladder.targetPrice, ladder)
    return {
      asin: item.asin,
      action: "NO_MARKET_DATA",
      currentPrice: item.currentPrice,
      newPrice,
      ladder,
      competitivePrice: null,
      marginAtNewPrice: marginAtPrice(inputs, newPrice),
      estimatedCost: cost.estimated,
      flags: [...flags, "No usable competitor offer — priced at target margin"],
    }
  }

  const competitivePrice = lowest * (1 + strategy.proximityTarget)

  if (item.currentPrice !== null && item.lowestCompetitor !== null) {
    const move = Math.abs(item.currentPrice - item.lowestCompetitor) / item.currentPrice
    if (move > strategy.circuitBreakerPct) {
      flags.push(
        `Circuit breaker: market is ${(move * 100).toFixed(1)}% away from current price — review before going live`,
      )
    }
  }

  if (competitivePrice < ladder.floorPrice) {
    const newPrice = clampToGuardrails(ladder.floorPrice, ladder)
    return {
      asin: item.asin,
      action: "HOLD_ABOVE_MARKET",
      currentPrice: item.currentPrice,
      newPrice,
      ladder,
      competitivePrice,
      marginAtNewPrice: marginAtPrice(inputs, newPrice),
      estimatedCost: cost.estimated,
      flags: [...flags, "Market is below our floor — cannot compete profitably"],
    }
  }

  const newPrice = clampToGuardrails(competitivePrice, ladder)
  return {
    asin: item.asin,
    action: "REPRICE",
    currentPrice: item.currentPrice,
    newPrice,
    ladder,
    competitivePrice,
    marginAtNewPrice: marginAtPrice(inputs, newPrice),
    estimatedCost: cost.estimated,
    flags,
  }
}

/**
 * Competitor filtering: ignore the lowest offer when the listing's own review
 * signal is below threshold — thin-signal listings are often liquidators who
 * won't hold the price. (Per-offer seller feedback isn't in the snapshot, so
 * the listing-level review count is the available proxy.)
 */
function usableLowestCompetitor(item: CatalogItem, strategy: StrategyConfig): number | null {
  if (item.lowestCompetitor === null) return null
  if ((item.reviewCount ?? 0) < strategy.minCompetitorReviews && item.competingSellers !== null && item.competingSellers <= 3) {
    return null
  }
  return item.lowestCompetitor
}
