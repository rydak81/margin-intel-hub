import { NextResponse } from "next/server"
import Parser from "rss-parser"

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Revalidate every 30 minutes

// ============================================================================
// TYPES
// ============================================================================

interface NormalizedArticle {
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
}

interface RSSFeed {
  url: string
  name: string
  tier: number
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

let articlesCache: NormalizedArticle[] = []
let lastCacheUpdate: number = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// ============================================================================
// SOURCE LAYER 1: Google News RSS Feeds
// ============================================================================

const GOOGLE_NEWS_FEEDS: RSSFeed[] = [
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+seller%22+OR+%22Amazon+FBA%22+OR+%22Seller+Central%22+OR+%22Amazon+marketplace%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    tier: 3
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Walmart+marketplace%22+OR+%22Walmart+seller%22+OR+%22TikTok+Shop%22+OR+%22Target+Plus%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    tier: 3
  },
  {
    url: 'https://news.google.com/rss/search?q=%22ecommerce%22+AND+%28%22marketplace%22+OR+%22seller%22+OR+%22FBA%22+OR+%22fulfillment%22%29&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    tier: 3
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+aggregator%22+OR+%22ecommerce+acquisition%22+OR+%22FBA+acquisition%22+OR+%22ecommerce+M%26A%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    tier: 3
  },
  {
    url: 'https://news.google.com/rss/search?q=%22retail+media+network%22+OR+%22Amazon+advertising%22+OR+%22Walmart+Connect%22+OR+%22ecommerce+advertising%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    tier: 3
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+FBA+fees%22+OR+%22ecommerce+logistics%22+OR+%22fulfillment+costs%22+OR+%22shipping+rates+ecommerce%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    tier: 3
  },
]

// ============================================================================
// SOURCE LAYER 2: Industry RSS Feeds
// ============================================================================

const INDUSTRY_RSS_FEEDS: RSSFeed[] = [
  // Tier 1 — Core Industry Publications
  { url: 'https://www.marketplacepulse.com/feed', name: 'Marketplace Pulse', tier: 1 },
  { url: 'https://www.digitalcommerce360.com/feed/', name: 'Digital Commerce 360', tier: 1 },
  { url: 'https://www.modernretail.co/feed/', name: 'Modern Retail', tier: 1 },
  { url: 'https://www.retaildive.com/feeds/news/', name: 'Retail Dive', tier: 1 },
  { url: 'https://www.supplychaindive.com/feeds/news/', name: 'Supply Chain Dive', tier: 1 },
  { url: 'https://practicalcommerce.com/feed', name: 'Practical Ecommerce', tier: 1 },
  { url: 'https://www.ecommercebytes.com/feed/', name: 'EcommerceByte', tier: 1 },
  
  // Tier 2 — Platform & Tool Blogs
  { url: 'https://www.junglescout.com/blog/feed/', name: 'Jungle Scout', tier: 2 },
  { url: 'https://www.helium10.com/blog/feed/', name: 'Helium 10', tier: 2 },
  { url: 'https://carbon6.io/blog/feed/', name: 'Carbon6', tier: 2 },
  { url: 'https://tinuiti.com/blog/feed/', name: 'Tinuiti', tier: 2 },
  { url: 'https://www.shopify.com/blog/feed', name: 'Shopify Blog', tier: 2 },
  { url: 'https://www.sellersnap.io/blog/feed/', name: 'Seller Snap', tier: 2 },
  { url: 'https://www.pacvue.com/blog/rss.xml', name: 'Pacvue', tier: 2 },
  
  // Tier 3 — Business Press (E-Commerce Sections)
  { url: 'https://techcrunch.com/category/commerce/feed/', name: 'TechCrunch Commerce', tier: 3 },
  { url: 'https://www.pymnts.com/feed/', name: 'PYMNTS', tier: 3 },
]

// All feeds combined
const ALL_RSS_FEEDS = [...INDUSTRY_RSS_FEEDS, ...GOOGLE_NEWS_FEEDS]

// ============================================================================
// RELEVANCE SCORING
// ============================================================================

const HIGH_VALUE_KEYWORDS = [
  'amazon seller', 'seller central', 'vendor central', 'fba', 'fbm',
  'amazon marketplace', 'walmart marketplace', 'walmart seller', 'tiktok shop',
  'target plus', 'ebay seller', 'shopify merchant', 'buy with prime',
  'sponsored products', 'amazon dsp', 'walmart connect', 'retail media',
  'marketplace seller', 'third-party seller', 'private label', 'buy box',
  'fba fees', 'referral fee', 'fulfillment fee', 'reimbursement',
  'ecommerce', 'e-commerce', 'online marketplace', 'dtc brand',
  'amazon aggregator', 'ecommerce acquisition', 'prosper show'
]

const EXCLUSION_KEYWORDS = [
  'aws', 'amazon web services', 'cloud computing', 'prime video',
  'kindle', 'fire tv', 'alexa skill', 'echo dot', 'ring doorbell',
  'twitch', 'blue origin', 'amazon rainforest', 'whole foods',
  'warehouse workers union', 'delivery driver strike', 'amazon music'
]

