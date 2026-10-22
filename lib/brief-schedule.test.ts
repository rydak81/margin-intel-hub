import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_CLAIM_LEASE_MS, briefClaimContent, claimTodaysBrief, claimedAt, getEasternCalendarDate, isBriefSendWindow } from './brief-schedule'

const mocks = vi.hoisted(() => ({ client: vi.fn(), callAI: vi.fn(), send: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.client }))
vi.mock('@/lib/ai-client', () => ({ callAI: mocks.callAI }))
vi.mock('@/lib/email', () => ({ sendBatchEmails: mocks.send }))

const utc = (iso: string) => new Date(iso)

describe('Daily Brief send window (7 AM Eastern)', () => {
  it('sends on the 11:00 UTC run during EDT and skips the 12:00 UTC run', () => {
    expect(isBriefSendWindow(utc('2026-10-21T11:00:00Z'))).toBe(true)
    expect(isBriefSendWindow(utc('2026-10-21T12:00:00Z'))).toBe(false)
  })

  it('sends on the 12:00 UTC run during EST and skips the 11:00 UTC run', () => {
    expect(isBriefSendWindow(utc('2026-11-02T11:00:00Z'))).toBe(false)
    expect(isBriefSendWindow(utc('2026-11-02T12:00:00Z'))).toBe(true)
    expect(isBriefSendWindow(utc('2027-01-15T12:00:00Z'))).toBe(true)
  })

  it('handles both DST transition days', () => {
    // DST ends Sun Nov 1, 2026 at 2 AM EDT (06:00 UTC); 11:00 UTC is then 6 AM EST.
    expect(isBriefSendWindow(utc('2026-11-01T11:00:00Z'))).toBe(false)
    expect(isBriefSendWindow(utc('2026-11-01T12:00:00Z'))).toBe(true)
    // DST starts Sun Mar 14, 2027 at 2 AM EST (07:00 UTC); 11:00 UTC is then 7 AM EDT.
    expect(isBriefSendWindow(utc('2027-03-14T11:00:00Z'))).toBe(true)
    expect(isBriefSendWindow(utc('2027-03-14T12:00:00Z'))).toBe(false)
  })

  it('lets exactly one of the two scheduled runs through on every day of the year', () => {
    for (let day = 0; day < 366; day++) {
      const base = Date.UTC(2026, 9, 1) + day * 86_400_000
      const at11 = isBriefSendWindow(new Date(base + 11 * 3_600_000))
      const at12 = isBriefSendWindow(new Date(base + 12 * 3_600_000))
      expect(Number(at11) + Number(at12), new Date(base).toISOString()).toBe(1)
    }
  })

  it('vercel.json schedules the route at both 11:00 and 12:00 UTC', () => {
    const crons: { path: string; schedule: string }[] = JSON.parse(readFileSync('vercel.json', 'utf8')).crons
    const schedules = crons.filter(c => c.path === '/api/news/daily-brief').map(c => c.schedule).sort()
    expect(schedules).toEqual(['0 11 * * *', '0 12 * * *'])
  })

  it('dates the brief by the Eastern calendar day', () => {
    expect(getEasternCalendarDate(utc('2026-11-02T12:00:00Z')).iso).toBe('2026-11-02')
    expect(getEasternCalendarDate(utc('2026-11-03T03:00:00Z')).iso).toBe('2026-11-02')
  })
})

// Fake daily_briefs table with a unique id, enough for the route's claim guard.
function setupDb(articles: any[] = [{ id: 'a1', title: 'Fee change', source_name: 'Src', ai_summary: 'Fees rose.' }], opts: { subscriberError?: boolean; briefSaveFails?: boolean; markerFails?: boolean } = {}) {
  const briefs = new Map<string, any>()
  const filtered = () => {
    const filters: Record<string, unknown> = {}
    const matches = (row: any) => row && Object.entries(filters).every(([k, v]) => row[k] === v)
    return { filters, matches }
  }
  const from = vi.fn((table: string) => {
    if (table === 'daily_briefs') {
      return {
        insert: async (row: any) => {
          if (briefs.has(row.id)) return { error: { code: '23505', message: 'duplicate key' } }
          briefs.set(row.id, { ...row }); return { error: null }
        },
        upsert: async (row: any, o: any) => {
          if (opts.briefSaveFails && row.provider) return { error: { code: '57P01', message: 'db restarting' } }
          if (briefs.has(row.id) && o?.ignoreDuplicates) return { error: null }
          briefs.set(row.id, { ...row }); return { error: null }
        },
        select: () => {
          const f = filtered()
          const q: any = { eq: (k: string, v: unknown) => { f.filters[k] = v; return q },
            maybeSingle: async () => { const row = briefs.get(f.filters.id as string); return { data: f.matches(row) ? { content: row.content } : null, error: null } } }
          return q
        },
        update: (patch: any) => {
          const f = filtered()
          const q: any = { eq: (k: string, v: unknown) => { f.filters[k] = v; return q },
            select: async () => {
              if (opts.markerFails && String(patch.content).startsWith('Brief delivery started')) return { data: null, error: { message: 'db restarting' } }
              const row = briefs.get(f.filters.id as string)
              if (!f.matches(row)) return { data: [], error: null }
              Object.assign(row, patch); return { data: [{ id: row.id }], error: null }
            } }
          return q
        },
        delete: () => {
          const f = filtered()
          const q: any = {
            eq: (k: string, v: unknown) => { f.filters[k] = v; return q },
            then: (resolve: any) => {
              if (f.matches(briefs.get(f.filters.id as string))) briefs.delete(f.filters.id as string)
              return Promise.resolve({ error: null }).then(resolve)
            },
          }
          return q
        },
      }
    }
    const isArticles = table === 'articles'
    const rows = isArticles ? articles : [{ email: 'reader@example.com', first_name: 'Sam' }]
    const error = !isArticles && opts.subscriberError ? { message: 'subscribers down' } : null
    const q: any = {
      select: () => q, gte: () => q, eq: () => q, order: () => q, limit: () => q,
      then: (resolve: any) => Promise.resolve({ data: error ? null : rows, error }).then(resolve),
    }
    return q
  })
  mocks.client.mockReturnValue({ from })
  return { briefs }
}

