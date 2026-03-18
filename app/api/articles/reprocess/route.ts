import { NextResponse } from "next/server"
import { 
  getArticlesNeedingAI, 
  updateArticleWithAI,
  saveArticles 
} from "@/lib/article-store"
import { 
  classifyAllArticles, 
  type RawArticle, 
  type ClassifiedArticle 
} from "@/lib/ai-classifier"

export const dynamic = 'force-dynamic'
export const maxDuration = 120 // Allow up to 120 seconds for AI processing

/**
 * POST /api/articles/reprocess
 * 
 * Finds articles in the database that are missing AI summaries/insights
 * and reprocesses them through the AI classification pipeline.
 * 
 * This ensures ALL articles have consistent AI-generated:
 * - Insightful summaries (not just regurgitated content)
 * - Impact analysis (high/medium/low with details)
 * - Action items for sellers
 * - Key statistics extracted
 * - Audience targeting
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 50)
    const dryRun = searchParams.get('dry_run') === 'true'

    console.log(`[Reprocess] Starting AI reprocessing (limit=${limit}, dryRun=${dryRun})...`)

    // Step 1: Find articles missing AI summaries
    const articlesNeedingAI = await getArticlesNeedingAI(limit)

    if (articlesNeedingAI.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All articles already have AI summaries",
        processed: 0,
        total: 0,
      })
    }

    console.log(`[Reprocess] Found ${articlesNeedingAI.length} articles needing AI processing`)

    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: "Dry run - no changes made",
        articlesNeedingAI: articlesNeedingAI.map(a => ({
          id: a.id,
          title: a.title,
          currentSummary: a.aiSummary?.substring(0, 100) || '(none)',
          hasImpactDetail: !!a.impactDetail,
          hasActionItem: !!a.actionItem,
        })),
        total: articlesNeedingAI.length,
      })
    }

    // Step 2: Convert to RawArticle format for AI classifier
    const rawArticles: RawArticle[] = articlesNeedingAI.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary || '',
      fullContent: a.fullContent || a.summary || '',
      sourceName: a.sourceName,
      sourceUrl: a.sourceUrl,
      publishedAt: a.publishedAt,
      imageUrl: a.imageUrl,
      originalRssImage: a.originalRssImage,
      hasRealImage: a.hasRealImage,
      tier: a.tier || 3,
      sourceType: a.sourceType || 'industry',
    }))

    // Step 3: Run through AI classification (same pipeline as new articles)
    console.log(`[Reprocess] Sending ${rawArticles.length} articles to AI for classification...`)
    const classifications = await classifyAllArticles(rawArticles)

    // Step 4: Merge classifications and update database
    let successCount = 0
    let failCount = 0
    const results: Array<{ id: string; title: string; status: string; preview?: string }> = []

    for (let i = 0; i < rawArticles.length; i++) {
      const article = rawArticles[i]
      const classification = classifications.find(c => c.index === i)

      if (!classification || !classification.ai_summary) {
        failCount++
        results.push({
          id: article.id,
          title: article.title,
          status: 'failed',
        })
        continue
      }

      // Update the article in Supabase with new AI content
      const updated = await updateArticleWithAI(article.id, {
        aiSummary: classification.ai_summary,
        impactLevel: classification.impact_level,
        impactDetail: classification.impact_detail,
        actionItem: classification.action_item,
        keyStat: classification.key_stat,
        audience: classification.audience,
      })

      if (updated) {
        successCount++
        results.push({
          id: article.id,
          title: article.title,
          status: 'success',
          preview: classification.ai_summary.substring(0, 150) + '...',
        })
      } else {
        failCount++
        results.push({
          id: article.id,
          title: article.title,
          status: 'db_error',
        })
      }
    }

    console.log(`[Reprocess] Complete: ${successCount} success, ${failCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Reprocessed ${successCount} articles with AI`,
      processed: successCount,
      failed: failCount,
      total: articlesNeedingAI.length,
      results,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Reprocess] Error:', message)
    
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}

/**
 * GET /api/articles/reprocess
 * 
 * Check how many articles need reprocessing (diagnostic endpoint)
 */
export async function GET() {
  try {
    const articlesNeedingAI = await getArticlesNeedingAI(100)

    return NextResponse.json({
      success: true,
      articlesNeedingReprocessing: articlesNeedingAI.length,
      sample: articlesNeedingAI.slice(0, 5).map(a => ({
        id: a.id,
        title: a.title,
        hasAiSummary: !!a.aiSummary && a.aiSummary.length > 100,
        hasImpactDetail: !!a.impactDetail,
        hasActionItem: !!a.actionItem,
        publishedAt: a.publishedAt,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}
