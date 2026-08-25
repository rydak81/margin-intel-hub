/**
 * Sales forecasting engine: Holt-Winters exponential smoothing fitted to the
 * seller's own history, with Monte Carlo simulation for honest uncertainty
 * bands.
 *
 * ── Why Holt-Winters rather than ARIMA ──
 * For monthly retail unit series (short, strongly seasonal, trend-shifting),
 * seasonal exponential smoothing is the standard forecasting baseline and
 * routinely matches or beats ARIMA in forecasting competitions on exactly this
 * kind of data — and it fits reliably in the browser on 12–60 points, where
 * ARIMA order selection is fragile. We say what we do in the UI; no method
 * name-dropping the code doesn't back.
 *
 * ── Uncertainty ──
 * Prediction intervals come from residual-bootstrap Monte Carlo: we re-run the
 * fitted model forward many times, each step perturbed by a residual sampled
 * from the model's own in-sample errors, updating state along each path. Bands
 * widen with horizon because uncertainty genuinely compounds — nothing is
 * hand-drawn.
 *
 * Everything runs client-side; the seller's sales data never leaves the page.
 */

export interface HistoryPoint {
  /** First day of the month, local. */
  date: Date
  units: number
}

export interface ForecastPoint {
  date: Date
  p10: number
  p50: number
  p90: number
}

export interface ForecastResult {
  forecast: ForecastPoint[]
  fitted: number[]
  method: string
  seasonalitySource: 'data' | 'blended' | 'category-prior' | 'none'
  /** Mean absolute percentage error on a held-out tail, when history allows. */
  backtestMape: number | null
  totalNext12: { p10: number; p50: number; p90: number }
  peakMonthIndex: number | null
}

/**
 * Modeled monthly seasonal priors (Jan..Dec, mean 1.0) per category. These are
 * domain-shaped curves used only when the seller's history is too short to
 * estimate seasonality from their own data — and the UI labels them as such.
 */
export const CATEGORY_SEASONALITY: Record<string, { label: string; indices: number[] }> = {
  none: { label: 'No strong seasonality / not sure', indices: Array(12).fill(1) },
  toys_games: { label: 'Toys & Games', indices: [0.7, 0.65, 0.7, 0.75, 0.8, 0.8, 0.85, 0.9, 0.9, 1.05, 1.5, 2.4] },
  electronics: { label: 'Electronics', indices: [0.85, 0.75, 0.8, 0.8, 0.85, 0.9, 1.0, 0.95, 0.9, 1.0, 1.5, 1.7] },
  home_garden: { label: 'Home & Garden', indices: [0.8, 0.85, 1.1, 1.25, 1.3, 1.2, 1.1, 1.0, 0.9, 0.9, 0.85, 0.75] },
  apparel: { label: 'Apparel & Accessories', indices: [0.8, 0.75, 0.95, 1.0, 1.05, 0.95, 0.9, 1.1, 1.0, 1.0, 1.3, 1.2] },
  beauty: { label: 'Beauty & Personal Care', indices: [0.9, 0.95, 0.95, 1.0, 1.05, 0.95, 0.95, 0.95, 0.95, 1.0, 1.3, 1.05] },
  grocery: { label: 'Grocery & Consumables', indices: [1.0, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 1.0, 1.05, 1.05] },
  sports_outdoors: { label: 'Sports & Outdoors', indices: [1.0, 0.85, 1.0, 1.1, 1.2, 1.15, 1.1, 1.0, 0.9, 0.85, 0.9, 0.95] },
  pet_supplies: { label: 'Pet Supplies', indices: [1.0, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.95, 1.0, 1.1, 1.05] },
  office: { label: 'Office & School', indices: [1.15, 0.95, 0.95, 0.95, 0.9, 0.9, 1.2, 1.5, 1.1, 0.9, 0.75, 0.75] },
  health: { label: 'Health & Wellness', indices: [1.2, 1.0, 1.0, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 1.0, 1.0, 1.1] },
}

const SEASON_LENGTH = 12

interface HWState {
  level: number
  trend: number
  /** Seasonal factors indexed by calendar month (0..11), multiplicative, mean 1. */
  seasonal: number[]
}

interface HWParams {
  alpha: number
  beta: number
  gamma: number
}

interface HWFit {
  state: HWState
  params: HWParams
  fitted: number[]
  /** Relative one-step-ahead residuals y/fitted. */
  residuals: number[]
  sse: number
}

function clonedState(s: HWState): HWState {
  return { level: s.level, trend: s.trend, seasonal: [...s.seasonal] }
}

