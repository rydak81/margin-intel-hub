import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANALYSIS_ARTICLES, latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { BRIEF_CTA_KEYS } from '@/lib/brief-cta'
import { HOMEPAGE_LATEST_ANALYSIS_COUNT, homepageLatestAnalysis } from '@/lib/homepage-latest'
import { newsletterSource } from '@/lib/newsletter-source'
import { HomepageLatestAnalysis } from '@/components/homepage-latest-analysis'

function article(partial: Pick<AnalysisArticle, 'slug' | 'publishedOn' | 'headline' | 'dek'> & Partial<Pick<AnalysisArticle, 'updatedOn' | 'takeaway'>>): AnalysisArticle {
  return {
    slug: partial.slug,
    seoTitle: partial.headline.slice(0, 40),
    metaDescription: partial.dek.slice(0, 80),
    headline: partial.headline,
    dek: partial.dek,
    publishedOn: partial.publishedOn,
    updatedOn: partial.updatedOn ?? partial.publishedOn,
    author: 'Test',
    readTime: '1 min',
    tags: [],
    takeaway: partial.takeaway ?? 'Takeaway that must not be used as the card summary.',
    forecastIds: [],
    newsletterSource: 'campaign_test',
    sections: [],
    sources: [],
  }
}

describe('homepage latest analysis selection', () => {
  const articles = [
    article({ slug: 'older', publishedOn: '2026-01-02', headline: 'Older piece', dek: 'Older summary.' }),
    article({ slug: 'tie-b', publishedOn: '2026-06-01', updatedOn: '2026-12-01', headline: 'Tie B', dek: 'Summary B.', takeaway: 'Not B.' }),
    article({ slug: 'newest', publishedOn: '2026-11-06', headline: 'Newest piece', dek: 'Newest summary.' }),
    article({ slug: 'tie-a', publishedOn: '2026-06-01', headline: 'Tie A', dek: 'Summary A.' }),
    article({ slug: 'oldest', publishedOn: '2026-01-01', headline: 'Oldest piece', dek: 'Oldest summary.' }),
  ]

  it('picks the newest entries by publish date and keeps same-day file order', () => {
    expect(homepageLatestAnalysis(3, articles).map(card => card.slug)).toEqual(['newest', 'tie-b', 'tie-a'])
  })

  it('maps headline, publish date, and dek onto the card, and ignores a later update', () => {
    const [first, second] = homepageLatestAnalysis(2, articles)
    expect(first).toEqual({
      slug: 'newest',
      title: 'Newest piece',
      date: '2026-11-06',
      dateLabel: 'Nov 6, 2026',
      summary: 'Newest summary.',
      href: '/intelligence/analysis/newest',
    })
    expect(second.summary).toBe('Summary B.')
    expect(second.summary).not.toBe('Not B.')
    expect(second.date).toBe('2026-06-01')
  })

  it('honours the limit and returns nothing when asked for none', () => {
    expect(homepageLatestAnalysis(1, articles)).toHaveLength(1)
    expect(homepageLatestAnalysis(0, articles)).toEqual([])
    expect(homepageLatestAnalysis(10, articles)).toHaveLength(articles.length)
    expect(homepageLatestAnalysis(4, [])).toEqual([])
  })

  it('uses the homepage count against the live catalog, newest first', () => {
    expect(HOMEPAGE_LATEST_ANALYSIS_COUNT).toBeGreaterThanOrEqual(3)
    expect(HOMEPAGE_LATEST_ANALYSIS_COUNT).toBeLessThanOrEqual(5)
    const cards = homepageLatestAnalysis()
    const expected = latestAnalysis(HOMEPAGE_LATEST_ANALYSIS_COUNT)
    expect(cards.map(card => card.slug)).toEqual(expected.map(article => article.slug))
    expect(cards).toHaveLength(Math.min(HOMEPAGE_LATEST_ANALYSIS_COUNT, ANALYSIS_ARTICLES.length))
    for (let i = 1; i < cards.length; i++) expect(cards[i - 1].date >= cards[i].date).toBe(true)
    for (const card of cards) {
      const source = expected.find(article => article.slug === card.slug)!
      expect(card.title).toBe(source.headline)
      expect(card.summary).toBe(source.dek)
      expect(card.href).toBe(`/intelligence/analysis/${card.slug}`)
    }
  })
})

describe('homepage Daily Brief campaign', () => {
  it('uses an allowlisted campaign id', () => {
    expect(BRIEF_CTA_KEYS.homeLatest).toBe('campaign_home_latest')
    expect(newsletterSource(`?source=${BRIEF_CTA_KEYS.homeLatest}`)).toBe('newsletter_campaign_home_latest')
  })
})

describe('homepage wiring', () => {
  it('renders title, date, summary, and a link for each selected article', () => {
    const cards = homepageLatestAnalysis(2, [
      article({ slug: 'ebay-example', publishedOn: '2026-11-06', headline: 'eBay fee example', dek: 'A one-line fee summary.' }),
    ])
    expect(cards[0].dateLabel).toBe('Nov 6, 2026')
    const html = renderToStaticMarkup(createElement(HomepageLatestAnalysis, { articles: cards }) as ReactElement)
    expect(html).toContain('Latest analysis')
    expect(html).toContain('href="/intelligence/analysis/ebay-example"')
    expect(html).toContain('eBay fee example')
    expect(html).toContain('A one-line fee summary.')
    expect(html).toContain('dateTime="2026-11-06"')
    expect(html).toContain('Nov 6, 2026')
    expect(html).toContain('href="/intelligence/analysis"')
    expect(renderToStaticMarkup(createElement(HomepageLatestAnalysis, { articles: [] }) as ReactElement)).toBe('')
  })

  it('places the campaign signup and the selected articles on the homepage', () => {
    const home = readFileSync(join(process.cwd(), 'components/home-page-client.tsx'), 'utf8')
    const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8')
    expect(home).toContain('BRIEF_CTA_KEYS.homeLatest')
    expect(home).toContain('<HomepageLatestAnalysis')
    expect(page).toContain('homepageLatestAnalysis()')
  })
})
