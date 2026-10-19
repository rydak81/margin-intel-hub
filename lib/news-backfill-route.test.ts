import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ client: vi.fn(), classify: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.client }))
vi.mock('@/lib/news-classification', () => ({ classifyArticle: mocks.classify, evaluateOperatorValue: (_row: unknown, c: unknown) => c }))
import { POST } from '../app/api/news/backfill-classify/route'
const classification = {
  aiSummary: 'Fees changed.', ourTake: 'Check margins.', keyTakeaways: ['Check fees'], bottomLine: 'Review fees.',
  whatThisMeans: null, keyStat: null, category: 'profitability', platforms: ['amazon'], audience: ['sellers'],
  impactLevel: 'high', relevanceScore: 0.8, relevant: true, rejectionReason: null,
}
function setup(ids = ['art_a', 'art_b']) {
  const rows: any[] = ids.map(id => ({ id, title: id, ai_summary: null, audience: [], updated_at: null }))
  let counts = 0, recountFailure = false
  const rpc = vi.fn(async (_name: string, args: any) => {
    Object.assign(rows.find(r => r.id === args.p_article_id), args.p_update)
    return { data: true, error: null }
  })
  const from = vi.fn((table: string) => {
    let head = false, cursor = '', limit = 40, overwritten = false
    const q: any = {
      select: (_s: string, options: any) => { head = !!options?.head; return q },
      is: () => q, not: () => { overwritten = true; return q }, contains: () => q,
      order: () => q, limit: (n: number) => { limit = n; return q }, gt: (_k: string, v: string) => { cursor = v; return q },
      then: (resolve: any) => {
        if (table !== 'articles') return Promise.resolve({ error: null }).then(resolve)
        const pending = rows.filter(r => overwritten ? r.ai_summary !== null && r.audience.includes('brand_sellers') : r.ai_summary === null)
        if (head) { counts++; return Promise.resolve({ count: pending.length, error: recountFailure && counts > 1 ? { message: 'count failed' } : null }).then(resolve) }
        return Promise.resolve({ data: pending.filter(r => r.id > cursor).slice(0, limit).map(r => ({ ...r })), error: null }).then(resolve)
      },
    }
    return q
  })
  mocks.client.mockReturnValue({ from, rpc }); mocks.classify.mockResolvedValue(classification)
  return { rows, rpc, from, failRecount: () => { recountFailure = true } }
}
const request = (body: any = {}, auth = 'Bearer test-only') => new NextRequest('http://test.invalid/api/news/backfill-classify', {
  method: 'POST', headers: { authorization: auth, 'content-type': 'application/json' },
  body: JSON.stringify({ mode: 'unclassified', runId: 'test-run', ...body }),
})
beforeEach(() => { vi.stubEnv('CRON_SECRET', 'test-only'); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://test.invalid'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only'); vi.clearAllMocks() })
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks() })
describe('backfill endpoint', () => {
  it('uses one atomic RPC per article and completes only after recounting', async () => {
    const h = setup(); const res = await POST(request()); const body = await res.json()
    expect(body).toMatchObject({ protocolVersion: 2, updated: 2, remainingBefore: 2, remainingAfter: 0, done: true })
    expect(h.rpc).toHaveBeenCalledWith('apply_article_classification_backfill', expect.objectContaining({ p_run_id: 'test-run', p_expected: expect.objectContaining({ title: 'art_a' }) }))
    expect(h.from.mock.calls.filter(([table]) => table === 'article_classification_audit')).toHaveLength(1) // read-only preflight
  })
  it('reports exhausted ID range separately from failed articles behind the cursor', async () => {
    setup(); mocks.classify.mockRejectedValue(new Error('rate limited'))
    const body = await (await POST(request())).json()
    expect(body).toMatchObject({ passComplete: true, done: false, remainingAfter: 2, errorCount: 2, updated: 0, nextCursor: 'art_b' })
  })
  it('counts guarded skips without inventing committed changes', async () => {
    const h = setup(['art_a']); h.rpc.mockResolvedValue({ data: false, error: null })
    const body = await (await POST(request())).json()
    expect(body).toMatchObject({ skipped: 1, updated: 0, done: false, remainingAfter: 1 })
  })
  it('fresh recount recognizes another worker completing a skipped article', async () => {
    const h = setup(['art_a']); h.rpc.mockImplementation(async () => { h.rows[0].ai_summary = 'other worker'; return { data: false, error: null } })
    const body = await (await POST(request())).json()
    expect(body).toMatchObject({ skipped: 1, updated: 0, done: true, remainingAfter: 0 })
  })
  it('time-budget stop advances only past attempted rows and resumes remaining rows', async () => {
    const h = setup(); let clock = 0; vi.spyOn(Date, 'now').mockImplementation(() => clock)
    mocks.classify.mockImplementation(async () => { clock = 40000; return classification })
    const partial = await (await POST(request({ concurrency: 1 }))).json()
    expect(partial).toMatchObject({ attempted: 1, nextCursor: 'art_a', passComplete: false, done: false, remainingAfter: 1 })
    const resumed = await (await POST(request({ cursor: partial.nextCursor, concurrency: 1 }))).json()
    expect(resumed).toMatchObject({ updated: 1, done: true, remainingAfter: 0 }); expect(h.rpc).toHaveBeenCalledTimes(2)
  })
  it('recount failure cannot return success after writes', async () => {
    const h = setup(); h.failRecount(); expect((await POST(request())).status).toBe(500)
  })
  it('dry runs make no AI calls or write RPCs', async () => {
    const h = setup(); const body = await (await POST(request({ dryRun: true }))).json()
    expect(body.remaining).toBe(2); expect(h.rpc).not.toHaveBeenCalled(); expect(mocks.classify).not.toHaveBeenCalled()
  })
  it('refuses invalid input and unauthorized requests before data access', async () => {
    setup()
    expect((await POST(request({}, 'Bearer wrong'))).status).toBe(401)
    for (const body of [{ mode: 'wrong' }, { limit: 0 }, { concurrency: 1.5 }, { runId: '' }, { dryRun: 'true' }]) expect((await POST(request(body))).status).toBe(400)
    expect(mocks.client).not.toHaveBeenCalled()
  })
  it('leaves incomplete model text pending without calling the write RPC', async () => {
    const h = setup(['art_a']); mocks.classify.mockResolvedValue({ ...classification, ourTake: '', keyTakeaways: [] })
    const body = await (await POST(request())).json()
    expect(body).toMatchObject({ updated: 0, errorCount: 1, done: false, remainingAfter: 1 })
    expect(h.rpc).not.toHaveBeenCalled()
  })
})
