// End-to-end checks for every Daily Marketplace Brief signup path:
// CTA key -> /newsletter?source=<key> -> form source -> /api/subscribe -> saved
// subscriber row (source included). Database and email are mocked; nothing is
// sent anywhere.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_CTA_KEYS, FOOTER_BRIEF_SOURCE, HEADER_BRIEF_SOURCE, briefSignupHref } from '@/lib/brief-cta'
import { NEWSLETTER_FIXED_SOURCES, newsletterSource, sanitizeSubscriberSource } from '@/lib/newsletter-source'
import { homepageWidgetSource, newsletterSignupSource } from '@/lib/newsletter-signup'
import { scrubAnalyticsUrl } from '@/lib/analytics-url'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { getAllPairs } from '@/lib/fee-compare'
import { OPERATOR_GUIDES } from '@/lib/operator-guides'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { ebayAnalysisBriefSource } from '@/lib/related-links'
import { POST } from '@/app/api/subscribe/route'

const db = vi.hoisted(() => ({ admin: vi.fn(), hasConfig: vi.fn(), insert: vi.fn(), existing: vi.fn(), sendEmail: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: db.admin, hasAdminConfig: db.hasConfig }))
vi.mock('@/lib/email', () => ({ sendEmail: db.sendEmail }))

const ROOT = process.cwd()

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

/** Every literal /newsletter?source=<key> written anywhere in app, components or lib. */
function literalSignupKeys(): { key: string; file: string }[] {
  const found: { key: string; file: string }[] = []
  for (const file of ['app', 'components', 'lib'].flatMap(d => sourceFiles(join(ROOT, d)))) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\/newsletter\?source=([a-z0-9_-]+)/g)) {
      found.push({ key: m[1], file: relative(ROOT, file) })
    }
  }
  return found
}

/** Every key the generated CTAs can emit (fee pages, compare pairs, guides, analysis, chrome). */
function generatedSignupKeys(): string[] {
  return [
    HEADER_BRIEF_SOURCE, FOOTER_BRIEF_SOURCE,
    BRIEF_CTA_KEYS.feeHub, BRIEF_CTA_KEYS.feeChangelog, BRIEF_CTA_KEYS.articles, BRIEF_CTA_KEYS.news, BRIEF_CTA_KEYS.guidesHub, BRIEF_CTA_KEYS.homeLatest,
    ...MARKETPLACES.flatMap(m => [BRIEF_CTA_KEYS.feeMarketplace(m.slug), BRIEF_CTA_KEYS.feeCategory(m.slug), BRIEF_CTA_KEYS.feeSale(m.slug)]),
    ...getAllPairs().map(p => BRIEF_CTA_KEYS.feeCompare(p.slug)),
    ...OPERATOR_GUIDES.map(g => BRIEF_CTA_KEYS.guide(g.slug)),
    ...ANALYSIS_ARTICLES.map(a => a.newsletterSource),
    ...ANALYSIS_ARTICLES.flatMap(a => {
      const key = ebayAnalysisBriefSource(a)
      return key ? [key] : []
    }),
  ]
}

const post = (body: unknown) => new Request('https://example.com/api/subscribe', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
})

beforeEach(() => {
  vi.clearAllMocks()
  db.hasConfig.mockReturnValue(true)
  db.existing.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
  db.insert.mockImplementation((row: { email: string }) => ({
    select: () => ({ single: async () => ({ data: { id: 'sub_fixture', email: row.email }, error: null }) }),
  }))
  db.admin.mockReturnValue({
    from: () => ({
      select: () => ({ eq: () => ({ single: db.existing }) }),
      insert: db.insert,
    }),
  })
  db.sendEmail.mockResolvedValue({ success: true })
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.restoreAllMocks() })

describe('every CTA key reaches the form with its source intact', () => {
  it('all generated CTA keys pass the allowlist, so /newsletter keeps them', () => {
    const keys = generatedSignupKeys()
    expect(keys.length).toBeGreaterThan(20)
    for (const key of keys) {
      expect(newsletterSource(new URL(briefSignupHref(key), 'https://x').search), key).toBe(`newsletter_${key}`)
    }
  })

  it('every literal /newsletter?source= link in the codebase passes the allowlist', () => {
    const found = literalSignupKeys()
    expect(found.length).toBeGreaterThan(5)
    for (const { key, file } of found) expect(newsletterSource(`?source=${key}`), `${key} in ${file}`).toBe(`newsletter_${key}`)
  })

  it('fixed channel keys are accepted', () => {
    for (const key of NEWSLETTER_FIXED_SOURCES) expect(newsletterSignupSource(`?source=${key}`)).toBe(`newsletter_${key}`)
  })
})