/** Normalize seasonal factors to mean 1 so level and seasonality don't drift into each other. */
function normalizeSeasonal(seasonal: number[]): number[] {
  const mean = seasonal.reduce((a, b) => a + b, 0) / seasonal.length
  return mean > 0 ? seasonal.map((s) => s / mean) : seasonal
}

/**
 * One pass of multiplicative Holt-Winters over the series. `updateGamma=false`
 * freezes the seasonal factors (used when they come from a prior rather than
 * the data).
 */
function runHW(
  units: number[],
  monthIndices: number[],
  initial: HWState,
  params: HWParams,
  updateGamma: boolean,
): HWFit {
  const state = clonedState(initial)
  const fitted: number[] = []
  const residuals: number[] = []
  let sse = 0

  for (let t = 0; t < units.length; t++) {
    const m = monthIndices[t]
    const s = state.seasonal[m] || 1
    const oneAhead = Math.max((state.level + state.trend) * s, 0.01)
    fitted.push(oneAhead)

    const y = Math.max(units[t], 0.01)
    residuals.push(y / oneAhead)
    sse += (y - oneAhead) ** 2

    const prevLevel = state.level
    state.level = params.alpha * (y / s) + (1 - params.alpha) * (state.level + state.trend)
    state.trend = params.beta * (state.level - prevLevel) + (1 - params.beta) * state.trend
    if (updateGamma) {
      state.seasonal[m] = params.gamma * (y / state.level) + (1 - params.gamma) * s
    }
  }

  state.seasonal = normalizeSeasonal(state.seasonal)
  return { state, params, fitted, residuals, sse }
}

/** Initial state: level/trend from the first season(s), seasonal factors supplied. */
function initialState(units: number[], seasonal: number[]): HWState {
  const first = units.slice(0, Math.min(SEASON_LENGTH, units.length))
  const level = first.reduce((a, b) => a + b, 0) / first.length || 1

  let trend = 0
  if (units.length >= SEASON_LENGTH * 2) {
    const second = units.slice(SEASON_LENGTH, SEASON_LENGTH * 2)
    const secondMean = second.reduce((a, b) => a + b, 0) / second.length
    trend = (secondMean - level) / SEASON_LENGTH
  } else if (units.length >= 4) {
    const half = Math.floor(units.length / 2)
    const a = units.slice(0, half).reduce((x, y) => x + y, 0) / half
    const b = units.slice(half).reduce((x, y) => x + y, 0) / (units.length - half)
    trend = (b - a) / half
  }

  return { level: Math.max(level, 0.01), trend, seasonal: normalizeSeasonal([...seasonal]) }
}

/** Seasonal factors estimated from the data: average detrended ratio per calendar month. */
function estimateSeasonalFromData(units: number[], monthIndices: number[]): number[] {
  const overallMean = units.reduce((a, b) => a + b, 0) / units.length || 1
  const sums = Array(12).fill(0)
  const counts = Array(12).fill(0)
  units.forEach((u, t) => {
    sums[monthIndices[t]] += u / overallMean
    counts[monthIndices[t]] += 1
  })
  const indices = sums.map((s, m) => (counts[m] > 0 ? s / counts[m] : 1))
  return normalizeSeasonal(indices)
}

function fitHoltWinters(
  units: number[],
  monthIndices: number[],
  seasonal: number[],
  updateGamma: boolean,
): HWFit {
  const alphas = [0.1, 0.2, 0.3, 0.45, 0.6, 0.8]
  const betas = [0.01, 0.05, 0.1, 0.2]
  const gammas = updateGamma ? [0.05, 0.15, 0.3] : [0]

  let best: HWFit | null = null
  for (const alpha of alphas) {
    for (const beta of betas) {
      for (const gamma of gammas) {
        const fit = runHW(units, monthIndices, initialState(units, seasonal), { alpha, beta, gamma }, updateGamma)
        if (!best || fit.sse < best.sse) best = fit
      }
    }
  }
  return best!
}

/** Deterministic PRNG so the same inputs always produce the same bands. */
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

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  return sorted[base] + rest * ((sorted[base + 1] ?? sorted[base]) - sorted[base])
}

/**
 * Monte Carlo simulation: run the fitted model forward `horizon` steps,
 * `paths` times, each step multiplied by a bootstrap-sampled relative residual
 * and the state updated with the simulated value — so uncertainty compounds
 * along each path exactly as it would in reality.
 */
