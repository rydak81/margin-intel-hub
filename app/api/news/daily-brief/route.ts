import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callAI } from '@/lib/ai-client'

export const maxDuration = 60

// Lazy-initialized Supabase client (avoids module-level crash if env vars missing)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get top articles from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: topArticles, error } = await getSupabase()
      .from('articles')
      .select('*')
      .gte('published_at', yesterday)
      .eq('relevant', true)
      .gte('relevance_score', 60)
      .order('relevance_score', { ascending: false })
      .limit(7)

    if (error) {
      return NextResponse.json({ error: `DB query failed: ${error.message}` }, { status: 500 })
    }

    if (!topArticles?.length) {
      return NextResponse.json({ error: 'No articles for brief' }, { status: 404 })
    }

    // Check for any AI key (Gateway or direct)
    const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!hasAIKey) {
      return NextResponse.json({
        articles: topArticles.length,
        brief: null,
        message: 'No AI API key set — returning raw articles',
        topArticles,
        date: new Date().toISOString()
      })
    }

    const briefPrompt = `You are a marketplace intelligence analyst writing a daily brief for ecommerce professionals who sell on Amazon, Walmart, Shopify, and other marketplaces.

Write a concise daily news brief with these ${topArticles.length} stories. For each story:
- One-line headline
- 2-3 sentence summary focused on seller impact
- Action item if applicable

End with a "Bottom Line" section (2-3 sentences) summarizing the day's themes.

Stories:
${topArticles.map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.source_name})\nSummary: ${a.ai_summary || a.summary}`).join('\n\n')}`

    const response = await callAI({
      prompt: briefPrompt,
      maxTokens: 2000
    })
    console.log(`[DailyBrief] Generated via ${response.provider} (${response.model})`)

    return NextResponse.json({
      success: true,
      articles: topArticles.length,
      brief: response.text,
      provider: response.provider,
      topArticles,
      date: new Date().toISOString()
    })
  } catch (error) {
    console.error('Daily brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily brief', details: String(error) },
      { status: 500 }
    )
  }
}