describe('/newsletter form attribution', () => {
  it('uses the key on the URL', () => {
    expect(newsletterSignupSource('?source=campaign_cta_header', 'tiktok')).toBe('newsletter_campaign_cta_header')
  })
  it('falls back to the key remembered for the visit when reached through an unkeyed /newsletter link', () => {
    expect(newsletterSignupSource('', 'campaign_dist_var')).toBe('newsletter_campaign_dist_var')
  })
  it('ignores an invalid remembered key and defaults to newsletter_page', () => {
    expect(newsletterSignupSource('', 'evil.com')).toBe('newsletter_page')
    expect(newsletterSignupSource('', null)).toBe('newsletter_page')
    // Same rule as the CTA links: an invalid URL key never wins, a valid remembered key still applies.
    expect(newsletterSignupSource('?source=evil.com', 'tiktok')).toBe('newsletter_tiktok')
    expect(newsletterSignupSource('?source=evil.com', null)).toBe('newsletter_page')
  })
})

describe('homepage widget attribution', () => {
  it('is homepage_widget by default and carries a valid visit key', () => {
    expect(homepageWidgetSource('', null)).toBe('homepage_widget')
    expect(homepageWidgetSource('?source=linkedin', null)).toBe('homepage_widget:linkedin')
    expect(homepageWidgetSource('', 'campaign_dist_mp')).toBe('homepage_widget:campaign_dist_mp')
    expect(homepageWidgetSource('?source=bad key', null)).toBe('homepage_widget')
  })
})

describe('/api/subscribe persistence (mocked database)', () => {
  it.each([
    'newsletter_campaign_cta_header',
    'newsletter_campaign_cta_footer',
    `newsletter_${BRIEF_CTA_KEYS.feeMarketplace('amazon')}`,
    `newsletter_${BRIEF_CTA_KEYS.articles}`,
    'newsletter_page',
    'homepage_widget',
    'homepage_widget:campaign_dist_mp',
    'fee-gate:sales-forecaster',
  ])('saves the subscriber with source %s', async source => {
    const response = await POST(post({ email: ' Reader@Example.com ', role: 'brand_seller', source }))
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)
    expect(db.insert).toHaveBeenCalledTimes(1)
    expect(db.insert.mock.calls[0][0]).toMatchObject({ email: 'reader@example.com', role: 'brand_seller', source })
  })

  it('never rejects a signup over its source label: missing or odd values are stored safely', async () => {
    await POST(post({ email: 'a@example.com' }))
    expect(db.insert.mock.calls[0][0].source).toBe('website')
    await POST(post({ email: 'b@example.com', source: { nested: true } }))
    expect(db.insert.mock.calls[1][0].source).toBe('website')
    await POST(post({ email: 'c@example.com', source: 'x'.repeat(500) }))
    expect(db.insert.mock.calls[2][0].source).toHaveLength(100)
    expect(sanitizeSubscriberSource('  newsletter_brief  ')).toBe('newsletter_brief')
  })

  it('answers 409 already_subscribed without inserting', async () => {
    db.existing.mockResolvedValueOnce({ data: { id: 'sub_old', email: 'old@example.com' }, error: null })
    const response = await POST(post({ email: 'old@example.com', source: 'newsletter_page' }))
    expect(response.status).toBe(409)
    expect((await response.json()).error).toBe('already_subscribed')
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('returns a clear 503 (not a silent generic failure) when the database env is missing', async () => {
    db.hasConfig.mockReturnValue(false)
    const response = await POST(post({ email: 'a@example.com', source: 'newsletter_page' }))
    expect(response.status).toBe(503)
    expect((await response.json()).success).toBe(false)
    expect(db.admin).not.toHaveBeenCalled()
  })

  it('a failed welcome email does not fail the signup', async () => {
    db.sendEmail.mockRejectedValueOnce(new Error('mail down'))
    const response = await POST(post({ email: 'a@example.com', source: 'newsletter_page' }))
    expect(response.status).toBe(200)
  })
})

describe('analytics URL scrubbing keeps attribution, drops private query values', () => {
  it('keeps utm_* and an allowlisted ?source, drops everything else and the hash', () => {
    expect(scrubAnalyticsUrl('https://marketplacebeta.com/articles?q=private+search&utm_source=chatgpt.com#x'))
      .toBe('https://marketplacebeta.com/articles?utm_source=chatgpt.com')
    expect(scrubAnalyticsUrl('https://marketplacebeta.com/newsletter?source=campaign_cta_header&email=a%40b.com#subscribe'))
      .toBe('https://marketplacebeta.com/newsletter?source=campaign_cta_header')
  })
  it('drops non-allowlisted sources, email-like or oversized utm values', () => {
    expect(scrubAnalyticsUrl('https://marketplacebeta.com/?source=evil.com&utm_source=a%40b.com&utm_campaign=' + 'x'.repeat(200)))
      .toBe('https://marketplacebeta.com/')
    expect(scrubAnalyticsUrl('not a url')).toBeNull()
  })
})