function simulate(
  fit: HWFit,
  startMonthIndex: number,
  horizon: number,
  updateGamma: boolean,
  paths = 1000,
): { p10: number[]; p50: number[]; p90: number[]; totals: { p10: number; p50: number; p90: number } } {
  const rand = mulberry32(42)
  // Guard against degenerate residual sets (perfect fit on tiny data).
  const residuals = fit.residuals.length >= 4 ? fit.residuals : [0.9, 0.95, 1.05, 1.1]
  const results: number[][] = Array.from({ length: horizon }, () => [])
  const pathTotals: number[] = []

  for (let p = 0; p < paths; p++) {
    const state = clonedState(fit.state)
    let pathTotal = 0
    for (let h = 0; h < horizon; h++) {
      const m = (startMonthIndex + h) % 12
      const s = state.seasonal[m] || 1
      const point = Math.max((state.level + state.trend) * s, 0)
      const shock = residuals[Math.floor(rand() * residuals.length)]
      const y = Math.max(point * shock, 0)
      results[h].push(y)
      pathTotal += y

      const prevLevel = state.level
      const ySafe = Math.max(y, 0.01)
      state.level = fit.params.alpha * (ySafe / s) + (1 - fit.params.alpha) * (state.level + state.trend)
      state.trend = fit.params.beta * (state.level - prevLevel) + (1 - fit.params.beta) * state.trend
      if (updateGamma) {
        state.seasonal[m] = fit.params.gamma * (ySafe / state.level) + (1 - fit.params.gamma) * s
      }
    }
    pathTotals.push(pathTotal)
  }

  const p10: number[] = []
  const p50: number[] = []
  const p90: number[] = []
  for (let h = 0; h < horizon; h++) {
    const sorted = results[h].sort((a, b) => a - b)
    p10.push(quantile(sorted, 0.1))
    p50.push(quantile(sorted, 0.5))
    p90.push(quantile(sorted, 0.9))
  }

  // Horizon-total quantiles come from each path's own total — quantiles are
  // not additive, and months are correlated through the evolving state, so
  // summing the monthly P10s would badly overstate how wide the annual band is.
  const sortedTotals = pathTotals.sort((a, b) => a - b)
  const totals = {
    p10: Math.round(quantile(sortedTotals, 0.1)),
    p50: Math.round(quantile(sortedTotals, 0.5)),
    p90: Math.round(quantile(sortedTotals, 0.9)),
  }

  return { p10, p50, p90, totals }
}

/**
 * Seasonality policy for a series of length n: estimated from the data when
 * there are 2+ full seasons, blended with the category prior at 12–23 points,
 * pure prior below that. Centralized so the backtest applies the same policy
 * to its training split — deriving seasonality from the full series and then
 * "holding out" months it already saw would leak the evaluation targets and
 * flatter the reported error.
 */
function chooseSeasonality(
  units: number[],
  monthIndices: number[],
  prior: number[],
): { seasonal: number[]; updateGamma: boolean } {
  const n = units.length
  if (n >= 24) {
    return { seasonal: estimateSeasonalFromData(units, monthIndices), updateGamma: true }
  }
  if (n >= 12) {
    const fromData = estimateSeasonalFromData(units, monthIndices)
    const w = n / 24
    return {
      seasonal: normalizeSeasonal(fromData.map((d, i) => w * d + (1 - w) * prior[i])),
      updateGamma: false,
    }
  }
  return { seasonal: [...prior], updateGamma: false }
}

/** Backtest: refit without the last `holdout` months, forecast them, report MAPE. */
function backtest(
  units: number[],
  monthIndices: number[],
  prior: number[],
  holdout: number,
): number | null {
  if (units.length < holdout + 10) return null
  const trainUnits = units.slice(0, -holdout)
  const trainMonths = monthIndices.slice(0, -holdout)
  // Seasonality comes from the training split only — never the held-out tail.
  const { seasonal, updateGamma } = chooseSeasonality(trainUnits, trainMonths, prior)
  const fit = fitHoltWinters(trainUnits, trainMonths, seasonal, updateGamma)

  const state = clonedState(fit.state)
  let mapeSum = 0
  let mapeCount = 0
  for (let h = 0; h < holdout; h++) {
    const m = monthIndices[trainUnits.length + h]
    const s = state.seasonal[m] || 1
    const f = Math.max((state.level + state.trend) * s, 0)
    const actual = units[trainUnits.length + h]
    if (actual > 0) {
      mapeSum += Math.abs(actual - f) / actual
      mapeCount++
    }
    // Walk the state forward on the point forecast (no peeking at actuals).
    state.level = state.level + state.trend
  }
  return mapeCount > 0 ? (mapeSum / mapeCount) * 100 : null
}

