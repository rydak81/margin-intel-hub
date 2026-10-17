/**
 * Marketplace Pressure Index: coverage intensity, not market size.
 *
 * The index is share-normalized so that growth (or shrinkage) in our own ingestion volume
 * does not read as "pressure". For each platform and topic:
 *
 *   share(week)    = key's relevant articles that week / all relevant articles that week
 *   baselineShare  = mean of share(week) over the trailing baseline weeks (default 12,
 *                    excluding the current week and any week whose total volume is too
 *                    thin to give a stable share)
 *   index          = share(last 7 days) / baselineShare
 *
 * An index of 2.0 means the key's slice of total coverage is twice its usual slice. If every
 * key's volume doubles together, every index stays at ~1.0. Raw counts are reported
 * alongside for transparency.
 */

export interface PressureArticle {
  published_at: string | null
  category: string | null
  platforms: string[] | null
}

export interface PressureRow {
  key: string
  kind: 'platform' | 'topic'
  label: string
  /** Raw count of relevant articles tagged with this key in the last 7 days. */
  current: number
  /** Raw average weekly count over the baseline weeks, 1 dp. */
  baseline: number
  /** Share of all relevant articles in the last 7 days (0-1, 4 dp). */
  share: number
  /** Mean weekly share over the baseline weeks (0-1, 4 dp). */
  baselineShare: number
  /** share / baselineShare, rounded to 2 dp. The headline index. */
  index: number
  /** Unnormalized current / baseline count ratio, 2 dp. Shown for transparency only. */
  rawRatio: number
  /** False when volume is below the ranking thresholds; such rows are listed but not ranked. */
  ranked: boolean
  /** Weekly counts, oldest first, ending with the current week. */
  weekly: number[]
}

export interface PressureIndexResult {
  status: 'ok' | 'empty'
  asOf: string
  windowStart: string
  archiveStart: string | null
  /** Full prior weeks in the archive (before the current week). */
  weeksOfHistory: number
  /** Prior weeks actually used for the baseline (trailing, volume-filtered). */
  baselineWeeks: number
  articlesCounted: number
  /** All relevant articles in the last 7 days. */
  totalCurrent: number
  /** Average weekly relevant articles over the baseline weeks, 1 dp. */
  totalBaseline: number
  /** Ranked rows first (index desc), then unranked thin rows. */
  rows: PressureRow[]
}

export interface PressureOptions {
  /** Trailing weeks used for the baseline. Default BASELINE_WEEKS. */
  baselineWeeks?: number
  /** Keys averaging fewer articles per baseline week than this are dropped entirely. */
  minBaseline?: number
  /** Keys with fewer articles than this in the last 7 days are shown but not ranked. */
  minCurrent?: number
  /** Baseline weeks whose total volume is below this fraction of the median baseline week are skipped. */
  minWeekFractionOfMedian?: number
}

export const PLATFORM_LABELS: Record<string, string> = {
  amazon: 'Amazon', walmart: 'Walmart', tiktok: 'TikTok Shop', shopify: 'Shopify', ebay: 'eBay', etsy: 'Etsy',
  target: 'Target', temu: 'Temu', shein: 'Shein', alibaba: 'Alibaba', aliexpress: 'AliExpress', multi_platform: 'Multichannel',
}

