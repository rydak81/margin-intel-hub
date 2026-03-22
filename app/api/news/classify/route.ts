import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callAIForJSON } from '@/lib/ai-client'

// Lazy-initialized Supabase client (avoids module-level crash if env vars missing)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)')
    _supabase = createClient(url, key)
  }
  return _supabase
}

/**
 * Strip HTML tags from text
 */
function stripHTML(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract keywords from text using simple NLP heuristics.
 */
function extractKeywords(text: string): Array<{ keyword: string; weight: number }> {
  if (!text) return []

  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2)

  const brands = [
    'amazon', 'ebay', 'shopify', 'etsy', 'tiktok', 'instagram', 'facebook', 'google',
    'walmart', 'target', 'bestbuy', 'costco', 'stripe', 'paypal', 'fulfillment',
    'asin', 'sku', 'fba', 'msku', 'api', 'sdk', 'aws', 'azure', 'gcp'
  ]

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
    'with', 'from', 'by', 'as', 'this', 'that', 'these', 'those', 'it', 'its',
    'you', 'your', 'we', 'our', 'they', 'their', 'what', 'which', 'who', 'why',
    'how', 'where', 'when', 'all', 'each', 'every', 'both', 'either', 'neither'
  ])

  const wordFreq: Record<string, number> = {}
  words.forEach(word => {
    if (word.length > 2 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })

  const keywords: Array<{ keyword: string; weight: number }> = []

  brands.forEach(brand => {
    if (wordFreq[brand]) {
      keywords.push({
        keyword: brand,
        weight: Math.min(1.0, 0.7 + wordFreq[brand] * 0.05)
      })
    }
  })

  Object.entries(wordFreq)
    .filter(([word]) => !brands.includes(word))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .forEach(([word, freq]) => {
      keywords.push({
        keyword: word,
        weight: Math.min(1.0, 0.3 + freq * 0.02)
      })
    })

  return keywords.sort((a, b) => b.weight - a.weight).slice(0, 20)
}

/**
 * Classify a single article using Claude (via AI Gateway or direct Anthropic)
 * Enhanced prompt: operator-level intelligence for agencies, sellers, and enterprise brands
 */
async function classifyArticle(article: any) {
  const prompt = `You are the Chief Intelligence Officer at a top-tier Amazon agency that manages $500M+ in annual marketplace revenue across Amazon, Walmart, Shopify, eBay, and TikTok Shop. Your readers are agency owners, 7-8 figure sellers, and brand executives who need to make decisions THIS WEEK based on your analysis.

You don't summarize news â you decode what it means for the operator's P&L, catalog strategy, and competitive positioning.

ARTICLE TO ANALYZE:
Title: ${article.title}
Source: ${article.source_name || 'Unknown'}
Published: ${article.published_at || 'Recent'}
Summary: ${article.summary || ''}
${article.full_content ? `Full Content: ${article.full_content.substring(0, 4000)}` : ''}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "aiSummary": "3-4 sentences. Lead with the business impact, not what happened. What changed, what's the magnitude, and who gets hit first? Include specific numbers, percentages, dates, and platform names. Write like a Bloomberg terminal alert for marketplace operators.",

  "ourTake": "3-4 sentences of second-order analysis. What's the non-obvious play here? Connect this to at least ONE of: margin compression, platform fee trajectory, supply chain shifts, advertising cost trends, competitive moat erosion, or regulatory risk. What would a $10M/year seller do differently starting Monday morning? Be specific about tactics, not vague about 'monitoring the situation.'",

  "keyTakeaways": [
    "First action item: Be hyper-specific. Name the tool, setting, report, or workflow to act on. Example format: 'Pull your [specific report] and check [specific metric] â if [threshold], then [specific action].'",
    "Second action item: What to DO this week â not what to 'consider' or 'monitor.' Name the platform, the metric, the threshold, and the action.",
    "Third action item: What to prepare for in the next 30-90 days. What's the second domino that falls from this news?"
  ],

  "bottomLine": "A sharp, quotable one-liner (under 25 words) that an agency owner would screenshot and send to their team Slack. Think: 'If X, then Y â and here's what that costs you.'",

  "whatThisMeans": "2-3 sentences explaining the broader strategic context. How does this fit into the 2026 marketplace landscape? Is this part of a trend toward platform consolidation, margin compression, AI disruption, or regulatory tightening? Connect the dots that a busy operator would miss.",

  "category": "one of: breaking, platform_updates, market_metrics, profitability, mergers_acquisitions, tools_technology, advertising, logistics, events, tactics, compliance_policy",
  "platforms": ["amazon", "walmart", "shopify", "ebay", "tiktok", "target", "etsy"],
  "audience": ["sellers", "agencies", "brands", "new_sellers", "experts"],
  "impactLevel": "high if it affects fees/policy/revenue/margins directly, medium if operational, low if informational",
  "keyStat": "The single most important number from this article. Format as a complete phrase like '$2.3B in Q4 revenue' or '15% fee increase effective April 1' or '3,000 sellers onboarded'. Return null ONLY if the article contains zero quantitative data.",
  "relevanceScore": 0.0-1.0,
  "unsplashQuery": "2-3 word photo search query"
}

QUALITY RULES:
- Every field must provide UNIQUE value. Do not repeat the same point across aiSummary, ourTake, and keyTakeaways.
- aiSummary = WHAT happened and its magnitude
- ourTake = WHY it matters (second-order effects)
- keyTakeaways = WHAT TO DO about it (specific actions)
- whatThisMeans = WHERE this fits (strategic context)
- bottomLine = The HEADLINE (quotable, shareable)
- All text must be on single lines (no literal newline characters within strings). Use spaces between sentences.
- Respond with ONLY valid JSON, no other text.`

  const { data: parsed, provider, model } = await callAIForJSON<any>({
    prompt,
    maxTokens: 4096
  })
  console.log(`[Classify] Article classified via ${provider} (${model})`)

  return {
    aiSummary: parsed.aiSummary || '',
    ourTake: parsed.ourTake || '',
    keyTakeaways: parsed.keyTakeaways || [],
    bottomLine: parsed.bottomLine || '',
    whatThisMeans: parsed.whatThisMeans || null,
    category: parsed.category || 'market_metrics',
    platforms: parsed.platforms || [],
    audience: parsed.audience || [],
    impactLevel: parsed.impactLevel || 'medium',
    keyStat: parsed.keyStat || null,
    relevanceScore: parsed.relevanceScore || 0.5,
    unsplashQuery: parsed.unsplashQuery || ''
  }
}

