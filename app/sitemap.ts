import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${siteUrl}/articles`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${siteUrl}/newsletter`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${siteUrl}/tools`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${siteUrl}/events`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    url: `${siteUrl}/community`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  },
  {
    url: `${siteUrl}/solutions`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
]

type SitemapArticleRow = {
  id: string
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
      .select('id, published_at')
      .eq('relevant', true)
      .gte('relevance_score', 30)
      .order('published_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.warn('[sitemap] Failed to load article URLs:', error.message)
      return []
    }

    return ((data ?? []) as SitemapArticleRow[]).map((article) => ({
      url: `${siteUrl}/news/${article.id}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (error) {
    console.warn('[sitemap] Unexpected error building sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articleRoutes = await getArticleRoutes()

  return [...staticRoutes, ...articleRoutes]
}
