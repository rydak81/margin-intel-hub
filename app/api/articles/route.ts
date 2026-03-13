import { NextResponse } from "next/server"
import Parser from "rss-parser"
import { generateText, Output } from "ai"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 900 // Revalidate every 15 minutes
export const maxDuration = 60 // Allow up to 60 seconds for AI processing

// ============================================================================
// TYPES
// ============================================================================

interface RawArticle {
  title: string
  link: string
  pubDate?: string
  contentSnippet?: string
  content?: string
  creator?: string
  source: string
  tier: number
  sourceType: 'industry' | 'google' | 'reddit'
}

interface ProcessedArticle {
  id: string
  title: string
  summary: string
  sourceUrl: string
  sourceName: string
  publishedAt: string
  category: string
  platforms: string[]
  imageUrl?: string
  relevanceScore: number
  tier: number
  sourceType: 'industry' | 'google' | 'reddit'
  tags: string[]
  aiAnalysis: {
    isRelevant: boolean
    reasoning: string
    sentiment: 'positive' | 'negative' | 'neutral'
  }
}

interface RSSFeed {
  url: string
  name: string
  tier: number
  label?: string
}

// ============================================================================
// AI ANALYSIS SCHEMA
// ============================================================================

const articleAnalysisSchema = z.object({
  isRelevant: z.boolean().describe('Whether this article is relevant for e-commerce sellers, marketplace operators, or industry professionals'),
  relevanceScore: z.number().min(0).max(100).describe('Relevance score from 0-100 for e-commerce seller audience'),
  reasoning: z.string().describe('Brief explanation of why this article is or is not relevant'),
  category: z.enum([
    'platform-updates',      // Amazon, Walmart, TikTok Shop policy/feature changes
    'seller-operations',     // FBA, fulfillment, inventory, logistics
    'advertising',           // PPC, sponsored products, retail media
    'profitability',         // Fees, margins, reimbursements, pricing
    'market-trends',         // Industry news, M&A, market shifts
    'tools-technology',      // Seller tools, SaaS, automation
    'compliance-policy',     // Account health, policy changes, legal
    'strategy-tactics',      // Best practices, case studies, how-tos
    'irrelevant'             // Not for e-commerce sellers
  ]).describe('The primary category for this article'),
  platforms: z.array(z.enum([
    'amazon', 'walmart', 'tiktok-shop', 'ebay', 'etsy', 'shopify', 'target', 'multi-channel', 'general'
  ])).describe('Which marketplace platforms this article is about'),
  tags: z.array(z.string()).max(5).describe('Up to 5 relevant tags/keywords'),
  sentiment: z.enum(['positive', 'negative', 'neutral']).describe('Overall sentiment for sellers'),
  improvedSummary: z.string().max(300).describe('A concise, seller-focused summary (max 300 chars)'),
})

// ============================================================================
// RSS FEED SOURCES
// ============================================================================

const INDUSTRY_RSS_FEEDS: RSSFeed[] = [
  // Tier 1 — Core Industry Publications (most trusted)
  { url: 'https://www.marketplacepulse.com/feed', name: 'Marketplace Pulse', tier: 1 },
  { url: 'https://www.digitalcommerce360.com/feed/', name: 'Digital Commerce 360', tier: 1 },
  { url: 'https://www.modernretail.co/feed/', name: 'Modern Retail', tier: 1 },
  { url: 'https://www.retaildive.com/feeds/news/', name: 'Retail Dive', tier: 1 },
  { url: 'https://www.ecommercebytes.com/feed/', name: 'EcommerceBytes', tier: 1 },
  { url: 'https://channelx.world/feed/', name: 'ChannelX', tier: 1 },
  
  // Tier 2 — Platform & Tool Blogs  
  { url: 'https://www.junglescout.com/blog/feed/', name: 'Jungle Scout', tier: 2 },
  { url: 'https://ecomcrew.com/feed/', name: 'EcomCrew', tier: 2 },
  { url: 'https://www.supplychaindive.com/feeds/news/', name: 'Supply Chain Dive', tier: 2 },
  
  // Tier 3 — Business Press
  { url: 'https://techcrunch.com/category/commerce/feed/', name: 'TechCrunch Commerce', tier: 3 },
]

const GOOGLE_NEWS_FEEDS: RSSFeed[] = [
  // Seller-specific searches
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+seller%22+OR+%22Amazon+FBA%22+OR+%22Seller+Central%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Amazon Seller News',
    tier: 3
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Walmart+marketplace%22+OR+%22TikTok+Shop%22+OR+%22ecommerce+seller%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Marketplace News',
    tier: 3
  },
]

