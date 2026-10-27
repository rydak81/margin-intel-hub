import { readFileSync } from 'node:fs'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import {
  HONEYPOT_FIELD, SPONSOR_OFFERS, SPONSOR_OFFER_VALUES, createRateLimiter, clientIp, inquiryRecipient, sponsorInquiryEmail, validateSponsorInquiry,
} from './sponsor-inquiry'
import { FOUNDING_LOCK_TEXT, SPONSOR_OFFER_DEFS, SPONSOR_PAYMENT_NOTE, foundingLockOpen } from './sponsor-offers'

const valid = { name: 'Ada Lovelace', email: 'Ada@Example.com ', company: 'Acme', offer: 'single_slot', message: 'We sell repricing software.', sourcePage: 'sponsor' }

describe('validateSponsorInquiry', () => {
  it('accepts a valid inquiry and normalises it', () => {
    const r = validateSponsorInquiry(valid)
    expect(r).toMatchObject({ ok: true, honeypot: false, value: { email: 'ada@example.com', offer: 'single_slot', sourcePage: 'sponsor' } })
  })
  it('rejects bad email addresses', () => {
    for (const email of ['', 'nope', 'a@b', 'a b@c.com', `${'a'.repeat(250)}@x.com`]) {
      expect(validateSponsorInquiry({ ...valid, email })).toMatchObject({ ok: false })
    }
  })
  it('enforces required fields and length limits', () => {
    expect(validateSponsorInquiry({ ...valid, name: ' ' })).toMatchObject({ ok: false })
    expect(validateSponsorInquiry({ ...valid, name: 'x'.repeat(101) })).toMatchObject({ ok: false })
    expect(validateSponsorInquiry({ ...valid, company: '' })).toMatchObject({ ok: false })
    expect(validateSponsorInquiry({ ...valid, company: 'x'.repeat(121) })).toMatchObject({ ok: false })
    expect(validateSponsorInquiry({ ...valid, message: 'short' })).toMatchObject({ ok: false })
    expect(validateSponsorInquiry({ ...valid, message: 'x'.repeat(2001) })).toMatchObject({ ok: false })
    expect(validateSponsorInquiry({ ...valid, message: 'x'.repeat(2000) })).toMatchObject({ ok: true })
  })
  it('only allows listed offers', () => {
    for (const o of SPONSOR_OFFERS) expect(validateSponsorInquiry({ ...valid, offer: o.value })).toMatchObject({ ok: true })
    for (const offer of ['', 'free_money', '$149', 'SINGLE_SLOT', 'newsletter_slot', 'tool_listing', 5, null]) {
      expect(validateSponsorInquiry({ ...valid, offer })).toMatchObject({ ok: false })
    }
  })
  it('maps the allowlist to the approved offers with prices in the labels', () => {
    expect(SPONSOR_OFFER_VALUES).toEqual(['founding_sponsor', 'single_slot', 'dossier_sponsor', 'other'])
    expect(SPONSOR_OFFERS.map(o => o.label)).toEqual([
      'Founding Sponsor \u2014 $149/week',
      'Single Brief slot \u2014 $39',
      'Dossier presenting sponsor \u2014 $299',
      'Something else / question',
    ])
  })
  it('falls back to "other" for an unknown source page', () => {
    expect(validateSponsorInquiry({ ...valid, sourcePage: 'evil' })).toMatchObject({ ok: true, value: { sourcePage: 'other' } })
  })
  it('flags honeypot submissions even when the rest is invalid', () => {
    expect(validateSponsorInquiry({ ...valid, [HONEYPOT_FIELD]: 'http://spam.test' })).toEqual({ ok: true, honeypot: true })
    expect(validateSponsorInquiry({ [HONEYPOT_FIELD]: 'x' })).toEqual({ ok: true, honeypot: true })
  })
  it('rejects non-object bodies', () => {
    for (const raw of [null, 'x', 5, [], undefined]) expect(validateSponsorInquiry(raw)).toMatchObject({ ok: false })
  })
})

