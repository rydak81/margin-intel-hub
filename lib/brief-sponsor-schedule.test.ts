import { describe, expect, it } from 'vitest'
import { getNewsletterSponsor } from './sponsorship'
import { generateDailyBriefEmail, generateDailyBriefText, renderSponsorSlot, renderSponsorText } from './email-templates'
import { withUtm } from './utm'

const base = { NEWSLETTER_SPONSOR_NAME: 'Acme', NEWSLETTER_SPONSOR_URL: 'https://acme.test/go' }
const booked = { ...base, NEWSLETTER_SPONSOR_START: '2026-11-09', NEWSLETTER_SPONSOR_END: '2026-11-13' }
// The Brief sends at 7 AM ET: 12:00 UTC in November (EST), 11:00 UTC in October (EDT).
const sendAt = (day: string, utcHour = 12) => new Date(`${day}T${String(utcHour).padStart(2, '0')}:00:00Z`)

describe('Brief sponsor booking window (America/New_York, inclusive)', () => {
  it('unset dates keep the old behaviour: always on, weekends included', () => {
    expect(getNewsletterSponsor(base, sendAt('2026-11-07'))?.name).toBe('Acme') // Saturday
    expect(getNewsletterSponsor(base, sendAt('2027-06-01', 11))?.name).toBe('Acme')
  })

  it('switches on at START and off after END, both inclusive', () => {
    expect(getNewsletterSponsor(booked, sendAt('2026-11-06'))).toBeNull() // Fri before
    expect(getNewsletterSponsor(booked, sendAt('2026-11-09'))?.name).toBe('Acme') // Mon
    expect(getNewsletterSponsor(booked, sendAt('2026-11-13'))?.name).toBe('Acme') // Fri
    expect(getNewsletterSponsor(booked, sendAt('2026-11-16'))).toBeNull() // next Mon
  })

  it('uses the Eastern calendar day, not UTC', () => {
    // 2026-11-14 03:00 UTC is still Fri Nov 13, 10 PM EST.
    expect(getNewsletterSponsor(booked, new Date('2026-11-14T03:00:00Z'))?.name).toBe('Acme')
    // 2026-11-09 04:00 UTC is still Sun Nov 8, 11 PM EST.
    expect(getNewsletterSponsor({ ...booked, NEWSLETTER_SPONSOR_WEEKDAYS_ONLY: 'false' }, new Date('2026-11-09T04:00:00Z'))).toBeNull()
  })

  it('a dated booking skips weekend issues by default; the rule is configurable', () => {
    const fullWeek = { ...base, NEWSLETTER_SPONSOR_START: '2026-11-09', NEWSLETTER_SPONSOR_END: '2026-11-15' }
    expect(getNewsletterSponsor(fullWeek, sendAt('2026-11-14'))).toBeNull() // Sat
    expect(getNewsletterSponsor(fullWeek, sendAt('2026-11-15'))).toBeNull() // Sun
    expect(getNewsletterSponsor({ ...fullWeek, NEWSLETTER_SPONSOR_WEEKDAYS_ONLY: 'false' }, sendAt('2026-11-14'))?.name).toBe('Acme')
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_WEEKDAYS_ONLY: 'true' }, sendAt('2026-11-14'))).toBeNull()
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_WEEKDAYS_ONLY: 'true' }, sendAt('2026-11-16'))?.name).toBe('Acme')
  })

  it('a single-day ($39) booking runs on exactly that day', () => {
    const slot = { ...base, NEWSLETTER_SPONSOR_START: '2026-11-18', NEWSLETTER_SPONSOR_END: '2026-11-18' }
    expect(getNewsletterSponsor(slot, sendAt('2026-11-17'))).toBeNull()
    expect(getNewsletterSponsor(slot, sendAt('2026-11-18'))?.name).toBe('Acme')
    expect(getNewsletterSponsor(slot, sendAt('2026-11-19'))).toBeNull()
  })

  it('only START or only END is an open-ended window', () => {
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_START: '2026-11-09' }, sendAt('2026-11-08'))).toBeNull()
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_START: '2026-11-09' }, sendAt('2027-01-02'))?.name).toBe('Acme')
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_END: '2026-11-13' }, sendAt('2026-11-14'))).toBeNull()
  })

  it('hides the slot when the dates are misconfigured', () => {
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_START: '11/09/2026' }, sendAt('2026-11-10'))).toBeNull()
    expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_START: '2026-11-13', NEWSLETTER_SPONSOR_END: '2026-11-09' }, sendAt('2026-11-10'))).toBeNull()
  })

  it('hides the slot when the URL does not parse as http(s)', () => {
    for (const bad of ['https://', 'http://', 'https://exa mple.com', 'javascript:alert(1)', 'acme.test']) {
      expect(getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_URL: bad }, sendAt('2026-11-10')), bad).toBeNull()
    }
  })
})

