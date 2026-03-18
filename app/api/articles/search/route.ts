import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function parseList(str?: string): string[] {
  if (!str) return []
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const platforms = parseList(searchParams.get('platforms') || '')
    const impact = searchParams.get('impact')
    const audience = searchParams.get('audience')
    const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'relevant' | 'impact'
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    let query = supabase
      .from('articles')
      .select('id, title, summary, category, source_name, published_at, image_url, platform_tags, impact_level, relevance_score, audience_tags', { count: 'exact' })

    if (q.trim()) {
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,ai_summary.ilike.%${q}%`)
    }
    if (category) query = query.eq('category', category)
    if (platforms.length > 0) query = query.filter('platform_tags', 'cs', JSON.stringify(platforms))
    if (impact) query = query.eq('impact_level', impact)
    if (audience) query = query.filter('audience_tags', 'cs', JSON.stringify([audience]))

    switch (sort) {
      case 'oldest': query = query.order('published_at', { ascending: true }); break
      case 'relevant': query = query.order('relevance_score', { ascending: false }); break
      case 'impact': query = query.order('impact_level', { ascending: true }).order('published_at', { ascending: false }); break
      default: query = query.order('published_at', { ascending: false }); break
    }

    query = query.range(offset, offset + limit - 1)
    const { data, count, error } = await query

    if (error) {
      console.error('Search query error:', error)
      return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 })
    }

    // Facets
    const { data: categoryData } = await supabase.from('articles').select('category')
    const categoryFacets: Record<string, number> = {}
    categoryData?.forEach(item => { if (item.category) categoryFacets[item.category] = (categoryFacets[item.category] || 0) + 1 })

    const { data: platformData } = await supabase.from('articles').select('platform_tags')
    const platformFacets: Record<string, number> = {}
    platformData?.forEach(item => { if (item.platform_tags && Array.isArray(item.platform_tags)) item.platform_tags.forEach((p: string) => { platformFacets[p] = (platformFacets[p] || 0) + 1 }) })

    const { data: impactData } = await supabase.from('articles').select('impact_level')
    const impactFacets: Record<string, number> = {}
    impactData?.forEach(item => { if (item.impact_level) impactFacets[item.impact_level] = (impactFacets[item.impact_level] || 0) + 1 })

    const articles = data?.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      category: article.category,
      sourceName: article.source_name,
      publishedAt: article.published_at,
      imageUrl: article.image_url,
      platforms: article.platform_tags || [],
      impactLevel: article.impact_level,
      relevanceScore: article.relevance_score,
      audience: article.audience_tags || [],
    })) || []

    // Fix impact sort client-side since alphabetical != severity
    if (sort === 'impact') {
      const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
      articles.sort((a, b) => {
        const impactA = impactOrder[a.impactLevel || 'low'] ?? 3
        const impactB = impactOrder[b.impactLevel || 'low'] ?? 3
        if (impactA !== impactB) return impactA - impactB
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
    }

    return NextResponse.json({
      success: true, articles, total: count || 0,
      facets: { categories: categoryFacets, platforms: platformFacets, impactLevels: impactFacets }
    })
  } catch (error) {
    console.error('Article search error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
