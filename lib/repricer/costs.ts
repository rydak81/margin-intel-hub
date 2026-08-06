// COGS input handling: CSV import validation and category-default estimation.
//
// SKUs with no cost data are excluded from repricing entirely (see decision.ts).
// Category defaults produce records marked `estimated: true` so a guessed floor
// is never mistaken for a real one.

import type { CatalogItem, Category, CostRecord } from "./types"

export interface CostImportResult {
  accepted: CostRecord[]
  /** Rows rejected outright (negative/invalid cost) with the reason. */
  rejected: { line: number; reason: string }[]
  /** Accepted rows that deserve a second look (e.g. cost above selling price). */
  warnings: { asin: string; message: string }[]
  /** ASINs in the file that don't exist in the catalog — reported, not skipped silently. */
  unmatched: string[]
}

/**
 * Parse a cost CSV with columns: asin, landed_cost, outbound_shipping[, effective_date].
 * Validates per spec: reject negative costs, warn on cost above current price,
 * report unmatched SKUs.
 */
export function parseCostCsv(text: string, catalog: CatalogItem[]): CostImportResult {
  const byAsin = new Map(catalog.map((i) => [i.asin, i]))
  const result: CostImportResult = { accepted: [], rejected: [], warnings: [], unmatched: [] }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  for (let n = 0; n < lines.length; n++) {
    const raw = lines[n].trim()
    const cells = raw.split(",").map((c) => c.trim())
    if (n === 0 && /asin/i.test(cells[0])) continue // header row

    const [asin, landedStr, shippingStr, effectiveDate] = cells
    if (!asin || !/^B0[A-Z0-9]{8}$/.test(asin)) {
      result.rejected.push({ line: n + 1, reason: `Invalid ASIN "${asin ?? ""}"` })
      continue
    }
    const landedCost = Number(landedStr)
    const outboundShipping = Number(shippingStr ?? "0")
    if (!Number.isFinite(landedCost) || landedCost < 0) {
      result.rejected.push({ line: n + 1, reason: `${asin}: invalid landed cost "${landedStr}"` })
      continue
    }
    if (!Number.isFinite(outboundShipping) || outboundShipping < 0) {
      result.rejected.push({ line: n + 1, reason: `${asin}: invalid shipping "${shippingStr}"` })
      continue
    }

    const item = byAsin.get(asin)
    if (!item) {
      result.unmatched.push(asin)
      continue
    }
    if (item.currentPrice !== null && landedCost > item.currentPrice) {
      result.warnings.push({
        asin,
        message: `Landed cost $${landedCost.toFixed(2)} exceeds current price $${item.currentPrice.toFixed(2)}`,
      })
    }
    result.accepted.push({
      asin,
      landedCost,
      outboundShipping,
      effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
      estimated: false,
    })
  }
  return result
}

/**
 * Category defaults expressed as a fraction of the current market low —
 * a rough acquisition-economics prior for refurb Apple, used ONLY to explore
 * the engine before real COGS lands. Every record is marked estimated.
 * VERIFY: replace with real landed costs; nothing here is trustworthy.
 */
export const DEFAULT_COST_RATIOS: Record<Category, { costRatio: number; shipping: number }> = {
  iPad: { costRatio: 0.65, shipping: 8 },
  iPhone: { costRatio: 0.7, shipping: 6 },
  "MacBook Air": { costRatio: 0.72, shipping: 12 },
  "MacBook Pro": { costRatio: 0.72, shipping: 14 },
  "Apple Watch": { costRatio: 0.65, shipping: 5 },
}

export function estimateCost(item: CatalogItem, effectiveDate: string): CostRecord | null {
  const base = item.lowestCompetitor ?? item.currentPrice
  if (base === null) return null
  const { costRatio, shipping } = DEFAULT_COST_RATIOS[item.category]
  return {
    asin: item.asin,
    landedCost: Math.round(base * costRatio * 100) / 100,
    outboundShipping: shipping,
    effectiveDate,
    estimated: true,
  }
}
