import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, hasAdminConfig } from '@/lib/supabase/admin'
import { curateArticleFeed } from '@/lib/feed-curation'

type CategoryFacetRow = { category: string | null }
type PlatformFacetRow = { platforms: string[] | null }
type ImpactFacetRow = { impact_level: string | null }
type SearchArticleRow = {
  id: string
  title: string
  summary: string | null
  category: string | null
  source_name: string | null
  source_type?: "industry" | "google" | null
  published_at: string
  image_url: string | null
  platforms: string[] | null
  impact_level: 'high' | 'medium' | 'low' | null
  relevance_score: number | null
  audience: string[] | null
  is_breaking?: boolean | null
}

function parseList(str?: string): string[] {
  if (!str) return []
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0)
}

type SearchFilters = {
  q: string
  category?: string | null
  platforms: string[]
  impact?: string | null
  audience?: string | null
}

function applyFilters<T>(query: T, filters: SearchFilters): T {
  let next = (query as any)
    .eq('relevant', true)
    .gte('relevance_score', 40)

  if (filters.q.trim()) {
    next = next.or(`title.ilike.%${filters.q}%,summary.ilike.%${filters.q}%,ai_summary.ilike.%${filters.q}%`)
  }
  if (filters.category) next = next.eq('category', filters.category)
  if (filters.platforms.length > 0) next = next.filter('platforms', 'cs', JSON.stringify(filters.platforms))
  if (filters.impact) next = next.eq('impact_level', filters.impact)
  if (filters.audience) next = next.filter('audience', 'cs', JSON.stringify([filters.audience]))

  return next
}

export async function GET(request: NextRequest) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 503 }
      )
    }

    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const platforms = parseList(searchParams.get('platforms') || '')
    const impact = searchParams.get('impact')
    const audience = searchParams.get('audience')
    const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'relevant' | 'impact'
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
    const rawWindow = Math.min(Math.max((offset + limit) * 4, 80), 320)
    const filters: SearchFilters = { q, category, platforms, impact, audience }

    let query = applyFilters(
      supabase
        .from('articles')
        .select('id, title, summary, category, source_name, source_type, published_at, image_url, platforms, impact_level, relevance_score, audience, is_breaking'),
      filters
    )

    switch (sort) {
      case 'oldest':
        query = query.order('published_at', { ascending: true })
        break
      case 'relevant':
        query = query.order('relevance_score', { ascending: false })
        break
      case 'impact':
        query = query.order('impact_level', { ascending: true }).order('published_at', { ascending: false })
        break
      default:
        query = query.order('published_at', { ascending: false })
        break
    }

    query = query.limit(rawWindow)
    const { data, error } = await query

    if (error) {
      console.error('Search query error:', error)
      return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 })
    }

    const { data: categoryData } = await applyFilters(
      supabase
        .from('articles')
        .select('category'),
      { q, platforms, impact, audience }
    )
    const categoryFacets: Record<string, number> = {}
    ;((categoryData as CategoryFacetRow[] | null) || []).forEach((item) => {
      if (item.category) categoryFacets[item.category] = (categoryFacets[item.category] || 0) + 1
    })

    const { data: platformData } = await applyFilters(
      supabase
        .from('articles')
        .select('platforms'),
      { q, category, impact, audience, platforms: [] }
    )
    const platformFacets: Record<string, number> = {}
    ;((platformData as PlatformFacetRow[] | null) || []).forEach((item) => {
      if (item.platforms && Array.isArray(item.platforms)) {
        item.platforms.forEach((platform) => {
          platformFacets[platform] = (platformFacets[platform] || 0) + 1
        })
      }
    })

    const { data: impactData } = await applyFilters(
      supabase
        .from('articles')
        .select('impact_level'),
      { q, category, platforms, audience }
    )
    const impactFacets: Record<string, number> = {}
    ;((impactData as ImpactFacetRow[] | null) || []).forEach((item) => {
      if (item.impact_level) impactFacets[item.impact_level] = (impactFacets[item.impact_level] || 0) + 1
    })

    const allArticles = (((data as SearchArticleRow[] | null) || []).map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary || '',
      category: article.category || 'general',
      sourceName: article.source_name || 'Unknown Source',
      sourceType: article.source_type || 'industry',
      publishedAt: article.published_at,
      imageUrl: article.image_url || undefined,
      platforms: article.platforms || [],
      impactLevel: article.impact_level || undefined,
      relevanceScore: article.relevance_score || 0,
      audience: article.audience || [],
      isBreaking: article.is_breaking || false,
    })))

    if (sort === 'impact') {
      const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
      allArticles.sort((a, b) => {
        const impactA = impactOrder[a.impactLevel || 'low'] ?? 3
        const impactB = impactOrder[b.impactLevel || 'low'] ?? 3
        if (impactA !== impactB) return impactA - impactB
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
    }

    const curatedArticles = curateArticleFeed(allArticles, {
      maxPerTopic: q.trim() || category || platforms.length > 0 ? 3 : 2,
    })
    const articles = curatedArticles.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      articles,
      total: curatedArticles.length,
      facets: { categories: categoryFacets, platforms: platformFacets, impactLevels: impactFacets },
      appliedFilters: {
        query: q,
        category: category || null,
        platforms,
        impact: impact || null,
        audience: audience || null,
      },
    })
  } catch (error) {
    console.error('Article search error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
