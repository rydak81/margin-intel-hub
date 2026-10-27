import { NextRequest } from 'next/server'
import { GET } from '@/app/api/articles/search/route'

export interface InitialArticle {
  id: string
  title: string
  summary: string
  category: string
  sourceName: string
  publishedAt: string
  imageUrl?: string
  platforms?: string[]
  impactLevel?: 'high' | 'medium' | 'low'
  relevanceScore?: number
}

export interface InitialArticlesData {
  articles: InitialArticle[]
  total: number
  facets: {
    categories: Record<string, number>
    platforms: Record<string, number>
    impactLevels: Record<string, number>
  }
}

/** Shapes the search API's JSON into the server-rendered initial state; null when it is unusable. */
export function parseInitialArticles(body: unknown): InitialArticlesData | null {
  const data = body as Partial<InitialArticlesData> & { success?: boolean } | null
  if (!data || data.success !== true || !Array.isArray(data.articles) || data.articles.length === 0) return null
  return {
    articles: data.articles,
    total: typeof data.total === 'number' ? data.total : data.articles.length,
    facets: data.facets ?? { categories: {}, platforms: {}, impactLevels: {} },
  }
}

/**
 * First page of the default archive view (newest first, 12 items), produced by
 * the same handler that serves /api/articles/search so the server-rendered
 * list is exactly what the browser would fetch. Returns null on any failure
 * (missing credentials, query error); the page then falls back to the
 * client-side fetch.
 */
export async function loadInitialArticles(): Promise<InitialArticlesData | null> {
  try {
    const request = new NextRequest('http://localhost/api/articles/search?sort=newest&limit=12&offset=0')
    const response = await GET(request)
    if (!response.ok) return null
    return parseInitialArticles(await response.json())
  } catch (error) {
    console.warn('[articles] Initial server render fell back to client fetch:', error)
    return null
  }
}
