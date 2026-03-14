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
// RSS FEED SOURCES - VERIFIED WORKING (March 2026)
// ============================================================================

interface RSSFeed {
  url: string
  name: string
  tier: number
  label?: string
  defaultCategory?: string
}

const INDUSTRY_RSS_FEEDS: RSSFeed[] = [
  // TIER 1 — Major Industry Publications
  { url: 'https://www.digitalcommerce360.com/feed/', name: 'Digital Commerce 360', tier: 1, defaultCategory: 'market_metrics' },
  { url: 'https://www.modernretail.co/feed/', name: 'Modern Retail', tier: 1, defaultCategory: 'platform_updates' },
  { url: 'https://www.retaildive.com/feeds/news/', name: 'Retail Dive', tier: 1, defaultCategory: 'market_metrics' },
  { url: 'https://www.supplychaindive.com/feeds/news/', name: 'Supply Chain Dive', tier: 1, defaultCategory: 'logistics' },
  { url: 'https://practicalcommerce.com/feed', name: 'Practical Ecommerce', tier: 1, defaultCategory: 'tactics' },
  { url: 'https://www.ecommercebytes.com/feed/', name: 'EcommerceBytes', tier: 1, defaultCategory: 'platform_updates' },
  
  // TIER 2 — Amazon/Seller Tool Blogs  
  { url: 'https://www.junglescout.com/blog/feed/', name: 'Jungle Scout', tier: 2, defaultCategory: 'tactics' },
  { url: 'https://ecomcrew.com/feed/', name: 'EcomCrew', tier: 2, defaultCategory: 'tactics' },
  { url: 'https://carbon6.io/blog/feed/', name: 'Carbon6', tier: 2, defaultCategory: 'tools_technology' },
  { url: 'https://tinuiti.com/blog/feed/', name: 'Tinuiti', tier: 2, defaultCategory: 'advertising' },
  
  // TIER 3 — Platform Official Blogs
  { url: 'https://www.aboutamazon.com/news/feed', name: 'About Amazon', tier: 3, defaultCategory: 'platform_updates' },
  
  // TIER 4 — Business/Tech Press
  { url: 'https://techcrunch.com/category/commerce/feed/', name: 'TechCrunch Commerce', tier: 4, defaultCategory: 'mergers_acquisitions' },
]

const GOOGLE_NEWS_FEEDS: RSSFeed[] = [
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+seller%22+OR+%22Amazon+FBA%22+OR+%22Seller+Central%22+OR+%22FBA+fees%22+OR+%22Buy+with+Prime%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Amazon Seller News',
    tier: 3,
    defaultCategory: 'platform_updates'
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Walmart+marketplace%22+OR+%22Walmart+seller%22+OR+%22TikTok+Shop%22+OR+%22Target+Plus%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Other Marketplaces',
    tier: 3,
    defaultCategory: 'platform_updates'
  },
  {
    url: 'https://news.google.com/rss/search?q=%22ecommerce+seller%22+OR+%22marketplace+seller%22+OR+%22retail+media+network%22+OR+%22multichannel+selling%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'E-Commerce Industry',
    tier: 3,
    defaultCategory: 'market_metrics'
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+aggregator%22+OR+%22ecommerce+acquisition%22+OR+%22FBA+acquisition%22+OR+%22ecommerce+private+equity%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'M&A Activity',
    tier: 3,
    defaultCategory: 'mergers_acquisitions'
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+advertising%22+OR+%22Sponsored+Products%22+OR+%22retail+media%22+OR+%22Walmart+Connect%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Retail Media',
    tier: 3,
    defaultCategory: 'advertising'
  },
]

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

let articlesCache: ClassifiedArticle[] = []
let lastCacheUpdate: number = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// ============================================================================
// RSS FETCHING WITH ERROR RESILIENCE
// ============================================================================

const parser = new Parser({
  timeout: 10000, // 10 seconds (faster failure)
  headers: {
    'User-Agent': 'EcomIntelHub/1.0 (News Aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ]
  }
})

function isValidArticleImage(url: string | null | undefined): boolean {
  if (!url) return false
  if (!url.startsWith('http')) return false
  
  // Filter out tiny icons, tracking pixels, and invalid URLs
  const invalidPatterns = [
    'favicon',
    '1x1',
    'pixel',
    'gravatar.com',
    'wp-content/plugins',
    'google.com/s2/favicons',
    'track',
    'spacer',
    'blank',
    'transparent',
    '.gif', // Most GIFs are tracking pixels or low quality
    'badge',
    'icon',
    'logo',
    'avatar',
  ]
  
  const lowerUrl = url.toLowerCase()
  for (const pattern of invalidPatterns) {
    if (lowerUrl.includes(pattern)) return false
  }
  
  return true
}

