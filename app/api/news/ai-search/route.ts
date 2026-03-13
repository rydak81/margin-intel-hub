import { NextResponse } from 'next/server'
import { aiSearch, EXAMPLE_SEARCH_QUERIES } from '@/lib/ai-search'
import type { ClassifiedArticle } from '@/lib/ai-classifier'

// In-memory cache for articles (populated by /api/articles)
let cachedArticles: ClassifiedArticle[] = []
let cacheTimestamp: number = 0
const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

// Function to set cached articles (called from /api/articles)
export function setCachedArticlesForSearch(articles: ClassifiedArticle[]) {
  cachedArticles = articles
  cacheTimestamp = Date.now()
}

// Function to get cached articles
export function getCachedArticlesForSearch(): ClassifiedArticle[] {
  return cachedArticles
}

export function isCacheValidForSearch(): boolean {
  return cachedArticles.length > 0 && (Date.now() - cacheTimestamp) < CACHE_DURATION_MS
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // If no cached articles, try to fetch them from the articles API
    if (cachedArticles.length === 0) {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : 'http://localhost:3000'
      
      try {
        const articlesResponse = await fetch(`${baseUrl}/api/articles?limit=100`, {
          cache: 'no-store'
        })
        const articlesData = await articlesResponse.json()
        
        if (articlesData.success && articlesData.articles) {
          // Transform articles to ClassifiedArticle format
          cachedArticles = articlesData.articles.map((a: Record<string, unknown>) => ({
            id: a.id,
            title: a.title,
            summary: a.summary || a.aiSummary || '',
            sourceName: a.sourceName,
            sourceUrl: a.sourceUrl,
            publishedAt: a.publishedAt,
            imageUrl: a.imageUrl,
            tier: a.tier || 3,
            sourceType: a.sourceType || 'industry',
            relevant: true,
            relevanceScore: a.relevanceScore || 50,
            category: a.category || 'platform_updates',
            platforms: a.platforms || ['multi_platform'],
            aiSummary: a.aiSummary || a.summary || '',
            isBreaking: a.isBreaking || false,
            audience: a.audience || ['sellers'],
            impactLevel: a.impactLevel || 'medium',
            impactDetail: a.impactDetail || '',
            actionItem: a.actionItem || '',
            keyStat: a.keyStat || null,
            rejectionReason: null
          }))
          cacheTimestamp = Date.now()
        }
      } catch (fetchError) {
        console.error('[v0] Failed to fetch articles for search:', fetchError)
      }
    }

    if (cachedArticles.length === 0) {
      return NextResponse.json({
        answer: "No articles are currently available to search. Please try again later.",
        articles: [],
        suggestedQueries: EXAMPLE_SEARCH_QUERIES.slice(0, 3),
        confidence: 'low',
        query
      })
    }

    // Perform AI-powered search
    const searchResult = await aiSearch(query, cachedArticles)

    return NextResponse.json({
      success: true,
      ...searchResult
    })
  } catch (error) {
    console.error('[v0] AI Search API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed',
        answer: "Search is temporarily unavailable. Please try again.",
        articles: [],
        suggestedQueries: EXAMPLE_SEARCH_QUERIES.slice(0, 3),
        confidence: 'low'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI-powered news search endpoint. POST with { "query": "your search query" }',
    exampleQueries: EXAMPLE_SEARCH_QUERIES
  })
}