export function forecastSales(
  history: HistoryPoint[],
  categoryKey: string,
  horizon = 12,
): ForecastResult {
  const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime())
  const units = sorted.map((p) => p.units)
  const monthIndices = sorted.map((p) => p.date.getMonth())
  const n = units.length

  const prior = CATEGORY_SEASONALITY[categoryKey]?.indices ?? CATEGORY_SEASONALITY.none.indices

  // Seasonality source: the seller's own data when there's enough of it,
  // the category prior when there isn't, and a blend in between.
  const { seasonal, updateGamma } = chooseSeasonality(units, monthIndices, prior)
  const seasonalitySource: ForecastResult['seasonalitySource'] =
    n >= 24 ? 'data' : n >= 12 ? 'blended' : categoryKey === 'none' ? 'none' : 'category-prior'

  const fit = fitHoltWinters(units, monthIndices, seasonal, updateGamma)

  const lastDate = sorted[n - 1].date
  const startMonthIndex = (lastDate.getMonth() + 1) % 12
  const bands = simulate(fit, startMonthIndex, horizon, updateGamma)

  const forecast: ForecastPoint[] = []
  for (let h = 0; h < horizon; h++) {
    const date = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1 + h, 1)
    forecast.push({
      date,
      p10: Math.round(bands.p10[h]),
      p50: Math.round(bands.p50[h]),
      p90: Math.round(bands.p90[h]),
    })
  }

  const totalNext12 = bands.totals

  let peakMonthIndex: number | null = null
  if (forecast.length > 0) {
    let max = -1
    forecast.forEach((f, i) => {
      if (f.p50 > max) {
        max = f.p50
        peakMonthIndex = i
      }
    })
  }

  return {
    forecast,
    fitted: fit.fitted,
    method:
      seasonalitySource === 'data'
        ? 'Holt-Winters (seasonality estimated from your data) + Monte Carlo'
        : seasonalitySource === 'blended'
          ? 'Holt-Winters (your data blended with category seasonal priors) + Monte Carlo'
          : 'Holt trend model with category seasonal priors + Monte Carlo',
    seasonalitySource,
    backtestMape: backtest(units, monthIndices, prior, 6),
    totalNext12,
    peakMonthIndex,
  }
}

// ── Input parsing ────────────────────────────────────────────────────────────

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** Parse "2025-01", "Jan 2025", "January 2025", "01/2025", "1/2025". */
export function parseMonth(raw: string): Date | null {
  const s = raw.trim().toLowerCase().replace(/,/g, '')
  let m: RegExpMatchArray | null

  if ((m = s.match(/^(\d{4})[-/](\d{1,2})$/))) {
    const month = parseInt(m[2], 10)
    if (month >= 1 && month <= 12) return new Date(parseInt(m[1], 10), month - 1, 1)
  }
  if ((m = s.match(/^(\d{1,2})[-/](\d{4})$/))) {
    const month = parseInt(m[1], 10)
    if (month >= 1 && month <= 12) return new Date(parseInt(m[2], 10), month - 1, 1)
  }
  if ((m = s.match(/^([a-z]{3,9})\s+(\d{4})$/))) {
    const idx = MONTH_NAMES.findIndex((name) => m![1].startsWith(name))
    if (idx >= 0) return new Date(parseInt(m[2], 10), idx, 1)
  }
  return null
}

/**
 * Parse pasted history: one row per line, "month, units" (comma, tab, or
 * semicolon separated). Returns points plus lines it couldn't read, so the UI
 * can say exactly what was skipped rather than failing silently.
 */
export function parseHistoryInput(text: string): { points: HistoryPoint[]; skipped: string[] } {
  const points: HistoryPoint[] = []
  const skipped: string[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const parts = line.split(/[,\t;]+/).map((p) => p.trim()).filter(Boolean)
    if (parts.length < 2) {
      skipped.push(line)
      continue
    }
    const date = parseMonth(parts[0])
    // "Jan 2025, 1,200" splits the thousands separator into extra parts —
    // stitch trailing 3-digit groups back together before parsing.
    const tail = parts.slice(1)
    let unitsStr = tail[0]
    if (tail.length > 1 && tail.slice(1).every((p) => /^\d{3}$/.test(p))) {
      unitsStr = tail.join('')
    }
    const units = Number(unitsStr.replace(/\s/g, ''))
    if (!date || !Number.isFinite(units) || units < 0) {
      // Tolerate a header row without complaint.
      if (points.length === 0 && /month|date|period/i.test(parts[0])) continue
      skipped.push(line)
      continue
    }
    points.push({ date, units })
  }

  // Deduplicate months, keeping the last value entered.
  const byMonth = new Map<string, HistoryPoint>()
  for (const p of points) {
    byMonth.set(`${p.date.getFullYear()}-${p.date.getMonth()}`, p)
  }

  return {
    points: [...byMonth.values()].sort((a, b) => a.date.getTime() - b.date.getTime()),
    skipped,
  }
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
