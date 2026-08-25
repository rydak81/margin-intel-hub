import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, hasAdminConfig } from '@/lib/supabase/admin'
import { curateArticleFeed } from '@/lib/feed-curation'
import { resolveArticleImage } from '@/lib/article-images'

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
  search_rank?: number
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

/**
 * Applies filters to a PostgREST query builder. Text queries go through
 * Postgres full-text search on the weighted search_vector column (websearch
 * syntax: multi-word, "quoted phrases", OR, -exclusions) rather than ilike
 * substring matching.
 */
function applyFilters<T>(query: T, filters: SearchFilters): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let next = (query as any)

  // Quality gate is unconditional: the classifier deliberately keeps rejected
  // rows (relevant=false) in the table, and the aggregator inserts new rows as
  // relevant=true score 50 — so this never empties the default view, it only
  // keeps explicitly-rejected content out of it.
  next = next.eq('relevant', true).gte('relevance_score', 40)

  if (filters.q.trim()) {
    next = next.textSearch('search_vector', filters.q.trim(), { type: 'websearch', config: 'english' })
  }
  if (filters.category) next = next.eq('category', filters.category)
  if (filters.platforms.length > 0) next = next.contains('platforms', filters.platforms)
  if (filters.impact) next = next.eq('impact_level', filters.impact)
  if (filters.audience) next = next.contains('audience', [filters.audience])

  return next
}

/** Junk-summary rows the classifier flagged but never cleaned up. */
function isSubstantive(summary: string): boolean {
  const lower = summary.toLowerCase()
  return !lower.includes('no substantive content')
    && !lower.includes('no data, policy change')
    && !lower.includes('article summary contains only')
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
    const q = (searchParams.get('q') || '').trim()
    const category = searchParams.get('category')
    const platforms = parseList(searchParams.get('platforms') || '')
    const impact = searchParams.get('impact')
    const audience = searchParams.get('audience')
    const sort = (searchParams.get('sort') || (q ? 'relevant' : 'newest')) as 'newest' | 'oldest' | 'relevant' | 'impact'
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
    const rawWindow = Math.min(Math.max((offset + limit) * 4, 80), 320)
    const filters: SearchFilters = { q, category, platforms, impact, audience }

    let data: SearchArticleRow[] | null = null
    let error: { message: string } | null = null

    if (q && sort === 'relevant') {
      // Rank-ordered path: the RPC blends match quality with recency, so
      // "most relevant" means relevant to the query — not the classifier's
      // industry-relevance score.
      const rpc = await supabase.rpc('search_articles_ranked', {
        search_query: q,
        filter_category: category ?? null,
        filter_platforms: platforms.length > 0 ? platforms : null,
        filter_impact: impact ?? null,
        filter_audience: audience ?? null,
        max_rows: rawWindow,
      })
      data = rpc.data as SearchArticleRow[] | null
      error = rpc.error
    }

    const SELECT_COLUMNS = 'id, title, summary, category, source_name, source_type, published_at, image_url, platforms, impact_level, relevance_score, audience, is_breaking'

    // Every other combination — browsing, or a query with an explicit
    // newest/oldest/impact sort — goes through the query builder, where the
    // requested ORDER BY runs in the database BEFORE the row limit. Sorting a
    // rank-truncated window in JS would silently drop the true newest/oldest
    // matches on broad queries. Also the fallback when the ranked RPC is
    // missing (databases provisioned without scripts/010).
    if (data === null) {
      if (sort === 'impact' && !impact) {
        // Alphabetical order can't express high > medium > low ('low' sorts
        // before 'medium'), and PostgREST has no CASE ordering — so fill the
        // window tier by tier in severity order, each tier newest-first.
        const collected: SearchArticleRow[] = []
        for (const level of ['high', 'medium', 'low']) {
          const remaining = rawWindow - collected.length
          if (remaining <= 0) break
          const tier = await applyFilters(
            supabase.from('articles').select(SELECT_COLUMNS),
            { ...filters, impact: level }
          )
            .order('published_at', { ascending: false })
            .limit(remaining)
          if (tier.error) {
            error = tier.error
            break
          }
          collected.push(...((tier.data as SearchArticleRow[] | null) ?? []))
        }
        if (!error) data = collected
      } else {
        let query = applyFilters(
          supabase.from('articles').select(SELECT_COLUMNS),
          filters
        )

        switch (sort) {
          case 'oldest':
            query = query.order('published_at', { ascending: true })
            break
          case 'relevant':
            query = query.order('relevance_score', { ascending: false })
            break
          default:
            query = query.order('published_at', { ascending: false })
            break
        }

        query = query.limit(rawWindow)
        const result = await query
        data = result.data as SearchArticleRow[] | null
        error = result.error
      }
    }

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
      // Normalized + validated, with a deterministic stock fallback — a card
      // never ships with a null or junk image URL.
      imageUrl: resolveArticleImage(
        article.image_url,
        article.title,
        article.category || 'general',
        article.platforms || [],
      ),
      platforms: article.platforms || [],
      impactLevel: article.impact_level || 'medium',
      relevanceScore: article.relevance_score || 0,
      audience: article.audience || [],
      isBreaking: article.is_breaking || false,
    })).filter((article) => isSubstantive(article.summary)))

    if (sort === 'impact') {
      const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
      allArticles.sort((a, b) => {
        const impactA = impactOrder[a.impactLevel || 'low'] ?? 3
        const impactB = impactOrder[b.impactLevel || 'low'] ?? 3
        if (impactA !== impactB) return impactA - impactB
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
    }

    // With a search query, don't collapse near-duplicate coverage as
    // aggressively — the reader asked for everything on this topic.
    const curatedArticles = curateArticleFeed(allArticles, {
      maxPerTopic: q ? 4 : (category || platforms.length > 0 ? 3 : 2),
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
