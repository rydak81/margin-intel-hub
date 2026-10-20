/**
 * The resident analyst agent.
 *
 * A scheduled run (app/api/intel/analyst) that reads the day's classified
 * coverage, recalls its own memory (intel_memory), checks every open
 * forecast's confirming/invalidating indicators against the new evidence,
 * and writes its conclusions back. Memory persists between runs and
 * includes forecast post-mortems, so each run — and each future forecast —
 * is made in the context of the graded record. A run may also issue a
 * correction that supersedes one of its own earlier entries.
 *
 * This module holds the types, the sanitizer that validates the model's
 * JSON output against hard constraints (whitelisted forecast ids, enum
 * fields, bounded list sizes), and the loader the public analyst log reads.
 */

export type MemoryKind = 'observation' | 'hypothesis' | 'correction' | 'post_mortem'
export type IndicatorSignal = 'confirming' | 'invalidating' | 'mixed' | 'none'

export interface AnalystForecastCheck {
  id: number
  signal: IndicatorSignal
  note: string
}

export interface AnalystMemoryEntry {
  kind: MemoryKind
  title: string
  body: string
  confidence: 'low' | 'medium' | 'high'
  related_forecasts: number[]
  source_titles: string[]
  /** Title of an earlier memory entry this one corrects (kind 'correction' only). */
  supersedes_title?: string
}

export interface AnalystOutput {
  assessment: string
  watchlist: { item: string; why: string }[]
  forecast_checks: AnalystForecastCheck[]
  memory: AnalystMemoryEntry[]
}

const MEMORY_KINDS: MemoryKind[] = ['observation', 'hypothesis', 'correction', 'post_mortem']
const SIGNALS: IndicatorSignal[] = ['confirming', 'invalidating', 'mixed', 'none']
const CONFIDENCES = ['low', 'medium', 'high'] as const

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * Validate and bound the model's output. Everything the run persists goes
 * through here: forecast checks only target open forecasts (openIds),
 * memory may reference any ledger forecast (allIds — post-mortems point at
 * resolved ones), enums fall back to safe values, and list sizes are capped
 * so a malformed response cannot flood the tables.
 */
export function sanitizeAnalystOutput(raw: unknown, openIds: number[], allIds: number[] = openIds): AnalystOutput | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const assessment = str(r.assessment, 2000)
  if (!assessment) return null
  const open = new Set(openIds)
  const all = new Set(allIds)

  const watchlist = (Array.isArray(r.watchlist) ? r.watchlist : [])
    .map((w) => ({ item: str((w as Record<string, unknown>)?.item, 160), why: str((w as Record<string, unknown>)?.why, 400) }))
    .filter((w) => w.item && w.why)
    .slice(0, 5)

  const forecast_checks = (Array.isArray(r.forecast_checks) ? r.forecast_checks : [])
    .map((c) => {
      const o = c as Record<string, unknown>
      const id = Number(o?.id)
      const note = str(o?.note, 400)
      let signal = SIGNALS.includes(o?.signal as IndicatorSignal) ? (o.signal as IndicatorSignal) : 'none'
      // A directional signal needs evidence: without a note it downgrades to
      // 'none' instead of persisting as a read the public ledger cannot show.
      if (signal !== 'none' && !note) signal = 'none'
      return { id, signal, note }
    })
    .filter((c) => Number.isInteger(c.id) && open.has(c.id))
    .slice(0, 24)

  const memory = (Array.isArray(r.memory) ? r.memory : [])
    .map((m) => {
      const o = m as Record<string, unknown>
      const supersedes = str(o?.supersedes_title, 200)
      return {
        kind: MEMORY_KINDS.includes(o?.kind as MemoryKind) ? (o.kind as MemoryKind) : 'observation',
        title: str(o?.title, 200),
        body: str(o?.body, 2000),
        confidence: CONFIDENCES.includes(o?.confidence as (typeof CONFIDENCES)[number]) ? (o.confidence as 'low' | 'medium' | 'high') : 'low',
        related_forecasts: (Array.isArray(o?.related_forecasts) ? o.related_forecasts : [])
          .map(Number)
          .filter((n) => Number.isInteger(n) && all.has(n))
          .slice(0, 6),
        source_titles: (Array.isArray(o?.source_titles) ? o.source_titles : [])
          .map((t) => str(t, 240))
          .filter(Boolean)
          .slice(0, 6),
        ...(supersedes ? { supersedes_title: supersedes } : {}),
      }
    })
    .filter((m) => m.title && m.body)
    .slice(0, 4)

  return { assessment, watchlist, forecast_checks, memory }
}

export interface AnalystLogRun {
  runDate: string
  assessment: string
  watchlist: { item: string; why: string }[]
  articlesConsidered: number
  memoryWritten: number
}

/** Latest analyst run for the public log. Null when the agent has not run yet or the DB is unavailable. */
export async function loadLatestAnalystRun(): Promise<AnalystLogRun | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return null
    const { createClient } = await import('@supabase/supabase-js')
    const { data } = await createClient(url, key)
      .from('intel_analyst_runs')
      .select('run_date, assessment, watchlist, articles_considered, memory_written')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!data) return null
    return {
      runDate: data.run_date,
      assessment: data.assessment,
      watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
      articlesConsidered: data.articles_considered ?? 0,
      memoryWritten: data.memory_written ?? 0,
    }
  } catch {
    return null
  }
}