const TRUSTED_SOURCES = [
  'marketplace pulse', 'digital commerce 360', 'modern retail',
  'retail dive', 'jungle scout', 'helium 10', 'carbon6',
  'practical ecommerce', 'ecommerce bytes', 'supply chain dive'
]

function calculateRelevanceScore(title: string, summary: string, sourceName: string): number {
  const text = `${title} ${summary}`.toLowerCase()
  const sourceNameLower = sourceName.toLowerCase()
  let score = 0
  
  // High value keywords: +15 each
  for (const keyword of HIGH_VALUE_KEYWORDS) {
    if (text.includes(keyword)) {
      score += 15
    }
  }
  
  // Exclusion keywords: -25 each
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (text.includes(keyword)) {
      score -= 25
    }
  }
  
  // Trusted source bonus: +20
  for (const source of TRUSTED_SOURCES) {
    if (sourceNameLower.includes(source)) {
      score += 20
      break
    }
  }
  
  return score
}

// ============================================================================
// AUTO-CATEGORIZATION
// ============================================================================

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Breaking': ['breaking', 'urgent', 'outage', 'effective immediately', 'just announced'],
  'Market & Metrics': ['earnings', 'revenue', 'gmv', 'quarterly', 'benchmark', 'market share', 'growth rate', 'q1', 'q2', 'q3', 'q4'],
  'Platform Updates': ['new feature', 'launched', 'rollout', 'policy change', 'update', 'announces', 'introduces'],
  'Seller Profitability': ['fee change', 'fee increase', 'margin', 'reimbursement', 'profitability', 'cost', 'pricing'],
  'M&A & Deal Flow': ['acquisition', 'merger', 'funding round', 'ipo', 'acquires', 'raises', 'investment'],
  'Tools & Technology': ['saas', 'tool', 'software', 'api', 'integration', 'automation', 'ai'],
  'Advertising': ['ppc', 'roas', 'acos', 'sponsored', 'retail media', 'advertising', 'campaign', 'dsp'],
  'Logistics': ['fulfillment', 'shipping', '3pl', 'supply chain', 'tariff', 'warehouse', 'delivery'],
  'Events': ['conference', 'summit', 'webinar', 'prosper show', 'shoptalk', 'event'],
  'Tactics & Strategy': ['how to', 'strategy', 'best practice', 'case study', 'tips', 'guide', 'optimization'],
}

function assignCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase()
  
  let bestCategory = 'Industry'
  let bestScore = 0
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(keyword => text.includes(keyword)).length
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }
  
  return bestCategory
}

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

const PLATFORM_KEYWORDS: Record<string, string[]> = {
  amazon: ['amazon', 'fba', 'fulfillment by amazon', 'amazon seller', 'amazon marketplace', 'amzn', 'seller central'],
  walmart: ['walmart', 'walmart marketplace', 'walmart seller', 'walmart fulfillment', 'walmart connect'],
  tiktok: ['tiktok', 'tiktok shop', 'tik tok'],
  shopify: ['shopify', 'shopify seller', 'shopify store', 'shopify merchant'],
  ebay: ['ebay', 'ebay seller', 'ebay marketplace'],
}

function detectPlatforms(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  const platforms: string[] = []
  
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      platforms.push(platform)
    }
  }
  
  return platforms.length > 0 ? platforms : ['multi-platform']
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

