#!/usr/bin/env node
// One-off driver. See docs/archive-classification-backfill.md before use.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'

export function parseOptions(args = process.argv.slice(2), env = process.env) {
  const values = {}
  const allowed = new Set(['mode', 'max-calls', 'limit', 'concurrency', 'sleep-ms', 'max-passes', 'run-id', 'state-file'])
  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '')
    if (args[i] === '--dry-run') { values.dryRun = true; continue }
    if (!args[i].startsWith('--') || !allowed.has(key) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Invalid option: ${args[i]}`)
    values[key] = args[++i]
  }
  const integer = (key, fallback, min, max = Number.MAX_SAFE_INTEGER) => {
    const n = Number(values[key] ?? fallback)
    if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`Invalid --${key}`)
    return n
  }
  const mode = values.mode ?? 'overwritten'
  if (!['unclassified', 'overwritten'].includes(mode)) throw new Error('Invalid --mode')
  if (!env.CRON_SECRET) throw new Error('CRON_SECRET is not set in the environment')
  const url = new URL(env.BASE_URL || 'https://marketplacebeta.com')
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid BASE_URL')
  const runId = values['run-id']
  if (runId !== undefined && (!runId.trim() || runId.length > 64)) throw new Error('Invalid --run-id (1–64 characters)')
  return {
    mode, baseUrl: url.href.replace(/\/$/, ''), secret: env.CRON_SECRET, dryRun: !!values.dryRun, runId,
    stateFile: values['state-file'] ?? `.backfill-state-${mode}.json`,
    maxCalls: integer('max-calls', 1000, 1), maxPasses: integer('max-passes', 2, 1),
    limit: integer('limit', 40, 1, 60), concurrency: integer('concurrency', 8, 1, 12),
    sleepMs: integer('sleep-ms', 2000, 0),
  }
}

export function saveState(file, state) {
  const temp = `${file}.${process.pid}.tmp`
  const fd = fs.openSync(temp, 'w', 0o600)
  try { fs.writeFileSync(fd, JSON.stringify(state, null, 2) + '\n'); fs.fsyncSync(fd) }
  finally { fs.closeSync(fd) }
  fs.renameSync(temp, file)
}

function loadState(o) {
  if (!fs.existsSync(o.stateFile)) return {
    version: 2, baseUrl: o.baseUrl, mode: o.mode,
    runId: o.runId ?? `backfill-${o.mode}-${randomUUID()}`,
    cursor: '', pass: 1, calls: 0, updated: 0, skipped: 0, errors: 0, status: 'running',
  }
  const state = JSON.parse(fs.readFileSync(o.stateFile, 'utf8'))
  if (state.version !== 2 || state.baseUrl !== o.baseUrl || state.mode !== o.mode
    || typeof state.runId !== 'string' || !state.runId || state.runId.length > 64
    || (o.runId !== undefined && state.runId !== o.runId)
    || typeof state.cursor !== 'string'
    || !['pass', 'calls', 'updated', 'skipped', 'errors'].every(k => Number.isSafeInteger(state[k]) && state[k] >= (k === 'pass' ? 1 : 0))) {
    throw new Error('State identity/version is invalid. Keep it for review and use a new --state-file for an intentional fresh run.')
  }
  return state
}

function validateResponse(r, state) {
  if (!r || r.protocolVersion !== 2 || r.mode !== state.mode || r.runId !== state.runId
    || r.cursor !== state.cursor || typeof r.nextCursor !== 'string' || r.nextCursor < state.cursor
    || typeof r.done !== 'boolean' || typeof r.passComplete !== 'boolean'
    || !['attempted', 'updated', 'skipped', 'errorCount', 'remainingAfter'].every(k => Number.isSafeInteger(r[k]) && r[k] >= 0)
    || r.attempted !== r.updated + r.skipped + r.errorCount
    || !Array.isArray(r.errors)
    || r.done !== (r.remainingAfter === 0)) throw new Error('Invalid/incompatible backfill response; cursor unchanged')
}

// Returns 0 only after a fresh server count confirms completion (or a dry run).
// 2 = repeated API failure, 3 = incomplete budget, 130 = interrupted.
export async function runBackfill(o, {
  fetchImpl = fetch, sleep = ms => delay(ms), log = console.log, error = console.error,
  signal = new AbortController().signal,
} = {}) {
  const state = loadState(o)
  const call = async body => {
    const res = await fetchImpl(`${o.baseUrl}/api/news/backfill-classify`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${o.secret}` },
      body: JSON.stringify(body), signal: AbortSignal.any([signal, AbortSignal.timeout(70000)]),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.error || ''}`)
    return json
  }
  if (o.dryRun) {
    const r = await call({ mode: o.mode, dryRun: true, limit: o.limit, cursor: state.cursor })
    if (!Number.isSafeInteger(r.remaining) || r.remaining < 0) throw new Error('Invalid dry-run count')
    log(`[dry-run] mode=${o.mode} remaining=${r.remaining} estimated cost ~$${r.estimatedCostUsdForRemaining}`)
    return 0
  }
  // Checkpoint the identity before a request can commit. Atomic replacement means a
  // killed client replays from a valid old cursor; the database guard prevents duplicates.
  saveState(o.stateFile, state)
  if (state.pass > o.maxPasses) {
    error('[backfill] incomplete: retry budget exhausted; increase --max-passes to resume')
    return 3
  }
  let consecutiveFailures = 0
  for (let i = 0; i < o.maxCalls; i++) {
    if (signal.aborted) return 130
    let r
    try {
      r = await call({ mode: o.mode, cursor: state.cursor, limit: o.limit, concurrency: o.concurrency, runId: state.runId })
      validateResponse(r, state)
    } catch (err) {
      if (signal.aborted) return 130
      consecutiveFailures++
      error(`[backfill] call failed (${consecutiveFailures}/5): ${err.message}`)
      if (consecutiveFailures >= 5) return 2
      await sleep(15000)
      continue
    }
    consecutiveFailures = 0
    state.calls++; state.updated += r.updated; state.skipped += r.skipped; state.errors += r.errorCount
    state.cursor = r.nextCursor
    state.remaining = r.remainingAfter
    state.status = r.done ? 'completed' : 'running'
    if (r.passComplete && !r.done) { state.pass++; state.cursor = '' }
    if (state.pass > o.maxPasses && !r.done) state.status = 'exhausted'
    // A disk error must stop the process; it is not a retriable API error.
    saveState(o.stateFile, state)
    log(`[backfill] run=${state.runId} call=${state.calls} +${r.updated} updated skipped=${r.skipped} errors=${r.errorCount} remaining=${r.remainingAfter}`)
    for (const e of r.errors || []) error(`  error ${e.id}: ${e.error}`)
    if (r.done) { log('[backfill] done: verified remaining=0'); return 0 }
    if (state.status === 'exhausted') {
      error(`[backfill] incomplete: ${r.remainingAfter} remaining after ${o.maxPasses} passes; state saved`)
      return 3
    }
    if (i + 1 < o.maxCalls) await sleep(o.sleepMs)
  }
  error('[backfill] incomplete: --max-calls reached; state saved, re-run to resume')
  return 3
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const controller = new AbortController()
  let interruptedCode = 130
  const interrupt = signal => { interruptedCode = signal === 'SIGTERM' ? 143 : 130; controller.abort() }
  process.once('SIGINT', interrupt)
  process.once('SIGTERM', interrupt)
  try {
    process.exitCode = await runBackfill(parseOptions(), {
      signal: controller.signal,
      sleep: ms => delay(ms, undefined, { signal: controller.signal }).catch(err => { if (!controller.signal.aborted) throw err }),
    })
    if (controller.signal.aborted) process.exitCode = interruptedCode
  } catch (err) { console.error(`[backfill] stopped: ${err.message}`); process.exitCode = 1 }
  finally { process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', interrupt) }
}
