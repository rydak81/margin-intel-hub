import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // ── Static pages ──
  const staticPages = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/articles', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/newsletter', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/tools', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/events', changeFrequency: 'weekly' as const, priority: 0.6 },
    { path: '/community', changeFrequency: 'daily' as const, priority: 0.7 },
    { path: '/solutions', changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  for (const page of staticPages) {
    entries.push({
      url: `https://marketplacebeta.com${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // ── Dynamic article pages ──
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: articles } = await supabase
        .from('articles')
        .select('id, published_at')
        .eq('relevant', true)
        .gte('relevance_score', 50)
        .order('published_at', { ascending: false })
        .limit(500)

      if (articles) {
        for (const article of articles) {
          entries.push({
            url: `https://marketplacebeta.com/news/${article.id}`,
            lastModified: new Date(article.published_at),
            changeFrequency: 'weekly',
            priority: 0.8,
          })
        }
      }
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching articles:', error)
    // Return static pages even if article fetch fails
  }

  return entries
}
