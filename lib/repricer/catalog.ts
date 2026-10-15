// Sample catalog: a real, anonymized market snapshot (2026-08-05) of a
// refurbished-Apple reseller's 77 Amazon Renewed SKUs (market prices,
// competition, Buy Box status; seller names replaced with generic labels,
// the sampled seller shown as "You"). It is the demo dataset — users can
// import their own catalog, stored only in their browser.

import type { CatalogItem, Category } from "./types"
import seed from "./seed-catalog.json"

export const SEED_CATALOG: CatalogItem[] = seed as CatalogItem[]

export const CATALOG_STORAGE_KEY = "repricer.catalog.v1"
export const CATEGORIES: Category[] = ["iPad", "iPhone", "MacBook Air", "MacBook Pro", "Apple Watch"]

export interface CatalogImportResult {
  accepted: CatalogItem[]
  rejected: { line: number; reason: string }[]
}

const num = (value: string | undefined): number | null => {
  if (value === undefined || value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

/**
 * Parse a user catalog CSV with columns:
 * asin, title, category, current_price[, lowest_competitor, competing_sellers,
 * buybox_price, buybox_holder, has_buybox, rating, review_count, monthly_sales_band].
 * Numeric fields may be blank (= unknown). `has_buybox` accepts true/yes/1.
 */
export function parseCatalogCsv(text: string): CatalogImportResult {
  const result: CatalogImportResult = { accepted: [], rejected: [] }
  const seen = new Set<string>()
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  for (let n = 0; n < lines.length; n++) {
    const cells = lines[n].split(",").map((c) => c.trim())
    if (n === 0 && /asin/i.test(cells[0])) continue
    const [asin, title, category, currentStr, lowestStr, sellersStr, buyboxStr, buyboxHolder, hasBuyboxStr, ratingStr, reviewsStr, salesBand] = cells
    if (!asin || !/^B0[A-Z0-9]{8}$/i.test(asin)) {
      result.rejected.push({ line: n + 1, reason: `Invalid ASIN "${asin ?? ""}"` })
      continue
    }
    if (seen.has(asin.toUpperCase())) {
      result.rejected.push({ line: n + 1, reason: `${asin}: duplicate ASIN` })
      continue
    }
    if (!title) {
      result.rejected.push({ line: n + 1, reason: `${asin}: missing title` })
      continue
    }
    if (!CATEGORIES.includes(category as Category)) {
      result.rejected.push({ line: n + 1, reason: `${asin}: category must be one of ${CATEGORIES.join(" / ")}` })
      continue
    }
    const currentPrice = num(currentStr)
    const lowestCompetitor = num(lowestStr)
    const competingSellers = num(sellersStr)
    const buyboxPrice = num(buyboxStr)
    const rating = num(ratingStr)
    const reviewCount = num(reviewsStr)
    const numbers = { currentPrice, lowestCompetitor, competingSellers, buyboxPrice, rating, reviewCount }
    const bad = Object.entries(numbers).find(([, v]) => v !== null && (Number.isNaN(v) || v < 0))
    if (bad) {
      result.rejected.push({ line: n + 1, reason: `${asin}: invalid ${bad[0]}` })
      continue
    }
    seen.add(asin.toUpperCase())
    result.accepted.push({
      asin: asin.toUpperCase(),
      title,
      category: category as Category,
      currentPrice,
      lowestCompetitor,
      competingSellers: competingSellers === null ? null : Math.round(competingSellers),
      buyboxHolder: buyboxHolder || null,
      buyboxPrice,
      hasBuybox: /^(true|yes|1)$/i.test(hasBuyboxStr ?? ""),
      rating,
      reviewCount: reviewCount === null ? null : Math.round(reviewCount),
      monthlySalesBand: salesBand || null,
    })
  }
  return result
}

/** Read a previously imported catalog from this browser; null = use the sample. */
export function loadStoredCatalog(): CatalogItem[] | null {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    if (!parsed.every((i) => typeof i?.asin === "string" && typeof i?.title === "string" && CATEGORIES.includes(i?.category))) return null
    return parsed as CatalogItem[]
  } catch {
    return null
  }
}

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
