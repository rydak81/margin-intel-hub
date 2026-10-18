import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { classifyArticle, evaluateOperatorValue } from '@/lib/news-classification'
import { budgetExhausted, runWithConcurrency } from '@/lib/news-aggregation/pipeline-helpers'
import {
  BACKFILL_SELECT,
  FEED_DEFAULT_AUDIENCE_MARKER,
  buildBackfillUpdate,
  estimateCostUsd,
  matchesMode,
  type BackfillMode,
} from '@/lib/news-backfill'

/**
 * POST /api/news/backfill-classify  (one-off, NOT scheduled in vercel.json crons)
 *
 * Body: { mode: 'unclassified' | 'overwritten', cursor?: string, limit?: number,
 *         concurrency?: number, dryRun?: boolean, runId?: string }
 * Auth: Authorization: Bearer $CRON_SECRET (required; refuses to run if unset).
 *
 * Walks rows in id order after `cursor`, classifies with the same prompt as the cron,
 * atomically commits the guarded classification update and its audit via one RPC.
 * Returns nextCursor; resume by passing it back. No deletes, no
 * image generation, no keyword/category table rewrites.
 */

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const BUDGET_MS = 38000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyModeFilter(query: any, mode: BackfillMode) {
  return mode === 'unclassified'
    ? query.is('ai_summary', null)
    : query.not('ai_summary', 'is', null).contains('audience', [FEED_DEFAULT_AUDIENCE_MARKER])
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured; backfill disabled' }, { status: 503 })
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected a JSON object' }, { status: 400 })
  }
  const mode: BackfillMode = body.mode
  if (!['unclassified', 'overwritten'].includes(mode)) return NextResponse.json({ error: 'mode must be unclassified or overwritten' }, { status: 400 })
  const cursor = body.cursor ?? ''
  const limit = body.limit ?? 40
  const concurrency = body.concurrency ?? 8
  const dryRun = body.dryRun === true
  const runId = body.runId
  if (typeof cursor !== 'string' || !Number.isInteger(limit) || limit < 1 || limit > 60
    || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12
    || (!dryRun && (typeof runId !== 'string' || !runId.trim() || runId.length > 64))) {
    return NextResponse.json({ error: 'Invalid cursor, limit (1–60), concurrency (1–12), or runId (1–64 characters)' }, { status: 400 })
  }

  try {
    const supabase = getSupabase()

    const { count: remaining, error: countError } = await applyModeFilter(
      supabase.from('articles').select('id', { count: 'exact', head: true }), mode
    )
    if (countError) throw new Error(`count failed: ${countError.message}`)

    // Audit table must exist before any write.
    const { error: auditProbe } = await supabase.from('article_classification_audit').select('id, atomic_version, after_snapshot, restored_at', { head: true }).limit(1)
    if (auditProbe) {
      return NextResponse.json({ error: 'Atomic backfill schema missing; apply the revised scripts/011_classification_backfill_audit.sql first', details: auditProbe.message }, { status: 412 })
    }

    let query = applyModeFilter(supabase.from('articles').select(BACKFILL_SELECT), mode).order('id', { ascending: true }).limit(limit)
    if (cursor) query = query.gt('id', cursor)
    const { data: rows, error: selectError } = await query
    if (selectError) throw new Error(`select failed: ${selectError.message}`)

    const batch = (rows || []).filter((row: any) => matchesMode(row, mode))

    if (dryRun) {
      return NextResponse.json({
        mode, dryRun: true, runId, remaining, estimatedCostUsdForRemaining: estimateCostUsd(remaining || 0),
        sampleIds: batch.slice(0, 10).map((r: any) => r.id),
        nextCursor: rows && rows.length ? rows[rows.length - 1].id : cursor,
      })
    }

    let updated = 0
    let skipped = 0
    let lastDoneId = cursor
    const errors: Array<{ id: string; error: string }> = []
    const doneIds = new Set<string>()

    const started = await runWithConcurrency(batch, concurrency, async (row: any) => {
      try {
        const classified = evaluateOperatorValue(row, await classifyArticle(row))
        const update = buildBackfillUpdate(mode, classified, new Date().toISOString())

        const { data: changed, error: updateError } = await supabase.rpc('apply_article_classification_backfill', {
          p_run_id: runId, p_article_id: row.id, p_mode: mode,
          p_expected: row, p_update: update,
        })
        if (updateError) throw new Error(`atomic update failed: ${updateError.message}`)
        if (changed === true) updated++
        else if (changed !== false) throw new Error('Unexpected atomic update result')
        else skipped++ // row changed under us (e.g. the cron classified it); left as is
      } catch (err) {
        errors.push({ id: row.id, error: err instanceof Error ? err.message : String(err) })
      } finally {
        doneIds.add(row.id)
      }
    }, () => budgetExhausted(startTime, BUDGET_MS))

    // Cursor only advances past the contiguous prefix of rows that were attempted, so a
    // time-budget stop never skips unprocessed rows. Failed rows still match the selector
    // and are retried by a later pass started from an empty cursor.
    for (const row of rows || []) {
      if (matchesMode(row as any, mode) && !doneIds.has((row as any).id)) break
      lastDoneId = (row as any).id
    }

    // A range ending is not completion: failed/skipped rows may be behind the cursor.
    const passComplete = started >= batch.length && (rows || []).length < limit
    const { count: remainingAfter, error: recountError } = await applyModeFilter(
      supabase.from('articles').select('id', { count: 'exact', head: true }), mode
    )
    if (recountError || remainingAfter === null) throw new Error(`recount failed: ${recountError?.message || 'missing count'}`)
    const done = remainingAfter === 0
    console.log(`[Backfill] run=${runId} mode=${mode} cursor=${cursor || '-'} -> ${lastDoneId} updated=${updated} skipped=${skipped} errors=${errors.length} remaining=${remainingAfter}`)

    return NextResponse.json({
      protocolVersion: 2, mode, runId, cursor, nextCursor: lastDoneId, done, passComplete, remainingAfter,
      attempted: started, updated, skipped, errors: errors.slice(0, 20), errorCount: errors.length,
      remainingBefore: remaining, runtimeMs: Date.now() - startTime,
    })
  } catch (error) {
    console.error('[Backfill] error:', error)
    return NextResponse.json({ error: 'Backfill failed', details: String(error) }, { status: 500 })
  }
}