/**
 * Search Unsplash for an image
 */
async function searchUnsplashImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()
    return data.results?.[0]?.urls?.regular || null
  } catch (error) {
    console.error('Unsplash search failed:', error)
    return null
  }
}

/**
 * Get category-specific fallback image URL
 */
function getCategoryFallbackImage(category: string): string {
  const categoryImages: Record<string, string> = {
    breaking: 'https://images.unsplash.com/photo-1585776245991-274a50dd9d91?w=800&h=400&fit=crop',
    platform_updates: 'https://images.unsplash.com/photo-1460925895917-aaf4edb6482b?w=800&h=400&fit=crop',
    market_metrics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    profitability: 'https://images.unsplash.com/photo-1579532537598-459e926db58a?w=800&h=400&fit=crop',
    mergers_acquisitions: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    tools_technology: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    advertising: 'https://images.unsplash.com/photo-1460925895917-aaf4edb6482b?w=800&h=400&fit=crop',
    logistics: 'https://images.unsplash.com/photo-1586528116880-3c079e1fa7f0?w=800&h=400&fit=crop',
    events: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    tactics: 'https://images.unsplash.com/photo-1460925895917-aaf4edb6482b?w=800&h=400&fit=crop',
    compliance_policy: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop'
  }
  return categoryImages[category] || categoryImages.market_metrics
}

/**
 * Insert article keywords into article_keywords table
 */
async function insertKeywords(articleId: string, keywords: Array<{ keyword: string; weight: number }>) {
  if (keywords.length === 0) return
  // Delete existing keywords for this article to handle reclassification
  await getSupabase().from('article_keywords').delete().eq('article_id', articleId)
  const keywordRows = keywords.map(k => ({
    article_id: articleId,
    keyword: k.keyword,
    weight: k.weight
  }))
  const { error } = await getSupabase().from('article_keywords').insert(keywordRows)
  if (error) console.error('Error inserting keywords:', error)
}

/**
 * Insert article categories into article_categories table
 */
