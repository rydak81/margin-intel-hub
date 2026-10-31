import { GUIDE_UPDATED, OPERATOR_GUIDES } from '@/lib/operator-guides'
import { isOperatorRelevant } from '@/lib/operator-editorial-policy'
import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { MARKETPLACES, getAllFeeRoutes } from '@/lib/marketplace-fees'
import { getAllPairs } from '@/lib/fee-compare'
import { CHECKED_ON as AMAZON_PEAK_CHECKED, AMAZON_PEAK_PATH } from '@/lib/amazon-holiday-peak-2026'
import { FEE_CHANGELOG } from '@/lib/fee-changelog'
import { FEE_BY_PRICE_PATH, verifiedRange as feeByPriceVerified } from '@/lib/fee-by-price'
import { CHECKED_ON as TIKTOK_FEE_CHANGE_CHECKED, TIKTOK_FEE_CHANGE_PATH } from '@/lib/tiktok-fee-change-2026'
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { INDEXABLE_NEWS_SOURCE_TYPES, dedupeByTitle, isSelfCanonicalFeeCategory } from '@/lib/seo-indexing'

export const revalidate = 300

// Last substantive update to the tools / partner / community sections.
const SITE_SECTIONS_UPDATED = '2026-10-16'

// /pricing launched 2026-10-21 (#97).
const PRICING_UPDATED = '2026-10-21'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${siteUrl}/articles`,
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${siteUrl}/news`,
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${siteUrl}/newsletter`,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${siteUrl}/tools`,
    lastModified: new Date(SITE_SECTIONS_UPDATED),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${siteUrl}/pricing`,
    lastModified: new Date(PRICING_UPDATED),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  // /partners, /solutions and /community redirect (next.config.mjs), so only
  // their destinations belong in the sitemap.
  ...['sponsor'].map(path => ({
    url: `${siteUrl}/${path}`,
    lastModified: new Date(SITE_SECTIONS_UPDATED),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })),
  {
    url: `${siteUrl}/intelligence/forecasts`,
    lastModified: new Date(SITE_SECTIONS_UPDATED),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: `${siteUrl}/intelligence/pressure-index`,
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${siteUrl}/intelligence/analysis`,
    lastModified: new Date(ANALYSIS_ARTICLES.reduce((d, a) => (a.updatedOn > d ? a.updatedOn : d), '2026-01-01')),
    changeFrequency: 'daily',
    priority: 0.8,
  },
  ...ANALYSIS_ARTICLES.map(a => ({
    url: `${siteUrl}/intelligence/analysis/${a.slug}`,
    lastModified: new Date(a.updatedOn),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })),
  {
    url: `${siteUrl}/fees/changelog`,
    lastModified: new Date(FEE_CHANGELOG.reduce((d, e) => (e.date > d ? e.date : d), '2026-01-01')),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: `${siteUrl}/events`,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
]

type SitemapArticleRow = {
  id: string
  title: string
  category: string
  summary: string | null
  ai_summary: string | null
  published_at: string | null
  source_type: string | null
}

async function getArticleRoutes(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return []
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, category, summary, ai_summary, published_at, source_type')
      // Only first-party posts; ingested briefings are noindex (lib/seo-indexing.ts).
      .in('source_type', [...INDEXABLE_NEWS_SOURCE_TYPES])
      .eq('relevant', true)
      .gte('relevance_score', 40)
      .order('published_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.warn('[sitemap] Failed to load article URLs:', error.message)
      return []
    }

    return dedupeByTitle((data ?? []) as SitemapArticleRow[]).filter(article => isOperatorRelevant({ ...article, summary: article.summary || "", aiSummary: article.ai_summary || "" })).map((article) => ({
      url: `${siteUrl}/news/${article.id}`,
      ...(article.published_at && Number.isFinite(Date.parse(article.published_at)) ? { lastModified: new Date(article.published_at) } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (error) {
    console.warn('[sitemap] Unexpected error building sitemap:', error)
    return []
  }
}

/**
 * Fee pages are statically generated from a local dataset, so they can be
 * enumerated synchronously — no database round-trip needed.
 */
function getFeeRoutes(): MetadataRoute.Sitemap {
  const hub: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/fees`,
      lastModified: new Date(Math.max(...MARKETPLACES.map(m => Date.parse(m.lastVerified)))),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...MARKETPLACES.map((marketplace) => ({
      url: `${siteUrl}/fees/${marketplace.slug}`,
      lastModified: new Date(marketplace.lastVerified),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  // TikTok Shop and Etsy category pages canonicalise to their marketplace page
  // (lib/seo-indexing.ts), so only self-canonical category pages are listed.
  const categories: MetadataRoute.Sitemap = getAllFeeRoutes().filter((route) => isSelfCanonicalFeeCategory(route.marketplace)).map((route) => ({
    url: `${siteUrl}/fees/${route.marketplace}/${route.category}`,
    lastModified: new Date(MARKETPLACES.find(m => m.slug === route.marketplace)!.lastVerified),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Amazon holiday peak explainer sits with the hub so it inherits fee-hub priority.
  hub.push({ url: `${siteUrl}${AMAZON_PEAK_PATH}`, lastModified: new Date(AMAZON_PEAK_CHECKED), changeFrequency: 'weekly', priority: 0.8 })

  const comparisons: MetadataRoute.Sitemap = getAllPairs().map((pair) => ({
    url: `${siteUrl}/fees/compare/${pair.slug}`,
    lastModified: new Date(Math.max(Date.parse(pair.a.lastVerified), Date.parse(pair.b.lastVerified))),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // The "$N sale" pages are noindex (lib/seo-indexing.ts), so they are not listed.

  const explainers: MetadataRoute.Sitemap = [
    { url: `${siteUrl}${TIKTOK_FEE_CHANGE_PATH}`, lastModified: new Date(TIKTOK_FEE_CHANGE_CHECKED), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}${FEE_BY_PRICE_PATH}`, lastModified: new Date(feeByPriceVerified().newest), changeFrequency: 'weekly', priority: 0.8 },
  ]

  return [...hub, ...explainers, ...comparisons, ...categories]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articleRoutes = await getArticleRoutes()

  return [...staticRoutes,
    { url: `${siteUrl}/desktop-manufacturing`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/intelligence`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/intelligence/dossier`, changeFrequency: 'monthly', priority: 0.8 },
    ...['guides', ...OPERATOR_GUIDES.map(guide => `guides/${guide.slug}`)].map(path => ({ url: `${siteUrl}/${path}`, lastModified: new Date(GUIDE_UPDATED), changeFrequency: 'monthly' as const, priority: path.startsWith('guides') ? 0.8 : 0.5 })),
    ...['about', 'editorial-policy'].map(path => ({ url: `${siteUrl}/${path}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...getFeeRoutes(), ...articleRoutes]
}
