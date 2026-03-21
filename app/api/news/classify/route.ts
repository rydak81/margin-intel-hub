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
 */
async function classifyArticle(article: any) {
  const prompt = `You are a senior marketplace intelligence analyst writing for e-commerce sellers, agencies, and brands who operate on Amazon, Walmart, Shopify, eBay, and TikTok Shop.

Analyze this article and provide deep, actionable insights.

ARTICLE:
Title: ${article.title}
Summary: ${article.summary}
${article.full_content ? `Full Content: ${article.full_content.substring(0, 3000)}` : ''}

Provide a JSON response with EXACTLY this structure (no markdown, no code blocks, pure JSON only):
{
  "aiSummary": "A 2-4 sentence analyst-grade summary. Start with what happened, then explain WHY it matters to sellers. Include specific numbers, dates, platform names, and fee amounts where available. Do NOT be generic — write like a Bloomberg analyst covering the marketplace economy.",
  "ourTake": "2-3 sentences of non-obvious insight. What is the second-order effect? What should smart operators do differently because of this? Connect to broader industry trends (tariffs, AI, platform competition, margin compression). Write like an experienced operator giving advice to a peer.",
  "keyTakeaways": ["Specific, actionable takeaway with concrete details", "Second actionable item mentioning tools, settings, or workflows", "Third item — what to watch for next or how to prepare"],
  "bottomLine": "A quotable one-liner that captures the essence — designed for LinkedIn sharing",
  "category": "one of: breaking, platform_updates, market_metrics, profitability, mergers_acquisitions, tools_technology, advertising, logistics, events, tactics, compliance_policy",
  "platforms": ["amazon", "walmart", "shopify", "ebay", "tiktok", "target", "etsy"] (only platforms actually mentioned or directly relevant),
  "audience": ["sellers", "agencies", "brands", "new_sellers", "experts"] (who should care most),
  "impactLevel": "high if it affects fees/policy/revenue directly, medium if operational, low if informational",
  "keyStat": "The single most important number or metric from the article, or null if none",
  "relevanceScore": 0.0-1.0 (1.0 = directly impacts seller operations or revenue, 0.3 = tangentially related to e-commerce),
  "unsplashQuery": "2-3 word search query for a relevant stock photo (e.g. 'warehouse shipping', 'online shopping', 'data analytics')"
}

IMPORTANT: All string values must be on a single line with no literal newline characters. Use spaces between sentences, not line breaks. Respond with ONLY valid JSON, no other text.`

  const { data: parsed, provider, model } = await callAIForJSON<any>({
    prompt,
    maxTokens: 2048
  })
  console.log(`[Classify] Article classified via ${provider} (${model})`)

  return {
    aiSummary: parsed.aiSummary || '',
    ourTake: parsed.ourTake || '',
    keyTakeaways: parsed.keyTakeaways || [],
    bottomLine: parsed.bottomLine || '',
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch unclassified articles (increased from 25 to 50)
    const { data: unclassified, error: fetchError } = await getSupabase()
      .from('articles')
      .select('*')
      .is('ai_summary', null)
      .limit(50)
      .order('published_at', { ascending: false })

    if (fetchError) throw fetchError

    let classifiedCount = 0
    let enrichedCount = 0
    let fixedImageCount = 0
    const errors: any[] = []

    // Process in batches of 10 (increased from 5)
    const batchSize = 10
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
              summary: cleanSummary
            }

            const { error: insightError } = await getSupabase().from('articles').update(insightData).eq('id', article.id)
            if (!insightError) enrichedCount++

            // Insert keywords and categories (may fail due to article_id type mismatch — non-fatal)
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
            console.error(`Classification error for article ${article.id}:`, error)
            errors.push({ articleId: article.id, error: error instanceof Error ? error.message : String(error) })
          }
        })
      )
    }

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