function extractImageFromItem(item: Record<string, unknown>): string | null {
  const candidates: (string | null | undefined)[] = []
  
  // Try media:content
  const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined
  candidates.push(mediaContent?.$?.url)
  
  // Try media:thumbnail
  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string } } | undefined
  candidates.push(mediaThumbnail?.$?.url)
  
  // Try enclosure
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined
  if (enclosure?.type?.startsWith('image/')) {
    candidates.push(enclosure.url)
  }
  
  // Try extracting first <img> from HTML content
  const html = (item['content:encoded'] || item.content || '') as string
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch?.[1] && imgMatch[1].startsWith('http')) {
    candidates.push(imgMatch[1])
  }
  
  // Return first VALID image (not a favicon/icon/tracking pixel)
  for (const url of candidates) {
    if (isValidArticleImage(url)) {
      return url!
    }
  }
  
  return null
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
      
      const imageUrl = extractImageFromItem(item as unknown as Record<string, unknown>)
      
      articles.push({
        id: generateArticleId(item.link),
        title: item.title.trim(),
        summary: (item.contentSnippet || item.content || '').substring(0, 250),
        sourceName: feed.label || feed.name,
        sourceUrl: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        imageUrl: imageUrl || undefined,
        tier: feed.tier,
        sourceType,
      })
    }
    
    return articles
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error'
    console.warn(`[Feed Error] ${feed.name}: ${errMessage}`)
    return [] // Return empty array, don't crash
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
  
  for (const article of articles) {
    // Create a normalized key from the title
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation
      .replace(/\s+/g, ' ')          // Collapse whitespace
      .trim()
    
    // Use first 60 chars as the dedup key (catches same story from different sources)
    const shortKey = normalizedTitle.substring(0, 60)
    
    // Also create word-based keys (catches reworded headlines)
    const words = normalizedTitle.split(' ').filter(w => w.length > 3)
    const wordKey = words.slice(0, 6).sort().join(' ')
    
    // Check both keys
    const existingByShort = seen.get(`short:${shortKey}`)
    const existingByWord = seen.get(`word:${wordKey}`)
    const existing = existingByShort || existingByWord
    
    if (existing) {
      // Keep the one from the higher-tier source or with a real image
      const existingTier = existing.tier || 5
      const newTier = article.tier || 5
      const existingHasImage = existing.imageUrl && isValidArticleImage(existing.imageUrl)
      const newHasImage = article.imageUrl && isValidArticleImage(article.imageUrl)
      
      if (newTier < existingTier || (newHasImage && !existingHasImage)) {
        // Replace with the better version
        seen.set(`short:${shortKey}`, article)
        seen.set(`word:${wordKey}`, article)
      }
      // Otherwise keep the existing one
    } else {
      seen.set(`short:${shortKey}`, article)
      if (wordKey !== shortKey) {
        seen.set(`word:${wordKey}`, article)
      }
    }
  }
  
  // Return unique articles (deduplicate the Map values)
  const uniqueArticles = [...new Set(seen.values())]
  return uniqueArticles
}

// ============================================================================
// MAIN AGGREGATION FUNCTION
// ============================================================================

async function aggregateAndProcessArticles(): Promise<ClassifiedArticle[]> {
  console.log('[v0] Starting AI-powered news aggregation (Claude Haiku 4.5)...')
  
  // Combine all feeds
  const allFeeds = [
    ...INDUSTRY_RSS_FEEDS.map(f => ({ ...f, type: 'industry' as const })),
    ...GOOGLE_NEWS_FEEDS.map(f => ({ ...f, type: 'google' as const })),
  ]
  
  // Fetch from all sources with error resilience
  const results = await Promise.allSettled(
    allFeeds.map(async (feed) => {
      return fetchRSSFeed(feed, feed.type)
    })
  )
  
  // Flatten results, ignoring failed feeds
  const allRawArticles = results
    .filter((r): r is PromiseFulfilledResult<RawArticle[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
  
  const successfulFeeds = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<RawArticle[]>).value.length > 0).length
  const failedFeeds = results.filter(r => r.status === 'rejected').length
  
  console.log(`[v0] Fetched ${allRawArticles.length} articles from ${successfulFeeds} feeds (${failedFeeds} feeds failed)`)
  
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
    
    // AI-powered batch classification (with fallback to keyword matching)
    const classifications = await classifyAllArticles(articlesToClassify)
    
    // Merge classifications back into articles
    const classified = mergeClassifications(articlesToClassify, classifications)
    
    // Filter: only show relevant articles with score >= 50
    const relevant = classified.filter(a => 
      a.relevant !== false && a.relevanceScore >= 50
    )
    
    // Add image fallbacks
    const withImages = relevant.map(a => ({
      ...a,
      imageUrl: getArticleImage(a) || undefined
    }))
    
    console.log(`[v0] AI approved ${withImages.length} of ${articlesToClassify.length} articles as relevant`)
    
    // Add to cache (merge with existing)
    const existingIds = new Set(articlesCache.map(a => a.id))
    const newRelevant = withImages.filter(a => !existingIds.has(a.id))
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
        model: 'claude-haiku-4-5-20251001',
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
