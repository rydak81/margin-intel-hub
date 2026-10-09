import { unstable_cache } from 'next/cache'
import { createAdminClient, hasAdminConfig } from '@/lib/supabase/admin'
import { curateArticleFeed } from '@/lib/feed-curation'
import { normalizeIntelligenceTags, type IntelligenceSnapshot } from '@/lib/intelligence'

export const loadIntelligenceSnapshot = unstable_cache(async (): Promise<IntelligenceSnapshot> => {
  const checkedAt = new Date().toISOString()
  const unavailable: IntelligenceSnapshot = { status: 'unavailable', checkedAt, sampledCount: 0, capped: false, articles: [] }
  if (!hasAdminConfig()) return unavailable
  try {
    const { data, error } = await createAdminClient().from('articles')
      .select('id,title,ai_summary,summary,source_name,source_url,published_at,category,platforms,audience,impact_level,action_item,relevance_score,is_breaking,source_type')
      .eq('relevant', true).gte('relevance_score', 40)
      .gte('published_at', new Date(Date.parse(checkedAt) - 90 * 86400000).toISOString())
      .lte('published_at', checkedAt).order('published_at', { ascending: false }).limit(500).abortSignal(AbortSignal.timeout(10000))
    if (error) { console.warn('[intelligence] Snapshot query failed:', error.code); return unavailable }
    const candidates = (data || []).map(row => ({
      id: row.id as string, title: row.title as string,
      summary: String(row.ai_summary || row.summary || '').slice(0, 600),
      sourceName: String(row.source_name || 'Unspecified source'), sourceUrl: String(row.source_url || ''),
      publishedAt: row.published_at as string,
      ...normalizeIntelligenceTags({ title: String(row.title || ''), category: String(row.category || 'general'), platforms: (row.platforms || []) as string[], audience: (row.audience || []) as string[] }),
      impactLevel: (row.impact_level || 'medium') as 'high' | 'medium' | 'low',
      actionItem: String(row.action_item || '').slice(0, 400), relevanceScore: Number(row.relevance_score || 0),
      isBreaking: Boolean(row.is_breaking), sourceType: (row.source_type === 'google' ? 'google' : 'industry') as 'google' | 'industry',
    }))
    const articles = curateArticleFeed(candidates, { limit: 500, maxPerTopic: 1, preserveOrder: true })
      .map(({ relevanceScore: _score, isBreaking: _breaking, sourceType: _sourceType, ...article }) => article)
    return { status: 'ready', checkedAt, sampledCount: candidates.length, capped: candidates.length === 500, articles }
  } catch { return unavailable }
}, ['operator-intelligence-v2'], { revalidate: 300 })
