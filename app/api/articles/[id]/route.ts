import { NextResponse } from 'next/server'
import { getArticleById, getRelatedArticles } from '@/lib/article-store'
import { getArticleImageUrl, isGoodArticleImage } from '@/lib/article-images'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const article = await getArticleById(id)

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Enrich with image
    const enriched = {
      ...article,
      imageUrl: getArticleImageUrl(
        article.imageUrl,
        article.title,
        article.category,
        article.platforms || []
      ),
      hasRealImage: isGoodArticleImage(article.imageUrl),
    }

    // Get related articles
    const related = await getRelatedArticles(id, article.category, 4)
    const enrichedRelated = related.map(a => ({
      ...a,
      imageUrl: getArticleImageUrl(
        a.imageUrl,
        a.title,
        a.category,
        a.platforms || []
      ),
    }))

    return NextResponse.json({
      success: true,
      article: enriched,
      relatedArticles: enrichedRelated,
    })
  } catch (error) {
    console.error('[API] Article detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
