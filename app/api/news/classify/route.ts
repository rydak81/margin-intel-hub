import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { classifyArticle, evaluateOperatorValue, extractKeywords, stripHTML } from '@/lib/news-classification'
import { generateAndStoreArticleImage } from '@/lib/article-image-generation'
import { isGoodArticleImage } from '@/lib/article-images'
import { budgetExhausted } from '@/lib/news-aggregation/pipeline-helpers'

// Don't start a new batch after this point; leaves room under maxDuration (60s) for the last batch to finish.
const CLASSIFY_BUDGET_MS = 32000

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

function needsFreshArticleImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true
  if (!isGoodArticleImage(imageUrl)) return true

  const lowerUrl = imageUrl.toLowerCase()
  return lowerUrl.includes('images.unsplash.com') || lowerUrl.includes('source.unsplash.com')
}

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!hasAIKey) {
      return NextResponse.json({ error: 'No AI API key configured' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Classify] Auth mismatch -- may be a manual trigger without CRON_SECRET')
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

    const { data: needsImageRefresh, error: imageRefreshErr } = await getSupabase()
      .from('articles')
      .select('*')
      .eq('relevant', true)
      .or('image_url.is.null,image_url.like.%images.unsplash.com%,image_url.like.%source.unsplash.com%')
      .limit(20)
      .order('published_at', { ascending: false })

    if (imageRefreshErr) throw imageRefreshErr

    const unclassified = Array.from(
      new Map(
        [...(brandNew || []), ...(needsEnrichment || []), ...(needsImageRefresh || [])].map((article) => [article.id, article])
      ).values()
    )

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

    console.log(
      `[Classify] Found ${brandNew?.length || 0} new + ${needsEnrichment?.length || 0} needing enrichment + ${needsImageRefresh?.length || 0} needing image refresh = ${unclassified.length} total`
    )

    let classifiedCount = 0
    let enrichedCount = 0
    let fixedImageCount = 0
    let generatedImageCount = 0
    const errors: any[] = []

    // Process in batches of 5 (reduced from 10 to stay within Sonnet rate limits)
    const batchSize = 5
    let skippedForTime = 0
    for (let i = 0; i < unclassified.length; i += batchSize) {
      // Each batch (model call + image generation) takes ~10-25s. Starting one late used to
      // run past maxDuration (60s), killing the function and discarding in-flight work.
      if (budgetExhausted(startTime, CLASSIFY_BUDGET_MS)) {
        skippedForTime = unclassified.length - i
        console.log(`[Classify] Time budget reached; deferring ${skippedForTime} articles to the next run`)
        break
      }
      const batch = unclassified.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (article: any) => {
          try {
            const needsClassification = !article.ai_summary || !article.our_take
            const classified = needsClassification
              ? evaluateOperatorValue(article, await classifyArticle(article))
              : {
                  aiSummary: article.ai_summary || stripHTML(article.summary || ''),
                  ourTake: article.our_take || '',
                  keyTakeaways: article.key_takeaways || [],
                  bottomLine: article.bottom_line || '',
                  whatThisMeans: article.what_this_means || null,
                  category: article.category || 'market_metrics',
                  platforms: article.platforms || [],
                  audience: article.audience || [],
                  impactLevel: article.impact_level || 'medium',
                  keyStat: article.key_stat || null,
                  relevanceScore: Math.max(0, Math.min(1, Number(article.relevance_score || 50) / 100)),
                  unsplashQuery: '',
                  relevant: article.relevant !== false,
                  rejectionReason: article.rejection_reason || null,
                }
            const cleanSummary = stripHTML(article.summary || '')
            const keywords = extractKeywords(`${article.title} ${classified.aiSummary} ${cleanSummary}`)

            // Phase 1: Core fields
            const updateData: any = {
              ai_summary: classified.aiSummary,
              category: classified.category,
              platforms: classified.platforms,
              audience: classified.audience,
              impact_level: classified.impactLevel,
              relevant: classified.relevant,
              relevance_score: Math.round(classified.relevanceScore > 1 ? classified.relevanceScore : (classified.relevanceScore || 0) * 100),
              rejection_reason: classified.rejectionReason,
              classified_at: new Date().toISOString()
            }

            if (needsFreshArticleImage(article.image_url)) {
              const generatedImage = await generateAndStoreArticleImage({
                id: article.id,
                title: article.title,
                summary: classified.aiSummary || cleanSummary || article.summary || '',
                category: classified.category,
                platforms: classified.platforms,
                sourceName: article.source_name,
                publishedAt: article.published_at,
              })

              let imageUrl = generatedImage?.imageUrl || null

              if (generatedImage?.imageUrl) {
                generatedImageCount++
              }

              if (!imageUrl && classified.unsplashQuery) {
                imageUrl = await searchUnsplashImage(classified.unsplashQuery)
              }
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
            if (needsClassification) {
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

              // Insert keywords and categories (may fail due to article_id type mismatch -- non-fatal)
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
            }

            if (needsClassification) {
              classifiedCount++
            }
          } catch (error) {
            console.error(`[Classify] Error for article ${article.id}:`, error instanceof Error ? error.message : String(error))
            errors.push({ articleId: article.id, error: error instanceof Error ? error.message : String(error) })
          }
        })
      )
    }

    console.log(`[Classify] Complete: ${classifiedCount} classified, ${enrichedCount} enriched, ${errors.length} errors, ${skippedForTime} deferred`)

    return NextResponse.json({
      success: true,
      classifiedCount,
      enrichedCount,
      fixedImageCount,
      generatedImageCount,
      totalProcessed: unclassified.length,
      deferredForTime: skippedForTime,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Classification endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
