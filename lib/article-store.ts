/**
 * Article Persistence Layer — Supabase + In-Memory Cache
 *
 * Stores all AI-classified articles in Supabase for:
 * - Persistence across server restarts
 * - Full-text search across historical articles
 * - Building a growing archive of e-commerce news
 * - Individual article pages with AI insights
 *
 * Falls back to in-memory cache if Supabase is unavailable.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ClassifiedArticle } from '@/lib/ai-classifier'

// In-memory cache (fast reads, populated from Supabase on startup)
let articlesCache: ClassifiedArticle[] = []
let lastCacheUpdate = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Save articles to Supabase (upsert — won't duplicate)
 */
export async function saveArticles(articles: ClassifiedArticle[]): Promise<void> {
  if (!isSupabaseConfigured() || articles.length === 0) return

  try {
    const supabase = createAdminClient()

    const rows = articles.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      full_content: a.fullContent || null,
      ai_summary: a.aiSummary || null,
      source_name: a.sourceName,
      source_url: a.sourceUrl,
      published_at: a.publishedAt,
      image_url: a.imageUrl || null,
      original_rss_image: a.originalRssImage || null,
      has_real_image: a.hasRealImage || false,
      relevant: a.relevant,
      relevance_score: a.relevanceScore,
      category: a.category,
      platforms: a.platforms || [],
      is_breaking: a.isBreaking || false,
      audience: a.audience || [],
      impact_level: a.impactLevel || 'medium',
      impact_detail: a.impactDetail || null,
      action_item: a.actionItem || null,
      key_stat: a.keyStat || null,
      rejection_reason: a.rejectionReason || null,
      tier: a.tier,
      source_type: a.sourceType || 'industry',
    }))

    const { error } = await supabase
      .from('articles')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false })

    if (error) {
      console.warn('[ArticleStore] Supabase upsert error:', error.message)
    } else {
      console.log(`[ArticleStore] Saved ${rows.length} articles to Supabase`)
    }
  } catch (err) {
    console.warn('[ArticleStore] Failed to save to Supabase:', err)
  }
}

/**
 * Load articles from Supabase (for cache warming or when in-memory cache is cold)
 */
export async function loadArticlesFromDB(options?: {
  limit?: number
  category?: string
  platform?: string
  audience?: string
  impact?: string
  search?: string
}): Promise<ClassifiedArticle[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('articles')
      .select('*')
      .eq('relevant', true)
      .gte('relevance_score', 50)
      .order('published_at', { ascending: false })
      .limit(options?.limit || 200)

    if (options?.category) {
      query = query.eq('category', options.category)
    }
    if (options?.platform) {
      query = query.contains('platforms', [options.platform])
    }
    if (options?.audience) {
      query = query.contains('audience', [options.audience])
    }
    if (options?.impact) {
      query = query.eq('impact_level', options.impact)
    }
    if (options?.search) {
      query = query.textSearch('search_vector', options.search, { type: 'websearch' })
    }

    const { data, error } = await query

    if (error) {
      console.warn('[ArticleStore] Supabase load error:', error.message)
      return []
    }

    return (data || []).map(dbRowToArticle)
  } catch (err) {
    console.warn('[ArticleStore] Failed to load from Supabase:', err)
    return []
  }
}

/**
 * Get a single article by ID (for article detail page)
 */
export async function getArticleById(id: string): Promise<ClassifiedArticle | null> {
  // Check in-memory cache first
  const cached = articlesCache.find(a => a.id === id)
  if (cached) return cached

  if (!isSupabaseConfigured()) return null

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return dbRowToArticle(data)
  } catch {
    return null
  }
}

/**
 * Search articles using PostgreSQL full-text search
 */
export async function searchArticles(query: string, limit = 20): Promise<ClassifiedArticle[]> {
  if (!isSupabaseConfigured()) {
    // Fall back to in-memory search
    const q = query.toLowerCase()
    return articlesCache
      .filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.aiSummary || '').toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q)
      )
      .slice(0, limit)
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('relevant', true)
      .textSearch('search_vector', query, { type: 'websearch' })
      .order('relevance_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('[ArticleStore] Search error:', error.message)
      return []
    }

    return (data || []).map(dbRowToArticle)
  } catch {
    return []
  }
}

