import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // Allow up to 60s for classification

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET handler - called by Vercel cron 15 min after aggregation
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find articles that haven't been AI-classified yet
    const { data: unclassified, error } = await supabaseAdmin
      .from('articles')
      .select('id, title, summary')
      .is('ai_summary', null) // No AI summary = not yet classified
      .order('published_at', { ascending: false })
      .limit(15) // Process 15 at a time

    if (error) {
      return NextResponse.json({ error: `DB query failed: ${error.message}` }, { status: 500 })
    }

    if (!unclassified?.length) {
      return NextResponse.json({
        success: true,
        message: 'No articles to classify',
        classified: 0,
        total: 0,
        timestamp: new Date().toISOString()
      })
    }

    console.log(`[Classify] Found ${unclassified.length} unclassified articles`)

    let classified = 0
    let errors = 0

    for (const article of unclassified) {
      try {
        const classification = await classifyWithAI(article)
        if (classification) {
          const { error: updateError } = await supabaseAdmin
            .from('articles')
            .update(classification)
            .eq('id', article.id)

          if (!updateError) {
            classified++
          } else {
            console.error(`[Classify] Update failed for ${article.id}:`, updateError.message)
            errors++
          }
        }
      } catch (err) {
        console.error(`[Classify] Error classifying "${article.title}":`, err)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      classified,
      total: unclassified.length,
      errors,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Classification error:', error)
    return NextResponse.json(
      { error: 'Classification failed', details: String(error) },
      { status: 500 }
    )
  }
}

// AI classification using Anthropic Claude Haiku
async function classifyWithAI(article: { id: string; title: string; summary: string }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Classify this e-commerce article. Return ONLY valid JSON, no markdown.
{
  "category": one of: "breaking", "market_metrics", "platform_updates", "seller_profitability", "ma_deal_flow", "tools_technology", "advertising", "logistics",
  "relevance_score": 1-100 (how relevant to marketplace sellers),
  "impact_level": "high" | "medium" | "low",
  "is_breaking": true/false,
  "platforms": array of: "amazon", "walmart", "ebay", "shopify", "tiktok", "target",
  "audience": array of: "brand_sellers", "agencies", "saas_tech", "investors", "service_providers",
  "ai_summary": 2-3 sentence summary for marketplace professionals,
  "action_item": one actionable takeaway for sellers (or null),
  "key_stat": key statistic from the article (or null)
}

Title: ${article.title}
Summary: ${article.summary}`
      }]
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API returned ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const classification = JSON.parse(jsonMatch[0])

  return {
    category: classification.category || undefined,
    relevance_score: classification.relevance_score || undefined,
    impact_level: classification.impact_level || undefined,
    is_breaking: classification.is_breaking || false,
    platforms: classification.platforms || undefined,
    audience: classification.audience || undefined,
    ai_summary: classification.ai_summary || undefined,
    action_item: classification.action_item || null,
    key_stat: classification.key_stat || null
  }
}
