import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

interface NewsAPIArticle {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  source: string
  sourceUrl: string
  author: string
  publishedAt: string
  readTime: number
  tags: string[]
  featured: boolean
  breaking: boolean
  imageUrl?: string
  platforms?: string[]
}

const CATEGORIES = ["Amazon", "Industry", "Strategy", "Retail", "D2C", "Logistics", "Tech", "Marketplaces", "Policy", "Tools"]

// Large pool of unique fallback images - 50 different images for variety
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1611095973763-414019e72400?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
]

// Get a unique image index based on string hash
function getUniqueImageIndex(text: string, fallbackIndex: number): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs((hash + fallbackIndex * 7) % FALLBACK_IMAGES.length)
}

// Determine category based on article content
function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  
  if (text.includes('amazon') || text.includes('aws') || text.includes('bezos')) return 'Amazon'
  if (text.includes('walmart') || text.includes('target') || text.includes('costco')) return 'Retail'
  if (text.includes('shopify') || text.includes('d2c') || text.includes('direct-to-consumer')) return 'D2C'
  if (text.includes('shipping') || text.includes('logistics') || text.includes('supply chain') || text.includes('delivery')) return 'Logistics'
  if (text.includes('tiktok') || text.includes('ebay') || text.includes('etsy') || text.includes('marketplace')) return 'Marketplaces'
  if (text.includes('ai') || text.includes('technology') || text.includes('software') || text.includes('tech')) return 'Tech'
  if (text.includes('regulation') || text.includes('ftc') || text.includes('law') || text.includes('policy')) return 'Policy'
  if (text.includes('strategy') || text.includes('growth') || text.includes('sales')) return 'Strategy'
  if (text.includes('tool') || text.includes('app') || text.includes('platform')) return 'Tools'
  
  return 'Industry'
}

// Detect platforms mentioned in article
function detectPlatforms(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase()
  const platforms: string[] = []
  
  if (text.includes('amazon')) platforms.push('Amazon')
  if (text.includes('walmart')) platforms.push('Walmart')
  if (text.includes('tiktok') || text.includes('tik tok')) platforms.push('TikTok Shop')
  if (text.includes('shopify')) platforms.push('Shopify')
  if (text.includes('ebay')) platforms.push('eBay')
  if (text.includes('etsy')) platforms.push('Etsy')
  
  return platforms.length > 0 ? platforms : ['E-commerce']
}

// Calculate estimated read time based on content length
function calculateReadTime(content: string | null, description: string | null): number {
  const text = content || description || ''
  const wordCount = text.split(/\s+/).length
  return Math.max(2, Math.min(15, Math.ceil(wordCount / 200)))
}

// Create a stable ID from the article URL
function createStableId(url: string, index: number): string {
  const slug = url
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .slice(0, 50)
  return `news-${index}-${slug}`
}

async function fetchFromNewsAPI(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY
  
  if (!apiKey) {
    console.log('[v0] No NEWS_API_KEY found, using fallback data')
    return generateFallbackArticles()
  }

  try {
    // Search for e-commerce related news
    const queries = [
      'amazon ecommerce',
      'online retail marketplace',
      'shopify ecommerce',
      'tiktok shop',
      'walmart marketplace'
    ]
    
    const query = queries.join(' OR ')
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EcomIntelHub/1.0'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      console.log('[v0] NewsAPI response not ok:', response.status)
      return generateFallbackArticles()
    }

    const data = await response.json()
    
    if (data.status !== 'ok' || !data.articles) {
      console.log('[v0] NewsAPI returned error:', data.message)
      return generateFallbackArticles()
    }

    const articles: NewsArticle[] = data.articles
      .filter((article: NewsAPIArticle) => 
        article.title && 
        article.title !== '[Removed]' && 
        article.description
      )
      .map((article: NewsAPIArticle, index: number) => {
        const category = categorizeArticle(article.title, article.description || '')
        const platforms = detectPlatforms(article.title, article.description || '')
        const hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
        
        return {
          id: createStableId(article.url, index),
          title: article.title,
          excerpt: article.description || '',
          content: article.content || article.description || '',
          category,
          source: article.source.name,
          sourceUrl: article.url,
          author: article.author || article.source.name,
          publishedAt: article.publishedAt,
          readTime: calculateReadTime(article.content, article.description),
          tags: [category.toLowerCase(), ...platforms.map(p => p.toLowerCase())],
          featured: index < 5,
          breaking: hoursAgo < 6,
          imageUrl: article.urlToImage || FALLBACK_IMAGES[getUniqueImageIndex(article.title, index)],
          platforms,
        }
      })

    return articles
  } catch (error) {
    console.log('[v0] Error fetching from NewsAPI:', error)
    return generateFallbackArticles()
  }
}

