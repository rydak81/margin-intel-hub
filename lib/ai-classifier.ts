import { z } from 'zod'
import { aiComplete, parseAIJson, getAIStrategyDescription } from './ai-providers'

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

// ============================================================================
// SYSTEM PROMPT — Enhanced for richer AI summaries and insights
// ============================================================================

const SYSTEM_PROMPT = `You are an expert editorial analyst and intelligence classifier for "MarketplaceBeta,"
a marketplace seller intelligence platform. Your audience includes Amazon/Walmart/eBay sellers,
e-commerce brand operators, marketplace agencies, SaaS tool providers, and e-commerce investors.

Your job is to evaluate news articles and provide INTELLIGENT ANALYSIS:
1. Determine if articles are RELEVANT to marketplace selling and e-commerce operations
2. Categorize and tag them accurately
3. Write insightful, analyst-grade summaries that go beyond restating headlines
4. Identify specific implications, opportunities, and risks for sellers

RELEVANT articles cover:
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
  is sold there, not because the article is about the marketplace/platform itself

SUMMARY QUALITY STANDARDS:
- Write like a Bloomberg/Morning Brew analyst, not a content mill
- Lead with the "so what" — why should a seller care?
- Include specific numbers, percentages, dates, and dollar amounts when available
- Connect the news to broader trends (e.g., "This continues the trend of...")
- Identify winners and losers — which sellers benefit, which are hurt?
- Make the action_item genuinely useful, not generic advice`

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
  ourTake?: string
  whatThisMeans?: string
  keyTakeaways?: string[]
  relatedContext?: string
  bottomLine?: string
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
// KEYWORD-BASED FALLBACK (when ALL AI providers are unavailable)
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
  if (text.match(/target\+|target plus|target marketplace/i)) platforms.push('target')
  if (text.match(/etsy|etsy seller/i)) platforms.push('etsy')
  if (text.match(/temu/i)) platforms.push('temu')
  if (text.match(/shein/i)) platforms.push('shein')
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
// MULTI-PROVIDER AI CLASSIFICATION
// ============================================================================

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
    "summary": "One clear sentence on why this matters to e-commerce professionals",
    "is_breaking": true or false,
    "audience": ["sellers", "agencies", "saas", "investors", "service_providers"],
    "rejection_reason": "Only if relevant=false, explain why in 5 words or less",
    "ai_summary": "An analyst-grade seller-focused insight (2-3 sentences). Lead with 'so what.' Include specific numbers/dates. Connect to broader industry trends. Identify who wins and who loses.",
    "impact_level": "high" or "medium" or "low",
    "impact_detail": "Who exactly is affected, estimated magnitude, and timeline",
    "action_item": "A specific, actionable next step (not generic advice like 'stay informed')",
    "key_stat": "The single most important number or data point (null if none)"
  }
]

Rules:
- If the article is a consumer product review, device launch, or buyer guide: relevant=false
- If "Amazon" is only mentioned because a product is sold there: relevant=false
- relevance_score: 80-100 = highly relevant, 50-79 = moderately relevant, below 50 = reject
- is_breaking: only true for major policy changes, platform outages, or urgent fee changes
- ai_summary: write like a Bloomberg analyst — specific, opinionated, numbers-first. Example: "Amazon's 5% referral fee hike on electronics (effective May 1) will squeeze margins for small sellers doing <$1M/yr. Large brands with negotiated rates are unaffected. This follows Walmart's similar move in Q4, signaling industry-wide fee compression."
- audience: tag ALL segments that would care about this article
- impact_level: high = affects many sellers significantly, medium = affects some sellers, low = minor/niche
- action_item: give a SPECIFIC action, e.g. "Audit your FBA inventory before April 15 to avoid new overage fees" instead of "Review your fees"

Return ONLY the JSON array, no other text.`

  // Retry with exponential backoff
  const maxRetries = 2
  let retryDelay = 2000

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await aiComplete({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        maxTokens: 4000,
        purpose: `classify batch of ${articles.length} articles`,
      })

      const parsed = parseAIJson<ArticleClassification[]>(result.text, 'array')
      if (!parsed || parsed.length === 0) {
        console.error(`[AI] Could not parse classification response from ${result.provider}`)
        if (attempt < maxRetries) continue
        return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
      }

      console.log(`[AI] Classified ${parsed.length} articles via ${result.provider} (${result.model}) in ${result.latencyMs}ms`)
      return parsed

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)

      if (msg === 'NO_AI_PROVIDER') {
        console.log('[AI] No AI providers available — using keyword fallback')
        return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
      }

      console.error(`[AI] Classification attempt ${attempt + 1} failed: ${msg}`)
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, retryDelay))
        retryDelay *= 2
        continue
      }

      // All retries exhausted — keyword fallback
      return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
    }
  }

  return articles.map((a, i) => ({ ...fallbackClassify(a), index: i }))
}

const BATCH_SIZE = 25
const DELAY_BETWEEN_BATCHES = 2000
const PARALLEL_BATCHES = 2

/**
 * Classify all articles in batches with rate limiting.
 * Uses parallel batch processing to fit within Vercel's 120s timeout.
 * With 50 articles: 2 batches of 25, processed in parallel ≈ 30-35s total.
 */
export async function classifyAllArticles(articles: RawArticle[]): Promise<ArticleClassification[]> {
  console.log(`[AI] Starting classification for ${articles.length} articles — ${getAIStrategyDescription()}`)

  const batches: RawArticle[][] = []
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    batches.push(articles.slice(i, i + BATCH_SIZE))
  }

  console.log(`[AI] Processing ${batches.length} batches (${PARALLEL_BATCHES} concurrent, ${DELAY_BETWEEN_BATCHES / 1000}s between waves)`)

  const results: ArticleClassification[] = []

  // Process batches in parallel waves
  for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
    const wave = batches.slice(i, i + PARALLEL_BATCHES)
    const waveNum = Math.floor(i / PARALLEL_BATCHES) + 1
    const totalWaves = Math.ceil(batches.length / PARALLEL_BATCHES)
    console.log(`[AI] Processing wave ${waveNum}/${totalWaves} (${wave.length} batches in parallel)...`)

    const waveResults = await Promise.all(
      wave.map(batch => classifyBatch(batch))
    )
    for (const batchResult of waveResults) {
      results.push(...batchResult)
    }

    // Brief delay between waves (not after the last one)
    if (i + PARALLEL_BATCHES < batches.length) {
      console.log(`[AI] Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next wave...`)
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }

  console.log(`[AI] Classification complete. ${results.length} articles processed.`)
  return results
}

/**
 * Mark an article as classified
 */
export function markAsClassified(articleId: string): void {
  classifiedArticleIds.add(articleId)
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
