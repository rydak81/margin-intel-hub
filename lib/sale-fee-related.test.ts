import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SaleFeeRelatedAnalysis } from '@/components/sale-fee-related'
import { getAnalysis, latestAnalysis } from '@/lib/analysis'
import { BRIEF_CTA_KEYS } from '@/lib/brief-cta'
import { HOLIDAY_HUB_LINK_LABEL, HOLIDAY_HUB_LINK_THROUGH, HOLIDAY_HUB_PATH, holidayHubLinkVisible } from '@/lib/holiday-hub'
import { MARKETPLACES, type MarketplaceSlug } from '@/lib/marketplace-fees'
import { analysisMarketplaces } from '@/lib/related-links'
import { SALE_PRICES, getAllSaleRoutes } from '@/lib/sale-fee-pages'
import { SALE_FEE_RELATED_ANALYSIS_LIMIT, saleFeeRelatedAnalysis, saleFeeRelatedLinks } from '@/lib/sale-fee-related'

const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map(p => p.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bcpi\\b|probabilit|\\bodds\\b`, 'i')

/** 2026-12-31 23:59 America/New_York (EST, UTC-5). */
const LAST_MINUTE = new Date('2027-01-01T04:59:00Z')
/** 2026-12-31 22:30 America/New_York, already January 1 in UTC. */
const STILL_DEC_31 = new Date('2027-01-01T03:30:00Z')
/** 2027-01-01 00:00 America/New_York. */
const NEXT_DAY = new Date('2027-01-01T05:00:00Z')

const analysisHrefs = (slug: MarketplaceSlug, now: Date) =>
  saleFeeRelatedLinks(slug, now)
    .map(link => link.href)
    .filter(href => href.startsWith('/intelligence/analysis/'))

describe('holiday hub link gate', () => {
  it('stays visible through the last minute of 2026-12-31 in New York', () => {
    expect(HOLIDAY_HUB_LINK_THROUGH).toBe('2026-12-31')
    expect(holidayHubLinkVisible(new Date('2026-11-27T15:00:00Z'))).toBe(true)
    expect(holidayHubLinkVisible(STILL_DEC_31)).toBe(true)
    expect(holidayHubLinkVisible(LAST_MINUTE)).toBe(true)
  })

  it('hides the hub link at 2027-01-01 in New York', () => {
    expect(holidayHubLinkVisible(NEXT_DAY)).toBe(false)
    expect(holidayHubLinkVisible(new Date('2027-01-01T15:00:00Z'))).toBe(false)
  })
})

describe('sale fee related analysis', () => {
  it('links 2 to 4 published articles for each marketplace, newest first', () => {
    const order = latestAnalysis().map(article => article.slug)
    for (const marketplace of MARKETPLACES) {
      const articles = saleFeeRelatedAnalysis(marketplace.slug)
      expect(articles.length, marketplace.slug).toBeGreaterThanOrEqual(2)
      expect(articles.length, marketplace.slug).toBeLessThanOrEqual(4)
      expect(articles.length, marketplace.slug).toBeLessThanOrEqual(SALE_FEE_RELATED_ANALYSIS_LIMIT)
      const indexes = articles.map(article => order.indexOf(article.slug))
      expect(indexes, marketplace.slug).toEqual([...indexes].sort((a, b) => a - b))
      for (const article of articles) {
        expect(getAnalysis(article.slug), article.slug).toBeDefined()
        expect(getAnalysis(article.slug)?.slug).toBe(article.slug)
        expect(analysisMarketplaces(article).map(item => item.slug), article.slug).toContain(marketplace.slug)
      }
    }
  })

  it('every linked analysis slug resolves to that published article', () => {
    for (const marketplace of MARKETPLACES) {
      for (const href of analysisHrefs(marketplace.slug, LAST_MINUTE)) {
        const slug = href.slice('/intelligence/analysis/'.length)
        const article = getAnalysis(slug)
        expect(article, href).toBeDefined()
        expect(href).toBe(`/intelligence/analysis/${article!.slug}`)
        expect(article!.headline.length).toBeGreaterThan(0)
      }
    }
  })

  it('adds the holiday hub through Dec 31 and drops it the next Eastern day', () => {
    for (const marketplace of MARKETPLACES) {
      const during = saleFeeRelatedLinks(marketplace.slug, LAST_MINUTE)
      const after = saleFeeRelatedLinks(marketplace.slug, NEXT_DAY)
      expect(during.at(-1), marketplace.slug).toEqual({
        href: HOLIDAY_HUB_PATH,
        label: HOLIDAY_HUB_LINK_LABEL,
        note: 'Holiday hub',
      })
      expect(during.filter(link => link.href === HOLIDAY_HUB_PATH), marketplace.slug).toHaveLength(1)
      expect(after.map(link => link.href), marketplace.slug).toEqual(analysisHrefs(marketplace.slug, LAST_MINUTE))
      expect(after.some(link => link.href === HOLIDAY_HUB_PATH), marketplace.slug).toBe(false)
      expect(`${during.map(link => `${link.label} ${link.note}`).join('\n')}`, marketplace.slug).not.toMatch(FORBIDDEN)
    }
  })

  it('renders the same analysis links on every price, with the hub only while the gate is open', () => {
    for (const marketplace of MARKETPLACES) {
      const open = renderToStaticMarkup(createElement(SaleFeeRelatedAnalysis, { marketplace: marketplace.slug, now: LAST_MINUTE }))
      const closed = renderToStaticMarkup(createElement(SaleFeeRelatedAnalysis, { marketplace: marketplace.slug, now: NEXT_DAY }))
      expect(open).toContain('id="related-analysis"')
      expect(open).toContain('Related analysis')
      for (const href of analysisHrefs(marketplace.slug, LAST_MINUTE)) expect(open, marketplace.slug).toContain(`href="${href}"`)
      expect(open, marketplace.slug).toContain(`href="${HOLIDAY_HUB_PATH}"`)
      expect(open, marketplace.slug).toContain(HOLIDAY_HUB_LINK_LABEL.replace(/&/g, '&amp;'))
      expect(closed, marketplace.slug).not.toContain(HOLIDAY_HUB_PATH)
      for (const href of analysisHrefs(marketplace.slug, NEXT_DAY)) expect(closed, marketplace.slug).toContain(`href="${href}"`)
      expect(open).not.toMatch(FORBIDDEN)
      expect(closed).not.toMatch(FORBIDDEN)
    }
  })
})

describe('on-a-$N-sale pages', () => {
  it('places Related analysis after the FAQ and before the unchanged fee-sale Brief CTA', async () => {
    const { default: Page } = await import('@/app/fees/[marketplace]/sale/[price]/page')
    for (const route of getAllSaleRoutes()) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve(route) } as never))
      const faq = html.indexOf('Common questions')
      const related = html.indexOf('id="related-analysis"')
      const source = BRIEF_CTA_KEYS.feeSale(route.marketplace)
      const cta = html.indexOf(`href="/newsletter?source=${source}#subscribe"`)
      expect(faq, `${route.marketplace}/${route.price}`).toBeGreaterThan(-1)
      expect(related, `${route.marketplace}/${route.price}`).toBeGreaterThan(faq)
      expect(cta, `${route.marketplace}/${route.price}`).toBeGreaterThan(related)
      expect(html, `${route.marketplace}/${route.price}`).toContain('Get fee changes before they hit your margin')
      const block = /<section id="related-analysis"[\s\S]*?<\/section>/.exec(html)?.[0] ?? ''
      expect(block, `${route.marketplace}/${route.price}`).toBe(
        renderToStaticMarkup(createElement(SaleFeeRelatedAnalysis, { marketplace: route.marketplace as MarketplaceSlug })),
      )
      for (const href of analysisHrefs(route.marketplace as MarketplaceSlug, new Date())) {
        expect(block, href).toContain(`href="${href}"`)
        expect(getAnalysis(href.slice('/intelligence/analysis/'.length)), href).toBeDefined()
      }
      if (holidayHubLinkVisible()) expect(block, route.marketplace).toContain(`href="${HOLIDAY_HUB_PATH}"`)
      else expect(block, route.marketplace).not.toContain(HOLIDAY_HUB_PATH)
      expect(block).not.toMatch(FORBIDDEN)
    }
    expect(SALE_PRICES.length).toBeGreaterThan(0)
  })
})
