import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ database: vi.fn(), snapshot: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.database }))
vi.mock('@/lib/manufacturing-data', () => ({ loadManufacturingSnapshot: mocks.snapshot }))
import { GET } from '@/app/api/intel-feed/route'

describe('retired partner feed', () => {
  it('returns Gone without authenticating, querying data, or fetching sources', async () => {
    const response = await GET()
    expect(response.status).toBe(410)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
    expect(await response.json()).toEqual({ error: 'Feed retired', message: 'The partner intelligence feed is no longer available.' })
    expect(mocks.database).not.toHaveBeenCalled()
    expect(mocks.snapshot).not.toHaveBeenCalled()
  })
})