describe('sponsor pricing copy', () => {
  const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
  it('foundingLockOpen follows the Nov 15, 2026 deadline in New York time', () => {
    expect(foundingLockOpen(new Date('2026-11-15T23:00:00-05:00'))).toBe(true)
    expect(foundingLockOpen(new Date('2026-11-16T00:30:00-05:00'))).toBe(false)
    expect(foundingLockOpen(new Date('2026-10-26T12:00:00-04:00'))).toBe(true)
  })
  it('terms are as approved and mention invoice, payment link and PayPal but not a payment processor', () => {
    expect(SPONSOR_OFFER_DEFS.map(o => [o.name, o.price, o.unit])).toEqual([
      ['Founding Sponsor', '$149', 'per week'], ['Single Brief slot', '$39', ''], ['Dossier presenting sponsor', '$299', ''],
    ])
    expect(SPONSOR_OFFER_DEFS[0].detail).toMatch(/5 Daily Marketplace Brief slots.*30-day sponsored tool listing/)
    expect(FOUNDING_LOCK_TEXT).toMatch(/6 months.*November 15, 2026/)
    expect(SPONSOR_PAYMENT_NOTE).toMatch(/invoice or payment link.*PayPal/)
  })
  it('/sponsor and /pricing render prices from the shared component, with no hard-coded prices', () => {
    for (const p of ['app/sponsor/page.tsx', 'app/pricing/page.tsx']) {
      const src = read(p)
      expect(src, p).toContain('SponsorOfferCards')
      expect(src, p).not.toMatch(/\$(149|39|299)/)
    }
  })
  it('sponsor copy has no stripe mention, traffic numbers, tool names or probabilities', () => {
    const copy = ['lib/sponsor-offers.ts', 'components/sponsor-offer-cards.tsx', 'components/sponsor-inquiry-form.tsx', 'app/sponsor/page.tsx'].map(read).join('\n')
    expect(copy).not.toMatch(/stripe|keepa|everbee|supabase|\bCPI\b/i)
    expect(copy).not.toMatch(/\d[\d,.]*\s*(k|m)?\+?\s*(subscribers|readers|visitors|visits|page ?views|opens)/i)
    expect(copy).not.toMatch(/contact for pricing|request rates/i)
  })
})

describe('rate limiter', () => {
  it('allows max requests per window per key, then recovers', () => {
    const l = createRateLimiter(3, 1000)
    expect([1, 2, 3, 4].map(() => l.check('1.1.1.1', 0))).toEqual([true, true, true, false])
    expect(l.check('2.2.2.2', 0)).toBe(true)
    expect(l.check('1.1.1.1', 999)).toBe(false)
    expect(l.check('1.1.1.1', 1000)).toBe(true)
  })
  it('reads the first forwarded IP', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))).toBe('9.9.9.9')
    expect(clientIp(new Headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8')
    expect(clientIp(new Headers())).toBe('unknown')
  })
})

describe('notification email', () => {
  it('escapes HTML and keeps the subject on one line', () => {
    const r = validateSponsorInquiry({ ...valid, company: 'Acme\nBcc: x', message: '<script>alert(1)</script> hello there' })
    if (!r.ok || r.honeypot) throw new Error('expected valid')
    const mail = sponsorInquiryEmail(r.value)
    expect(mail.subject).not.toMatch(/[\r\n]/)
    expect(mail.html).not.toContain('<script>')
    expect(mail.html).toContain('&lt;script&gt;')
  })
})

describe('inquiryRecipient', () => {
  it('prefers SPONSOR_INQUIRY_TO, then EMAIL_REPLY_TO, never a hard-coded address', () => {
    expect(inquiryRecipient({ SPONSOR_INQUIRY_TO: ' a@x.com ', EMAIL_REPLY_TO: 'b@x.com' })).toBe('a@x.com')
    expect(inquiryRecipient({ EMAIL_REPLY_TO: 'b@x.com' })).toBe('b@x.com')
    expect(inquiryRecipient({})).toBeNull()
  })
})

// ── Route ─────────────────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({ insert: vi.fn(), send: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: (t: string) => ({ insert: (row: unknown) => mocks.insert(t, row) }) }) }))
vi.mock('@/lib/email', () => ({ sendEmail: mocks.send }))

