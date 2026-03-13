import { NextResponse } from "next/server"
import Parser from "rss-parser"
import { 
  classifyAllArticles, 
  mergeClassifications, 
  getUnclassifiedArticles,
  type RawArticle,
  type ClassifiedArticle 
} from "@/lib/ai-classifier"

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Revalidate every 30 minutes
export const maxDuration = 120 // Allow up to 120 seconds for AI processing

// ============================================================================
// RSS FEED SOURCES - Expanded for maximum coverage
// ============================================================================

interface RSSFeed {
  url: string
  name: string
  tier: number
  label?: string
}

const INDUSTRY_RSS_FEEDS: RSSFeed[] = [
  // Tier 1 — Core Industry Publications (most trusted for seller news)
  { url: 'https://www.digitalcommerce360.com/feed/', name: 'Digital Commerce 360', tier: 1 },
  { url: 'https://www.modernretail.co/feed/', name: 'Modern Retail', tier: 1 },
  { url: 'https://www.retaildive.com/feeds/news/', name: 'Retail Dive', tier: 1 },
  { url: 'https://www.ecommercebytes.com/feed/', name: 'EcommerceBytes', tier: 1 },
  { url: 'https://channelx.world/feed/', name: 'ChannelX', tier: 1 },
  { url: 'https://www.supplychaindive.com/feeds/news/', name: 'Supply Chain Dive', tier: 1 },
  
  // Tier 2 — Platform & Tool Blogs  
  { url: 'https://www.junglescout.com/blog/feed/', name: 'Jungle Scout', tier: 2 },
  { url: 'https://ecomcrew.com/feed/', name: 'EcomCrew', tier: 2 },
  { url: 'https://www.webretailer.com/feed/', name: 'Web Retailer', tier: 2 },
  { url: 'https://sellerengine.com/feed/', name: 'SellerEngine', tier: 2 },
  
  // Tier 3 — Business Press
  { url: 'https://techcrunch.com/category/commerce/feed/', name: 'TechCrunch Commerce', tier: 3 },
  { url: 'https://www.pymnts.com/category/news/ecommerce/feed/', name: 'PYMNTS E-commerce', tier: 3 },
]

const GOOGLE_NEWS_FEEDS: RSSFeed[] = [
  // Amazon seller specific
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+seller%22+OR+%22Amazon+FBA%22+OR+%22Seller+Central%22+OR+%22FBA+fees%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Amazon Seller News',
    tier: 3
  },
  // Walmart marketplace
  {
    url: 'https://news.google.com/rss/search?q=%22Walmart+marketplace%22+OR+%22Walmart+seller%22+OR+%22Walmart+Fulfillment+Services%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Walmart Marketplace News',
    tier: 3
  },
  // TikTok Shop
  {
    url: 'https://news.google.com/rss/search?q=%22TikTok+Shop%22+seller+OR+merchant&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'TikTok Shop News',
    tier: 3
  },
  // E-commerce industry
  {
    url: 'https://news.google.com/rss/search?q=%22e-commerce%22+OR+%22ecommerce%22+marketplace+seller+OR+merchant&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'E-commerce Industry',
    tier: 3
  },
  // Retail media / advertising
  {
    url: 'https://news.google.com/rss/search?q=%22retail+media%22+OR+%22Amazon+Ads%22+OR+%22Walmart+Connect%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Retail Media News',
    tier: 3
  },
]

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

let articlesCache: ClassifiedArticle[] = []
let rawArticlesCache: RawArticle[] = []
let lastCacheUpdate: number = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// ============================================================================
// RSS FETCHING
// ============================================================================

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'EcomIntelHub/2.0 (AI-Powered News Aggregator; contact@ecomintel.hub)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
})

function extractImageUrl(item: Record<string, unknown>): string | undefined {
  // Try media:content
  if (item.mediaContent) {
    const media = item.mediaContent as { $?: { url?: string } }
    if (media.$?.url) return media.$.url
  }
  
  // Try media:thumbnail
  if (item.mediaThumbnail) {
    const thumb = item.mediaThumbnail as { $?: { url?: string } }
    if (thumb.$?.url) return thumb.$.url
  }
  
  // Try enclosure
  if (item.enclosure) {
    const enc = item.enclosure as { url?: string; type?: string }
    if (enc.url && enc.type?.startsWith('image/')) return enc.url
  }
  
  // Try to extract from content
  const content = (item.content || item['content:encoded'] || '') as string
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]
  
  return undefined
}