// Fallback articles when API is unavailable
function generateFallbackArticles(): NewsArticle[] {
  const HEADLINE_TEMPLATES = [
    "Amazon Announces Major Changes to FBA Fee Structure for Q2 2026",
    "TikTok Shop Surpasses $10B in US GMV, Challenging Amazon's Dominance",
    "New Tariff Regulations: What E-commerce Sellers Need to Know",
    "Walmart Marketplace Expands to 15 New Categories for Third-Party Sellers",
    "AI-Powered Listing Optimization Tools See 300% Adoption Increase",
    "Supply Chain Disruptions Expected to Ease by Summer 2026",
    "Amazon's Project Kuiper to Offer Logistics Benefits for Prime Sellers",
    "eBay Introduces Zero-Fee Selling for Verified Small Businesses",
    "Cross-Border E-commerce Hits Record $1.5 Trillion Globally",
    "New EU Regulations Impact US Sellers Shipping to Europe",
    "Shopify Partners with Amazon for Seamless Multi-Channel Selling",
    "FTC Proposes New Guidelines for Product Review Authenticity",
    "Amazon Vine Program Updates: Higher Costs, Better Results?",
    "Seller-Fulfilled Prime Expansion Opens New Opportunities",
    "Q1 2026 E-commerce Growth: Key Takeaways for Marketplace Sellers",
  ]

  const EXCERPTS = [
    "The new fee structure will impact small and medium sellers the most, with changes taking effect in April.",
    "Industry analysts predict continued growth as social commerce reshapes consumer buying habits.",
    "Sellers should prepare for significant changes to their logistics and fulfillment strategies.",
    "The platform update introduces several seller-friendly features aimed at improving conversion rates.",
    "Market research indicates a shift in consumer preferences toward sustainable products.",
    "New regulations will require additional compliance measures for cross-border transactions.",
    "The partnership aims to simplify multi-channel inventory management for growing brands.",
    "Experts weigh in on how these changes will affect profitability for marketplace sellers.",
  ]

  const SOURCES = [
    "Amazon Seller Central", "eCommerceBytes", "Practical Ecommerce", 
    "Retail Dive", "Modern Retail", "Supply Chain Dive", "TechCrunch"
  ]

  const articles: NewsArticle[] = []
  const now = new Date()

  for (let i = 0; i < HEADLINE_TEMPLATES.length; i++) {
    const hoursAgo = Math.floor(Math.random() * 72)
    const publishDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    const title = HEADLINE_TEMPLATES[i]
    const category = categorizeArticle(title, EXCERPTS[i % EXCERPTS.length])
    const platforms = detectPlatforms(title, EXCERPTS[i % EXCERPTS.length])

    articles.push({
      id: `fallback-${i}-${title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
      title,
      excerpt: EXCERPTS[i % EXCERPTS.length],
      content: EXCERPTS[i % EXCERPTS.length],
      category,
      source: SOURCES[i % SOURCES.length],
      sourceUrl: '#',
      author: ["Sarah Chen", "Michael Torres", "Emily Watson", "David Kim"][i % 4],
      publishedAt: publishDate.toISOString(),
      readTime: Math.floor(Math.random() * 8) + 2,
      tags: [category.toLowerCase()],
      featured: i < 5,
      breaking: hoursAgo < 6,
      imageUrl: FALLBACK_IMAGES[getUniqueImageIndex(title, i)],
      platforms,
    })
  }

  return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '30')
  const featured = searchParams.get('featured') === 'true'
  
  try {
    let articles = await fetchFromNewsAPI()
    
    if (category && category !== 'all') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase())
    }
    
    if (featured) {
      articles = articles.filter(a => a.featured)
    }
    
    return NextResponse.json({
      success: true,
      articles: articles.slice(0, limit),
      categories: CATEGORIES,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.log('[v0] Error in GET handler:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch news",
      articles: generateFallbackArticles(),
    }, { status: 500 })
  }
}
