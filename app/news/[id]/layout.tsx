import { Metadata } from 'next'
import { isOperatorRelevant } from '@/lib/operator-editorial-policy'
import { newsArticleMetadataFields } from '@/lib/news-article-seo'
import { isIndexableNewsArticle } from '@/lib/seo-indexing'
import { createClient } from '@supabase/supabase-js'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return { title: 'MarketplaceBeta' }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: article } = await supabase
    .from('articles')
    .select('id, title, ai_summary, summary, image_url, source_name, source_type, category, impact_level, platforms, relevant, published_at, updated_at')
    .eq('id', id)
    .single()

  if (!article) {
    return { title: 'Article Not Found | MarketplaceBeta', robots: { index: false, follow: true } }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
  // Use dynamic OG image generator for all articles (branded, consistent)
  const imageUrl = article.image_url || `${siteUrl}/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category || '')}&impact=${encodeURIComponent(article.impact_level || '')}`

  return {
    ...newsArticleMetadataFields({
      id: article.id,
      title: article.title,
      aiSummary: article.ai_summary,
      summary: article.summary,
      sourceName: article.source_name,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      imageUrl,
      siteUrl,
    }),
    // Ingested third-party briefings are noindex,follow; see lib/seo-indexing.ts.
    robots: { index: isIndexableNewsArticle(article) && isOperatorRelevant({ ...article, aiSummary: article.ai_summary }), follow: true },
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
