import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import nextConfig from '@/next.config.mjs'
import { ALL_SPONSORS } from '@/lib/sponsors'
import { OPERATOR_GUIDES } from '@/lib/operator-guides'
import { MARKETPLACES } from '@/lib/marketplace-fees'
import { newsletterSource } from '@/lib/newsletter-source'
import { REPRICER_BRIEF_HREF, RepricerReference } from '@/components/repricer/repricer-reference'
import { SITE_URL } from '@/lib/site-jsonld'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))
vi.mock('@/hooks/use-auth-account', () => ({
  useAuthAccount: () => ({ currentUser: null, loading: false, user: null, metadata: {} }),
}))
vi.mock('@/lib/news-briefing', () => ({
  getDailyOperatorBriefing: async () => ({
    articles: [
      { id: 'sig_1', title: 'Signal story', summary: 'Signal summary', aiSummary: 'Signal summary', category: 'fees', sourceName: 'Source One', publishedAt: '2026-11-01T00:00:00.000Z', platforms: ['amazon'], imageUrl: '', fullContent: '' },
      { id: 'cov_1', title: 'Coverage story', summary: 'Coverage summary', aiSummary: '', category: 'logistics', sourceName: 'Source Two', publishedAt: '2026-11-02T00:00:00.000Z', platforms: ['walmart'], imageUrl: '', fullContent: '' },
    ],
    briefing: {
      generatedAt: '2026-11-03T00:00:00.000Z',
      headline: 'Operator briefing headline',
      dek: 'A dated digest for the test.',
      sellerAlerts: [],
      actionItems: ['Check the original announcement.'],
      metrics: [
        { label: 'Reports in this snapshot', value: '2', detail: 'Curated coverage.' },
        { label: 'Sources represented', value: '2', detail: 'Distinct publishers.' },
        { label: 'Newest report', value: '2026-11-02', detail: 'Source publication date.' },
      ],
      signals: [{
        articleId: 'sig_1', title: 'Signal story', summary: 'Signal summary', whyItMatters: 'Confirm which channel it affects.',
        source: 'Source One', publishedAt: '2026-11-01T00:00:00.000Z', platforms: ['amazon'], impactLevel: 'high',
      }],
      categoryMix: [{ label: 'fees', count: 1 }],
    },
  }),
}))
vi.mock('@/lib/articles-initial', () => ({
  loadInitialArticles: async () => ({
    articles: [{ id: 'art_one', title: 'First archive story', summary: 'One.', category: 'logistics', sourceName: 'Source A', publishedAt: '2026-10-01' }],
    total: 1,
    facets: { categories: {}, platforms: {}, impactLevels: {} },
  }),
  parseInitialArticles: (body: unknown) => body,
}))

const { buildCustomRoute } = createRequire(import.meta.url)('next/dist/lib/build-custom-route.js') as {
  buildCustomRoute: (type: string, route: { source: string; headers: { key: string; value: string }[] }) => { regex: string }
}

const TOOL_NAMES = [['kee', 'pa'], ['ever', 'bee'], ['supa', 'base']].map((part) => part.join(''))
const FORBIDDEN = new RegExp(`${TOOL_NAMES.join('|')}|\\bCPI\\b|probabilit|\\bodds\\b`, 'i')
const html = (el: unknown) => renderToStaticMarkup(el as ReactElement)
const ldBlocks = (markup: string) => [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((match) => {
  const value = JSON.parse(match[1].replace(/\\u003c/g, '<'))
  return Array.isArray(value) ? value : [value]
})

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (/\.(tsx|ts|jsx|js|mjs)$/.test(name)) out.push(path)
  }
  return out
}

function headerMatches(source: string, pathname: string): boolean {
  const route = buildCustomRoute('header', { source, headers: [] })
  return new RegExp(route.regex).test(pathname)
}

