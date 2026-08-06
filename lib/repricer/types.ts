// Core types for the margin-aware repricing engine.
// The math solves for price from a margin target rather than marking up cost,
// because percentage-based fees (referral, ads, returns) scale with price.

export type Marketplace =
  | "amazon"
  | "walmart"
  | "ebay"
  | "backmarket"
  | "newegg"
  | "direct"

export type Category =
  | "iPad"
  | "iPhone"
  | "MacBook Air"
  | "MacBook Pro"
  | "Apple Watch"

export interface CatalogItem {
  asin: string
  title: string
  category: Category
  /** Current listed price. Null when the listing had no visible price at snapshot time. */
  currentPrice: number | null
  lowestCompetitor: number | null
  competingSellers: number | null
  buyboxHolder: string | null
  buyboxPrice: number | null
  hasBuybox: boolean
  rating: number | null
  reviewCount: number | null
  monthlySalesBand: string | null
}

/** Per-SKU cost record. History is kept by effectiveDate; never overwrite. */
export interface CostRecord {
  asin: string
  /** COGS: purchase price + inbound freight + refurb parts + refurb labor. */
  landedCost: number
  /** FBM — the seller pays outbound shipping to the customer. */
  outboundShipping: number
  effectiveDate: string
  /** True when derived from a category default rather than a real cost entry. */
  estimated: boolean
}

export interface PricingInputs {
  landedCost: number
  outboundShipping: number
  referralRate: number
  fixedFees: number
  acosRate: number
  returnReserveRate: number
}

export interface PriceLadder {
  /** price(floorMargin) — no code path may ever emit a price below this. */
  floorPrice: number
  /** price(targetMargin) — where we want to sit. */
  targetPrice: number
  /** max(targetPrice * ceilingMultiplier, market high) unless overridden. */
  ceilingPrice: number
  variableRate: number
  fixedCosts: number
}

export type DecisionAction =
  | "REPRICE"
  | "HOLD_ABOVE_MARKET"
  | "EXCLUDED_NO_COST"
  | "NO_MARKET_DATA"

export interface Decision {
  asin: string
  action: DecisionAction
  currentPrice: number | null
  newPrice: number | null
  ladder: PriceLadder | null
  competitivePrice: number | null
  /** Net margin realized at newPrice, as a decimal of revenue. */
  marginAtNewPrice: number | null
  estimatedCost: boolean
  flags: string[]
}

export interface StrategyConfig {
  targetMargin: number
  floorMargin: number
  /** Stay within this fraction above the lowest offer to hold Buy Box rotation. */
  proximityTarget: number
  ceilingMultiplier: number
  acosRate: number
  returnReserveRate: number
  /** Pause repricing and alert when market moved more than this within a day. */
  circuitBreakerPct: number
  /** Ignore competitors below this feedback/review floor (likely liquidators). */
  minCompetitorReviews: number
  cooldownHours: number
  maxDailyChanges: number
}
