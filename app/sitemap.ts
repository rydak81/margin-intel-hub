import { GUIDE_UPDATED, OPERATOR_GUIDES } from '@/lib/operator-guides'
import { isOperatorRelevant } from '@/lib/operator-editorial-policy'
import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { MARKETPLACES, getAllFeeRoutes } from '@/lib/marketplace-fees'
import { getAllPairs } from '@/lib/fee-compare'
import { getAllSaleRoutes, salePath } from '@/lib/sale-fee-pages'
import { FEE_CHANGELOG } from '@/lib/fee-changelog'

export const revalidate = 300

// Last substantive update to the tools / partner / community sections.
const SITE_SECTIONS_UPDATED = '2026-10-16'

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
  ...['tools/repricer', 'tools/repricer/history', 'tools/repricer/sourcing'].map(path => ({
    url: `${siteUrl}/${path}`,
    lastModified: new Date(SITE_SECTIONS_UPDATED),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })),
  ...['partners', 'solutions', 'community', 'sponsor'].map(path => ({
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
      .select('id, title, category, summary, ai_summary, published_at')
      .eq('relevant', true)
      .gte('relevance_score', 40)
      .order('published_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.warn('[sitemap] Failed to load article URLs:', error.message)
      return []
    }

    return ((data ?? []) as SitemapArticleRow[]).filter(article => isOperatorRelevant({ ...article, summary: article.summary || "", aiSummary: article.ai_summary || "" })).map((article) => ({
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
    {
      url: `${siteUrl}/fees/compare`,
      lastModified: new Date(Math.max(...MARKETPLACES.map(m => Date.parse(m.lastVerified)))),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...MARKETPLACES.map((marketplace) => ({
      url: `${siteUrl}/fees/${marketplace.slug}`,
      lastModified: new Date(marketplace.lastVerified),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  const categories: MetadataRoute.Sitemap = getAllFeeRoutes().map((route) => ({
    url: `${siteUrl}/fees/${route.marketplace}/${route.category}`,
    lastModified: new Date(MARKETPLACES.find(m => m.slug === route.marketplace)!.lastVerified),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const comparisons: MetadataRoute.Sitemap = getAllPairs().map((pair) => ({
    url: `${siteUrl}/fees/compare/${pair.slug}`,
    lastModified: new Date(Math.max(Date.parse(pair.a.lastVerified), Date.parse(pair.b.lastVerified))),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const sales: MetadataRoute.Sitemap = getAllSaleRoutes().map((route) => ({
    url: `${siteUrl}${salePath(route.marketplace, Number(route.price))}`,
    lastModified: new Date(MARKETPLACES.find(m => m.slug === route.marketplace)!.lastVerified),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...hub, ...comparisons, ...categories, ...sales]
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
