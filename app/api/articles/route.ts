import { NextResponse } from "next/server"
import Parser from "rss-parser"

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

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
}

// RSS feed sources - Industry publications first, then Google News for broader coverage
const RSS_FEEDS = [
  // Industry publications with working RSS feeds
  { url: "https://www.digitalcommerce360.com/feed/", name: "Digital Commerce 360", priority: 1 },
  { url: "https://www.modernretail.co/feed/", name: "Modern Retail", priority: 1 },
  { url: "https://www.retaildive.com/feeds/news/", name: "Retail Dive", priority: 2 },
  { url: "https://techcrunch.com/tag/e-commerce/feed/", name: "TechCrunch E-commerce", priority: 2 },
  { url: "https://www.pymnts.com/feed/", name: "PYMNTS", priority: 2 },
  
  // Google News - Amazon specific searches
  { url: "https://news.google.com/rss/search?q=Amazon+FBA+seller+fees&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=Amazon+third+party+seller+marketplace&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=Amazon+seller+central+announcement&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  
  // Google News - E-commerce marketplace searches
  { url: "https://news.google.com/rss/search?q=ecommerce+marketplace+news&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=online+marketplace+seller&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  
  // Google News - Walmart marketplace
  { url: "https://news.google.com/rss/search?q=Walmart+marketplace+seller&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=Walmart+fulfillment+services&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  
  // Google News - TikTok Shop
  { url: "https://news.google.com/rss/search?q=TikTok+Shop+seller+ecommerce&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=TikTok+Shop+live+commerce&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  
  // Google News - Shopify and eBay
  { url: "https://news.google.com/rss/search?q=Shopify+merchant+ecommerce&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=eBay+seller+marketplace&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  
  // Google News - Industry trends
  { url: "https://news.google.com/rss/search?q=ecommerce+fulfillment+logistics&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=retail+arbitrage+reseller&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=private+label+Amazon&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
  { url: "https://news.google.com/rss/search?q=D2C+direct+consumer+brand&hl=en-US&gl=US&ceid=US:en&when=7d", name: "Google News", priority: 3 },
]

// Keywords to filter out irrelevant articles
const EXCLUDE_KEYWORDS = [
  'aws', 'alexa', 'prime video', 'kindle', 'blue origin', 'amazon web services',
  'rainforest', 'ring doorbell', 'twitch', 'whole foods', 'warehouse workers union',
  'amazon music', 'amazon prime video', 'fire tv', 'echo dot', 'amazon echo'
]

// Keywords for platform detection
const PLATFORM_KEYWORDS: Record<string, string[]> = {
  amazon: ['amazon', 'fba', 'fulfillment by amazon', 'amazon seller', 'amazon marketplace', 'amzn'],
  walmart: ['walmart', 'walmart marketplace', 'walmart seller', 'walmart fulfillment'],
  tiktok: ['tiktok', 'tiktok shop', 'tik tok'],
  shopify: ['shopify', 'shopify seller', 'shopify store'],
  ebay: ['ebay', 'ebay seller', 'ebay marketplace'],
}

// Category keywords for auto-assignment
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Breaking': ['breaking', 'urgent', 'just in', 'developing'],
  'Market & Metrics': ['growth', 'sales', 'revenue', 'gmv', 'market share', 'q1', 'q2', 'q3', 'q4', 'earnings', 'report', 'statistics'],
  'Platform Updates': ['update', 'changes', 'new feature', 'announcement', 'launches', 'introduces', 'rolls out'],
  'Seller Profitability': ['fees', 'profit', 'margin', 'cost', 'pricing', 'profitability', 'revenue'],
  'M&A & Deal Flow': ['acquisition', 'merger', 'acquires', 'buyout', 'deal', 'investment', 'funding', 'ipo'],
  'Tools & Technology': ['tool', 'software', 'ai', 'automation', 'technology', 'app', 'integration'],
  'Advertising': ['advertising', 'ppc', 'ads', 'sponsored', 'marketing', 'campaign'],
  'Logistics': ['shipping', 'fulfillment', 'logistics', 'delivery', 'supply chain', 'warehouse', 'fba'],
  'Tactics & Strategy': ['strategy', 'tips', 'guide', 'how to', 'best practices', 'optimization'],
  'Policy': ['regulation', 'policy', 'ftc', 'law', 'compliance', 'rules', 'guidelines'],
}

// Fallback images based on category
const CATEGORY_IMAGES: Record<string, string> = {
  'Breaking': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
  'Market & Metrics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'Platform Updates': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  'Seller Profitability': 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=450&fit=crop',
  'M&A & Deal Flow': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
  'Tools & Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
  'Advertising': 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop',
  'Logistics': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop',
  'Tactics & Strategy': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
  'Policy': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop',
  'Industry': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
}

// Large pool of unique fallback images - 50 different images for variety
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // e-commerce shopping
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop', // packages
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop', // digital payment
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', // analytics
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=450&fit=crop', // warehouse
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop', // retail store
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop', // laptop work
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop', // business meeting
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', // data dashboard
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop', // shopping bags
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=450&fit=crop', // money growth
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop', // team meeting
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop', // computer code
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop', // strategy board
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop', // office work
  'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800&h=450&fit=crop', // delivery truck
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop', // shipping boxes
  'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=450&fit=crop', // phone shopping
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop', // online shopping
  'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=450&fit=crop', // shopping cart
  'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&h=450&fit=crop', // world map
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop', // amazon box
  'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop', // amazon logo
  'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=800&h=450&fit=crop', // code on screen
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop', // data analysis
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop', // business presentation
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop', // office team
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=450&fit=crop', // business suit
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=450&fit=crop', // woman working
  'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&h=450&fit=crop', // global business
  'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=450&fit=crop', // warehouse interior
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=450&fit=crop', // shipping container
  'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=450&fit=crop', // cargo port
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop', // warehouse shelves
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=450&fit=crop', // person with tablet
  'https://images.unsplash.com/photo-1611095973763-414019e72400?w=800&h=450&fit=crop', // ecommerce
  'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&h=450&fit=crop', // typing keyboard
  'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800&h=450&fit=crop', // happy customer
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=450&fit=crop', // product photography
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=450&fit=crop', // headphones product
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=450&fit=crop', // sneaker product
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=450&fit=crop', // camera product
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=450&fit=crop', // plants products
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=450&fit=crop', // electronics
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=450&fit=crop', // shoes product
  'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&h=450&fit=crop', // fashion product
  'https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=800&h=450&fit=crop', // perfume product
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=450&fit=crop', // t-shirt product
  'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=450&fit=crop', // business graphs
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop', // trading stocks
]

// Get a unique image index based on the article title hash
function getUniqueImageIndex(title: string, fallbackIndex: number): number {
  const hash = Math.abs(hashString(title))
  // Combine hash with fallback index to ensure uniqueness even for similar titles
  return (hash + fallbackIndex * 7) % FALLBACK_IMAGES.length
}

function isRelevantArticle(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase()
  
  // Check for exclusion keywords
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return false
    }
  }
  
  // Must contain at least one e-commerce related term
  const relevantTerms = ['seller', 'marketplace', 'ecommerce', 'e-commerce', 'retail', 'amazon', 'walmart', 'shopify', 'ebay', 'tiktok', 'fba', 'fulfillment', 'merchant', 'online selling']
  return relevantTerms.some(term => text.includes(term))
}

function detectPlatforms(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  const platforms: string[] = []
  
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      platforms.push(platform)
    }
  }
  
  if (platforms.length === 0) {
    return ['multi-platform']
  }
  
  return platforms
}

function assignCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase()
  
  // Score each category based on keyword matches
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

function createStableId(url: string, title: string): string {
  const slug = `${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 50)
  return `article-${slug}-${Math.abs(hashString(url))}`
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

function truncateSummary(text: string, maxLength: number = 200): string {
  if (!text) return ''
  const cleaned = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).trim() + '...'
}

function isSimilarTitle(title1: string, title2: string): boolean {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
  const t1 = normalize(title1)
  const t2 = normalize(title2)
  
  // Check if one contains most of the other
  if (t1.length < 20 || t2.length < 20) return t1 === t2
  
  const shorter = t1.length < t2.length ? t1 : t2
  const longer = t1.length < t2.length ? t2 : t1
  
  return longer.includes(shorter.slice(0, Math.floor(shorter.length * 0.7)))
}

async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<NormalizedArticle[]> {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent', { keepArray: true }],
        ['media:thumbnail', 'mediaThumbnail'],
        ['enclosure', 'enclosure'],
      ]
    }
  })
  
  try {
    const feed = await parser.parseURL(feedUrl)
    const articles: NormalizedArticle[] = []
    
    for (const item of feed.items || []) {
      const title = item.title || ''
      const summary = truncateSummary(item.contentSnippet || item.content || item.description || '')
      
      // Skip irrelevant articles
      if (!isRelevantArticle(title, summary)) continue
      
      const platforms = detectPlatforms(title, summary)
      const category = assignCategory(title, summary)
      
      // Try to extract image from feed
      let imageUrl: string | undefined
      
      // Check various image sources in RSS
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
        imageUrl = item.enclosure.url
      } else if ((item as any).mediaThumbnail?.url) {
        imageUrl = (item as any).mediaThumbnail.url
      } else if ((item as any).mediaContent?.[0]?.$.url) {
        imageUrl = (item as any).mediaContent[0].$.url
      }
      
      // Use unique fallback based on title hash if no image from feed
      if (!imageUrl) {
        const imageIndex = getUniqueImageIndex(title, articles.length)
        imageUrl = FALLBACK_IMAGES[imageIndex]
      }
      
      // For Google News, extract actual source from title
      let actualSourceName = sourceName
      if (sourceName === 'Google News' && title.includes(' - ')) {
        const parts = title.split(' - ')
        actualSourceName = parts[parts.length - 1].trim()
      }
      
      articles.push({
        id: createStableId(item.link || '', title),
        title: title.replace(/ - [^-]+$/, '').trim(), // Remove source suffix from Google News titles
        summary,
        sourceUrl: item.link || '',
        sourceName: actualSourceName,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        category,
        platforms,
        imageUrl,
      })
    }
    
    return articles
  } catch (error) {
    console.log(`[v0] Error fetching RSS feed ${feedUrl}:`, error)
    return []
  }
}

async function fetchAllArticles(): Promise<NormalizedArticle[]> {
  // Fetch all feeds in parallel
  const feedPromises = RSS_FEEDS.map(feed => fetchRSSFeed(feed.url, feed.name))
  const feedResults = await Promise.allSettled(feedPromises)
  
  // Combine all articles
  let allArticles: NormalizedArticle[] = []
  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      allArticles = allArticles.concat(result.value)
    }
  }
  
  // Deduplicate by title similarity
  const uniqueArticles: NormalizedArticle[] = []
  for (const article of allArticles) {
    const isDuplicate = uniqueArticles.some(existing => 
      isSimilarTitle(existing.title, article.title)
    )
    if (!isDuplicate) {
      uniqueArticles.push(article)
    }
  }
  
  // Sort by publishedAt (newest first)
  uniqueArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  
  return uniqueArticles
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const platform = searchParams.get('platform')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  try {
    let articles = await fetchAllArticles()
    
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
