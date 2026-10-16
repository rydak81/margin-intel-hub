/**
 * Marketplace Pressure Index: coverage intensity, not market size.
 *
 * For each platform and topic, compares the count of relevant classified articles in the
 * last 7 days with that key's average weekly count since the archive began (excluding the
 * current week). An index of 2.0 means twice the usual weekly coverage.
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
  current: number
  baseline: number
  /** current / baseline, rounded to 2 dp. */
  index: number
  /** Weekly counts, oldest first, ending with the current week. */
  weekly: number[]
}

export interface PressureIndexResult {
  status: 'ok' | 'empty'
  asOf: string
  windowStart: string
  archiveStart: string | null
  weeksOfHistory: number
  articlesCounted: number
  rows: PressureRow[]
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
/** Keys averaging fewer articles per week than this are too thin to rank. */
export const MIN_BASELINE = 1

export function computePressureIndex(articles: readonly PressureArticle[], now: Date = new Date()): PressureIndexResult {
  const end = now.getTime()
  const windowStart = end - WEEK_MS
  const dated = articles
    .map(a => ({ a, t: a.published_at ? Date.parse(a.published_at) : NaN }))
    .filter(({ t }) => Number.isFinite(t) && t <= end)

  const empty: PressureIndexResult = { status: 'empty', asOf: now.toISOString(), windowStart: new Date(windowStart).toISOString(), archiveStart: null, weeksOfHistory: 0, articlesCounted: 0, rows: [] }
  if (dated.length === 0) return empty

  const first = Math.min(...dated.map(d => d.t))
  // Week 0 is the current 7 days; week k covers (end - (k+1)w, end - kw].
  const totalWeeks = Math.max(1, Math.ceil((end - first) / WEEK_MS))
  const priorWeeks = totalWeeks - 1
  if (priorWeeks < 1) return { ...empty, archiveStart: new Date(first).toISOString(), articlesCounted: dated.length }

  const counts = new Map<string, number[]>()
  const bump = (key: string, week: number) => {
    let arr = counts.get(key)
    if (!arr) { arr = new Array(totalWeeks).fill(0); counts.set(key, arr) }
    arr[week] += 1
  }
  for (const { a, t } of dated) {
    const week = Math.min(totalWeeks - 1, Math.floor((end - t) / WEEK_MS))
    if (a.category && TOPIC_LABELS[a.category]) bump(`topic:${a.category}`, week)
    for (const p of new Set(a.platforms ?? [])) if (PLATFORM_LABELS[p]) bump(`platform:${p}`, week)
  }

  const rows: PressureRow[] = []
  for (const [key, arr] of counts) {
    const [kind, id] = key.split(':') as ['platform' | 'topic', string]
    const current = arr[0]
    const baseline = arr.slice(1).reduce((s, n) => s + n, 0) / priorWeeks
    if (baseline < MIN_BASELINE) continue
    rows.push({
      key, kind, label: kind === 'platform' ? PLATFORM_LABELS[id] : TOPIC_LABELS[id],
      current, baseline: Math.round(baseline * 10) / 10, index: Math.round((current / baseline) * 100) / 100,
      weekly: arr.slice(0, SPARKLINE_WEEKS).reverse(),
    })
  }
  rows.sort((x, y) => y.index - x.index || y.current - x.current)

  return {
    status: rows.length ? 'ok' : 'empty',
    asOf: now.toISOString(), windowStart: new Date(windowStart).toISOString(), archiveStart: new Date(first).toISOString(),
    weeksOfHistory: priorWeeks, articlesCounted: dated.length, rows,
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
