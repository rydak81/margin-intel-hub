/**
 * RSS 2.0 feed of original MarketplaceBeta work: analysis, fee-table changes and guides.
 * Syndicated news (/news) is deliberately excluded.
 */
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { FEE_CHANGELOG, feeChangelogId } from '@/lib/fee-changelog'
import { GUIDE_PUBLISHED, OPERATOR_GUIDES } from '@/lib/operator-guides'
import { SITE_URL } from '@/lib/site-jsonld'

export interface FeedItem { title: string; link: string; guid: string; date: string; description: string; category: string }

export function feedItems(): FeedItem[] {
  const items: FeedItem[] = [
    ...ANALYSIS_ARTICLES.map((a) => ({
      title: a.headline,
      link: `${SITE_URL}/intelligence/analysis/${a.slug}`,
      guid: `${SITE_URL}/intelligence/analysis/${a.slug}`,
      date: a.publishedOn,
      description: a.metaDescription,
      category: 'Analysis',
    })),
    ...FEE_CHANGELOG.map((e) => ({
      title: `Fee change: ${e.title}`,
      link: `${SITE_URL}/fees/changelog#${feeChangelogId(e)}`,
      guid: `${SITE_URL}/fees/changelog#${feeChangelogId(e)}`,
      date: e.date,
      description: e.summary,
      category: 'Fee changes',
    })),
    ...OPERATOR_GUIDES.map((g) => ({
      title: g.title,
      link: `${SITE_URL}/guides/${g.slug}`,
      guid: `${SITE_URL}/guides/${g.slug}`,
      date: GUIDE_PUBLISHED,
      description: g.description,
      category: 'Guides',
    })),
  ]
  return items.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const rfc822 = (iso: string) => new Date(`${iso}T12:00:00Z`).toUTCString()

export function buildRssFeed(): string {
  const items = feedItems()
  const newest = items[0]?.date
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    '<title>MarketplaceBeta: analysis and fee changes</title>',
    `<link>${xml(SITE_URL)}</link>`,
    '<description>Original, source-linked analysis and dated marketplace fee changes for Amazon, Walmart, TikTok Shop, eBay and Etsy sellers.</description>',
    '<language>en-us</language>',
    ...(newest ? [`<lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    `<atom:link href="${xml(SITE_URL)}/feed.xml" rel="self" type="application/rss+xml" />`,
    ...items.map((i) => [
      '<item>',
      `<title>${xml(i.title)}</title>`,
      `<link>${xml(i.link)}</link>`,
      `<guid isPermaLink="true">${xml(i.guid)}</guid>`,
      `<pubDate>${rfc822(i.date)}</pubDate>`,
      `<category>${xml(i.category)}</category>`,
      `<description>${xml(i.description)}</description>`,
      '</item>',
    ].join('')),
    '</channel>',
    '</rss>',
    '',
  ]
  return parts.join('\n')
}