const REDDIT_FEEDS: RSSFeed[] = [
  { url: 'https://www.reddit.com/r/FulfillmentByAmazon/hot/.rss', name: 'r/FulfillmentByAmazon', tier: 4 },
  { url: 'https://www.reddit.com/r/AmazonSeller/hot/.rss', name: 'r/AmazonSeller', tier: 4 },
]

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

let articlesCache: ProcessedArticle[] = []
let lastCacheUpdate: number = 0
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

// ============================================================================
// RSS FETCHING
// ============================================================================

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'EcomIntelHub/1.0 (News Aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [['media:content', 'mediaContent']],
  },
})

async function fetchRSSFeed(feed: RSSFeed, sourceType: 'industry' | 'google' | 'reddit'): Promise<RawArticle[]> {
  try {
    const feedData = await parser.parseURL(feed.url)
    const articles: RawArticle[] = []
    
    // Take more articles for AI to filter (AI will determine relevance)
    const items = feedData.items.slice(0, 15)
    
    for (const item of items) {
      if (!item.title || !item.link) continue
      
      // Skip very old articles (> 7 days)
      if (item.pubDate) {
        const pubDate = new Date(item.pubDate)
        const daysSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSincePublished > 7) continue
      }
      
      articles.push({
        title: item.title.trim(),
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet?.slice(0, 500) || item.content?.slice(0, 500) || '',
        creator: item.creator,
        source: feed.label || feed.name,
        tier: feed.tier,
        sourceType,
      })
    }
    
    return articles
  } catch (error) {
    console.error(`[v0] Failed to fetch ${feed.name}:`, error)
    return []
  }
}

// ============================================================================
// AI-POWERED ARTICLE ANALYSIS
// ============================================================================

async function analyzeArticleWithAI(article: RawArticle): Promise<ProcessedArticle | null> {
  try {
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4',
      output: Output.object({ schema: articleAnalysisSchema }),
      messages: [
        {
          role: 'system',
          content: `You are an expert e-commerce industry analyst for Ecom Intel Hub, a news aggregator specifically for:
- Amazon, Walmart, TikTok Shop, and other marketplace SELLERS
- E-commerce brand owners and operators
- Agency professionals serving e-commerce clients
- Investors and M&A professionals in the e-commerce space

Your job is to analyze news articles and determine if they are RELEVANT to this professional audience.

RELEVANT topics include:
- Marketplace policy changes, fee updates, or new features
- Seller tools, software, and technology
- Advertising and retail media (PPC, sponsored products)
- Fulfillment, logistics, and operations
- Profitability, margins, reimbursements
- M&A activity in e-commerce
- Tariffs and regulations affecting sellers
- Success stories and case studies
- Industry trends and market analysis

IRRELEVANT topics include:
- Consumer product reviews or "best of" lists
- Personal shopping deals or discounts
- Entertainment (Prime Video, Twitch, etc.)
- AWS/cloud computing
- Amazon devices (Kindle, Echo, Fire TV)
- Celebrity news or gossip
- Amazon rainforest/environment
- General retail that doesn't affect sellers
- Food/recipes, travel, fashion trends`
        },
        {
          role: 'user',
          content: `Analyze this article for relevance to e-commerce sellers:

TITLE: ${article.title}
SOURCE: ${article.source}
SNIPPET: ${article.contentSnippet || 'No snippet available'}

Provide your analysis.`
        }
      ],
      maxOutputTokens: 500,
    })

    if (!output) return null

    // Filter out irrelevant articles
    if (!output.isRelevant || output.relevanceScore < 30 || output.category === 'irrelevant') {
      console.log(`[v0] AI filtered out: "${article.title.slice(0, 50)}..." (score: ${output.relevanceScore}, reason: ${output.reasoning.slice(0, 100)})`)
      return null
    }

    return {
      id: generateArticleId(article.link),
      title: article.title,
      summary: output.improvedSummary || article.contentSnippet?.slice(0, 300) || '',
      sourceUrl: article.link,
      sourceName: article.source,
      publishedAt: article.pubDate || new Date().toISOString(),
      category: output.category,
      platforms: output.platforms,
      relevanceScore: output.relevanceScore,
      tier: article.tier,
      sourceType: article.sourceType,
      tags: output.tags,
      aiAnalysis: {
        isRelevant: output.isRelevant,
        reasoning: output.reasoning,
        sentiment: output.sentiment,
      }
    }
  } catch (error) {
    console.error(`[v0] AI analysis failed for "${article.title.slice(0, 50)}":`, error)
    return null
  }
}

// Batch analyze articles with rate limiting
async function analyzeArticlesBatch(articles: RawArticle[], batchSize = 5): Promise<ProcessedArticle[]> {
  const results: ProcessedArticle[] = []
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(article => analyzeArticleWithAI(article))
    )
    
    results.push(...batchResults.filter((r): r is ProcessedArticle => r !== null))
    
    // Small delay between batches
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return results
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

