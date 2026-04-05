import { NextResponse } from "next/server"
import { getArticleImageUrl, isGoodArticleImage } from "@/lib/article-images"
import { curateArticleFeed } from "@/lib/feed-curation"
import { getArticleDeskScore } from "@/lib/source-intelligence"
import { createAdminClient, hasAdminConfig } from "@/lib/supabase/admin"
import {
  getArticlesCache,
  setArticlesCache,
  isCacheValid,
  getLastCacheUpdate
} from "@/lib/article-store"

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

// ============================================================================
// API ROUTE HANDLER — Serves articles from Supabase only (no RSS fetching)
// Aggregation is handled by /api/news/aggregate via Vercel cron
// ============================================================================

export async function GET(request: Request) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials',
        articles: getArticlesCache().slice(0, 30),
      }, { status: 503 })
    }
    const supabaseAdmin = createAdminClient()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '60'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const audience = searchParams.get('audience')
    const impactLevel = searchParams.get('impact')

    // Check in-memory cache first (instant response)
    const cacheValid = isCacheValid()

    if (cacheValid) {
      console.log('[articles] Serving from in-memory cache')
    } else {
      // Load from Supabase (fast DB read, ~200ms)
      console.log('[articles] Cache cold — loading from Supabase...')

      const query = supabaseAdmin
        .from('articles')
        .select('*')
        .eq('relevant', true)
        .gte('relevance_score', 40)
        .order('published_at', { ascending: false })
        .limit(320)

      const { data: dbArticles, error } = await query

      if (error) {
        console.warn('[articles] Supabase query error:', error.message)
      } else if (dbArticles && dbArticles.length > 0) {
        console.log(`[articles] Loaded ${dbArticles.length} articles from Supabase`)
        // Convert DB rows to cache format and store
        const mapped = dbArticles.map(dbRowToArticle)
        setArticlesCache(curateArticleFeed(mapped, { limit: 180, maxPerTopic: 2 }))
      } else {
        console.log('[articles] No articles in database — cron job will populate soon')
      }
    }

    const articlesCache = getArticlesCache()
    let articles = [...articlesCache]

    // Apply filters
    if (category) {
      articles = articles.filter(a => a.category === category)
    }
    if (platform) {
      articles = articles.filter(a => a.platforms.includes(platform))
    }
    if (audience) {
      articles = articles.filter(a => a.audience?.includes(audience))
    }
    if (impactLevel) {
      articles = articles.filter(a => a.impactLevel === impactLevel)
    }

    articles = curateArticleFeed(articles, {
      maxPerTopic: category || platform || audience || impactLevel ? 3 : 2,
    })
    articles.sort((a, b) => getArticleDeskScore(b) - getArticleDeskScore(a))

    // Calculate breakdown stats
    const byCategory: Record<string, number> = {}
    const byImpact = { high: 0, medium: 0, low: 0 }
    const byAudience: Record<string, number> = {}

    articlesCache.forEach(a => {
      byCategory[a.category] = (byCategory[a.category] || 0) + 1
      if (a.impactLevel) byImpact[a.impactLevel as keyof typeof byImpact]++
      a.audience?.forEach((aud: string) => {
        byAudience[aud] = (byAudience[aud] || 0) + 1
      })
    })

    // Apply offset + limit pagination
    const paginatedArticles = articles.slice(offset, offset + limit)

    // Enrich articles with stock fallback images and sourceTier
    const enrichedArticles = paginatedArticles.map(article => ({
      ...article,
      sourceTier: article.tier,
      imageUrl: getArticleImageUrl(
        article.imageUrl,
        article.title,
        article.category,
        article.platforms || [],
        article.fullContent
      ),
      hasRealImage: isGoodArticleImage(article.imageUrl),
    }))

    return NextResponse.json({
      success: true,
      articles: enrichedArticles,
      totalCount: articles.length,
      aiClassified: true,
      cacheHit: cacheValid,
      stats: {
        byCategory,
        byImpact,
        byAudience,
      },
      meta: {
        lastUpdate: new Date(getLastCacheUpdate()).toISOString(),
        source: 'supabase',
      }
    })

  } catch (error) {
    console.error('[articles] API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch articles',
      articles: getArticlesCache().slice(0, 30), // Return stale cache on error
    }, { status: 500 })
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function dbRowToArticle(row: any) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary || '',
    fullContent: row.full_content || '',
    aiSummary: row.ai_summary || row.summary || '',
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    imageUrl: row.image_url || undefined,
    originalRssImage: row.original_rss_image || undefined,
    hasRealImage: row.has_real_image || false,
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
    ourTake: row.our_take || '',
    whatThisMeans: row.what_this_means || '',
    keyTakeaways: row.key_takeaways || [],
    relatedContext: row.related_context || '',
    bottomLine: row.bottom_line || '',
    rejectionReason: row.rejection_reason || null,
    tier: row.tier || 3,
    sourceType: row.source_type || 'industry',
  }
}
