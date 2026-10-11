import { NextRequest } from 'next/server'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { priceForMargin, marginAtPrice } from './pricing'
import { keepaProductToHistory } from './history'
import { forecastSales } from './forecast'
import { maxLandedCost } from './sourcing'

const getUser = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser } }) }))
import { keepaAccess } from './keepa-access'
import { GET as historyGet } from '@/app/api/history/route'
import { GET as sourcingGet } from '@/app/api/sourcing/route'

const inputs = { landedCost: 65, outboundShipping: 8, fixedFees: .3,
  referralTiers: [{ upTo: null, rate: .08 }], acosRate: .05, returnReserveRate: .06 }

describe('pricing correctness repairs', () => {
  it('rounds required prices up so the requested margin survives cents rounding', () => {
    for (const cost of [0.01, 1, 65, 113.37, 1501]) {
      const scenario = { ...inputs, landedCost: cost }
      for (const margin of [.01, .12, .18, .31]) {
        const price = priceForMargin(scenario, margin)
        expect(marginAtPrice(scenario, price)).toBeGreaterThanOrEqual(margin - 1e-9)
        expect(marginAtPrice(scenario, price - .01)).toBeLessThan(margin)
      }
    }
  })
  it('includes minimum referral fees at low selling prices', () => {
    const scenario = { ...inputs, landedCost: .5, outboundShipping: 0, fixedFees: 0, minReferralFee: .3 }
    const price = priceForMargin(scenario, .2)
    expect(marginAtPrice(scenario, price)).toBeGreaterThanOrEqual(.2)
    expect(maxLandedCost(price, { ...scenario, tiers: scenario.referralTiers }, .2)).toBeGreaterThanOrEqual(.5)
  })
  it.each([NaN, Infinity, -1])('rejects invalid costs %s', landedCost => {
    expect(() => priceForMargin({ ...inputs, landedCost }, .12)).toThrow(RangeError)
  })
})

describe('market data evidence', () => {
  it('adds Buy Box shipping and never interprets used prices as sales', () => {
    const t = Math.floor(Date.now() / 60000) - 21564000
    const csv: (number[] | null)[] = []
    csv[18] = [t, 10000, 500]
    csv[32] = [t, 9000, 0]
    const points = keepaProductToHistory({ asin: 'B0TESTSKU1', csv, monthlySoldHistory: [t, 100] }, 6)
    expect(points.at(-1)).toMatchObject({ buyBoxPrice: 105, monthlySold: 100, salesEvidence: 'range' })
    expect(keepaProductToHistory({ asin: 'B0TESTSKU1', csv }, 6).at(-1)?.monthlySold).toBeNull()
    expect(forecastSales(points, { scenarioPrice: 105, horizonMonths: 6 }).ok).toBe(false)
  })
  it('does not carry a price past an explicit missing marker', () => {
    const now = new Date()
    const t = (offset: number) => Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1) / 60000) - 21564000
    const csv: (number[] | null)[] = []
    csv[18] = [t(-2), 10000, 0, t(-1), -1, -1]
    expect(keepaProductToHistory({ asin: 'B0TESTSKU1', csv }, 3).map(p => p.buyBoxPrice)).toEqual([100, null, null])
  })
})

describe('paid data access', () => {
  beforeEach(() => {
    vi.stubEnv('REPRICER_KEEPA_ENABLED', 'true')
    vi.stubEnv('KEEPA_API_KEY', 'unit-test-key')
    vi.stubEnv('REPRICER_KEEPA_USER_IDS', 'trusted-test-user')
    getUser.mockReset()
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request') }))
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
  it('defaults to disabled even when a provider key exists', async () => {
    vi.stubEnv('REPRICER_KEEPA_ENABLED', '')
    expect(await keepaAccess()).toMatchObject({ status: 200 })
    expect(getUser).not.toHaveBeenCalled()
  })
  it('blocks unauthenticated history and sourcing before paid requests', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    for (const [handler, path] of [[historyGet, '/api/history?asin=B0TESTSKU1'], [sourcingGet, '/api/sourcing?q=tablet']] as const) {
      const response = await handler(new NextRequest('https://example.test' + path))
      expect(response.status).toBe(401)
      expect(JSON.stringify(await response.json())).not.toContain('unit-test-key')
    }
    expect(fetch).not.toHaveBeenCalled()
  })
  it('rejects accounts outside the server allowlist', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'other-user' } }, error: null })
    expect(await keepaAccess()).toMatchObject({ status: 403 })
  })
  it('throttles trusted accounts after six requests per minute', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'trusted-test-user' } }, error: null })
    for (let i = 0; i < 6; i++) expect(await keepaAccess()).toEqual({ key: 'unit-test-key' })
    expect(await keepaAccess()).toMatchObject({ status: 429 })
  })
})