const post = async (body: unknown, ip = '3.3.3.3') => {
  const { POST } = await import('../app/api/sponsor-inquiry/route')
  return POST(new Request('http://test.invalid/api/sponsor-inquiry', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }))
}

describe('POST /api/sponsor-inquiry', () => {
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks()
    vi.stubEnv('SPONSOR_INQUIRY_TO', 'owner@example.com')
    mocks.insert.mockResolvedValue({ error: null }); mocks.send.mockResolvedValue({ success: true, id: 'e1' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks() })

  it('stores, emails the owner with reply-to set to the visitor, and succeeds', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200); expect(await res.json()).toEqual({ success: true })
    expect(mocks.insert).toHaveBeenCalledWith('sponsor_inquiries', expect.objectContaining({ email: 'ada@example.com', offer: 'single_slot', source_page: 'sponsor' }))
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'owner@example.com', replyTo: 'ada@example.com' }))
  })
  it('returns a fake success for honeypot hits and does nothing', async () => {
    const res = await post({ ...valid, [HONEYPOT_FIELD]: 'spam' })
    expect(await res.json()).toEqual({ success: true })
    expect(mocks.insert).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled()
  })
  it('400s on invalid input and malformed JSON', async () => {
    expect((await post({ ...valid, offer: 'nope' })).status).toBe(400)
    expect((await post('{not json')).status).toBe(400)
    expect(mocks.insert).not.toHaveBeenCalled()
  })
  it('rate limits per IP after 5 accepted inquiries', async () => {
    for (let i = 0; i < 5; i++) expect((await post(valid, '4.4.4.4')).status).toBe(200)
    const res = await post(valid, '4.4.4.4')
    expect(res.status).toBe(429); expect(res.headers.get('retry-after')).toBe('3600')
    expect((await post(valid, '5.5.5.5')).status).toBe(200)
  })
  it('still succeeds when the email fails (stored)', async () => {
    mocks.send.mockResolvedValue({ success: false, error: 'boom' })
    expect((await post(valid)).status).toBe(200); expect(mocks.insert).toHaveBeenCalled()
  })
  it('still succeeds when storage fails but email works', async () => {
    mocks.insert.mockResolvedValue({ error: { message: 'relation does not exist', code: '42P01' } })
    expect((await post(valid)).status).toBe(200); expect(mocks.send).toHaveBeenCalled()
  })
  it('still succeeds when storage throws', async () => {
    mocks.insert.mockRejectedValue(new Error('network'))
    expect((await post(valid)).status).toBe(200); expect(mocks.send).toHaveBeenCalled()
  })
  it('stores but skips email when no recipient is configured', async () => {
    vi.stubEnv('SPONSOR_INQUIRY_TO', ''); vi.stubEnv('EMAIL_REPLY_TO', '')
    expect((await post(valid)).status).toBe(200)
    expect(mocks.insert).toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled()
  })
})

// ── Source-level checks ───────────────────────────────────────────────────────
describe('no dead mailto links', () => {
  const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
  it('/sponsor and /pricing use the form and have no hello@ mailto', () => {
    for (const p of ['app/sponsor/page.tsx', 'app/pricing/page.tsx']) {
      const src = read(p)
      expect(src, p).toContain('SponsorInquiryForm')
      expect(src, p).not.toMatch(/mailto:/i)
      expect(src, p).not.toMatch(/hello@marketplacebeta/i)
    }
  })
  it('no page, component or lib links to hello@ or uses mailto:', () => {
    for (const p of ['app/about/page.tsx', 'app/editorial-policy/page.tsx', 'app/events/page.tsx', 'components/premium-site-footer.tsx', 'lib/sponsorship.ts']) {
      const src = read(p)
      expect(src, p).not.toMatch(/mailto:/i)
      expect(src, p).not.toMatch(/hello@marketplacebeta/i)
    }
  })
  it('form copy and email avoid internal tool names', () => {
    const copy = read('components/sponsor-inquiry-form.tsx') + read('lib/sponsor-inquiry.ts')
    expect(copy).not.toMatch(/keepa|everbee|supabase/i)
  })
})
