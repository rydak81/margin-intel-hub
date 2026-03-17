import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getArticleImageUrl, isGoodArticleImage } from '@/lib/article-images'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const category = searchParams.get('category')
  const platform = searchParams.get('platform')

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
  }

  const offset = (page - 1) * limit

  try {
    // Use websearch mode for natural language queries
    let queryBuilder = supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact' })
      .textSearch('search_vector', query, { type: 'websearch' })
      .eq('relevant', true)
      .order('published_at', { ascending: false })

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }
    if (platform) {
      queryBuilder = queryBuilder.contains('platforms', [platform])
    }

    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: articles, count, error } = await queryBuilder

    if (error) {
      console.error('[Search] Error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Enrich articles with images
    const enriched = (articles || []).map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary || '',
      aiSummary: row.ai_summary || row.summary || '',
      ourTake: row.our_take || '',
      whatThisMeans: row.what_this_means || '',
      keyTakeaways: row.key_takeaways || [],
      relatedContext: row.related_context || '',
      sourceName: row.source_name,
      sourceUrl: row.source_url,
      publishedAt: row.published_at,
      imageUrl: getArticleImageUrl(
        row.image_url,
        row.title,
        row.category,
        row.platforms || []
      ),
      hasRealImage: isGoodArticleImage(row.image_url),
      relevant: row.relevant,
      relevanceScore: row.relevance_score,
      category: row.category,
      platforms: row.platforms || [],
      isBreaking: row.is_breaking || false,
      audience: row.audience || [],
      impactLevel: row.impact_level || 'medium',
      impactDetail: row.impact_detail || '',
      actionItem: row.action_item || '',
      keyStat: row.key_stat || null,
      tier: row.tier || 3,
      sourceType: row.source_type || 'industry',
    }))

    return NextResponse.json({
      success: true,
      articles: enriched,
      total: count || 0,
      page,
      limit,
      query,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error('[Search] Error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