export const TOPIC_LABELS: Record<string, string> = {
  breaking: 'Breaking news', market_metrics: 'Market metrics', platform_updates: 'Platform updates', profitability: 'Fees & profitability',
  mergers_acquisitions: 'M&A', tools_technology: 'Tools & technology', advertising: 'Advertising', logistics: 'Logistics & freight',
  events: 'Events', tactics: 'Seller tactics',
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
export const SPARKLINE_WEEKS = 12
/** Trailing baseline length in weeks. */
export const BASELINE_WEEKS = 12
/** Keys averaging fewer articles per baseline week than this are too thin to list. */
export const MIN_BASELINE = 1
/** Keys need at least this many articles in the last 7 days to be ranked. */
export const MIN_CURRENT = 3
/** Baseline weeks below this fraction of the median baseline week's volume (ramp-up, outages, stray old dates) are skipped. */
export const MIN_WEEK_FRACTION_OF_MEDIAN = 0.25

const r1 = (n: number) => Math.round(n * 10) / 10
const r2 = (n: number) => Math.round(n * 100) / 100
const r4 = (n: number) => Math.round(n * 10000) / 10000

function median(xs: number[]): number {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function computePressureIndex(articles: readonly PressureArticle[], now: Date = new Date(), options: PressureOptions = {}): PressureIndexResult {
  const baselineLen = Math.max(1, Math.floor(options.baselineWeeks ?? BASELINE_WEEKS))
  const minBaseline = options.minBaseline ?? MIN_BASELINE
  const minCurrent = options.minCurrent ?? MIN_CURRENT
  const minWeekFraction = options.minWeekFractionOfMedian ?? MIN_WEEK_FRACTION_OF_MEDIAN

  const end = now.getTime()
  const windowStart = end - WEEK_MS
  const dated = articles
    .map(a => ({ a, t: a.published_at ? Date.parse(a.published_at) : NaN }))
    .filter(({ t }) => Number.isFinite(t) && t <= end)

  const empty: PressureIndexResult = {
    status: 'empty', asOf: now.toISOString(), windowStart: new Date(windowStart).toISOString(), archiveStart: null,
    weeksOfHistory: 0, baselineWeeks: 0, articlesCounted: 0, totalCurrent: 0, totalBaseline: 0, rows: [],
  }
  if (dated.length === 0) return empty

  let first = Infinity
  for (const d of dated) if (d.t < first) first = d.t
  // Week 0 is the current 7 days; week k covers (end - (k+1)w, end - kw].
  const totalWeeks = Math.max(1, Math.ceil((end - first) / WEEK_MS))
  const priorWeeks = totalWeeks - 1
  const base = { ...empty, archiveStart: new Date(first).toISOString(), weeksOfHistory: Math.max(0, priorWeeks), articlesCounted: dated.length }
  if (priorWeeks < 1) return base

  // Only the current week, the trailing baseline and the sparkline window matter.
  const span = Math.min(totalWeeks, Math.max(baselineLen + 1, SPARKLINE_WEEKS))
  const totals = new Array<number>(span).fill(0)
  const counts = new Map<string, number[]>()
  const bump = (key: string, week: number) => {
    let arr = counts.get(key)
    if (!arr) { arr = new Array<number>(span).fill(0); counts.set(key, arr) }
    arr[week] += 1
  }
  for (const { a, t } of dated) {
    const week = Math.floor((end - t) / WEEK_MS)
    if (week >= span) continue
    totals[week] += 1
    if (a.category && TOPIC_LABELS[a.category]) bump(`topic:${a.category}`, week)
    for (const p of new Set(a.platforms ?? [])) if (PLATFORM_LABELS[p]) bump(`platform:${p}`, week)
  }

  const totalCurrent = totals[0]
  // Trailing baseline weeks 1..baselineLen, skipping weeks too thin to give a stable share.
  const candidate = Array.from({ length: Math.min(baselineLen, span - 1) }, (_, i) => i + 1)
  const med = median(candidate.map(w => totals[w]))
  const baselineWeekIdx = candidate.filter(w => totals[w] > 0 && totals[w] >= med * minWeekFraction)
  if (totalCurrent === 0 || baselineWeekIdx.length === 0) return { ...base, totalCurrent }
  const totalBaseline = baselineWeekIdx.reduce((s, w) => s + totals[w], 0) / baselineWeekIdx.length

  const rows: PressureRow[] = []
  for (const [key, arr] of counts) {
    const [kind, id] = key.split(':') as ['platform' | 'topic', string]
    const current = arr[0]
    const baseline = baselineWeekIdx.reduce((s, w) => s + arr[w], 0) / baselineWeekIdx.length
    if (baseline < minBaseline) continue
    const baselineShare = baselineWeekIdx.reduce((s, w) => s + arr[w] / totals[w], 0) / baselineWeekIdx.length
    if (baselineShare <= 0) continue
    const currentShare = current / totalCurrent
    rows.push({
      key, kind, label: kind === 'platform' ? PLATFORM_LABELS[id] : TOPIC_LABELS[id],
      current, baseline: r1(baseline),
      share: r4(currentShare), baselineShare: r4(baselineShare),
      index: r2(currentShare / baselineShare), rawRatio: r2(current / baseline),
      ranked: current >= minCurrent,
      weekly: arr.slice(0, SPARKLINE_WEEKS).reverse(),
    })
  }
  rows.sort((x, y) => Number(y.ranked) - Number(x.ranked) || y.index - x.index || y.current - x.current)

  return {
    status: rows.length ? 'ok' : 'empty',
    asOf: now.toISOString(), windowStart: new Date(windowStart).toISOString(), archiveStart: new Date(first).toISOString(),
    weeksOfHistory: priorWeeks, baselineWeeks: baselineWeekIdx.length, articlesCounted: dated.length,
    totalCurrent, totalBaseline: r1(totalBaseline), rows,
  }
}

/** Server-only: loads relevant articles from Supabase. Returns [] when unconfigured or unreachable. */
export async function loadPressureArticles(): Promise<PressureArticle[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return []
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const out: PressureArticle[] = []
    const PAGE = 1000
    for (let from = 0; from < 50_000; from += PAGE) {
      const { data, error } = await supabase
        .from('articles')
        .select('published_at, category, platforms')
        .eq('relevant', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: true })
        .range(from, from + PAGE - 1)
      if (error) { console.warn('[pressure-index] query failed:', error.message); return [] }
      out.push(...((data ?? []) as PressureArticle[]))
      if (!data || data.length < PAGE) break
    }
    return out
  } catch (error) {
    console.warn('[pressure-index] unexpected error:', error)
    return []
  }
}
