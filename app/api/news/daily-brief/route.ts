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

    const briefPrompt = `You are the lead marketplace analyst at MarketplaceBeta, an e-commerce intelligence publication read by Amazon sellers, agency operators, and SaaS founders.

Write today's "Seller's Daily Brief" — an editorial-quality briefing that reads like it was written by a sharp industry insider, NOT a bot summary.

Today's top ${topArticles.length} stories:
${topArticles.map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.source_name})\nSummary: ${a.ai_summary || a.summary}\nFull context: ${(a.full_content || '').substring(0, 800)}`).join('\n\n')}

Structure your brief as follows (use markdown):

## The Seller's Daily Brief
*${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}*

### The Big Picture
2-3 sentences framing the day's overall theme. What's the connective thread?

### What Happened
For each story (use ### for headlines):
- A punchy headline (not the source headline — rewrite it with a seller lens)
- 2-3 paragraph analysis: what happened, why it matters to operators, and what to do about it
- Bold the most important sentence in each story

### Moves to Watch
Bullet list of 3-5 tactical items sellers should act on or monitor this week

### The Bottom Line
A single quotable paragraph that captures the day's essence — the kind of thing a seller would screenshot and share.

Write with authority, specificity, and an operator's perspective. Avoid corporate speak. Be direct.`

    const response = await callAI({
      prompt: briefPrompt,
      maxTokens: 3000,
      tier: 'deep'
    })
    console.log(`[DailyBrief] Generated via ${response.provider} (${response.model}) [${response.tier}]`)

    // Store the daily brief in Supabase for frontend consumption
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    try {
      await getSupabase()
        .from('daily_briefs')
        .upsert({
          id: today,
          brief_date: today,
          content: response.text,
          article_count: topArticles.length,
          article_ids: topArticles.map((a: any) => a.id),
          provider: response.provider,
          model: response.model,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
    } catch (dbErr) {
      // Non-fatal — brief still returned in response even if DB save fails
      console.warn('[DailyBrief] Failed to save to daily_briefs table:', dbErr)
    }

    return NextResponse.json({
      success: true,
      articles: topArticles.length,
      brief: response.text,
      provider: response.provider,
      model: response.model,
      tier: response.tier,
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