describe('Brief sponsor UTM tagging', () => {
  it('adds utm_source=marketplacebeta and utm_medium=brief', () => {
    expect(getNewsletterSponsor(base)!.url).toBe('https://acme.test/go?utm_source=marketplacebeta&utm_medium=brief')
  })
  it("never overrides the sponsor's own UTMs", () => {
    const url = getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_URL: 'https://acme.test/go?utm_source=mbeta&utm_campaign=nov&ref=1' })!.url
    const q = new URL(url).searchParams
    expect(q.get('utm_source')).toBe('mbeta')
    expect(q.get('utm_campaign')).toBe('nov')
    expect(q.get('utm_medium')).toBe('brief')
    expect(q.get('ref')).toBe('1')
    expect(withUtm('https://acme.test/?utm_medium=email', 'brief')).toBe('https://acme.test/?utm_medium=email&utm_source=marketplacebeta')
  })
  it('the HTML slot links to the tagged URL', () => {
    expect(renderSponsorSlot(getNewsletterSponsor(base))).toContain('href="https://acme.test/go?utm_source=marketplacebeta&amp;utm_medium=brief"')
  })
})

describe('plain-text Brief', () => {
  const brief = { briefContent: '**Fees rose**\nCheck margins.', date: 'Monday, November 9, 2026', articleCount: 1, subscriberEmail: 'reader@example.com' }

  it('carries a labelled sponsor block with the tagged link', () => {
    const sponsor = getNewsletterSponsor({ ...base, NEWSLETTER_SPONSOR_TAGLINE: 'Reprice to a floor.', NEWSLETTER_SPONSOR_CTA: 'Try it free' })
    expect(renderSponsorText(sponsor)).toBe('---\nSPONSORED\nAcme\nReprice to a floor.\nTry it free: https://acme.test/go?utm_source=marketplacebeta&utm_medium=brief\n---')
    expect(renderSponsorText(getNewsletterSponsor(base))).toContain('Learn more about Acme: https://acme.test/go?utm_source=marketplacebeta&utm_medium=brief')
    expect(renderSponsorText(null)).toBe('')
  })

  it('appears in generateDailyBriefText only while a sponsor is live, above the unsubscribe line', () => {
    const before = { ...process.env }
    try {
      Object.assign(process.env, { ...base, NEWSLETTER_SPONSOR_START: '2000-01-01', NEWSLETTER_SPONSOR_WEEKDAYS_ONLY: 'false' })
      const text = generateDailyBriefText(brief)
      expect(text).toContain('SPONSORED\nAcme')
      expect(text.indexOf('SPONSORED')).toBeLessThan(text.indexOf('Unsubscribe:'))
      expect(generateDailyBriefEmail(brief)).toContain('utm_medium=brief')
      delete process.env.NEWSLETTER_SPONSOR_NAME
      const plain = generateDailyBriefText(brief)
      expect(plain).not.toContain('SPONSORED')
      expect(plain).toMatch(/Check margins\.\n\nUnsubscribe:/)
    } finally {
      process.env = before
    }
  })
})
