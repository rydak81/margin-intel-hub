#!/usr/bin/env node
// Driver for the one-off classification backfill. Runs from any machine (e.g. the box);
// all database and AI work happens inside the deployed /api/news/backfill-classify route,
// so the only secret needed locally is CRON_SECRET (read from env, never printed).
//
// Usage:
//   BASE_URL=https://marketplacebeta.com CRON_SECRET=... node scripts/backfill-classification.mjs --mode overwritten --dry-run
//   BASE_URL=https://marketplacebeta.com CRON_SECRET=... node scripts/backfill-classification.mjs --mode overwritten
//   ... --mode unclassified [--max-calls 50] [--limit 40] [--concurrency 8] [--sleep-ms 2000] [--run-id backfill-2026-10-18]
//
// Resumable: progress (cursor, totals) is saved after every call to
// .backfill-state-<mode>.json; re-running picks up from the saved cursor. Delete the
// state file only if you want to start a fresh pass (safe: processed rows no longer match).

import fs from 'node:fs'

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : fallback
}

const BASE_URL = (process.env.BASE_URL || 'https://marketplacebeta.com').replace(/\/$/, '')
const SECRET = process.env.CRON_SECRET
const mode = arg('mode', 'overwritten')
const dryRun = arg('dry-run', false) === true
const maxCalls = Number(arg('max-calls', 1000))
const limit = Number(arg('limit', 40))
const concurrency = Number(arg('concurrency', 8))
const sleepMs = Number(arg('sleep-ms', 2000))
const maxPasses = Number(arg('max-passes', 2))
const stateFile = `.backfill-state-${mode}.json`

if (!SECRET) { console.error('CRON_SECRET is not set in the environment'); process.exit(1) }
if (!['unclassified', 'overwritten'].includes(mode)) { console.error('--mode must be unclassified or overwritten'); process.exit(1) }

const state = fs.existsSync(stateFile)
  ? JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  : { mode, runId: arg('run-id', `backfill-${mode}-${new Date().toISOString().slice(0, 10)}`), cursor: '', pass: 1, calls: 0, updated: 0, skipped: 0, errors: 0 }
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function call(body) {
  const res = await fetch(`${BASE_URL}/api/news/backfill-classify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${SECRET}` },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.error || ''} ${json.details || ''}`.trim())
  return json
}

if (dryRun) {
  const r = await call({ mode, dryRun: true, limit, cursor: state.cursor })
  console.log(`[dry-run] mode=${mode} remaining=${r.remaining} est. cost ~$${r.estimatedCostUsdForRemaining} sample=${(r.sampleIds || []).join(',')}`)
  process.exit(0)
}

let consecutiveFailures = 0
console.log(`[backfill] run=${state.runId} mode=${mode} starting at cursor='${state.cursor}' pass=${state.pass}`)
for (let i = 0; i < maxCalls; i++) {
  try {
    const r = await call({ mode, cursor: state.cursor, limit, concurrency, runId: state.runId })
    consecutiveFailures = 0
    state.calls++; state.updated += r.updated; state.skipped += r.skipped; state.errors += r.errorCount
    state.cursor = r.nextCursor || state.cursor
    save()
    console.log(`[backfill] ${new Date().toISOString()} call=${state.calls} pass=${state.pass} cursor=${state.cursor} +${r.updated} updated (${state.updated} total) skipped=${r.skipped} errors=${r.errorCount} remaining~${r.remainingBefore - r.updated} ${r.runtimeMs}ms`)
    for (const e of r.errors || []) console.log(`  error ${e.id}: ${e.error}`)
    if (r.done) {
      if (r.remainingBefore - r.updated <= 0 || state.pass >= maxPasses) { console.log('[backfill] done'); break }
      state.pass++; state.cursor = ''; save()
      console.log(`[backfill] end of id range; starting retry pass ${state.pass} for rows that failed`)
    }
  } catch (err) {
    consecutiveFailures++
    console.error(`[backfill] call failed (${consecutiveFailures}/5): ${err.message}`)
    if (consecutiveFailures >= 5) { console.error('[backfill] stopping after 5 consecutive failures; state saved, re-run to resume'); process.exit(2) }
    await sleep(15000)
  }
  await sleep(sleepMs)
}