async function insertCategories(articleId: string, primaryCategory: string, platforms: string[], confidenceScore: number) {
  const categories: Array<{ article_id: string; category: string; confidence_score: number; is_primary: boolean }> = [
    { article_id: articleId, category: primaryCategory, confidence_score: confidenceScore, is_primary: true }
  ]

  const platformCategoryMap: Record<string, string> = {
    amazon: 'amazon_specific',
    ebay: 'ebay_specific',
    shopify: 'shopify_specific',
    etsy: 'etsy_specific',
    tiktok: 'social_commerce'
  }

  platforms.forEach(platform => {
    const platformCategory = platformCategoryMap[platform.toLowerCase()]
    if (platformCategory) {
      categories.push({ article_id: articleId, category: platformCategory, confidence_score: 0.8, is_primary: false })
    }
  })

  // Delete existing categories for this article to handle reclassification
  await getSupabase().from('article_categories').delete().eq('article_id', articleId)
  const { error } = await getSupabase().from('article_categories').insert(categories)
  if (error) console.error('Error inserting categories:', error)
}

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!hasAIKey) {
      return NextResponse.json({ error: 'No AI API key configured' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Classify] Auth mismatch â may be a manual trigger without CRON_SECRET')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Phase 1: Fetch brand-new articles (no ai_summary at all)
    const { data: brandNew, error: newErr } = await getSupabase()
      .from('articles')
      .select('*')
      .is('ai_summary', null)
      .limit(25)
      .order('published_at', { ascending: false })

    if (newErr) throw newErr

    // Phase 2: Fetch articles that have ai_summary but are missing deep insights (our_take)
    // This catches articles that were only partially processed or have RSS-only summaries
    const { data: needsEnrichment, error: enrichErr } = await getSupabase()
      .from('articles')
      .select('*')
      .is('our_take', null)
      .not('ai_summary', 'is', null)
      .limit(25)
      .order('published_at', { ascending: false })

    if (enrichErr) throw enrichErr

    const unclassified = [...(brandNew || []), ...(needsEnrichment || [])]

    if (unclassified.length === 0) {
      console.log('[Classify] No articles found needing classification or enrichment')
      return NextResponse.json({
        success: true,
        message: 'No articles to process',
        classifiedCount: 0,
        enrichedCount: 0,
        totalProcessed: 0
      })
    }

    console.log(`[Classify] Found ${brandNew?.length || 0} new + ${needsEnrichment?.length || 0} needing enrichment = ${unclassified.length} total`)

    let classifiedCount = 0
    let enrichedCount = 0
    let fixedImageCount = 0
    const errors: any[] = []

    // Process in batches of 5 (reduced from 10 to stay within Sonnet rate limits)
    const batchSize = 5
    for (let i = 0; i < unclassified.length; i += batchSize) {
      const batch = unclassified.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (article: any) => {
          try {
            const classified = await classifyArticle(article)
            const cleanSummary = stripHTML(article.summary || '')
            const keywords = extractKeywords(`${article.title} ${classified.aiSummary} ${cleanSummary}`)

            // Phase 1: Core fields
            const updateData: any = {
              ai_summary: classified.aiSummary,
              category: classified.category,
              platforms: classified.platforms,
              audience: classified.audience,
              impact_level: classified.impactLevel,
              relevance_score: Math.round(classified.relevanceScore > 1 ? classified.relevanceScore : (classified.relevanceScore || 0) * 100),
              classified_at: new Date().toISOString()
            }

            if (!article.image_url) {
              let imageUrl = classified.unsplashQuery ? await searchUnsplashImage(classified.unsplashQuery) : null
              if (!imageUrl) imageUrl = getCategoryFallbackImage(classified.category)
              updateData.image_url = imageUrl
              fixedImageCount++
            }

            const { error: updateError } = await getSupabase().from('articles').update(updateData).eq('id', article.id)
            if (updateError) {
              errors.push({ articleId: article.id, error: updateError })
              return
            }

            // Phase 2: Deep insight fields + cleaned summary
            const insightData: any = {
              our_take: classified.ourTake,
              key_takeaways: classified.keyTakeaways,
              bottom_line: classified.bottomLine,
              key_stat: classified.keyStat,
              what_this_means: classified.whatThisMeans,
              summary: cleanSummary
            }

            const { error: insightError } = await getSupabase().from('articles').update(insightData).eq('id', article.id)
            if (!insightError) enrichedCount++

            // Insert keywords and categories (may fail due to article_id type mismatch â non-fatal)
            try {
              await insertKeywords(article.id, keywords)
            } catch (kwErr) {
              console.warn(`[Classify] Keyword insertion failed for ${article.id} (article_id type mismatch?):`, kwErr)
            }
            try {
              await insertCategories(article.id, classified.category, classified.platforms, classified.relevanceScore)
            } catch (catErr) {
              console.warn(`[Classify] Category insertion failed for ${article.id} (article_id type mismatch?):`, catErr)
            }

            classifiedCount++
          } catch (error) {
            console.error(`[Classify] Error for article ${article.id}:`, error instanceof Error ? error.message : String(error))
            errors.push({ articleId: article.id, error: error instanceof Error ? error.message : String(error) })
          }
        })
      )
    }

    console.log(`[Classify] Complete: ${classifiedCount} classified, ${enrichedCount} enriched, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      classifiedCount,
      enrichedCount,
      fixedImageCount,
      totalProcessed: unclassified.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Classification endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
