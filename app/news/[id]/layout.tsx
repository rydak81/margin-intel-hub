import { Metadata } from 'next'
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
    .select('id, title, ai_summary, summary, image_url, source_name, category, impact_level, platforms')
    .eq('id', id)
    .single()

  if (!article) {
    return { title: 'Article Not Found | MarketplaceBeta' }
  }

  const description = article.ai_summary || article.summary || 'Read the full analysis on MarketplaceBeta'
  const truncatedDesc = description.length > 200 ? description.substring(0, 197) + '...' : description
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
  // Use dynamic OG image generator for all articles (branded, consistent)
  const imageUrl = article.image_url || `${siteUrl}/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category || '')}&impact=${encodeURIComponent(article.impact_level || '')}`
  const articleUrl = `${siteUrl}/news/${article.id}`

  return {
    title: `${article.title} | MarketplaceBeta`,
    description: truncatedDesc,
    openGraph: {
      title: article.title,
      description: truncatedDesc,
      url: articleUrl,
      siteName: 'MarketplaceBeta',
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: truncatedDesc,
      images: [imageUrl],
    },
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
