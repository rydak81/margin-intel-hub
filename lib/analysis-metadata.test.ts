import { readFileSync } from 'node:fs'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ANALYSIS_ARTICLES, type AnalysisArticle } from '@/lib/analysis'
import { buildRssFeed, feedItems } from '@/lib/rss-feed'
import { ORGANIZATION_REF, SITE_URL } from '@/lib/site-jsonld'

vi.mock('@/components/premium-site-header', () => ({ PremiumSiteHeader: () => null }))
vi.mock('@/components/premium-site-footer', () => ({ PremiumSiteFooter: () => null }))

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const ldBlocks = (html: string) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => {
  const v = JSON.parse(m[1].replace(/\\u003c/g, '<'))
  return Array.isArray(v) ? v : [v]
})

async function articleHtml(slug: string) {
  const { default: Page } = await import('@/app/intelligence/analysis/[slug]/page')
  const el = await Page({ params: Promise.resolve({ slug }) })
  return renderToStaticMarkup(createElement(() => el))
}

function expectArticleGraph(blocks: Record<string, unknown>[], article: AnalysisArticle) {
  const articles = blocks.filter(b => b['@type'] === 'Article' || b['@type'] === 'NewsArticle' || b['@type'] === 'AnalysisNewsArticle')
  const crumbs = blocks.filter(b => b['@type'] === 'BreadcrumbList')
  expect(articles).toHaveLength(1)
  expect(crumbs).toHaveLength(1)
  const url = `${SITE_URL}/intelligence/analysis/${article.slug}`
  expect(articles[0]).toMatchObject({
    headline: article.headline,
    description: article.metaDescription,
    datePublished: article.publishedOn,
    dateModified: article.updatedOn,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'MarketplaceBeta', url: `${SITE_URL}/about` },
    publisher: ORGANIZATION_REF,
  })
  expect(crumbs[0].itemListElement).toEqual([
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Intelligence', item: `${SITE_URL}/intelligence` },
    { '@type': 'ListItem', position: 3, name: 'Analysis', item: `${SITE_URL}/intelligence/analysis` },
    { '@type': 'ListItem', position: 4, name: article.seoTitle, item: url },
  ])
}

describe('analysis article metadata', () => {
  it('emits one Article graph and a Home > Intelligence > Analysis > piece breadcrumb', async () => {
    expect(ANALYSIS_ARTICLES.length).toBeGreaterThan(0)
    for (const article of ANALYSIS_ARTICLES) {
      const html = await articleHtml(article.slug)
      expectArticleGraph(ldBlocks(html), article)
      expect(html).toContain('href="/"')
      expect(html).toContain('href="/intelligence/analysis"')
      expect(html).toContain(`>${esc(article.seoTitle)}<`)
    }
  })

  it('sets a self canonical plus Open Graph and Twitter for each piece', async () => {
    const { generateMetadata } = await import('@/app/intelligence/analysis/[slug]/page')
    for (const article of ANALYSIS_ARTICLES) {
      const meta = await generateMetadata({ params: Promise.resolve({ slug: article.slug }) })
      const path = `/intelligence/analysis/${article.slug}`
      expect(meta.alternates?.canonical).toBe(path)
      expect(meta.description).toBe(article.metaDescription)
      expect(meta.openGraph).toMatchObject({
        title: article.seoTitle,
        description: article.metaDescription,
        url: path,
        type: 'article',
        publishedTime: article.publishedOn,
        modifiedTime: article.updatedOn,
      })
      expect(meta.twitter).toMatchObject({
        card: 'summary_large_image',
        title: article.seoTitle,
        description: article.metaDescription,
      })
      expect(JSON.stringify(meta.openGraph)).toContain('/api/og?')
      expect(JSON.stringify(meta.twitter)).toContain('/api/og?')
    }
  })
})

describe('analysis index metadata', () => {
  it('keeps its own canonical, Open Graph and Twitter, plus one breadcrumb list', async () => {
    const { metadata, default: Page } = await import('@/app/intelligence/analysis/page')
    expect(metadata.alternates?.canonical).toBe('/intelligence/analysis')
    expect(metadata.openGraph).toMatchObject({
      title: metadata.title,
      description: metadata.description,
      url: '/intelligence/analysis',
      type: 'website',
    })
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    })
    const html = renderToStaticMarkup(Page() as ReactElement)
    const blocks = ldBlocks(html)
    expect(blocks.filter(b => b['@type'] === 'CollectionPage')).toHaveLength(1)
    expect(blocks.filter(b => b['@type'] === 'BreadcrumbList')).toHaveLength(1)
    const crumb = blocks.find(b => b['@type'] === 'BreadcrumbList')
    expect(crumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Intelligence', item: `${SITE_URL}/intelligence` },
      { '@type': 'ListItem', position: 3, name: 'Analysis', item: `${SITE_URL}/intelligence/analysis` },
    ])
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/intelligence"')
    expect(html).toContain('>Analysis<')
  })
})

describe('analysis RSS feed', () => {
  it('lists every analysis entry newest first and is linked from the document head', () => {
    const analysis = feedItems().filter(i => i.category === 'Analysis')
    expect(analysis.map(i => i.link).sort()).toEqual(
      ANALYSIS_ARTICLES.map(a => `${SITE_URL}/intelligence/analysis/${a.slug}`).sort(),
    )
    for (const article of ANALYSIS_ARTICLES) {
      const item = analysis.find(i => i.link === `${SITE_URL}/intelligence/analysis/${article.slug}`)!
      expect(item.title).toBe(article.headline)
      expect(item.description).toBe(article.metaDescription)
      expect(item.guid).toBe(item.link)
      expect(item.date).toBe(article.publishedOn)
    }
    for (let i = 1; i < analysis.length; i++) expect(analysis[i - 1].date >= analysis[i].date).toBe(true)
    const xml = buildRssFeed()
    let cursor = -1
    for (const item of analysis) {
      const at = xml.indexOf(`<link>${item.link}</link>`)
      expect(at).toBeGreaterThan(cursor)
      cursor = at
    }
    const layout = readFileSync('app/layout.tsx', 'utf8')
    expect(layout).toContain('<link rel="alternate" type="application/rss+xml" title="MarketplaceBeta: analysis and fee changes" href="/feed.xml" />')
  })
})
