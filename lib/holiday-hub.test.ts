import { existsSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ANALYSIS_ARTICLES, getAnalysis, latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { AMAZON_PEAK_DESCRIPTION, AMAZON_PEAK_PATH, AMAZON_PEAK_TITLE } from '@/lib/amazon-holiday-peak-2026'
import { newsletterSource } from '@/lib/newsletter-source'
import { SPONSOR_CTA_HREF, SPONSOR_CTA_LABEL } from '@/lib/brief-cta'
import {
  HOLIDAY_FEE_PAGES, HOLIDAY_HUB_DESCRIPTION, HOLIDAY_HUB_PATH, HOLIDAY_HUB_SOURCE, HOLIDAY_HUB_TITLE,
  holidayAnalysis, holidayHubEntries, holidayHubUpdatedOn, isHolidayAnalysis, isOnHolidayHub,
} from '@/lib/holiday-hub'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => { throw new Error('No database in this test') } }))

const SITE = 'https://marketplacebeta.com'
const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probabilit|\\bodds\\b`, 'i')

const REQUIRED_ANALYSIS = [
  'holiday-shipping-cutoffs-2026-small-sellers',
  'holiday-returns-2026-amazon-walmart-etsy-ebay',
  'la-long-beach-rail-backlog-strike-holiday-inventory',
  'q4-2026-holiday-forecasts-marketplace-sellers',
  'q4-2026-parcel-surcharge-calendar',
]
const REQUIRED_PATHS = [...REQUIRED_ANALYSIS.map(s => `/intelligence/analysis/${s}`), AMAZON_PEAK_PATH]

/** React escapes text; compare against the same escaping. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

function article(overrides: Partial<AnalysisArticle> = {}): AnalysisArticle {
  return {
    slug: 'fixture', seoTitle: 'Fixture', metaDescription: 'Fixture meta.', headline: 'Fixture headline', dek: 'd',
    publishedOn: '2026-11-20', updatedOn: '2026-11-20', author: 'x', readTime: '1 min', tags: ['logistics'],
    takeaway: 't', forecastIds: [], newsletterSource: 'campaign_test',
    sections: [{ id: 's', title: 'Body', paragraphs: [] }], sources: [], ...overrides,
  }
}

async function hubHtml(): Promise<string> {
  const { default: Page } = await import('@/app/holiday-2026/page')
  return renderToStaticMarkup(Page() as ReactElement)
}

describe('/holiday-2026 route', () => {
  it('exists with a self-canonical, metadata and JSON-LD', async () => {
    expect(existsSync('app/holiday-2026/page.tsx')).toBe(true)
    const { metadata } = await import('@/app/holiday-2026/page')
    expect(metadata.alternates?.canonical).toBe(HOLIDAY_HUB_PATH)
    expect(metadata.title).toBe(`${HOLIDAY_HUB_TITLE} | MarketplaceBeta`)
    expect(metadata.description).toBe(HOLIDAY_HUB_DESCRIPTION)
    expect(HOLIDAY_HUB_TITLE.length).toBeLessThanOrEqual(60)
    expect(HOLIDAY_HUB_DESCRIPTION.length).toBeLessThanOrEqual(155)
    const html = await hubHtml()
    expect(html).toContain('"@type":"CollectionPage"')
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html.match(/<h1/g)).toHaveLength(1)
  })

  it('is in the sitemap once, dated from its newest entry, without dropping other routes', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    expect(urls.filter(u => u === `${SITE}${HOLIDAY_HUB_PATH}`)).toHaveLength(1)
    expect(new Set(urls).size).toBe(urls.length)
    for (const p of REQUIRED_PATHS) expect(urls).toContain(`${SITE}${p}`)
    const hub = entries.find(e => e.url === `${SITE}${HOLIDAY_HUB_PATH}`)!
    expect(hub.lastModified).toEqual(new Date(holidayHubUpdatedOn()))
  })
})

describe('hub links', () => {
  it('every required page exists on main', () => {
    for (const s of REQUIRED_ANALYSIS) expect(getAnalysis(s), s).toBeDefined()
    expect(existsSync('app/fees/amazon/holiday-peak-2026/page.tsx')).toBe(true)
  })

  it('links all six required pages, each with that page\'s own meta description', async () => {
    const html = await hubHtml()
    for (const s of REQUIRED_ANALYSIS) {
      const a = getAnalysis(s)!
      expect(html, s).toContain(`href="/intelligence/analysis/${s}"`)
      expect(html, s).toContain(`<p class="mt-2 text-muted-foreground">${esc(a.metaDescription)}</p>`)
      expect(html, s).toContain(esc(a.headline))
    }
    expect(html).toContain(`href="${AMAZON_PEAK_PATH}"`)
    expect(html).toContain(esc(AMAZON_PEAK_TITLE))
    expect(html).toContain(`<p class="mt-2 text-muted-foreground">${esc(AMAZON_PEAK_DESCRIPTION)}</p>`)
  })

  it('every description on the hub is copied from the linked page (no new copy)', async () => {
    const { metadata } = await import('@/app/fees/amazon/holiday-peak-2026/page')
    expect(metadata.title).toBe(AMAZON_PEAK_TITLE)
    expect(metadata.description).toBe(AMAZON_PEAK_DESCRIPTION)
    for (const e of holidayHubEntries()) {
      if (e.kind === 'Analysis') {
        const a = ANALYSIS_ARTICLES.find(x => `/intelligence/analysis/${x.slug}` === e.href)!
        expect(e.description).toBe(a.metaDescription)
        expect(e.title).toBe(a.headline)
      } else {
        expect(HOLIDAY_FEE_PAGES).toContainEqual(e)
      }
    }
  })

  it('links the comparison page and uses the hub Brief source and the sponsor CTA', async () => {
    const html = await hubHtml()
    expect(html).toContain('href="/fees/compare-by-item-price"')
    expect(HOLIDAY_HUB_SOURCE).toBe('campaign_holiday_hub')
    expect(newsletterSource(`?source=${HOLIDAY_HUB_SOURCE}`)).toBe(`newsletter_${HOLIDAY_HUB_SOURCE}`)
    expect(html).toContain(`href="/newsletter?source=${HOLIDAY_HUB_SOURCE}#subscribe"`)
    expect(html).toContain(`href="${SPONSOR_CTA_HREF}"`)
    expect(html).toContain(esc(SPONSOR_CTA_LABEL))
    expect(SPONSOR_CTA_LABEL).toBe('Sponsor the Brief from $39')
  })

  it('names no data vendors, no CPI and no forecast probabilities', async () => {
    expect(await hubHtml()).not.toMatch(FORBIDDEN)
  })
})

describe('auto-join selector', () => {
  it('selects the five holiday analysis pieces on main and skips non-holiday Q4 pieces', () => {
    const slugs = holidayAnalysis().map(a => a.slug)
    for (const s of REQUIRED_ANALYSIS) expect(slugs).toContain(s)
    expect(slugs).not.toContain('walmart-new-seller-savings-2026-worth-it')
    expect(slugs).not.toContain('ieepa-tariff-refunds-marketplace-sellers')
    expect(slugs).toEqual(latestAnalysis().filter(a => slugs.includes(a.slug)).map(a => a.slug))
  })

  it('a new holiday-tagged article joins the hub automatically, newest first', () => {
    const fixture = article({ slug: 'fixture-holiday', tags: ['Holiday shipping', 'Q4 2026'], publishedOn: '2026-12-01' })
    const articles = [fixture, ...latestAnalysis()]
    expect(holidayAnalysis(articles)[0].slug).toBe('fixture-holiday')
    expect(holidayHubEntries(articles)[0]).toMatchObject({ href: '/intelligence/analysis/fixture-holiday', description: 'Fixture meta.' })
    expect(isOnHolidayHub('/intelligence/analysis/fixture-holiday', articles)).toBe(true)
    expect(holidayHubUpdatedOn(articles)).toBe('2026-12-01')
  })

  it('ignores untagged pieces, partial-word matches and other seasons', () => {
    expect(isHolidayAnalysis(article({ tags: ['Q4 2026', 'Walmart'] }))).toBe(false)
    expect(isHolidayAnalysis(article({ tags: ['holidays2026'] }))).toBe(false)
    expect(isHolidayAnalysis(article({ tags: ['peak season'], publishedOn: '2027-10-01' }))).toBe(false)
    expect(isHolidayAnalysis(article({ tags: ['peak season'] }))).toBe(true)
  })
})

describe('back-links to /holiday-2026', () => {
  it('every holiday analysis page links the hub; other analysis pages do not', async () => {
    const { default: Page } = await import('@/app/intelligence/analysis/[slug]/page')
    for (const a of ANALYSIS_ARTICLES) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: a.slug }) } as never))
      const links = html.includes(`href="${HOLIDAY_HUB_PATH}"`)
      expect(links, a.slug).toBe(isHolidayAnalysis(a))
    }
  })

  it('the Amazon holiday peak fee page links the hub', async () => {
    const { default: Page } = await import('@/app/fees/amazon/holiday-peak-2026/page')
    const html = renderToStaticMarkup(Page() as ReactElement)
    expect(html).toContain(`href="${HOLIDAY_HUB_PATH}"`)
    expect(isOnHolidayHub(AMAZON_PEAK_PATH)).toBe(true)
  })
})
