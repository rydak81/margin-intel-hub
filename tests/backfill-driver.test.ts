import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseOptions, runBackfill } from '../scripts/backfill-classification.mjs'

function harness(t: any, overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'backfill-test-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const options = { ...parseOptions(['--state-file', path.join(dir, 'state.json'), '--sleep-ms', '0'], { CRON_SECRET: 'test-only', BASE_URL: 'http://example.invalid' }), ...overrides }
  const logs: string[] = [], requests: any[] = []
  const deps: NonNullable<Parameters<typeof runBackfill>[1]> & { fetchImpl: typeof fetch } = {
    sleep: async () => {}, log: (m: string) => logs.push(m), error: (m: string) => logs.push(m),
    fetchImpl: async (_url, init) => {
      const b = JSON.parse(String(init?.body)); requests.push(b)
      return Response.json(response(b))
    },
  }
  return { options, logs, requests, deps, state: () => JSON.parse(fs.readFileSync(options.stateFile, 'utf8')) }
}
function response(b: any, values = {}) {
  return { protocolVersion: 2, mode: b.mode, runId: b.runId, cursor: b.cursor, nextCursor: b.cursor,
    attempted: 0, updated: 0, skipped: 0, errorCount: 0, errors: [], done: true, passComplete: true, remainingAfter: 0, ...values }
}

test('persistent HTTP failures are nonzero and preserve a replayable checkpoint', async t => {
  const h = harness(t); let calls = 0
  h.deps.fetchImpl = async () => { calls++; return Response.json({ error: 'unavailable' }, { status: 503 }) }
  assert.equal(await runBackfill(h.options, h.deps), 2)
  assert.equal(calls, 5); assert.equal(h.state().cursor, ''); assert.ok(h.state().runId)
  assert.ok(!h.logs.some(s => s.includes('done:')))
})
test('persistent per-article failures exhaust passes without reporting success; explicit larger budget resumes', async t => {
  const h = harness(t, { maxPasses: 2 }); let calls = 0
  h.deps.fetchImpl = async (_url, init) => { calls++; const b = JSON.parse(String(init?.body)); return Response.json(response(b, {
    nextCursor: 'art_z', attempted: 1, errorCount: 1, done: false, remainingAfter: 1,
  })) }
  assert.equal(await runBackfill(h.options, h.deps), 3)
  assert.equal(calls, 2); assert.equal(h.state().pass, 3); assert.equal(h.state().cursor, '')
  assert.equal(await runBackfill(h.options, h.deps), 3); assert.equal(calls, 2)
  const finished = harness(t)
  assert.equal(await runBackfill({ ...h.options, maxPasses: 3 }, finished.deps), 0)
  assert.ok(!h.logs.some(s => s.includes('done:')))
})
test('max-calls partial completion exits nonzero and resumes from the saved cursor', async t => {
  const h = harness(t, { maxCalls: 1 })
  h.deps.fetchImpl = async (_url, init) => { const b = JSON.parse(String(init?.body)); return Response.json(response(b, {
    nextCursor: 'art_b', attempted: 1, updated: 1, done: false, passComplete: false, remainingAfter: 2,
  })) }
  assert.equal(await runBackfill(h.options, h.deps), 3); assert.equal(h.state().cursor, 'art_b')
  const done = harness(t)
  assert.equal(await runBackfill(h.options, done.deps), 0)
  assert.equal(done.requests[0].cursor, 'art_b'); assert.equal(h.state().updated, 1)
})
test('a lost response after commit replays the old cursor with the same run identity', async t => {
  const h = harness(t); const controller = new AbortController(); let original: any
  h.deps.fetchImpl = async (_url, init) => { original = JSON.parse(String(init?.body)); controller.abort(); throw new Error('response lost') }
  assert.equal(await runBackfill(h.options, { ...h.deps, signal: controller.signal }), 130)
  assert.equal(h.state().cursor, ''); assert.equal(h.state().runId, original.runId)
  const resumed = harness(t)
  assert.equal(await runBackfill(h.options, resumed.deps), 0)
  assert.equal(resumed.requests[0].runId, original.runId)
})
test('skips do not imply completion; fresh remaining count decides', async t => {
  const h = harness(t, { maxPasses: 1 })
  h.deps.fetchImpl = async (_url, init) => { const b = JSON.parse(String(init?.body)); return Response.json(response(b, {
    nextCursor: 'art_b', attempted: 1, skipped: 1, done: false, remainingAfter: 1,
  })) }
  assert.equal(await runBackfill(h.options, h.deps), 3)
  const done = harness(t)
  assert.equal(await runBackfill({ ...h.options, maxPasses: 2 }, done.deps), 0)
})
test('malformed/old API responses cannot report success or advance progress', async t => {
  const h = harness(t)
  h.deps.fetchImpl = async () => Response.json({ done: true, remainingBefore: 0, updated: 0, nextCursor: 'art_z' })
  assert.equal(await runBackfill(h.options, h.deps), 2); assert.equal(h.state().cursor, '')
})
test('state is bound to target, mode and explicit run ID; corrupt or legacy state fails closed', async t => {
  const h = harness(t); await runBackfill(h.options, h.deps)
  for (const override of [{ baseUrl: 'http://another.invalid' }, { mode: 'unclassified' }, { runId: 'other' }]) {
    await assert.rejects(runBackfill({ ...h.options, ...override }, h.deps), /identity\/version/)
  }
  fs.writeFileSync(h.options.stateFile, '{broken'); await assert.rejects(runBackfill(h.options, h.deps))
  fs.writeFileSync(h.options.stateFile, JSON.stringify({ mode: h.options.mode, cursor: 'art_z' }))
  await assert.rejects(runBackfill(h.options, h.deps), /identity\/version/)
})
test('dry-run does not create or alter progress state', async t => {
  const h = harness(t, { dryRun: true })
  h.deps.fetchImpl = async () => Response.json({ remaining: 5, estimatedCostUsdForRemaining: 0.06 })
  assert.equal(await runBackfill(h.options, h.deps), 0); assert.equal(fs.existsSync(h.options.stateFile), false)
})
test('invalid numeric options are rejected before a request', () => {
  for (const args of [['--max-passes', '0'], ['--max-calls', 'NaN'], ['--limit', '1.5'], ['--concurrency', '13'], ['--run-id']]) {
    assert.throws(() => parseOptions(args, { CRON_SECRET: 'test-only' }))
  }
})
test('checkpoint replacement failure stops without advancing the previous saved cursor', async t => {
  const h = harness(t, { maxCalls: 1 })
  await runBackfill(h.options, h.deps)
  const previous = fs.readFileSync(h.options.stateFile, 'utf8')
  let writes = 0, calls = 0
  const realRename = fs.renameSync
  t.mock.method(fs, 'renameSync', (...args: Parameters<typeof fs.renameSync>) => {
    if (++writes === 2) throw new Error('injected checkpoint failure')
    return realRename(...args)
  })
  h.deps.fetchImpl = async (_url, init) => { calls++; const b = JSON.parse(String(init?.body)); return Response.json(response(b, {
    nextCursor: 'art_z', attempted: 1, updated: 1,
  })) }
  await assert.rejects(runBackfill(h.options, h.deps), /checkpoint failure/)
  assert.equal(calls, 1); assert.equal(fs.readFileSync(h.options.stateFile, 'utf8'), previous)
})
