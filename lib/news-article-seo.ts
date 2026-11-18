/**
 * Head tags and NewsArticle JSON-LD for /news/[id].
 *
 * Titles, descriptions and dates come only from the article row. There is no
 * author column on `articles`, so these helpers never emit an author.
 * dateModified is the row's updated_at, never a copy of published_at.
 */
import type { Metadata } from 'next'
import type { AnalysisArticle } from '@/lib/analysis'
import { datedSummary } from '@/lib/news-freshness'
import { relatedAnalysisForMarketplace } from '@/lib/related-links'
import type { MarketplaceSlug } from '@/lib/marketplace-fees'
import { splitSourceSuffix, withheldSummaryDescription } from '@/lib/seo-indexing'
import { ORGANIZATION_ID } from '@/lib/site-jsonld'

/** Cap for the end-of-article analysis links. */
export const NEWS_ANALYSIS_LIMIT = 3

const PLATFORM_SLUGS: Record<string, MarketplaceSlug> = {
  amazon: 'amazon',
  walmart: 'walmart',
  ebay: 'ebay',
  etsy: 'etsy',
  tiktok: 'tiktok-shop',
  tiktok_shop: 'tiktok-shop',
}

export type NewsArticleSeoInput = {
  id: string
  title: string
  summary?: string | null
  aiSummary?: string | null
  sourceName?: string | null
  sourceUrl?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
}

/** ISO-8601 timestamp, or undefined when the row has no parseable value. */
export function validIsoTimestamp(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) return undefined
  return new Date(parsed).toISOString()
}

function truncateDescription(description: string): string {
  return description.length > 200 ? `${description.substring(0, 197)}...` : description
}

/** Document title (without the site suffix) and the meta description. */
export function newsArticleCopy(article: NewsArticleSeoInput): { headline: string; description: string } {
  const { headline, publisher } = splitSourceSuffix(article.title, article.sourceName)
  const source = publisher ?? article.sourceName
  const raw = (article.aiSummary || article.summary || '').trim()
  const description = raw
    ? (() => {
        const dated = datedSummary(raw, article.publishedAt ?? '')
        return dated === raw ? dated : withheldSummaryDescription(headline, source, article.publishedAt)
      })()
    : withheldSummaryDescription(headline, source, article.publishedAt)
  return { headline, description: truncateDescription(description) }
}

export function newsArticleMetadataFields(
  article: NewsArticleSeoInput & { imageUrl: string; siteUrl: string },
): Pick<Metadata, 'title' | 'description' | 'authors' | 'alternates' | 'openGraph' | 'twitter'> {
  const { headline, description } = newsArticleCopy(article)
  const articleUrl = `${article.siteUrl}/news/${article.id}`
  const publishedTime = validIsoTimestamp(article.publishedAt)
  const modifiedTime = validIsoTimestamp(article.updatedAt)
  return {
    title: `${headline} | MarketplaceBeta`,
    description,
    // The articles table has no author. Null clears the root layout's site-wide author.
    authors: null,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: 'MarketplaceBeta',
      type: 'article',
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      images: [{ url: article.imageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [article.imageUrl],
    },
  }
}

export type NewsArticleJsonLd = {
  '@context': 'https://schema.org'
  '@type': 'NewsArticle'
  headline: string
  description: string
  datePublished?: string
  dateModified?: string
  image?: string[]
  mainEntityOfPage: string
  publisher: {
    '@type': 'Organization'
    '@id': string
    name: 'MarketplaceBeta'
    url: string
  }
  isBasedOn?: {
    '@type': 'CreativeWork'
    url: string
    publisher?: { '@type': 'Organization'; name: string }
  }
}

export function newsArticleJsonLd(article: NewsArticleSeoInput & { image?: string | null }, siteUrl: string): NewsArticleJsonLd {
  const { headline, description } = newsArticleCopy(article)
  const datePublished = validIsoTimestamp(article.publishedAt)
  const dateModified = validIsoTimestamp(article.updatedAt)
  const sourceName = article.sourceName?.trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(article.image ? { image: [article.image] } : {}),
    mainEntityOfPage: `${siteUrl}/news/${article.id}`,
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'MarketplaceBeta',
      url: siteUrl,
    },
    ...(article.sourceUrl
      ? {
          isBasedOn: {
            '@type': 'CreativeWork',
            url: article.sourceUrl,
            ...(sourceName ? { publisher: { '@type': 'Organization' as const, name: sourceName } } : {}),
          },
        }
      : {}),
  }
}

function platformSlug(platform: string): MarketplaceSlug | undefined {
  const key = platform.trim().toLowerCase().replace(/[\s-]+/g, '_')
  return PLATFORM_SLUGS[key]
}

/** Marketplace slugs an article's platform tags map to, in tag order, deduped. */
export function newsMarketplaceSlugs(platforms: readonly string[] | null | undefined): MarketplaceSlug[] {
  const slugs: MarketplaceSlug[] = []
  for (const platform of platforms ?? []) {
    const slug = platformSlug(platform)
    if (slug && !slugs.includes(slug)) slugs.push(slug)
  }
  return slugs
}

/**
 * Up to three analysis articles that cover a marketplace named on the news
 * article. No match (Shopify, Target, an empty tag list) returns nothing,
 * rather than the newest analysis on an unrelated marketplace.
 */
export function relatedAnalysisForNews(platforms: readonly string[] | null | undefined): AnalysisArticle[] {
  const lists = newsMarketplaceSlugs(platforms).map(slug => relatedAnalysisForMarketplace(slug, NEWS_ANALYSIS_LIMIT))
  const seen = new Set<string>()
  const picked: AnalysisArticle[] = []
  const depth = Math.max(0, ...lists.map(list => list.length))
  for (let i = 0; i < depth && picked.length < NEWS_ANALYSIS_LIMIT; i++) {
    for (const list of lists) {
      const article = list[i]
      if (!article || seen.has(article.slug)) continue
      seen.add(article.slug)
      picked.push(article)
      if (picked.length >= NEWS_ANALYSIS_LIMIT) break
    }
  }
  return picked
}
