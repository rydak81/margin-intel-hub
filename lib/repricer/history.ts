// Historical market data for a SKU: monthly series of our price, Buy Box
// price, lowest offer, seller count, and estimated monthly sales.
//
// Live data comes from the Keepa API (paid; key via KEEPA_API_KEY) through
// /api/history/[asin]. Without a key the UI falls back to a deterministic
// sample series generated from the SKU's current snapshot, clearly labeled
// SAMPLE — never mistake it for market truth.

import type { CatalogItem } from "./types"

export interface HistoryPoint {
  /** Month key, e.g. "2025-09". */
  month: string
  ourPrice: number | null
  buyBoxPrice: number | null
  lowestOffer: number | null
  offerCount: number | null
  monthlySold: number | null
}

export interface HistoryResponse {
  asin: string
  source: "keepa" | "sample"
  points: HistoryPoint[]
}

// ---------------------------------------------------------------------------
// Keepa parsing
// ---------------------------------------------------------------------------

/** Keepa timestamps are minutes since epoch minus this offset. */
const KEEPA_TIME_OFFSET = 21564000

export function keepaTimeToDate(keepaMinutes: number): Date {
  return new Date((keepaMinutes + KEEPA_TIME_OFFSET) * 60000)
}

export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

/**
 * Keepa `csv` arrays are flat [keepaTime, value, keepaTime, value, ...]
 * pairs; -1 means "no data". Prices are integer cents. Returns the last
 * observation per month, in cents (or raw units for counts).
 */
export function keepaSeriesToMonthly(csv: number[] | null | undefined): Map<string, number> {
  const out = new Map<string, number>()
  if (!csv) return out
  for (let i = 0; i + 1 < csv.length; i += 2) {
    const value = csv[i + 1]
    if (value === -1) continue
    out.set(monthKey(keepaTimeToDate(csv[i])), value)
  }
  return out
}

/** Keepa csv indices used here (see Keepa product API docs). */
export const KEEPA_CSV = {
  NEW: 1,
  COUNT_NEW: 11,
  BUY_BOX_SHIPPING: 18,
  MONTHLY_SOLD: 32,
} as const

export interface KeepaProduct {
  asin: string
  csv?: (number[] | null)[]
}

/**
 * Convert one Keepa product payload to monthly history points, most recent
 * `months` months. `ourPrice` cannot come from Keepa (it tracks the market,
 * not one seller's offer) — it is left null and the UI overlays the current
 * price from the catalog snapshot.
 */
export function keepaProductToHistory(product: KeepaProduct, months = 18): HistoryPoint[] {
  const priceNew = keepaSeriesToMonthly(product.csv?.[KEEPA_CSV.NEW])
  const buyBox = keepaSeriesToMonthly(product.csv?.[KEEPA_CSV.BUY_BOX_SHIPPING])
  const counts = keepaSeriesToMonthly(product.csv?.[KEEPA_CSV.COUNT_NEW])
  const sold = keepaSeriesToMonthly(product.csv?.[KEEPA_CSV.MONTHLY_SOLD])

  return lastMonths(months).map((m) => ({
    month: m,
    ourPrice: null,
    buyBoxPrice: centsToDollars(buyBox.get(m)),
    lowestOffer: centsToDollars(priceNew.get(m)),
    offerCount: counts.get(m) ?? null,
    monthlySold: sold.get(m) ?? null,
  }))
}

function centsToDollars(cents: number | undefined): number | null {
  return cents === undefined ? null : Math.round(cents) / 100
}

export function lastMonths(n: number, from = new Date()): string[] {
  const out: string[] = []
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1))
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1))
    out.push(monthKey(m))
  }
  return out
}

// ---------------------------------------------------------------------------
// Sample data (no Keepa key configured)
// ---------------------------------------------------------------------------

/** Deterministic PRNG seeded from the ASIN so sample charts are stable. */
function seededRandom(seed: string): () => number {
  let h = 2166136261
  for (const ch of seed) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function salesBandMidpoint(band: string | null): number {
  if (!band) return 20
  const m = band.match(/([\d.]+)(K?)/i)
  if (!m) return 20
  const base = parseFloat(m[1]) * (m[2] ? 1000 : 1)
  return Math.round(base * 1.3)
}

/**
 * Generate a plausible 18-month sample series anchored to the SKU's current
 * snapshot: refurb electronics drift down ~1-2%/month with noise, the Buy Box
 * sits between the lowest offer and our price, seller counts wander around
 * today's count. For UI exploration only.
 */
export function generateSampleHistory(item: CatalogItem, months = 18): HistoryPoint[] {
  const rand = seededRandom(item.asin)
  const anchorPrice = item.currentPrice ?? item.lowestCompetitor ?? 200
  const anchorLow = item.lowestCompetitor ?? anchorPrice * 0.92
  const anchorSellers = item.competingSellers ?? 10
  const anchorSold = salesBandMidpoint(item.monthlySalesBand)
  const keys = lastMonths(months)

  // Walk backwards from today's anchor so the series ends at current values.
  const drift = 0.012 + rand() * 0.008 // monthly depreciation
  const points: HistoryPoint[] = []
  for (let i = 0; i < keys.length; i++) {
    const monthsBack = keys.length - 1 - i
    const appreciation = Math.pow(1 + drift, monthsBack)
    const noise = () => 1 + (rand() - 0.5) * 0.06
    const low = anchorLow * appreciation * noise()
    const our = Math.max(anchorPrice * appreciation * noise(), low * 0.98)
    const buyBox = low * (1 + rand() * 0.04)
    points.push({
      month: keys[i],
      ourPrice: Math.round(our * 100) / 100,
      buyBoxPrice: Math.round(buyBox * 100) / 100,
      lowestOffer: Math.round(low * 100) / 100,
      offerCount: Math.max(1, Math.round(anchorSellers * (1 + (rand() - 0.5) * 0.4))),
      monthlySold: Math.max(0, Math.round(anchorSold * (1 + (rand() - 0.5) * 0.5))),
    })
  }
  return points
}

/**
 * Drop leading months where every series is null — live Keepa products that
 * are younger than the requested window otherwise render a long empty region
 * on the left of every chart. Keeps at least 3 points.
 */
export function trimLeadingEmpty(points: HistoryPoint[]): HistoryPoint[] {
  const firstWithData = points.findIndex(
    (p) =>
      p.buyBoxPrice !== null ||
      p.lowestOffer !== null ||
      p.offerCount !== null ||
      p.monthlySold !== null ||
      p.ourPrice !== null,
  )
  if (firstWithData <= 0) return points
  return points.slice(Math.min(firstWithData, Math.max(0, points.length - 3)))
}
