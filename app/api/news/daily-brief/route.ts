import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get top articles from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: topArticles, error } = await supabaseAdmin
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

    // Use Claude to generate the brief
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        articles: topArticles.length,
        brief: null,
        message: 'No ANTHROPIC_API_KEY set — returning raw articles',
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
${topArticles.map((a, i) => `${i + 1}. "${a.title}" (${a.source_name})\nSummary: ${a.ai_summary || a.summary}`).join('\n\n')}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: briefPrompt
        }]
      })
    })

    if (!response.ok) {
      return NextResponse.json({
        error: `Claude API returned ${response.status}`,
        articles: topArticles.length,
        topArticles,
        date: new Date().toISOString()
      }, { status: 502 })
    }

    const data = await response.json()
    const brief = data.content?.[0]?.text || ''

    return NextResponse.json({
      success: true,
      articles: topArticles.length,
      brief,
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