describe('research artifact noindex', () => {
  it('sends X-Robots-Tag: noindex for /research/*.json and /downloads/*.md only', async () => {
    const headers = await nextConfig.headers!()
    const noindex = headers.filter((rule) => rule.headers?.some((header) => header.key === 'X-Robots-Tag' && header.value === 'noindex'))
    expect(noindex.map((rule) => rule.source).sort()).toEqual(['/downloads/:file.md', '/research/:file.json'])

    const research = readdirSync('public/research').filter((name) => name.endsWith('.json'))
    const markdown = readdirSync('public/downloads').filter((name) => name.endsWith('.md'))
    expect(research.length).toBeGreaterThan(0)
    expect(markdown).toEqual(['ai-workflow-pilot.md'])
    for (const name of research) {
      expect(headerMatches('/research/:file.json', `/research/${name}`)).toBe(true)
      expect(headerMatches('/downloads/:file.md', `/research/${name}`)).toBe(false)
    }
    for (const name of markdown) expect(headerMatches('/downloads/:file.md', `/downloads/${name}`)).toBe(true)

    const stayIndexable = [
      '/intelligence/MarketplaceBeta-Intelligence-Dossier-2026-10.pdf',
      '/intelligence/dossier-2026-10.html',
      '/downloads/product-profitability-worksheet.html',
      '/downloads/marketplace-launch-checklist.html',
    ]
    for (const path of stayIndexable) {
      expect(headerMatches('/research/:file.json', path), path).toBe(false)
      expect(headerMatches('/downloads/:file.md', path), path).toBe(false)
    }
  })
})

describe('retired /partners links', () => {
  it('points internal partner links at the sponsorship inquiry', () => {
    for (const sponsor of ALL_SPONSORS) {
      if (sponsor.secondaryCtaUrl?.startsWith('/')) expect(sponsor.secondaryCtaUrl).toBe('/sponsor#inquiry')
    }
    const roots = [...walk('app'), ...walk('components'), join('lib', 'sponsors.ts')]
    const hits = roots.filter((file) => {
      const text = readFileSync(file, 'utf8')
      return text.includes('"/partners"') || text.includes("'/partners'") || text.includes('href="/partners"')
    })
    expect(hits).toEqual([])
    const sponsor = readFileSync('app/sponsor/page.tsx', 'utf8')
    expect(sponsor).toContain('href="#inquiry"')
    expect(sponsor).toContain('sponsorship inquiry')
  })
})

describe('section JSON-LD', () => {
  it('adds CollectionPage, ItemList and BreadcrumbList on the section hubs', async () => {
    const { default: Guides } = await import('@/app/guides/page')
    const guides = ldBlocks(html(Guides()))
    expect(guides.map((block) => block['@type'])).toEqual(['CollectionPage', 'BreadcrumbList'])
    const guideItems = guides[0].mainEntity.itemListElement
    expect(guideItems).toHaveLength(OPERATOR_GUIDES.length + 2)
    expect(guideItems.map((item: { name: string; url: string }) => item.url)).toEqual([
      ...OPERATOR_GUIDES.map((guide) => `${SITE_URL}/guides/${guide.slug}`),
      `${SITE_URL}/downloads/product-profitability-worksheet.html`,
      `${SITE_URL}/downloads/marketplace-launch-checklist.html`,
    ])
    expect(guides[1].itemListElement.map((item: { name: string }) => item.name)).toEqual(['Home', 'Guides'])

    const { default: Fees } = await import('@/app/fees/page')
    const fees = ldBlocks(html(Fees()))
    expect(fees[0]['@type']).toBe('CollectionPage')
    expect(fees[0].mainEntity.itemListElement.map((item: { url: string }) => item.url)).toEqual([
      `${SITE_URL}/fees/compare-by-item-price`,
      ...MARKETPLACES.map((marketplace) => `${SITE_URL}/fees/${marketplace.slug}`),
    ])
    expect(fees[1].itemListElement.map((item: { name: string; item: string }) => [item.name, item.item])).toEqual([
      ['Home', SITE_URL],
      ['Fees', `${SITE_URL}/fees`],
    ])

    const { default: Dossier } = await import('@/app/intelligence/dossier/page')
    const dossier = ldBlocks(html(Dossier()))
    expect(dossier[0].mainEntity.numberOfItems).toBe(8)
    expect(dossier[0].mainEntity.itemListElement[1].url).toBe(`${SITE_URL}/intelligence/MarketplaceBeta-Intelligence-Dossier-2026-10.pdf`)
    expect(dossier[0].mainEntity.itemListElement[2].url).toBe(`${SITE_URL}/intelligence/dossier#finding-1`)
    expect(html(Dossier())).toContain('id="finding-1"')
    expect(dossier[1].itemListElement.map((item: { name: string }) => item.name)).toEqual(['Home', 'Intelligence', 'Dossier'])

    const { default: Articles } = await import('@/app/articles/page')
    const articles = ldBlocks(html(await Articles()))
    expect(articles[0].mainEntity.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'First archive story', url: `${SITE_URL}/news/art_one` },
    ])
    expect(articles[1].itemListElement.at(-1).name).toBe('Articles')

    const { default: News } = await import('@/app/news/page')
    const news = ldBlocks(html(await News()))
    expect(news[0].name).toBe('Operator briefing headline')
    expect(news[0].mainEntity.itemListElement.map((item: { name: string; url: string }) => [item.name, item.url])).toEqual([
      ['Signal story', `${SITE_URL}/news/sig_1`],
      ['Coverage story', `${SITE_URL}/news/cov_1`],
    ])
    expect(news[1].itemListElement.map((item: { name: string }) => item.name)).toEqual(['Home', 'News'])
  })
})