/**
 * Get related articles (same category, excluding current)
 */
export async function getRelatedArticles(articleId: string, category: string, limit = 4): Promise<ClassifiedArticle[]> {
  // Try in-memory first
  const fromCache = articlesCache
    .filter(a => a.id !== articleId && a.category === category)
    .slice(0, limit)

  if (fromCache.length >= limit) return fromCache

  if (!isSupabaseConfigured()) return fromCache

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .eq('relevant', true)
      .neq('id', articleId)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error || !data) return fromCache
    return data.map(dbRowToArticle)
  } catch {
    return fromCache
  }
}

// ============================================================================
// IN-MEMORY CACHE MANAGEMENT
// ============================================================================

export function getArticlesCache(): ClassifiedArticle[] {
  return articlesCache
}

export function setArticlesCache(articles: ClassifiedArticle[]): void {
  articlesCache = articles
  lastCacheUpdate = Date.now()
}

export function isCacheValid(): boolean {
  return articlesCache.length > 0 && (Date.now() - lastCacheUpdate) < CACHE_DURATION
}

export function getLastCacheUpdate(): number {
  return lastCacheUpdate
}

// ============================================================================
// REPROCESSING — Find articles missing AI summaries
// ============================================================================

/**
 * Find articles in the database that need AI reprocessing
 * (missing ai_summary or ai_summary is too short/generic)
 */
export async function getArticlesNeedingAI(limit = 50): Promise<ClassifiedArticle[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createAdminClient()
    
    // Find articles where ai_summary is null, empty, or suspiciously short
    // Also find articles where ai_summary equals the basic summary (not AI-enriched)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('relevant', true)
      .or('ai_summary.is.null,ai_summary.eq.')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('[ArticleStore] Error finding articles needing AI:', error.message)
      return []
    }

    // Also check for articles where AI summary is too short or equals the original summary
    const articlesNeedingAI = (data || []).filter(row => {
      const aiSummary = row.ai_summary || ''
      const originalSummary = row.summary || ''
      
      // Needs AI if:
      // 1. No AI summary at all
      // 2. AI summary is very short (< 100 chars)
      // 3. AI summary exactly matches original (wasn't actually processed)
      return !aiSummary || 
             aiSummary.length < 100 || 
             aiSummary === originalSummary ||
             !row.impact_detail ||
             !row.action_item
    })

    console.log(`[ArticleStore] Found ${articlesNeedingAI.length} articles needing AI reprocessing`)
    return articlesNeedingAI.map(dbRowToArticle)
  } catch (err) {
    console.warn('[ArticleStore] Failed to find articles needing AI:', err)
    return []
  }
}

/**
 * Update an article with new AI-generated content
 */
export async function updateArticleWithAI(
  articleId: string, 
  aiData: {
    aiSummary: string
    impactLevel: 'high' | 'medium' | 'low'
    impactDetail: string
    actionItem: string
    keyStat: string | null
    audience: string[]
  }
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('articles')
      .update({
        ai_summary: aiData.aiSummary,
        impact_level: aiData.impactLevel,
        impact_detail: aiData.impactDetail,
        action_item: aiData.actionItem,
        key_stat: aiData.keyStat,
        audience: aiData.audience,
      })
      .eq('id', articleId)

    if (error) {
      console.warn(`[ArticleStore] Failed to update article ${articleId}:`, error.message)
      return false
    }

    return true
  } catch (err) {
    console.warn(`[ArticleStore] Error updating article ${articleId}:`, err)
    return false
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function dbRowToArticle(row: any): ClassifiedArticle {
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
    rejectionReason: row.rejection_reason || null,
    tier: row.tier || 3,
    sourceType: row.source_type || 'industry',
  }
}
