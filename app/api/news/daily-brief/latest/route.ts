import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 300

let _supabase: any = null
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase credentials')
    _supabase = createClient(url, key)
  }
  return _supabase
}

/**
 * GET /api/news/daily-brief/latest
 * Returns the most recent daily brief for the frontend to display.
 * Falls back to generating a brief from top articles if no stored brief exists.
 */
export async function GET() {
  try {
    // Try to fetch the latest stored daily brief
    const { data: brief, error } = await getSupabase()
      .from('daily_briefs')
      .select('*')
      .order('brief_date', { ascending: false })
      .limit(1)
      .single()

    if (brief && !error) {
      return NextResponse.json({
        success: true,
        brief: brief.content,
        date: brief.brief_date,
        articleCount: brief.article_count,
        provider: brief.provider,
      })
    }

    // No stored brief — return top articles as a fallback summary
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: articles } = await getSupabase()
      .from('articles')
      .select('id, title, ai_summary, category, impact_level, source_name, published_at')
      .gte('published_at', yesterday)
      .eq('relevant', true)
      .gte('relevance_score', 60)
      .order('relevance_score', { ascending: false })
      .limit(5)

    if (!articles?.length) {
      return NextResponse.json({ success: false, error: 'No brief available' }, { status: 404 })
    }

    // Build a simple fallback brief from article summaries
    const fallbackBrief = `## The Seller's Daily Brief\n*${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}*\n\n### Today's Top Stories\n\n${articles.map((a: any, i: number) => `**${i + 1}. ${a.title}**\n${a.ai_summary || 'Analysis pending.'}\n*Source: ${a.source_name}*`).join('\n\n')}`

    return NextResponse.json({
      success: true,
      brief: fallbackBrief,
      date: new Date().toISOString().split('T')[0],
      articleCount: articles.length,
      provider: 'fallback',
    })
  } catch (error) {
    console.error('[DailyBrief/latest] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily brief' },
      { status: 500 }
    )
  }
}