function generateArticleId(url: string): string {
  const cleanUrl = url.replace(/[?#].*$/, '').toLowerCase()
  let hash = 0
  for (let i = 0; i < cleanUrl.length; i++) {
    const char = cleanUrl.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `art_${Math.abs(hash).toString(36)}`
}

function deduplicateArticles(articles: ProcessedArticle[]): ProcessedArticle[] {
  const seen = new Map<string, ProcessedArticle>()
  const titleSeen = new Set<string>()
  
  for (const article of articles) {
    // Skip if we've seen this exact URL
    if (seen.has(article.id)) continue
    
    // Skip if title is too similar to one we've seen
    const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (titleSeen.has(normalizedTitle)) continue
    
    seen.set(article.id, article)
    titleSeen.add(normalizedTitle)
  }
  
  return Array.from(seen.values())
}

// ============================================================================
// MAIN AGGREGATION FUNCTION
// ============================================================================

async function aggregateAndProcessArticles(): Promise<ProcessedArticle[]> {
  console.log('[v0] Starting AI-powered news aggregation...')
  
  // Fetch from all sources in parallel
  const [industryArticles, googleArticles, redditArticles] = await Promise.all([
    Promise.all(INDUSTRY_RSS_FEEDS.map(feed => fetchRSSFeed(feed, 'industry'))),
    Promise.all(GOOGLE_NEWS_FEEDS.map(feed => fetchRSSFeed(feed, 'google'))),
    Promise.all(REDDIT_FEEDS.map(feed => fetchRSSFeed(feed, 'reddit'))),
  ])
  
  const allRawArticles = [
    ...industryArticles.flat(),
    ...googleArticles.flat(),
    ...redditArticles.flat(),
  ]
  
  console.log(`[v0] Fetched ${allRawArticles.length} raw articles from all sources`)
  
  // Prioritize by tier and recency
  const sortedArticles = allRawArticles.sort((a, b) => {
    // Tier 1 first
    if (a.tier !== b.tier) return a.tier - b.tier
    // Then by date
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return dateB - dateA
  })
  
  // Take top articles for AI analysis (limit to control API costs)
  const articlesToAnalyze = sortedArticles.slice(0, 50)
  
  console.log(`[v0] Sending ${articlesToAnalyze.length} articles to Claude for AI analysis...`)
  
  // AI-powered analysis
  const processedArticles = await analyzeArticlesBatch(articlesToAnalyze, 5)
  
  console.log(`[v0] AI approved ${processedArticles.length} articles as relevant`)
  
  // Deduplicate
  const uniqueArticles = deduplicateArticles(processedArticles)
  
  // Sort by relevance score and recency
  uniqueArticles.sort((a, b) => {
    // High relevance first
    const scoreDiff = b.relevanceScore - a.relevanceScore
    if (Math.abs(scoreDiff) > 10) return scoreDiff
    // Then by date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
  
  console.log(`[v0] Final: ${uniqueArticles.length} unique, AI-curated articles`)
  
  return uniqueArticles
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Check cache
    const now = Date.now()
    if (!forceRefresh && articlesCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
      console.log('[v0] Serving from cache')
      let articles = [...articlesCache]
      
      // Apply filters
      if (category) {
        articles = articles.filter(a => a.category === category)
      }
      if (platform) {
        articles = articles.filter(a => a.platforms.includes(platform))
      }
      
      return NextResponse.json({
        success: true,
        articles: articles.slice(0, limit),
        meta: {
          total: articles.length,
          cached: true,
          lastUpdate: new Date(lastCacheUpdate).toISOString(),
          aiPowered: true,
        }
      })
    }
    
    // Refresh cache with AI-powered aggregation
    console.log('[v0] Cache expired, running AI-powered aggregation...')
    articlesCache = await aggregateAndProcessArticles()
    lastCacheUpdate = now
    
    let articles = [...articlesCache]
    
    // Apply filters
    if (category) {
      articles = articles.filter(a => a.category === category)
    }
    if (platform) {
      articles = articles.filter(a => a.platforms.includes(platform))
    }
    
    return NextResponse.json({
      success: true,
      articles: articles.slice(0, limit),
      meta: {
        total: articles.length,
        cached: false,
        lastUpdate: new Date(lastCacheUpdate).toISOString(),
        aiPowered: true,
        model: 'claude-sonnet-4',
      }
    })
    
  } catch (error) {
    console.error('[v0] Articles API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch articles',
      articles: articlesCache.slice(0, 30), // Return stale cache on error
    }, { status: 500 })
  }
}
