import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getEasternCalendarDate, isBriefSendWindow } from './brief-schedule'

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
function setupDb(articles: any[] = [{ id: 'a1', title: 'Fee change', source_name: 'Src', ai_summary: 'Fees rose.' }]) {
  const briefs = new Map<string, any>()
  const from = vi.fn((table: string) => {
    if (table === 'daily_briefs') {
      return {
        insert: async (row: any) => {
          if (briefs.has(row.id)) return { error: { code: '23505', message: 'duplicate key' } }
          briefs.set(row.id, row); return { error: null }
        },
        upsert: async (row: any, opts: any) => {
          if (briefs.has(row.id) && opts?.ignoreDuplicates) return { error: null }
          briefs.set(row.id, row); return { error: null }
        },
        delete: () => {
          const filters: Record<string, unknown> = {}
          const q: any = {
            eq: (k: string, v: unknown) => { filters[k] = v; return q },
            then: (resolve: any) => {
              const row = briefs.get(filters.id as string)
              if (row && Object.entries(filters).every(([k, v]) => row[k] === v)) briefs.delete(filters.id as string)
              return Promise.resolve({ error: null }).then(resolve)
            },
          }
          return q
        },
      }
    }
    const rows = table === 'articles'
      ? articles
      : [{ email: 'reader@example.com', first_name: 'Sam' }]
    const q: any = {
      select: () => q, gte: () => q, eq: () => q, order: () => q, limit: () => q,
      then: (resolve: any) => Promise.resolve({ data: rows, error: null }).then(resolve),
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
