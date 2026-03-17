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

    // Fetch unprocessed community topics
    const { data: topics, error } = await supabaseAdmin
      .from('community_topics')
      .select('*')
      .eq('processed', false)
      .order('published_at', { ascending: false })
      .limit(20)

    if (error || !topics?.length) {
      return NextResponse.json({
        success: true,
        message: 'No unprocessed topics',
        processed: 0,
        timestamp: new Date().toISOString()
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
    }

    // Process in batch — send all titles to AI for theme extraction
    const topicSummary = topics.map(t =>
      `[${t.source_platform}] "${t.title}" (${t.upvotes} upvotes, ${t.comment_count} comments)${t.body_snippet ? ': ' + t.body_snippet.substring(0, 200) : ''}`
    ).join('\n')

    const prompt = `You are analyzing Amazon seller community discussions to identify themes and sentiment. These posts are from Reddit seller communities and Seller Central forums.

For each post below, return a JSON array with an object per post containing:
- "index": the 0-based index of the post
- "sentiment": one of "positive", "negative", "neutral", "frustrated", "seeking_help", "celebratory", "warning"
- "theme_tags": array of 1-3 theme tags from this list: fba_fees, account_health, listing_optimization, buy_box, ppc_advertising, inventory_management, policy_change, account_suspension, ip_complaints, returns_refunds, category_ungating, brand_registry, product_research, supplier_issues, shipping_logistics, tax_compliance, review_management, pricing_strategy, new_seller_help, platform_comparison, amazon_news, seller_tools, margin_optimization, international_expansion, wholesale, private_label, arbitrage, seasonal_strategy
- "relevance_score": 0-100 how relevant this is to marketplace sellers (not general ecommerce or unrelated topics)

Posts:
${topicSummary}

Return ONLY a valid JSON array, no markdown or explanation.`

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
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      return NextResponse.json({ error: `AI API returned ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    let processed = 0
    const analyses = JSON.parse(jsonMatch[0])

    for (const analysis of analyses) {
      const topic = topics[analysis.index]
      if (!topic) continue

      const { error: updateError } = await supabaseAdmin
        .from('community_topics')
        .update({
          sentiment: analysis.sentiment,
          theme_tags: analysis.theme_tags || [],
          relevance_score: analysis.relevance_score || 50,
          processed: true,
        })
        .eq('id', topic.id)

      if (!updateError) processed++
    }

    return NextResponse.json({
      success: true,
      processed,
      total: topics.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Community analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    )
  }
}
