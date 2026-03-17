import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // Allow up to 60s for classification

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Category-based fallback images (Unsplash, landscape, 800px wide)
const CATEGORY_IMAGES: Record<string, string> = {
  platform_updates: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
  seller_tools: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  market_trends: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  policy_regulatory: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  logistics_supply_chain: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
  advertising_marketing: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
  international: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
  mergers_acquisitions: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  consumer_trends: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
  ai_technology: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  breaking: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800',
  market_metrics: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  seller_profitability: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  ma_deal_flow: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  tools_technology: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  advertising: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
  logistics: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
}

// GET handler - called by Vercel cron 15 min after aggregation
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Find articles that haven't been AI-classified yet
    const { data: unclassified, error } = await supabaseAdmin
      .from('articles')
      .select('id, title, summary, source_name, image_url')
      .is('ai_summary', null)
      .order('published_at', { ascending: false })
      .limit(15)

    if (error) {
      return NextResponse.json({ error: `DB query failed: ${error.message}` }, { status: 500 })
    }

    // 2. Find articles needing re-enrichment (have ai_summary but missing deep insights)
    const { data: needsEnrichment } = await supabaseAdmin
      .from('articles')
      .select('id, title, summary, source_name, image_url')
      .not('ai_summary', 'is', null)
      .is('our_take', null)
      .order('published_at', { ascending: false })
      .limit(5)

    const allToProcess = [
      ...(unclassified || []),
      ...(needsEnrichment || [])
    ]

    if (allToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles to classify',
        classified: 0,
        enriched: 0,
        total: 0,
        timestamp: new Date().toISOString()
      })
    }

    console.log(`[Classify] Found ${unclassified?.length || 0} unclassified + ${needsEnrichment?.length || 0} needing enrichment`)

    let classified = 0
    let enriched = 0
    let imagesFixed = 0
    let errors = 0

    for (const article of allToProcess) {
      try {
        const classification = await classifyWithAI(article)
        if (!classification) continue

        const updateData: Record<string, unknown> = {
          ai_summary: classification.ai_summary,
          our_take: classification.our_take,
          what_this_means: classification.our_take,  // Map operator's edge to both fields for backward compatibility
          key_takeaways: classification.key_takeaways || [],
          related_context: classification.bottom_line,  // Repurpose for bottom line storage
          action_item: classification.key_takeaways?.[0] || null,  // First action item
          key_stat: classification.key_stat,
          impact_detail: classification.bottom_line,  // Bottom line also stored here for display
          bottom_line: classification.bottom_line,
          category: classification.category,
          platforms: classification.platforms || [],
          audience: classification.audience || [],
          impact_level: classification.impact_level || 'medium',
          relevance_score: classification.relevance_score || 50,
          is_breaking: classification.is_breaking || false,
          relevant: classification.relevant !== false,
        }

        // Image fallback: if no image, try Unsplash then category fallback
        if (!article.image_url) {
          const unsplashUrl = await searchUnsplash(classification.image_search_query)
          if (unsplashUrl) {
            updateData.image_url = unsplashUrl
            updateData.has_real_image = true
            updateData.image_source = 'unsplash'
            imagesFixed++
          } else {
            // Category-based fallback
            const fallback = CATEGORY_IMAGES[classification.category] || CATEGORY_IMAGES['market_trends']
            updateData.image_url = fallback
            updateData.image_source = 'category_fallback'
            imagesFixed++
          }
        }

        const { error: updateError } = await supabaseAdmin
          .from('articles')
          .update(updateData)
          .eq('id', article.id)

        if (!updateError) {
          if (unclassified?.some(u => u.id === article.id)) {
            classified++
          } else {
            enriched++
          }
        } else {
          console.error(`[Classify] Update failed for ${article.id}:`, updateError.message)
          errors++
        }
      } catch (err) {
        console.error(`[Classify] Error classifying "${article.title}":`, err)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      classified,
      enriched,
      images_fixed: imagesFixed,
      total: allToProcess.length,
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

// Deep AI classification using Anthropic Claude Haiku
async function classifyWithAI(article: { id: string; title: string; summary: string; source_name?: string }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const classificationPrompt = `You are MarketplaceBeta's senior intelligence analyst. Your readers are enterprise brand operators, Amazon/Walmart sellers doing $1M+, agency directors, and ecommerce SaaS executives. They don't need hand-holding — they need the insight they'd miss without you.

Analyze this article and return a JSON object. Every field must earn its place — no filler, no restating the headline, no generic advice.

{
  "ai_summary": "THE SIGNAL — 1-2 sentences max. What happened, stated like a Bloomberg terminal alert. Be specific: name the companies, cite the numbers, state the timeline. No setup language like 'In a move that...' — just the facts, dense and direct.",

  "our_take": "THE OPERATOR'S EDGE — 3-4 sentences. This is the insight that justifies reading MarketplaceBeta instead of just scanning headlines. What's the non-obvious implication? What pattern does this fit into? How does this connect to other moves in the space? Differentiate impact by seller type where relevant (1P vendor vs 3P seller, brand owner vs reseller, US-only vs international). Reference specific regulations, timelines, fee structures, or competitive dynamics. Write in first person plural. Be opinionated and specific — vague takes like 'sellers should pay attention' are worthless.",

  "key_takeaways": ["MOVES TO MAKE — Array of exactly 2-3 action items. Each must be concrete and specific enough that someone could execute it this week. Bad: 'Review your compliance documentation.' Good: 'Pull your EU seller verification status in Seller Central > Account Health before the June 1 enforcement date — unverified accounts face listing suspension.' Target each bullet at a different audience where possible (one for brands, one for agencies, one for SaaS/operators)."],

  "bottom_line": "THE BOTTOM LINE — One sentence, quotable, shareable. Written so an executive could paste this into LinkedIn and sound like the smartest person in the room. This is the pull quote of the entire brief. Think: 'If your EU compliance workflow takes more than 48 hours per marketplace, you're not ready for what's coming in Q3.' or 'Amazon just told every 1P vendor that margin protection is now your problem, not theirs.'",

  "key_stat": "The single most important number from this article (e.g., '23% FBA fee increase effective April 1' or 'Walmart marketplace grew 42% YoY to $65B GMV'). Return null if no meaningful stat exists.",

  "category": "One of: platform_updates, seller_tools, market_trends, policy_regulatory, logistics_supply_chain, advertising_marketing, international, mergers_acquisitions, consumer_trends, ai_technology",
  "platforms": ["Array of relevant platforms: amazon, walmart, shopify, tiktok, ebay, target, etsy, general"],
  "audience": ["Array using clean labels: Brand Sellers, Wholesale Resellers, Agencies, SaaS Providers, Investors, New Sellers"],
  "impact_level": "One of: low, medium, high, critical",
  "relevance_score": "Integer 0-100. Be strict: 90+ = industry-shaping, every operator must know. 70-89 = important for specific segments. 50-69 = useful context. Below 50 = tangential to marketplace selling. Logistics/trucking news that doesn't directly affect seller operations or costs should score below 40.",
  "is_breaking": true/false,
  "relevant": "true/false — Set false for articles about trucking regulations, carrier operations, freight brokerage, port operations, or other logistics topics that don't directly impact marketplace seller costs, delivery times, or operations. The test: would an Amazon seller making $2M/year care about this? If not, mark false.",
  "image_search_query": "2-4 word stock photo search. Be specific to the article topic — 'amazon warehouse robots' not 'ecommerce'. Match the actual subject."
}

Article title: "${article.title}"
Article summary: "${article.summary || 'No summary available'}"
Source: "${article.source_name || 'Unknown'}"

Return ONLY valid JSON, no markdown or explanation.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: classificationPrompt }]
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API returned ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  return JSON.parse(jsonMatch[0])
}

// Search Unsplash for a relevant image
async function searchUnsplash(query: string | undefined): Promise<string | null> {
  if (!query) return null
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return null

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        signal: AbortSignal.timeout(5000)
      }
    )

    if (!response.ok) return null
    const data = await response.json()

    // Use the "regular" size (1080px wide)
    return data.results?.[0]?.urls?.regular || null
  } catch {
    return null
  }
}
