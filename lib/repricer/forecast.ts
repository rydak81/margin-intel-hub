// Sales forecasting from historical pricing and sales data — pure functions,
// no I/O, deterministic under a seed.
//
// Method (mirrors the simulation approach used in our prior brand analyses:
// central estimate + confidence band from Monte Carlo, seasonality-adjusted):
//   1. Price-demand: log-log elasticity fit on monthly (price, units) pairs
//      via least squares, with a category-prior fallback when history is thin.
//   2. Seasonality: multiplicative calendar-month indices.
//   3. Trend: damped linear trend on deseasonalized units.
//   4. Monte Carlo: simulate forward months = (level + damped trend) ×
//      seasonal index × (scenarioPrice / refPrice)^elasticity × bootstrapped
//      residual; report P10 / P50 / P90 units and revenue per month.
//
// Forecasts are estimates. Callers must always show the band, never the P50
// alone, and must not run this on sample-generated history.

import type { HistoryPoint } from "./history"

export interface SalesObservation {
  month: string // "YYYY-MM"
  price: number
  units: number
}

export interface ForecastMonth {
  month: string
  unitsP10: number
  unitsP50: number
  unitsP90: number
  revenueP50: number
}

export interface ForecastOk {
  ok: true
  months: ForecastMonth[]
  elasticity: number
  elasticitySource: "sku" | "category-fallback"
  elasticityR2: number | null
  refPrice: number
  scenarioPrice: number
  observationCount: number
  notes: string[]
}

export interface ForecastFail {
  ok: false
  reason: string
}

export type ForecastResult = ForecastOk | ForecastFail

export interface ForecastOptions {
  scenarioPrice: number
  horizonMonths?: number
  simulations?: number
  seed?: number
  /** Prior elasticity used when the SKU has too little history to fit its own. */
  fallbackElasticity?: number
  /** Minimum observations required to trust a SKU-level elasticity fit. */
  minMonthsForFit?: number
}

/** Usable (price, units) pairs from a history series. */
export function extractObservations(points: HistoryPoint[]): SalesObservation[] {
  const out: SalesObservation[] = []
  for (const p of points) {
    const price = p.buyBoxPrice ?? p.lowestOffer
    if (price === null || price <= 0) continue
    if (p.monthlySold === null || p.monthlySold <= 0) continue
    out.push({ month: p.month, price, units: p.monthlySold })
  }
  return out
}

export interface ElasticityFit {
  elasticity: number
  r2: number
  n: number
  clamped: boolean
}

/**
 * Log-log OLS: ln(units) = a + e·ln(price). Elasticity clamped to [-4, 0.5]
 * — outside that range the fit is almost certainly noise, not economics.
 */
export function fitElasticity(obs: SalesObservation[]): ElasticityFit | null {
  if (obs.length < 3) return null
  const xs = obs.map((o) => Math.log(o.price))
  const ys = obs.map((o) => Math.log(o.units))
  const mx = mean(xs)
  const my = mean(ys)
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    sxx += dx * dx
    sxy += dx * dy
    syy += dy * dy
  }
  if (sxx < 1e-9) return null // price never moved — elasticity unidentifiable
  const raw = sxy / sxx
  const elasticity = Math.min(0.5, Math.max(-4, raw))
  const r2 = syy < 1e-12 ? 0 : (sxy * sxy) / (sxx * syy)
  return { elasticity, r2, n: obs.length, clamped: raw !== elasticity }
}

/**
 * Multiplicative calendar-month indices, mean-normalized to 1. Months absent
 * from the history get 1. Clamped to [0.5, 2] so one hot December in a short
 * history can't triple a forecast.
 */
export function seasonalIndices(obs: SalesObservation[]): number[] {
  const sums = new Array(12).fill(0)
  const counts = new Array(12).fill(0)
  for (const o of obs) {
    const m = calendarMonth(o.month)
    sums[m] += o.units
    counts[m] += 1
  }
  const overall = mean(obs.map((o) => o.units))
  if (!Number.isFinite(overall) || overall <= 0) return new Array(12).fill(1)
  const idx = sums.map((s, m) =>
    counts[m] === 0 ? 1 : Math.min(2, Math.max(0.5, s / counts[m] / overall)),
  )
  const idxMean = mean(idx)
  return idx.map((v) => v / idxMean)
}

/**
 * Forecast forward months at a price scenario. Deterministic for a given seed.
 */
