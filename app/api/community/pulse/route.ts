import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callAIForJSON } from '@/lib/ai-client'

export const maxDuration = 60

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CommunityTopic {
  id: string
  title: string
  body_snippet: string | null
  source_platform: string
  upvotes: number
  comment_count: number
  sentiment: string | null
  theme_tags: string[]
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!hasAIKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
    }

    // Get processed community topics from the last 7 days
    const { data: recentTopics, error } = await supabaseAdmin
      .from('community_topics')
      .select('*')
      .eq('processed', true)
      .gte('relevance_score', 40)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('upvotes', { ascending: false })
      .limit(100)

    if (error || !recentTopics?.length) {
      return NextResponse.json({
        success: true,
        message: 'Not enough topics for pulse generation',
        timestamp: new Date().toISOString()
      })
    }

    // Count theme frequency
    const themeCounts: Record<string, { count: number; totalUpvotes: number; topics: CommunityTopic[] }> = {}
    for (const topic of recentTopics) {
      for (const tag of (topic.theme_tags || [])) {
        if (!themeCounts[tag]) {
          themeCounts[tag] = { count: 0, totalUpvotes: 0, topics: [] }
        }
        themeCounts[tag].count++
        themeCounts[tag].totalUpvotes += topic.upvotes || 0
        themeCounts[tag].topics.push(topic)
      }
    }

    // Find the top 3 themes by frequency + engagement
    const sortedThemes = Object.entries(themeCounts)
      .map(([theme, data]) => ({
        theme,
        count: data.count,
        score: data.count * 2 + data.totalUpvotes,
        topics: data.topics.slice(0, 10)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    if (sortedThemes.length === 0) {
      return NextResponse.json({ success: true, message: 'No trending themes found' })
    }

    // Generate a Seller Pulse article for the top trending theme
    const topTheme = sortedThemes[0]
    const topicList = topTheme.topics.map(t =>
      `- "${t.title}" (${t.upvotes} upvotes, ${t.comment_count} comments, sentiment: ${t.sentiment})${t.body_snippet ? ' — ' + t.body_snippet.substring(0, 150) : ''}`
    ).join('\n')

    const pulsePrompt = `You are MarketplaceBeta's senior community intelligence analyst. You monitor what Amazon/marketplace sellers are actually talking about — their real pain points, wins, frustrations, and questions.

This week, the theme "${topTheme.theme}" appeared in ${topTheme.count} community discussions across Reddit seller forums and Seller Central. Here are the most-discussed posts:

${topicList}

Write a "Seller Pulse" article that:

1. TITLE: A compelling, specific headline that captures the theme. Not "Sellers Discuss Fees" but "FBA Fee Fatigue Is Real: Here's What 47 Sellers Are Actually Doing About It"

2. THE PULSE (2-3 paragraphs): Synthesize the community sentiment. What's the dominant mood? What are sellers worried about? What solutions are they sharing with each other? Reference specific posts (by paraphrasing, not quoting) to show you've read the community. Write like a journalist covering a beat, not like an AI summarizing posts.

3. THE PATTERN (1-2 paragraphs): Connect this community sentiment to broader industry trends. Why is this theme trending NOW? What changed? Link it to recent policy changes, fee updates, algorithm shifts, or competitive dynamics. This is where you add the context that sellers in the forums might be missing.

4. SMART MOVES (3-4 bullet points): Concrete, specific actions segmented by audience:
   - For brand owners: [specific action]
   - For agencies: [specific action]
   - For SaaS builders: [specific opportunity]
   Include specific tools, settings, or workflows where possible.

5. THE BOTTOM LINE: One quotable sentence that captures the essence — designed for LinkedIn sharing.

Return JSON:
{
  "title": "the article title",
  "content": "the full article in markdown",
  "summary": "2 sentence summary for article cards",
  "themes": ["array", "of", "theme", "tags"],
  "sentiment_summary": "one sentence describing overall seller mood on this topic",
  "bottom_line": "the quotable bottom line"
}

Return ONLY valid JSON.`

    const { data: article, provider, model } = await callAIForJSON<any>({
      prompt: pulsePrompt,
      maxTokens: 3000
    })
    console.log(`[Pulse] Article generated via ${provider} (${model})`)

    const articleId = 'pulse_' + Date.now().toString(36)

    const { error: insertError } = await supabaseAdmin
      .from('seller_pulse_articles')
      .insert({
        id: articleId,
        title: article.title,
        content: article.content,
        summary: article.summary,
        themes: article.themes || [topTheme.theme],
        source_topic_ids: topTheme.topics.map((t: CommunityTopic) => t.id),
        topic_count: topTheme.count,
        sentiment_summary: article.sentiment_summary,
        status: 'published',
        published_at: new Date().toISOString(),
      })

    // Also insert into the main articles table so it appears in the feed
    if (!insertError) {
      await supabaseAdmin.from('articles').insert({
        id: articleId,
        title: article.title,
        summary: article.summary,
        ai_summary: article.summary,
        our_take: article.content,
        bottom_line: article.bottom_line,
        source_name: 'MarketplaceBeta Community Pulse',
        source_url: `https://marketplacebeta.com/community/pulse`,
        source_type: 'community_pulse',
        category: 'market_metrics',
        platforms: ['amazon', 'general'],
        audience: ['sellers', 'agencies', 'brands'],
        impact_level: 'high',
        relevance_score: 85,
        is_breaking: false,
        relevant: true,
        has_real_image: false,
        image_source: 'category_fallback',
        published_at: new Date().toISOString(),
        tier: 1,
      })
    }

    return NextResponse.json({
      success: true,
      article_id: articleId,
      title: article.title,
      themes: sortedThemes.map(t => ({ theme: t.theme, count: t.count })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Pulse generation error:', error)
    return NextResponse.json(
      { error: 'Pulse generation failed', details: String(error) },
      { status: 500 }
    )
  }
}
