import { generateText, Output } from 'ai'
import { z } from 'zod'

// Classification result schema
const ArticleClassificationSchema = z.object({
  index: z.number(),
  relevant: z.boolean(),
  relevance_score: z.number().min(0).max(100),
  category: z.enum([
    'breaking',
    'market_metrics',
    'platform_updates',
    'profitability',
    'mergers_acquisitions',
    'tools_technology',
    'advertising',
    'logistics',
    'events',
    'tactics'
  ]),
  platforms: z.array(z.enum([
    'amazon', 'walmart', 'tiktok', 'shopify', 'ebay', 
    'etsy', 'target', 'temu', 'shein', 'multi_platform'
  ])),
  summary: z.string(),
  is_breaking: z.boolean(),
  audience: z.array(z.enum(['sellers', 'agencies', 'saas', 'investors', 'service_providers'])),
  rejection_reason: z.string().nullable(),
  ai_summary: z.string(),
  impact_level: z.enum(['high', 'medium', 'low']),
  impact_detail: z.string(),
  action_item: z.string(),
  key_stat: z.string().nullable()
})

const ClassificationResponseSchema = z.array(ArticleClassificationSchema)

export type ArticleClassification = z.infer<typeof ArticleClassificationSchema>

// System prompt for the AI classifier
const SYSTEM_PROMPT = `You are an expert editorial classifier for an e-commerce 
and marketplace seller industry news platform called "Ecom Intel Hub." Your 
audience is: Amazon/Walmart/eBay sellers, e-commerce brand operators, marketplace 
agencies, SaaS tool providers, and e-commerce investors.

Your job is to evaluate news articles and determine:
1. Whether they are RELEVANT to marketplace selling and e-commerce operations
2. How to categorize and tag them
3. How to summarize them for a professional audience

RELEVANT articles are about:
- Selling on Amazon, Walmart, eBay, TikTok Shop, Shopify, Target+, Etsy, Temu, Shein
- Marketplace fees, policies, algorithms, or program changes
- Seller tools, SaaS products, or technology for e-commerce
- E-commerce advertising (Amazon Ads, Walmart Connect, retail media networks)
- Fulfillment, logistics, shipping, and supply chain for online sellers
- M&A activity involving e-commerce brands, agencies, aggregators, or SaaS
- Industry metrics (GMV, seller counts, marketplace earnings, market share data)
- Tariffs, trade policy, or regulations affecting online sellers
- Industry events and conferences (Prosper Show, Amazon Accelerate, Shoptalk, etc.)
- Tactics, strategies, and best practices for marketplace sellers

NOT RELEVANT articles include:
- Consumer product reviews or launches (TVs, phones, laptops, gadgets, appliances)
- Amazon device news (Alexa, Echo, Ring, Fire TV, Kindle)
- Amazon Web Services / AWS / cloud computing
- Amazon entertainment (Prime Video, MGM, Twitch, gaming)
- Amazon non-commerce initiatives (Blue Origin, healthcare, pharmacy, grocery)
- General "deal of the day" or "best products to buy" content
- Celebrity news, sports, weather, politics (unless directly about e-commerce policy)
- Crypto, stock market, or finance news (unless about e-commerce company earnings)
- Product spec comparisons or buyer guides aimed at consumers
- Amazon/Walmart labor disputes, union news, warehouse conditions
- Any article where "Amazon" or "Walmart" is only mentioned because a product 
  is sold there, not because the article is about the marketplace/platform itself`

export interface RawArticle {
  id: string
  title: string
  summary: string
  sourceName: string
  sourceUrl: string
  publishedAt: string
  imageUrl?: string
  tier: number
  sourceType: 'industry' | 'google'
}

export interface ClassifiedArticle extends RawArticle {
  relevant: boolean
  relevanceScore: number
  category: string
  platforms: string[]
  aiSummary: string
  isBreaking: boolean
  audience: string[]
  impactLevel: 'high' | 'medium' | 'low'
  impactDetail: string
  actionItem: string
  keyStat: string | null
  rejectionReason: string | null
}

// Track already-classified article IDs to avoid re-processing
const classifiedArticleIds = new Set<string>()

/**
 * Classify a batch of articles using Claude Haiku 4.5
 */
