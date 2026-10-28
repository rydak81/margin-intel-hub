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
    expect(inquiryRecipient({ EMAIL_REPLY_TO: 'b@x.com' })).toBeNull()
    expect(inquiryRecipient({ SPONSOR_INQUIRY_TO: 'bad-address' })).toBeNull()
    expect(inquiryRecipient({})).toBeNull()
  })
})

// ── Route ─────────────────────────────────────────────────────────────────────
const inquiryId = '9088b49e-c6ed-4f7b-928f-9b05076ec393'
const savedRow = { id: inquiryId, name: valid.name, email: 'ada@example.com', company: valid.company,
  offer: valid.offer, message: valid.message, source_page: valid.sourcePage, notification_email_id: null }
const mocks = vi.hoisted(() => ({ insert: vi.fn(), read: vi.fn(), update: vi.fn(), send: vi.fn(), configured: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => {
  const query = (result: () => unknown) => {
    const q = { select: () => q, eq: () => q, abortSignal: () => q, single: result }
    return q
  }
  return { hasAdminConfig: mocks.configured, createAdminClient: () => ({ from: () => ({
    insert: (row: unknown) => query(() => mocks.insert(row)),
    select: () => query(() => mocks.read()),
    update: (row: unknown) => query(() => mocks.update(row)),
  }) }) }
})
vi.mock('@/lib/email', () => ({ sendEmail: mocks.send }))

const post = async (body: unknown = { ...valid, inquiryId }, ip = '3.3.3.3') => {
  const { POST } = await import('../app/api/sponsor-inquiry/route')
  return POST(new Request('http://test.invalid/api/sponsor-inquiry', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }))
}

describe('POST /api/sponsor-inquiry', () => {
  beforeEach(() => {
    vi.resetModules(); vi.resetAllMocks()
    vi.stubEnv('SPONSOR_INQUIRY_TO', 'owner@example.com')
    mocks.configured.mockReturnValue(true)
    mocks.insert.mockImplementation(row => Promise.resolve({ data: { id: row.id }, error: null }))
    mocks.read.mockResolvedValue({ data: savedRow, error: null })
    mocks.update.mockResolvedValue({ data: { id: inquiryId }, error: null })
    mocks.send.mockResolvedValue({ success: true, id: 'e1' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks() })

  it('confirms storage and email acceptance, recording a provider receipt', async () => {
    const res = await post()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, stored: true, inquiryId })
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ id: inquiryId, email: 'ada@example.com', message: valid.message, source_page: 'sponsor' }))
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'owner@example.com', replyTo: 'ada@example.com',
      idempotencyKey: `sponsor-inquiry/${inquiryId}`, signal: expect.any(AbortSignal) }))
    expect(mocks.update).toHaveBeenCalledWith({ notification_email_id: 'e1', notification_accepted_at: expect.any(String) })
  })
  it('keeps legacy callers working without an inquiry ID', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect((await res.json()).inquiryId).toMatch(/^[a-f0-9-]{36}$/)
  })
  it('returns fake success only for honeypot hits and does nothing', async () => {
    expect(await (await post({ ...valid, [HONEYPOT_FIELD]: 'spam' })).json()).toEqual({ success: true })
    expect(mocks.insert).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled()
  })
  it('rejects invalid input, invalid references and malformed JSON without side effects', async () => {
    for (const body of [{ ...valid, offer: 'nope' }, { ...valid, inquiryId: 'bad' }, '{not json']) {
      expect((await post(body)).status).toBe(400)
    }
    expect(mocks.insert).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled()
  })
  it('rate limits per IP after 5 attempts', async () => {
    for (let i = 0; i < 5; i++) expect((await post(undefined, '4.4.4.4')).status).toBe(200)
    const res = await post(undefined, '4.4.4.4')
    expect(res.status).toBe(429); expect(res.headers.get('retry-after')).toBe('3600')
    expect((await post(undefined, '5.5.5.5')).status).toBe(200)
  })
  it.each([false, true])('returns an actionable error for database failure even if email acceptance is %s', async accepted => {
    mocks.insert.mockResolvedValue({ data: null, error: { code: '42P01', message: 'private provider detail' } })
    mocks.send.mockResolvedValue(accepted ? { success: true, id: 'e1' } : { success: false, error: 'private email detail' })
    const res = await post()
    expect(res.status).toBe(503); expect(res.headers.get('retry-after')).toBe('60')
    const json = await res.json()
    expect(json).toMatchObject({ success: false, stored: false, inquiryId })
    expect(json.error).toContain('try again')
    expect(JSON.stringify(json)).not.toContain('private')
    expect(mocks.send).toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled()
  })
  it.each(['reject', 'throw', 'missing_id'])('preserves the saved inquiry when notification fails: %s', async failure => {
    if (failure === 'throw') mocks.send.mockRejectedValue(new Error('network'))
    else mocks.send.mockResolvedValue(failure === 'missing_id' ? { success: true } : { success: false })
    const res = await post()
    expect(res.status).toBe(503)
    expect(await res.json()).toMatchObject({ success: false, stored: true, error: expect.stringContaining('was saved') })
    expect(mocks.insert).toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled()
  })
  it('handles both providers throwing without reporting success', async () => {
    mocks.insert.mockRejectedValue(new Error('timeout')); mocks.send.mockRejectedValue(new Error('timeout'))
    expect(await (await post()).json()).toMatchObject({ success: false, stored: false })
  })
  it('fails closed when storage returns no receipt or is unconfigured', async () => {
    mocks.insert.mockResolvedValue({ data: null, error: null })
    expect((await post()).status).toBe(503)
    mocks.configured.mockReturnValue(false)
    expect((await post()).status).toBe(503)
  })
  it('preserves storage but reports an absent recipient instead of using reply-to', async () => {
    vi.stubEnv('SPONSOR_INQUIRY_TO', ''); vi.stubEnv('EMAIL_REPLY_TO', 'dead@example.com')
    expect(await (await post()).json()).toMatchObject({ success: false, stored: true })
    expect(mocks.send).not.toHaveBeenCalled()
  })
  it('retries a saved pending inquiry without overwriting it', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    const res = await post()
    expect(res.status).toBe(200)
    expect(mocks.send).toHaveBeenCalledOnce()
    expect(mocks.update).toHaveBeenCalledWith(expect.not.objectContaining({ message: expect.anything() }))
  })
  it('does not notify again after an acknowledged retry or reload', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.read.mockResolvedValue({ data: { ...savedRow, notification_email_id: 'e1' }, error: null })
    expect((await post()).status).toBe(200)
    expect(mocks.send).not.toHaveBeenCalled()
  })
  it('rejects reference reuse with different contents without leaking the saved inquiry', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    const res = await post({ ...valid, inquiryId, message: 'Changed inquiry text' })
    expect(res.status).toBe(409)
    expect(JSON.stringify(await res.json())).not.toContain(savedRow.email)
    expect(mocks.send).not.toHaveBeenCalled()
  })
  it('does not mistake an unreadable duplicate for a confirmed save', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.read.mockResolvedValue({ data: null, error: { code: 'network' } })
    expect(await (await post()).json()).toMatchObject({ success: false, stored: false })
  })
  it('retains the durable inquiry if recording email acceptance fails', async () => {
    mocks.update.mockResolvedValue({ data: null, error: { code: 'network' } })
    expect(await (await post()).json()).toMatchObject({ success: true, stored: true })
    expect(console.error).toHaveBeenCalledWith('[SponsorInquiry] notification_receipt_failed', { inquiryId, emailId: 'e1' })
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