describe('Daily Brief route: one send per Eastern day', () => {
  const env = { ...process.env }
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers({ toFake: ['Date'] })
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.test.invalid'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only'
    process.env.ANTHROPIC_API_KEY = 'test-only'
    process.env.RESEND_API_KEY = 'test-only'
    delete process.env.CRON_SECRET
    mocks.callAI.mockReset().mockResolvedValue({ text: 'Brief body', provider: 'test', model: 'test' })
    mocks.send.mockReset().mockResolvedValue({ sent: 1, failed: 0 })
  })
  afterEach(() => { vi.useRealTimers(); process.env = { ...env } })

  const run = async (iso: string, query = '') => {
    vi.setSystemTime(new Date(iso))
    const { GET } = await import('../app/api/news/daily-brief/route')
    return (await GET(new Request(`http://test.invalid/api/news/daily-brief${query}`))).json()
  }

  it('EDT: the 11:00 UTC run sends; the 12:00 UTC run and a duplicate delivery do not', async () => {
    const { briefs } = setupDb()
    expect((await run('2026-10-21T11:00:05Z')).emailsSent).toBe(1)
    expect((await run('2026-10-21T11:00:30Z')).skipped).toBe(true)
    expect((await run('2026-10-21T12:00:05Z')).skipped).toBe(true)
    expect(mocks.send).toHaveBeenCalledTimes(1)
    expect(briefs.get('2026-10-21').content).toBe('Brief body')
  })

  it('EST: the 11:00 UTC run skips; the 12:00 UTC run sends once', async () => {
    setupDb()
    expect((await run('2026-11-02T11:00:05Z')).skipped).toBe(true)
    expect((await run('2026-11-02T12:00:05Z')).emailsSent).toBe(1)
    expect((await run('2026-11-02T12:00:40Z')).skipped).toBe(true)
    expect(mocks.send).toHaveBeenCalledTimes(1)
  })

  it('releases the claim when generation fails, so a retry can still send', async () => {
    const { briefs } = setupDb()
    mocks.callAI.mockRejectedValueOnce(new Error('model down'))
    await run('2026-11-02T12:00:05Z')
    expect(briefs.has('2026-11-02')).toBe(false)
    expect((await run('2026-11-02T12:10:00Z')).emailsSent).toBe(1)
  })

  it('a quiet day replaces the claim with the heartbeat row', async () => {
    const { briefs } = setupDb([])
    await run('2026-11-02T12:00:05Z')
    expect(briefs.get('2026-11-02').content).toMatch(/No qualifying articles/)
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('?force=1 bypasses the window and the claim (manual re-send)', async () => {
    setupDb()
    await run('2026-11-02T12:00:05Z')
    expect((await run('2026-11-02T15:00:00Z', '?force=1')).emailsSent).toBe(1)
    expect(mocks.send).toHaveBeenCalledTimes(2)
  })
})