async function fetchRSSFeed(feed: RSSFeed, sourceType: 'industry' | 'google'): Promise<RawArticle[]> {
  try {
    const feedData = await parser.parseURL(feed.url)
    const articles: RawArticle[] = []
    
    // Take more articles - AI will filter them
    const items = feedData.items.slice(0, 20)
    
    for (const item of items) {
      if (!item.title || !item.link) continue
      
      // Skip very old articles (> 14 days)
      if (item.pubDate) {
        const pubDate = new Date(item.pubDate)
        const daysSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSincePublished > 14) continue
      }
      
      const imageUrl = extractImageUrl(item as Record<string, unknown>)
      
      articles.push({
        id: generateArticleId(item.link),
        title: item.title.trim(),
        summary: item.contentSnippet?.slice(0, 500) || item.content?.slice(0, 500) || '',
        sourceName: feed.label || feed.name,
        sourceUrl: item.link,
        publishedAt: item.pubDate || new Date().toISOString(),
        imageUrl,
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

function deduplicateByTitle(articles: RawArticle[]): RawArticle[] {
  const seen = new Map<string, RawArticle>()
  const titleSeen = new Set<string>()
  
  for (const article of articles) {
    // Skip if we've seen this exact URL
    if (seen.has(article.id)) continue
    
    // Skip if title is too similar
    const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
    if (titleSeen.has(normalizedTitle)) continue
    
    seen.set(article.id, article)
    titleSeen.add(normalizedTitle)
  }
  
  return Array.from(seen.values())
}

// ============================================================================
// MAIN AGGREGATION FUNCTION
// ============================================================================

async function aggregateAndProcessArticles(): Promise<ClassifiedArticle[]> {
  console.log('[v0] Starting AI-powered news aggregation (using Claude Haiku 4.5)...')
  
  // Fetch from all sources in parallel
  const [industryResults, googleResults] = await Promise.all([
    Promise.all(INDUSTRY_RSS_FEEDS.map(feed => fetchRSSFeed(feed, 'industry'))),
    Promise.all(GOOGLE_NEWS_FEEDS.map(feed => fetchRSSFeed(feed, 'google'))),
  ])
  
  const allRawArticles = [
    ...industryResults.flat(),
    ...googleResults.flat(),
  ]
  
  console.log(`[v0] Fetched ${allRawArticles.length} raw articles from all sources`)
  
  // Quick deduplication before AI (saves API costs)
  const deduplicated = deduplicateByTitle(allRawArticles)
  console.log(`[v0] After deduplication: ${deduplicated.length} unique articles`)
  
  // Prioritize by tier and recency
  const sortedArticles = deduplicated.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier
    const dateA = new Date(a.publishedAt).getTime()
    const dateB = new Date(b.publishedAt).getTime()
    return dateB - dateA
  })
  
  // Only classify NEW articles (optimization to reduce API costs)
  const unclassified = getUnclassifiedArticles(sortedArticles)
  console.log(`[v0] ${unclassified.length} articles need AI classification`)
  
  // Limit to control API costs (classify top 100 new articles)
  const articlesToClassify = unclassified.slice(0, 100)
  
  if (articlesToClassify.length > 0) {
    console.log(`[v0] Sending ${articlesToClassify.length} articles to Claude Haiku for classification...`)
    
    // AI-powered batch classification
    const classifications = await classifyAllArticles(articlesToClassify)
    
    // Merge classifications back into articles
    const classified = mergeClassifications(articlesToClassify, classifications)
    
    // Filter: only show relevant articles with score >= 50
    const relevant = classified.filter(a => 
      a.relevant !== false && a.relevanceScore >= 50
    )
    
    console.log(`[v0] AI approved ${relevant.length} of ${articlesToClassify.length} articles as relevant`)
    
    // Add to cache (merge with existing)
    const existingIds = new Set(articlesCache.map(a => a.id))
    const newRelevant = relevant.filter(a => !existingIds.has(a.id))
    articlesCache = [...newRelevant, ...articlesCache]
  }
  
  // Sort: breaking first, then by score, then by date
  articlesCache.sort((a, b) => {
    if (a.isBreaking && !b.isBreaking) return -1
    if (!a.isBreaking && b.isBreaking) return 1
    if (Math.abs(b.relevanceScore - a.relevanceScore) > 10) {
      return b.relevanceScore - a.relevanceScore
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
  
  // Keep only last 200 articles in cache
  articlesCache = articlesCache.slice(0, 200)
  
  console.log(`[v0] Final cache: ${articlesCache.length} AI-curated articles`)
  
  return articlesCache
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '60'), 100)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const audience = searchParams.get('audience')
    const impactLevel = searchParams.get('impact')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Check cache
    const now = Date.now()
    const cacheValid = !forceRefresh && articlesCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION
    
    if (cacheValid) {
      console.log('[v0] Serving from cache')
    } else {
      // Refresh cache with AI-powered aggregation
      console.log('[v0] Cache expired, running AI-powered aggregation...')
      await aggregateAndProcessArticles()
      lastCacheUpdate = now
    }
    
    let articles = [...articlesCache]
    
    // Apply filters
    if (category) {
      articles = articles.filter(a => a.category === category)
    }
    if (platform) {
      articles = articles.filter(a => a.platforms.includes(platform))
    }
    if (audience) {
      articles = articles.filter(a => a.audience?.includes(audience))
    }
    if (impactLevel) {
      articles = articles.filter(a => a.impactLevel === impactLevel)
    }
    
    // Calculate stats
    const stats = {
      totalInCache: articlesCache.length,
      afterFilters: articles.length,
      byCategory: {} as Record<string, number>,
      byImpact: { high: 0, medium: 0, low: 0 },
      byAudience: {} as Record<string, number>,
    }
    
    articlesCache.forEach(a => {
      stats.byCategory[a.category] = (stats.byCategory[a.category] || 0) + 1
      if (a.impactLevel) stats.byImpact[a.impactLevel]++
      a.audience?.forEach(aud => {
        stats.byAudience[aud] = (stats.byAudience[aud] || 0) + 1
      })
    })
    
    return NextResponse.json({
      success: true,
      articles: articles.slice(0, limit),
      meta: {
        total: articles.length,
        cached: cacheValid,
        lastUpdate: new Date(lastCacheUpdate).toISOString(),
        aiPowered: true,
        model: 'claude-haiku-4-5',
        stats,
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
