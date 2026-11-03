import { describe, expect, it } from 'vitest'
import {
  NEWSLETTER_FIXED_SOURCES,
  newsletterSource,
  sanitizeSubscriberSource,
} from './newsletter-source'
import { homepageWidgetSource, newsletterSignupSource } from './newsletter-signup'
import { getAnalysis } from './analysis'

describe('newsletterSource', () => {
  it('keeps the existing dossier campaign attribution', () => {
    expect(newsletterSource('?source=dossier_2026_10')).toBe('newsletter_dossier_2026_10')
    expect(newsletterSource('?email=private@example.com&source=dossier_2026_10')).toBe(
      'newsletter_dossier_2026_10',
    )
  })

  it('accepts every fixed promo channel via source=', () => {
    for (const key of NEWSLETTER_FIXED_SOURCES) {
      expect(newsletterSource(`?source=${key}`)).toBe(`newsletter_${key}`)
    }
  })

  it('accepts campaign_<slug> keys (lowercase alnum/_/-, max 64)', () => {
    expect(newsletterSource('?source=campaign_launch_oct26')).toBe(
      'newsletter_campaign_launch_oct26',
    )
    expect(newsletterSource('?source=campaign_a')).toBe('newsletter_campaign_a')
    expect(newsletterSource('?source=campaign_reddit-ads_v1')).toBe(
      'newsletter_campaign_reddit-ads_v1',
    )
    // 64-char allowlisted key
    const max = `campaign_${'a'.repeat(55)}`
    expect(max).toHaveLength(64)
    expect(newsletterSource(`?source=${max}`)).toBe(`newsletter_${max}`)
  })

  it('reads utm_source when source is absent', () => {
    expect(newsletterSource('?utm_source=reddit')).toBe('newsletter_reddit')
    expect(newsletterSource('?utm_source=x&utm_medium=social')).toBe('newsletter_x')
    expect(newsletterSource('?utm_source=campaign_launch_oct26')).toBe(
      'newsletter_campaign_launch_oct26',
    )
    expect(newsletterSource('?utm_source=brief')).toBe('newsletter_brief')
  })

  it('prefers source over utm_source and ignores invalid fallthrough', () => {
    expect(newsletterSource('?source=linkedin&utm_source=reddit')).toBe('newsletter_linkedin')
    // Invalid explicit source must not fall through to a valid utm_source.
    expect(newsletterSource('?source=evil&utm_source=reddit')).toBe('newsletter_page')
  })

  it('rejects unsafe, oversized, or ambiguous values', () => {
    for (const search of [
      '',
      '?',
      '?source=other',
      '?source=private@example.com',
      '?source=dossier_2026_10&source=other',
      '?source=dossier_2026_10&source=dossier_2026_10',
      '?utm_source=other',
      '?utm_source=reddit&utm_source=x',
      '?source=Campaign_Launch', // uppercase rejected
      '?source=campaign_',
      '?source=campaign_-bad',
      '?source=campaign_bad-',
      '?source=campaign_has space',
      '?source=campaign_has.dot',
      `?source=campaign_${'a'.repeat(56)}`, // 65 chars
      '?source=javascript:alert(1)',
      '?source=../../etc/passwd',
    ]) {
      expect(newsletterSource(search), search).toBe('newsletter_page')
    }
  })
})

describe('holiday shipping cutoffs analysis CTA key (PR #136)', () => {
  const KEY = 'campaign_kw_holiday_cutoffs_2026'

  it('is the key the analysis page uses', () => {
    expect(getAnalysis('holiday-shipping-cutoffs-2026-small-sellers')?.newsletterSource).toBe(KEY)
  })

  it('is accepted unchanged from the URL, not relabeled to a fallback', () => {
    expect(newsletterSource(`?source=${KEY}`)).toBe(`newsletter_${KEY}`)
    expect(newsletterSource(`?utm_source=${KEY}`)).toBe(`newsletter_${KEY}`)
    expect(newsletterSignupSource(`?source=${KEY}`)).toBe(`newsletter_${KEY}`)
    expect(homepageWidgetSource(`?source=${KEY}`)).toBe(`homepage_widget:${KEY}`)
  })

  it('survives as a remembered visit key and is stored verbatim by /api/subscribe', () => {
    expect(newsletterSignupSource('', KEY)).toBe(`newsletter_${KEY}`)
    expect(sanitizeSubscriberSource(`newsletter_${KEY}`)).toBe(`newsletter_${KEY}`)
  })
})

describe('holiday returns analysis CTA key', () => {
  const KEY = 'campaign_kw_holiday_returns_2026'

  it('is the key the analysis page uses', () => {
    expect(getAnalysis('holiday-returns-2026-amazon-walmart-etsy-ebay')?.newsletterSource).toBe(KEY)
  })

  it('is accepted unchanged from the URL, not relabeled to a fallback', () => {
    expect(newsletterSource(`?source=${KEY}`)).toBe(`newsletter_${KEY}`)
    expect(newsletterSource(`?utm_source=${KEY}`)).toBe(`newsletter_${KEY}`)
    expect(newsletterSignupSource(`?source=${KEY}`)).toBe(`newsletter_${KEY}`)
    expect(homepageWidgetSource(`?source=${KEY}`)).toBe(`homepage_widget:${KEY}`)
  })

  it('survives as a remembered visit key and is stored verbatim by /api/subscribe', () => {
    expect(newsletterSignupSource('', KEY)).toBe(`newsletter_${KEY}`)
    expect(sanitizeSubscriberSource(`newsletter_${KEY}`)).toBe(`newsletter_${KEY}`)
  })
})