describe('Daily Brief route: recovering from failed runs', () => {
  const env = { ...process.env }
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers({ toFake: ['Date'] })
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.test.invalid'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only'
    process.env.ANTHROPIC_API_KEY = 'test-only'
    process.env.RESEND_API_KEY = 'test-only'
    delete process.env.CRON_SECRET
    mocks.callAI.mockReset().mockResolvedValue({ text: 'Brief body', provider: 'test', model: 'test' })
    mocks.send.mockReset().mockResolvedValue({ sent: 1, failed: 0 })
  })
  afterEach(() => { vi.useRealTimers(); process.env = { ...env } })

  const run = async (iso: string) => {
    vi.setSystemTime(new Date(iso))
    const { GET } = await import('../app/api/news/daily-brief/route')
    return (await GET(new Request('http://test.invalid/api/news/daily-brief'))).json()
  }

  it('takes over a claim abandoned by a run that died, but not a fresh one', async () => {
    const { briefs } = setupDb()
    briefs.set('2026-11-02', { id: '2026-11-02', content: briefClaimContent(new Date('2026-11-02T12:00:05Z')) })
    expect((await run('2026-11-02T12:02:00Z')).skipped).toBe(true) // still within the lease
    expect((await run('2026-11-02T12:06:00Z')).emailsSent).toBe(1) // lease expired
    expect(mocks.send).toHaveBeenCalledTimes(1)
    expect(briefs.get('2026-11-02').content).toBe('Brief body')
  })

  it('a subscriber-query failure claims nothing, so a retry still sends', async () => {
    const { briefs } = setupDb(undefined, { subscriberError: true })
    const res = await run('2026-11-02T12:00:05Z')
    expect(res.error).toMatch(/subscribers/)
    expect(briefs.has('2026-11-02')).toBe(false)
    setupDb()
    vi.resetModules() // drop the route's cached DB client
    expect((await run('2026-11-02T12:05:00Z')).emailsSent).toBe(1)
  })

  it('without a Resend key it archives the brief but takes no claim, so a later run can still send', async () => {
    delete process.env.RESEND_API_KEY
    const { briefs } = setupDb()
    expect((await run('2026-11-02T12:00:05Z')).emailsSent).toBe(0)
    expect(briefs.get('2026-11-02').content).toBe('Brief body')
    process.env.RESEND_API_KEY = 'test-only'
    // The archived brief is a real row, so a normal run treats the day as done
    // (a missing key is a config problem, not a transient one); ?force=1 re-sends.
    expect((await run('2026-11-02T12:10:00Z')).skipped).toBe(true)
    expect(mocks.send).not.toHaveBeenCalled()
  })
})


describe('Daily Brief route: brief archive fails while a claim is held', () => {
  const env = { ...process.env }
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers({ toFake: ['Date'] })
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.test.invalid'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only'
    process.env.ANTHROPIC_API_KEY = 'test-only'
    process.env.RESEND_API_KEY = 'test-only'
    delete process.env.CRON_SECRET
    mocks.callAI.mockReset().mockResolvedValue({ text: 'Brief body', provider: 'test', model: 'test' })
    mocks.send.mockReset().mockResolvedValue({ sent: 1, failed: 0 })
  })
  afterEach(() => { vi.useRealTimers(); process.env = { ...env } })

  const run = async (iso: string) => {
    vi.setSystemTime(new Date(iso))
    const { GET } = await import('../app/api/news/daily-brief/route')
    return (await GET(new Request('http://test.invalid/api/news/daily-brief'))).json()
  }

  it('records a non-claim marker and sends once; a retry after the lease does not re-send', async () => {
    const { briefs } = setupDb(undefined, { briefSaveFails: true })
    const res = await run('2026-11-02T12:00:05Z')
    expect(res.emailsSent).toBe(1)
    expect(res.briefPersisted).toBe(false)
    expect(briefs.get('2026-11-02').content).toMatch(/^Brief delivery started at /)
    vi.resetModules()
    expect((await run('2026-11-02T12:30:00Z')).skipped).toBe(true)
    expect(mocks.send).toHaveBeenCalledTimes(1)
  })

  it('if even the marker cannot be written, sends nothing and frees the day for a retry', async () => {
    const { briefs } = setupDb(undefined, { briefSaveFails: true, markerFails: true })
    const res = await run('2026-11-02T12:00:05Z')
    expect(res.error).toMatch(/no emails were sent/)
    expect(mocks.send).not.toHaveBeenCalled()
    expect(briefs.has('2026-11-02')).toBe(false)
  })
})

describe('claim fails closed after a confirmed duplicate', () => {
  const conflictingDb = (after: { readError?: boolean; swapError?: boolean }) => ({
    from: () => ({
      insert: async () => ({ error: { code: '23505', message: 'duplicate key' } }),
      select: () => {
        const q: any = { eq: () => q, maybeSingle: async () => after.readError
          ? { data: null, error: { message: 'db restarting' } }
          : { data: { content: briefClaimContent(new Date(Date.now() - BRIEF_CLAIM_LEASE_MS - 60_000)) }, error: null } }
        return q
      },
      update: () => {
        const q: any = { eq: () => q, select: async () => ({ data: null, error: { message: 'db restarting' } }) }
        return q
      },
    }),
  })
  it('a transient read error after the 23505 skips the send instead of running unguarded', async () => {
    expect(await claimTodaysBrief(conflictingDb({ readError: true }) as any, '2026-11-03')).toEqual({ status: 'taken' })
  })
  it('a transient swap error during takeover skips the send instead of running unguarded', async () => {
    expect(await claimTodaysBrief(conflictingDb({ swapError: true }) as any, '2026-11-03')).toEqual({ status: 'taken' })
  })
})

describe('claim lease helpers', () => {
  it('recognises claim placeholders and their time', () => {
    const at = new Date('2026-11-02T12:00:05Z')
    expect(claimedAt(briefClaimContent(at))?.toISOString()).toBe(at.toISOString())
    expect(claimedAt('Brief body')).toBeNull()
    expect(claimedAt('No qualifying articles today — no brief generated or sent.')).toBeNull()
    expect(BRIEF_CLAIM_LEASE_MS).toBeGreaterThan(60_000)
  })
})