export function forecastSales(points: HistoryPoint[], opts: ForecastOptions): ForecastResult {
  const {
    scenarioPrice,
    horizonMonths = 12,
    simulations = 10000,
    seed = 42,
    fallbackElasticity = -1.6,
    minMonthsForFit = 8,
  } = opts

  if (!(scenarioPrice > 0)) return { ok: false, reason: "Scenario price must be positive" }
  const obs = extractObservations(points)
  if (obs.length < 6) {
    return {
      ok: false,
      reason: `Only ${obs.length} months have both price and sales data — at least 6 are needed to forecast`,
    }
  }

  const notes: string[] = []
  const fit = obs.length >= minMonthsForFit ? fitElasticity(obs) : null
  let elasticity: number
  let elasticitySource: "sku" | "category-fallback"
  if (fit && fit.r2 >= 0.05) {
    elasticity = fit.elasticity
    elasticitySource = "sku"
    if (fit.clamped) notes.push("Elasticity fit was extreme and has been clamped")
    if (fit.r2 < 0.3) notes.push("Weak price-demand relationship in history (low R²) — band is wide for a reason")
  } else {
    elasticity = fallbackElasticity
    elasticitySource = "category-fallback"
    notes.push(
      fit === null || obs.length < minMonthsForFit
        ? "Too little history for a SKU-level elasticity — using the category prior"
        : "No usable price-demand signal in history — using the category prior",
    )
  }

  const seasonal = seasonalIndices(obs)
  const refPrice = mean(obs.slice(-3).map((o) => o.price))

  // Deseasonalized, price-normalized units per observation.
  const normalized = obs.map((o, t) => ({
    t,
    value:
      o.units /
      seasonal[calendarMonth(o.month)] /
      Math.pow(o.price / refPrice, elasticity),
  }))

  // Damped linear trend on normalized units.
  const ts = normalized.map((n) => n.t)
  const vs = normalized.map((n) => n.value)
  const mt = mean(ts)
  const mv = mean(vs)
  let stt = 0
  let stv = 0
  for (let i = 0; i < ts.length; i++) {
    stt += (ts[i] - mt) * (ts[i] - mt)
    stv += (ts[i] - mt) * (vs[i] - mv)
  }
  const slope = stt > 0 ? stv / stt : 0
  const damping = 0.85
  const level = mean(vs.slice(-Math.min(6, vs.length)))

  // Multiplicative residual pool from the fitted model.
  const residuals = normalized.map((n) => {
    const fitted = level + slope * (n.t - (normalized.length - 1))
    const r = fitted > 0 ? n.value / fitted : 1
    return Math.min(4, Math.max(0.25, Number.isFinite(r) && r > 0 ? r : 1))
  })

  const rng = mulberry32(seed)
  const lastMonth = obs[obs.length - 1].month
  const priceFactor = Math.pow(scenarioPrice / refPrice, elasticity)

  const months: ForecastMonth[] = []
  for (let h = 1; h <= horizonMonths; h++) {
    const monthLabel = addMonths(lastMonth, h)
    const trendTerm = slope * dampedSteps(h, damping)
    const base = Math.max(0, (level + trendTerm) * seasonal[calendarMonth(monthLabel)] * priceFactor)
    const draws = new Array<number>(simulations)
    for (let s = 0; s < simulations; s++) {
      const resid = residuals[Math.floor(rng() * residuals.length)]
      draws[s] = base * resid
    }
    draws.sort((a, b) => a - b)
    const p10 = quantileSorted(draws, 0.1)
    const p50 = quantileSorted(draws, 0.5)
    const p90 = quantileSorted(draws, 0.9)
    months.push({
      month: monthLabel,
      unitsP10: round1(p10),
      unitsP50: round1(p50),
      unitsP90: round1(p90),
      revenueP50: Math.round(p50 * scenarioPrice),
    })
  }

  return {
    ok: true,
    months,
    elasticity: round3(elasticity),
    elasticitySource,
    elasticityR2: fit ? round3(fit.r2) : null,
    refPrice: round2(refPrice),
    scenarioPrice,
    observationCount: obs.length,
    notes,
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function calendarMonth(key: string): number {
  return Number(key.slice(5, 7)) - 1
}

export function addMonths(key: string, n: number): string {
  const y = Number(key.slice(0, 4))
  const m = Number(key.slice(5, 7)) - 1
  const d = new Date(Date.UTC(y, m + n, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

/** Sum of damping^i for i in 0..h-1 — a damped trend accumulates, then flattens. */
function dampedSteps(h: number, phi: number): number {
  return (1 - Math.pow(phi, h)) / (1 - phi)
}

function quantileSorted(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round1 = (v: number) => Math.round(v * 10) / 10
const round2 = (v: number) => Math.round(v * 100) / 100
const round3 = (v: number) => Math.round(v * 1000) / 1000
