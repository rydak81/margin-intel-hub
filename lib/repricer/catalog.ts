// Seed catalog: the real 2026-08-05 snapshot of Powered by Tek's 77 active
// Amazon Renewed SKUs (ASIN, market prices, competition, Buy Box status).
// Source: seed_catalog.csv from the pricing audit. Do not invent product data.

import type { CatalogItem } from "./types"
import seed from "./seed-catalog.json"

export const SEED_CATALOG: CatalogItem[] = seed as CatalogItem[]

export interface CatalogSummary {
  totalSkus: number
  buyboxWins: number
  buyboxWinRate: number
  pricedAboveMarket: number
  medianGapPct: number
  skusOver20PctAbove: number
}

export function summarizeCatalog(items: CatalogItem[]): CatalogSummary {
  const priced = items.filter(
    (i) => i.currentPrice !== null && i.lowestCompetitor !== null,
  )
  const gaps = priced
    .map((i) => (i.currentPrice! - i.lowestCompetitor!) / i.lowestCompetitor!)
    .sort((a, b) => a - b)
  const median =
    gaps.length === 0
      ? 0
      : gaps.length % 2
        ? gaps[(gaps.length - 1) / 2]
        : (gaps[gaps.length / 2 - 1] + gaps[gaps.length / 2]) / 2
  return {
    totalSkus: items.length,
    buyboxWins: items.filter((i) => i.hasBuybox).length,
    buyboxWinRate: items.length ? items.filter((i) => i.hasBuybox).length / items.length : 0,
    pricedAboveMarket: priced.filter((i) => i.currentPrice! > i.lowestCompetitor!).length,
    medianGapPct: median,
    skusOver20PctAbove: priced.filter(
      (i) => (i.currentPrice! - i.lowestCompetitor!) / i.lowestCompetitor! > 0.2,
    ).length,
  }
}