describe('repricer history and sourcing pages', () => {
  it('stay indexable and explain the tool from the repo, with the brief CTA', async () => {
    const historyMeta = (await import('@/app/tools/repricer/history/page')).metadata
    const sourcingMeta = (await import('@/app/tools/repricer/sourcing/page')).metadata
    expect(historyMeta.robots).toBeUndefined()
    expect(sourcingMeta.robots).toBeUndefined()
    expect(newsletterSource('?source=tools_repricer')).toBe('newsletter_tools_repricer')

    const { default: History } = await import('@/app/tools/repricer/history/page')
    const { default: Sourcing } = await import('@/app/tools/repricer/sourcing/page')
    const history = html(History())
    const sourcing = html(Sourcing())
    for (const page of [history, sourcing]) {
      expect(page).toContain(`href="${REPRICER_BRIEF_HREF}"`)
      expect(page).toContain('href="/tools/repricer"')
      expect(page).toContain('href="/intelligence"')
      expect(page).toContain('href="/fees"')
      expect(page).toContain('href="/fees/changelog"')
      expect(page).toContain('Marketplace Pressure Index')
      expect(page).not.toMatch(FORBIDDEN)
      expect(page).not.toMatch(/helium10|a2x|rel="sponsored"|affiliate/i)
      expect(page).not.toMatch(/noindex/i)
    }
    expect(history).toContain('Sample data')
    expect(history).toContain('last 18 months')
    expect(history).toContain('August 5, 2026')
    expect(sourcing).toContain('maximum landed cost')
    expect(sourcing).toContain('Back Market')
    expect(html(createElement(RepricerReference, { page: 'history' }))).toContain('profitability floor')
  })
})

describe('about and guides expansion', () => {
  it('describes coverage, fee checks, and the guide index without new claims', async () => {
    const { default: About } = await import('@/app/about/page')
    const { default: Guides } = await import('@/app/guides/page')
    const about = html(About())
    const guides = html(Guides())
    for (const page of [about, guides]) {
      expect(page).toContain('href="/fees"')
      expect(page).toContain('href="/fees/changelog"')
      expect(page).toContain('href="/editorial-policy"')
      expect(page).not.toMatch(FORBIDDEN)
      expect(page).not.toMatch(/mailto:/i)
    }
    expect(about).toContain('Marketplace Pressure Index')
    expect(about).toContain('href="/intelligence/pressure-index"')
    expect(about).toContain('coverage intensity, not market size')
    expect(about).toContain('not affiliated with or endorsed')
    expect(guides).toContain('Guide index')
    for (const guide of OPERATOR_GUIDES) {
      expect(guides).toContain(`href="/guides/${guide.slug}"`)
      expect(guides).toContain(guide.takeaway)
    }
  })
})
