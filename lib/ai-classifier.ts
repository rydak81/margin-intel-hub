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
  fullContent?: string // Full RSS content for modal display
  sourceName: string
  sourceUrl: string
  publishedAt: string
  imageUrl?: string
  originalRssImage?: string // Original RSS image before fallback
  hasRealImage?: boolean // Flag for hero selection
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
  hasRealImage?: boolean // Flag for hero/featured selection
}

// Track already-classified article IDs to avoid re-processing
const classifiedArticleIds = new Set<string>()

// ============================================================================
// KEYWORD-BASED FALLBACK (when AI is unavailable)
// ============================================================================

const RELEVANT_KEYWORDS = [
  'amazon seller', 'fba', 'fbm', 'seller central', 'walmart marketplace',
  'tiktok shop', 'shopify merchant', 'ebay seller', 'ecommerce',
  'e-commerce', 'marketplace', 'fulfillment', 'retail media',
  'sponsored products', 'amazon ads', 'buy box', 'private label',
  'referral fee', 'fba fee', 'reimbursement', '3pl',
]

const EXCLUDE_KEYWORDS = [
  'aws', 'amazon web services', 'prime video', 'kindle', 'alexa',
  'ring doorbell', 'fire tv', 'blue origin', 'twitch', 'oled tv',
  'smart tv', 'gaming console', 'recipe', 'movie', 'series',
  'rainforest', 'whole foods', 'amazon pharmacy',
]

function detectPlatformsFromText(text: string): string[] {
  const platforms: string[] = []
  if (text.match(/amazon|fba|fbm|seller central|asin/i)) platforms.push('amazon')
  if (text.match(/walmart|wfs|walmart connect/i)) platforms.push('walmart')
  if (text.match(/tiktok shop|tiktok seller/i)) platforms.push('tiktok')
  if (text.match(/shopify|shop pay|shopify fulfillment/i)) platforms.push('shopify')
  if (text.match(/ebay|promoted listing/i)) platforms.push('ebay')
  if (platforms.length === 0) platforms.push('multi_platform')
  return platforms
}

function fallbackClassify(article: RawArticle): ArticleClassification {
  const text = (article.title + ' ' + (article.summary || '')).toLowerCase()
  
  const hasRelevant = RELEVANT_KEYWORDS.some(kw => text.includes(kw))
  const hasExclude = EXCLUDE_KEYWORDS.some(kw => text.includes(kw))
  
  if (hasExclude && !hasRelevant) {
    return {
      index: 0,
      relevant: false,
      relevance_score: 0,
      category: 'platform_updates',
      platforms: ['multi_platform'],
      summary: '',
      is_breaking: false,
      audience: [],
      rejection_reason: 'Excluded content',
      ai_summary: '',
      impact_level: 'low',
      impact_detail: '',
      action_item: '',
      key_stat: null
    }
  }
  
  // Basic category detection
  let category: ArticleClassification['category'] = 'platform_updates'
  if (text.match(/fee|cost|margin|profit|reimburse/)) category = 'profitability'
  if (text.match(/acqui|merger|funding|ipo|aggregator/)) category = 'mergers_acquisitions'
  if (text.match(/ppc|acos|roas|sponsored|advertising|retail media/)) category = 'advertising'
  if (text.match(/ship|freight|tariff|3pl|logistics|fulfillment|warehouse/)) category = 'logistics'
  if (text.match(/tool|software|saas|api|integration|launch/)) category = 'tools_technology'
  if (text.match(/conference|summit|webinar|prosper|shoptalk/)) category = 'events'
  if (text.match(/how to|strategy|tip|guide|tutorial|best practice/)) category = 'tactics'
  if (text.match(/revenue|gmv|earnings|quarterly|market share|billion/)) category = 'market_metrics'
  if (text.match(/breaking|urgent|outage|suspended/)) category = 'breaking'
  
  return {
    index: 0,
    relevant: hasRelevant,
    relevance_score: hasRelevant ? 60 : 30,
    category,
    platforms: detectPlatformsFromText(text) as ArticleClassification['platforms'],
    summary: article.summary || '',
    is_breaking: false,
    audience: ['sellers'],
    rejection_reason: null,
    ai_summary: article.summary || '',
    impact_level: 'medium',
    impact_detail: '',
    action_item: '',
    key_stat: null
  }
}

// ============================================================================
// AI CLASSIFICATION (using direct Anthropic API)
// ============================================================================

async function classifyBatch(articles: RawArticle[]): Promise<ArticleClassification[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // If no API key, use fallback
  if (!apiKey) {
    console.log('[v0] ANTHROPIC_API_KEY not set — using keyword fallback')
    return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
  }
  
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
- action_item: specific next step the reader should take

Return ONLY the JSON array, no other text.`

  // Retry with exponential backoff for rate limits
  const maxRetries = 3
  let retryDelay = 2000 // Start with 2 seconds
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }]
        })
      })

      // Handle rate limits with retry
      if (response.status === 429) {
        if (attempt < maxRetries) {
          console.log(`[v0] Rate limited, waiting ${retryDelay / 1000}s before retry ${attempt + 1}/${maxRetries}...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          retryDelay *= 2 // Exponential backoff
          continue
        }
        console.error('[v0] Rate limit exceeded after all retries, using fallback')
        return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[v0] Anthropic API error ${response.status}:`, errorText)
        // Fallback to keyword classification
        return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
      }

      const data = await response.json()
      const rawText = data.content?.[0]?.text || '[]'

      // Strip markdown fences and parse the JSON response
      const text = rawText.replace(/```json\n?|```\n?/g, '').trim()
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.error('[v0] Could not parse AI response as JSON')
        return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
      }

      const parsed = JSON.parse(jsonMatch[0])
      console.log(`[v0] Anthropic API call successful, received ${parsed.length} classifications`)
      return parsed as ArticleClassification[]

    } catch (error) {
      console.error('[v0] AI classification batch failed:', error)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        retryDelay *= 2
        continue
      }
      // Fallback to keyword classification
      return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
    }
  }
  
  // Should never reach here, but fallback just in case
  return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
}

const BATCH_SIZE = 12 // 12 articles per API call
const DELAY_BETWEEN_BATCHES = 8000 // 8 seconds between batches to stay under 10k tokens/min

/**
 * Classify all articles in batches with rate limiting
 * Processes SEQUENTIALLY to avoid rate limits (10k output tokens/min)
 */
export async function classifyAllArticles(articles: RawArticle[]): Promise<ArticleClassification[]> {
  console.log(`[v0] Starting AI classification for ${articles.length} articles...`)
  
  // Split into batches
  const batches: RawArticle[][] = []
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    batches.push(articles.slice(i, i + BATCH_SIZE))
  }

  console.log(`[v0] Processing ${batches.length} batches sequentially (${DELAY_BETWEEN_BATCHES / 1000}s between each)`)

  const results: ArticleClassification[] = []
  
  // Process batches SEQUENTIALLY to avoid rate limits
  for (let i = 0; i < batches.length; i++) {
    console.log(`[v0] Processing batch ${i + 1}/${batches.length}...`)
    
    const batchResult = await classifyBatch(batches[i])
    results.push(...batchResult)
    
    // Wait between batches to respect rate limits (except for the last batch)
    if (i < batches.length - 1) {
      console.log(`[v0] Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`)
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
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
