import { getArticles, getBreakingNews } from '@/lib/news-aggregation'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category') || undefined
    const platform = searchParams.get('platform') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'relevance' | 'trending') || 'recent'
    const breaking = searchParams.get('breaking') === 'true'

    // If requesting breaking news only
    if (breaking) {
      const breakingArticles = await getBreakingNews(limit)
      return NextResponse.json({
        articles: breakingArticles,
        total: breakingArticles.length,
        hasMore: false
      })
    }

    // Get articles with filters
    const articles = await getArticles({
      category,
      platform,
      search,
      limit,
      offset,
      sortBy
    })

    return NextResponse.json({
      articles,
      total: articles.length,
      offset,
      limit,
      hasMore: articles.length === limit
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: String(error) },
      { status: 500 }
    )
  }
}