async function classifyBatch(articles: RawArticle[]): Promise<ArticleClassification[]> {
  const articlesText = articles.map((a, i) => 
    `[${i}] TITLE: ${a.title}\nSOURCE: ${a.sourceName}\nSUMMARY: ${a.summary || 'No summary available'}`
  ).join('\n\n')

  const userPrompt = `Classify each of these ${articles.length} articles. 
For each article, return a JSON array with one object per article:

${articlesText}

Return this exact JSON structure (array of objects):
[
  {
    "index": 0,
    "relevant": true or false,
    "relevance_score": 0-100,
    "category": "one of: breaking, market_metrics, platform_updates, profitability, mergers_acquisitions, tools_technology, advertising, logistics, events, tactics",
    "platforms": ["amazon", "walmart", "tiktok", "shopify", "ebay", "etsy", "target", "temu", "shein", "multi_platform"],
    "summary": "One clear sentence summarizing why this matters to e-commerce professionals",
    "is_breaking": true or false,
    "audience": ["sellers", "agencies", "saas", "investors", "service_providers"],
    "rejection_reason": "Only if relevant=false, explain why in 5 words or less",
    "ai_summary": "A seller-focused summary with specific details and numbers (2-3 sentences)",
    "impact_level": "high" or "medium" or "low",
    "impact_detail": "Who this affects and estimated magnitude",
    "action_item": "What the reader should do about this",
    "key_stat": "The most important number or data point from this article, if any (null if none)"
  }
]

Rules:
- If the article is a consumer product review, device launch, or buyer guide: relevant=false
- If "Amazon" is only mentioned because a product is sold there: relevant=false
- relevance_score: 80-100 = highly relevant, 50-79 = moderately relevant, below 50 = reject
- is_breaking: only true for major policy changes, platform outages, or urgent fee changes
- ai_summary: write for a professional audience, be specific about what changed and why it matters
- audience: tag which audience segments would care about this article
- impact_level: high = affects many sellers significantly, medium = affects some sellers, low = minor/niche impact
- action_item: specific next step the reader should take`

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-haiku-4-5-20251001',
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      output: Output.object({ schema: ClassificationResponseSchema }),
      maxOutputTokens: 4000,
    })

    return output || []
  } catch (error) {
    console.error('[v0] AI classification batch failed:', error)
    // Fallback: mark all articles as needing manual review
    return articles.map((_, i) => ({
      index: i,
      relevant: false,
      relevance_score: 0,
      category: 'platform_updates' as const,
      platforms: ['multi_platform' as const],
      summary: '',
      is_breaking: false,
      audience: [],
      rejection_reason: 'AI classification failed',
      ai_summary: '',
      impact_level: 'low' as const,
      impact_detail: '',
      action_item: '',
      key_stat: null
    }))
  }
}

const BATCH_SIZE = 12 // 12 articles per API call
const CONCURRENT_BATCHES = 3 // Process 3 batches at a time

/**
 * Classify all articles in batches with rate limiting
 */
export async function classifyAllArticles(articles: RawArticle[]): Promise<ArticleClassification[]> {
  console.log(`[v0] Starting AI classification for ${articles.length} articles...`)
  
  // Split into batches
  const batches: RawArticle[][] = []
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    batches.push(articles.slice(i, i + BATCH_SIZE))
  }

  console.log(`[v0] Processing ${batches.length} batches of ${BATCH_SIZE} articles each`)

  const results: ArticleClassification[] = []
  
  // Process batches with concurrency limit
  for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
    const concurrentBatches = batches.slice(i, i + CONCURRENT_BATCHES)
    const batchResults = await Promise.allSettled(
      concurrentBatches.map(batch => classifyBatch(batch))
    )
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(...result.value)
      }
    }
    
    // Small delay between concurrent groups to respect rate limits
    if (i + CONCURRENT_BATCHES < batches.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`[v0] Classification complete. ${results.length} articles processed.`)
  return results
}

/**
 * Filter out articles that have already been classified
 */
export function getUnclassifiedArticles(articles: RawArticle[]): RawArticle[] {
  return articles.filter(a => !classifiedArticleIds.has(a.id))
}

/**
 * Mark an article as classified
 */
export function markAsClassified(articleId: string): void {
  classifiedArticleIds.add(articleId)
}

/**
 * Clear the classification cache (useful for forcing re-classification)
 */
export function clearClassificationCache(): void {
  classifiedArticleIds.clear()
}

/**
 * Merge classification results back into raw articles
 */
export function mergeClassifications(
  articles: RawArticle[], 
  classifications: ArticleClassification[]
): ClassifiedArticle[] {
  return articles.map((article, index) => {
    const classification = classifications[index]
    
    if (!classification) {
      // If classification failed, return with default values
      return {
        ...article,
        relevant: false,
        relevanceScore: 0,
        category: 'platform_updates',
        platforms: ['multi_platform'],
        aiSummary: article.summary,
        isBreaking: false,
        audience: [],
        impactLevel: 'low' as const,
        impactDetail: '',
        actionItem: '',
        keyStat: null,
        rejectionReason: 'Classification not available'
      }
    }
    
    // Mark as classified
    markAsClassified(article.id)
    
    return {
      ...article,
      relevant: classification.relevant,
      relevanceScore: classification.relevance_score,
      category: classification.category,
      platforms: classification.platforms,
      aiSummary: classification.ai_summary || classification.summary,
      isBreaking: classification.is_breaking,
      audience: classification.audience,
      impactLevel: classification.impact_level,
      impactDetail: classification.impact_detail,
      actionItem: classification.action_item,
      keyStat: classification.key_stat,
      rejectionReason: classification.rejection_reason
    }
  })
}