function createStableId(url: string, title: string): string {
  const slug = `${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 50)
  return `article-${slug}-${Math.abs(hashString(url))}`
}

function truncateSummary(text: string, maxLength: number = 200): string {
  if (!text) return ''
  const cleaned = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).trim() + '...'
}

function isSimilarTitle(title1: string, title2: string): boolean {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
  return normalize(title1) === normalize(title2)
}

// ============================================================================
// FALLBACK IMAGES
// ============================================================================

const CATEGORY_IMAGES: Record<string, string> = {
  'Breaking': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
  'Market & Metrics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'Platform Updates': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  'Seller Profitability': 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=450&fit=crop',
  'M&A & Deal Flow': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
  'Tools & Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
  'Advertising': 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop',
  'Logistics': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop',
  'Events': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
  'Tactics & Strategy': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
  'Industry': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop',
]

function getImageForArticle(title: string, category: string, index: number): string {
  // First try category-specific image
  if (CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category]
  }
  
  // Fallback to unique image based on title hash
  const hash = Math.abs(hashString(title))
  const imageIndex = (hash + index * 7) % FALLBACK_IMAGES.length
  return FALLBACK_IMAGES[imageIndex]
}

// ============================================================================
// RSS FETCHING
// ============================================================================

async function fetchRSSFeed(feed: RSSFeed): Promise<NormalizedArticle[]> {
  const parser = new Parser({
    timeout: 10000,
    customFields: {
      item: [
        ['media:content', 'mediaContent', { keepArray: true }],
        ['media:thumbnail', 'mediaThumbnail'],
        ['enclosure', 'enclosure'],
      ]
    }
  })
  
  try {
    const feedData = await parser.parseURL(feed.url)
    const articles: NormalizedArticle[] = []
    
    for (const item of feedData.items || []) {
      const title = item.title || ''
      const summary = truncateSummary(item.contentSnippet || item.content || item.description || '')
      
      // For Google News, extract actual source from title
      let actualSourceName = feed.name
      let cleanTitle = title
      if (feed.name === 'Google News' && title.includes(' - ')) {
        const parts = title.split(' - ')
        actualSourceName = parts[parts.length - 1].trim()
        cleanTitle = parts.slice(0, -1).join(' - ').trim()
      }
      
      // Calculate relevance score
      const relevanceScore = calculateRelevanceScore(cleanTitle, summary, actualSourceName)
      
      // Filter out articles below threshold (15 points)
      if (relevanceScore < 15) continue
      
      const platforms = detectPlatforms(cleanTitle, summary)
      const category = assignCategory(cleanTitle, summary)
      
      // Try to extract image from feed
      let imageUrl: string | undefined
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
        imageUrl = item.enclosure.url
      } else if ((item as any).mediaThumbnail?.url) {
        imageUrl = (item as any).mediaThumbnail.url
      } else if ((item as any).mediaContent?.[0]?.$.url) {
        imageUrl = (item as any).mediaContent[0].$.url
      }
      
      if (!imageUrl) {
        imageUrl = getImageForArticle(cleanTitle, category, articles.length)
      }
      
      articles.push({
        id: createStableId(item.link || '', cleanTitle),
        title: cleanTitle,
        summary,
        sourceUrl: item.link || '',
        sourceName: actualSourceName,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        category,
        platforms,
        imageUrl,
        relevanceScore,
      })
    }
    
    return articles
  } catch (error) {
    console.log(`[v0] Error fetching RSS feed ${feed.name}:`, error)
    return []
  }
}

// ============================================================================
// MAIN AGGREGATION
// ============================================================================

async function fetchAllArticles(): Promise<NormalizedArticle[]> {
  // Fetch all feeds in parallel
  const feedPromises = ALL_RSS_FEEDS.map(feed => fetchRSSFeed(feed))
  const feedResults = await Promise.allSettled(feedPromises)
  
  // Combine all articles
  let allArticles: NormalizedArticle[] = []
  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      allArticles = allArticles.concat(result.value)
    }
  }
  
  // Deduplicate by title similarity (first 60 chars)
  const uniqueArticles: NormalizedArticle[] = []
  for (const article of allArticles) {
    const isDuplicate = uniqueArticles.some(existing => 
      isSimilarTitle(existing.title, article.title)
    )
    if (!isDuplicate) {
      uniqueArticles.push(article)
    }
  }
  
  // Sort by relevance score first, then by publishedAt
  uniqueArticles.sort((a, b) => {
    // Prioritize higher relevance scores
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    // Then sort by date (newest first)
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
  
  return uniqueArticles
}

async function getArticlesWithCache(): Promise<NormalizedArticle[]> {
  const now = Date.now()
  
  // Return cached articles if still fresh
  if (articlesCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
    return articlesCache
  }
  
  // Fetch fresh articles
  const articles = await fetchAllArticles()
  
  // Update cache
  articlesCache = articles
  lastCacheUpdate = now
  
  return articles
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const platform = searchParams.get('platform')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  try {
    let articles = await getArticlesWithCache()
    
    // Filter by category if specified
    if (category && category !== 'all' && category !== 'All') {
      articles = articles.filter(a => 
        a.category.toLowerCase() === category.toLowerCase() ||
        a.category.toLowerCase().includes(category.toLowerCase())
      )
    }
    
    // Filter by platform if specified
    if (platform && platform !== 'all' && platform !== 'All') {
      articles = articles.filter(a => 
        a.platforms.some(p => p.toLowerCase() === platform.toLowerCase())
      )
    }
    
    // Convert to the format expected by the frontend
    const formattedArticles = articles.slice(0, limit).map((article, index) => ({
      id: article.id,
      title: article.title,
      excerpt: article.summary,
      content: article.summary,
      category: article.category,
      source: article.sourceName,
      sourceUrl: article.sourceUrl,
      author: article.sourceName,
      publishedAt: article.publishedAt,
      readTime: Math.max(2, Math.ceil(article.summary.length / 200)),
      tags: [article.category.toLowerCase(), ...article.platforms],
      featured: index < 5,
      breaking: (Date.now() - new Date(article.publishedAt).getTime()) < 6 * 60 * 60 * 1000,
      imageUrl: article.imageUrl,
      platforms: article.platforms.map(p => 
        p === 'amazon' ? 'Amazon' :
        p === 'walmart' ? 'Walmart' :
        p === 'tiktok' ? 'TikTok Shop' :
        p === 'shopify' ? 'Shopify' :
        p === 'ebay' ? 'eBay' :
        p === 'multi-platform' ? 'Multi-Platform' : p
      ),
    }))
    
    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      totalCount: articles.length,
      lastUpdated: new Date().toISOString(),
      cacheAge: Date.now() - lastCacheUpdate,
    })
  } catch (error) {
    console.log('[v0] Error in articles API:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch articles",
      articles: [],
    }, { status: 500 })
  }
}
