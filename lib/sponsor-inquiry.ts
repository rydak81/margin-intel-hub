// Sponsor inquiry form: shared validation, rate limiting and the notification email body.
// Used by app/api/sponsor-inquiry/route.ts and components/sponsor-inquiry-form.tsx.

export const SPONSOR_OFFERS = [
  { value: 'newsletter_slot', label: 'Newsletter sponsor slot' },
  { value: 'tool_listing', label: 'Sponsored tool listing' },
  { value: 'dossier_sponsor', label: 'Dossier sponsor' },
  { value: 'other', label: 'Something else / general question' },
] as const

export type SponsorOffer = (typeof SPONSOR_OFFERS)[number]['value']
export const SPONSOR_OFFER_VALUES: readonly string[] = SPONSOR_OFFERS.map(o => o.value)
export const SPONSOR_SOURCE_PAGES = ['sponsor', 'pricing', 'other'] as const
export type SponsorSourcePage = (typeof SPONSOR_SOURCE_PAGES)[number]

export const SPONSOR_LIMITS = { name: 100, email: 254, company: 120, messageMin: 10, message: 2000 } as const
/** Hidden field real visitors never fill in. */
export const HONEYPOT_FIELD = 'website'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SponsorInquiry {
  name: string
  email: string
  company: string
  offer: SponsorOffer
  message: string
  sourcePage: SponsorSourcePage
}

export type SponsorValidation =
  | { ok: true; honeypot: false; value: SponsorInquiry }
  | { ok: true; honeypot: true }
  | { ok: false; error: string }

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export function validateSponsorInquiry(raw: unknown): SponsorValidation {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Invalid request.' }
  const body = raw as Record<string, unknown>

  // Bots fill every field. Accept and drop so they get no signal to adapt to.
  if (str(body[HONEYPOT_FIELD]) !== '') return { ok: true, honeypot: true }

  const name = str(body.name)
  const email = str(body.email).toLowerCase()
  const company = str(body.company)
  const message = str(body.message)
  const offer = str(body.offer)
  const sourcePage = SPONSOR_SOURCE_PAGES.find(p => p === str(body.sourcePage)) ?? 'other'

  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (name.length > SPONSOR_LIMITS.name) return { ok: false, error: 'Name is too long.' }
  if (!email || email.length > SPONSOR_LIMITS.email || !EMAIL_REGEX.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (!company) return { ok: false, error: 'Please enter your company.' }
  if (company.length > SPONSOR_LIMITS.company) return { ok: false, error: 'Company name is too long.' }
  if (!SPONSOR_OFFER_VALUES.includes(offer)) return { ok: false, error: 'Please choose what you are interested in.' }
  if (message.length < SPONSOR_LIMITS.messageMin) return { ok: false, error: 'Please add a short message (at least 10 characters).' }
  if (message.length > SPONSOR_LIMITS.message) return { ok: false, error: 'Message is too long (2,000 characters max).' }

  return { ok: true, honeypot: false, value: { name, email, company, offer: offer as SponsorOffer, message, sourcePage } }
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory, per server instance: it slows scripted abuse but is not a global
// limit across serverless instances. Combined with the honeypot and the
// validation above that is enough for a low-volume inquiry form.

export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const MAX_TRACKED_KEYS = 5000

export interface RateLimiter {
  /** Returns true when the request is allowed, and records it. */
  check(key: string, now?: number): boolean
  reset(): void
}

export function createRateLimiter(max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS): RateLimiter {
  const hits = new Map<string, number[]>()
  return {
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
      if (recent.length >= max) {
        hits.set(key, recent)
        return false
      }
      recent.push(now)
      hits.set(key, recent)
      if (hits.size > MAX_TRACKED_KEYS) {
        for (const [k, times] of hits) {
          if (times.every(t => now - t >= windowMs)) hits.delete(k)
        }
      }
      return true
    },
    reset() { hits.clear() },
  }
}

export function clientIp(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
}

// ── Notification email ────────────────────────────────────────────────────────

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export const offerLabel = (offer: string) => SPONSOR_OFFERS.find(o => o.value === offer)?.label ?? offer

export function sponsorInquiryEmail(i: SponsorInquiry): { subject: string; html: string; text: string } {
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ')
  const subject = `Sponsor inquiry: ${oneLine(i.company)} (${offerLabel(i.offer)})`
  const rows: [string, string][] = [
    ['Name', i.name], ['Email', i.email], ['Company', i.company], ['Interested in', offerLabel(i.offer)], ['Submitted from', `/${i.sourcePage}`],
  ]
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">
<p><strong>New sponsor inquiry</strong>. Reply to this email to answer ${escapeHtml(i.name)} directly.</p>
<table cellpadding="4">${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>
<p><strong>Message</strong></p><p style="white-space:pre-wrap">${escapeHtml(i.message)}</p></div>`
  const text = `New sponsor inquiry\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${i.message}\n`
  return { subject, html, text }
}

/** Where inquiries are emailed: SPONSOR_INQUIRY_TO, else the existing EMAIL_REPLY_TO. */
export function inquiryRecipient(env: Record<string, string | undefined> = process.env): string | null {
  return env.SPONSOR_INQUIRY_TO?.trim() || env.EMAIL_REPLY_TO?.trim() || null
}
