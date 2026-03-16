import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import crypto from 'crypto'

// Types
export interface NewsSource {
  id: string
  name: string
  slug: string
  source_type: 'rss' | 'api' | 'scraper' | 'reddit' | 'forum' | 'social' | 'manual'
  url: string
  feed_url: string | null
  category: string
  platform: string[]
  is_active: boolean
  priority_score: number
  last_fetched_at: string | null
  fetch_frequency_minutes: number
  metadata: Record<string, unknown>
}

export interface Article {
  id?: string
  external_id: string
  source_id: string | null
  source_name: string
  source_url: string
  title: string
  slug: string
  summary: string | null
  body: string | null
  excerpt: string | null
  image_url: string | null
  author: string | null
  category: string
  platforms: string[]
  tags: string[]
  keywords: string[]
  ai_relevance_score: number
  ai_sentiment: 'positive' | 'negative' | 'neutral' | null
  ai_summary: string | null
  ai_keywords: string[]
  ai_category_confidence: number
  published_at: string
  fetched_at: string
  is_breaking: boolean
  is_featured: boolean
  priority_score: number
  content_hash: string
}

// RSS Feed Sources - E-commerce focused (verified working feeds)
export const DEFAULT_RSS_SOURCES: Omit<NewsSource, 'id' | 'last_fetched_at'>[] = [
  {
    name: 'eCommerce Bytes',
    slug: 'ecommerce-bytes',
    source_type: 'rss',
    url: 'https://www.ecommercebytes.com',
    feed_url: 'https://www.ecommercebytes.com/feed/',
    category: 'ecommerce',
    platform: ['amazon', 'ebay', 'etsy'],
    is_active: true,
    priority_score: 85,
    fetch_frequency_minutes: 60,
    metadata: {}
  },
  {
    name: 'Modern Retail',
    slug: 'modern-retail',
    source_type: 'rss',
    url: 'https://www.modernretail.co',
    feed_url: 'https://www.modernretail.co/feed/',
    category: 'ecommerce',
    platform: ['amazon', 'walmart', 'target'],
    is_active: true,
    priority_score: 85,
    fetch_frequency_minutes: 60,
    metadata: {}
  },
  {
    name: 'Jungle Scout Blog',
    slug: 'jungle-scout',
    source_type: 'rss',
    url: 'https://www.junglescout.com/blog',
    feed_url: 'https://www.junglescout.com/blog/feed/',
    category: 'amazon',
    platform: ['amazon'],
    is_active: true,
    priority_score: 80,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'TechCrunch E-commerce',
    slug: 'techcrunch-ecommerce',
    source_type: 'rss',
    url: 'https://techcrunch.com/tag/e-commerce/',
    feed_url: 'https://techcrunch.com/tag/e-commerce/feed/',
    category: 'industry',
    platform: ['general'],
    is_active: true,
    priority_score: 75,
    fetch_frequency_minutes: 60,
    metadata: {}
  },
  {
    name: 'Retail Dive',
    slug: 'retail-dive',
    source_type: 'rss',
    url: 'https://www.retaildive.com',
    feed_url: 'https://www.retaildive.com/feeds/news/',
    category: 'industry',
    platform: ['general'],
    is_active: true,
    priority_score: 80,
    fetch_frequency_minutes: 60,
    metadata: {}
  },
  {
    name: 'Supply Chain Dive',
    slug: 'supply-chain-dive',
    source_type: 'rss',
    url: 'https://www.supplychaindive.com',
    feed_url: 'https://www.supplychaindive.com/feeds/news/',
    category: 'logistics',
    platform: ['general'],
    is_active: true,
    priority_score: 75,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'Digital Commerce 360',
    slug: 'digital-commerce-360',
    source_type: 'rss',
    url: 'https://www.digitalcommerce360.com',
    feed_url: 'https://www.digitalcommerce360.com/feed/',
    category: 'ecommerce',
    platform: ['amazon', 'general'],
    is_active: true,
    priority_score: 80,
    fetch_frequency_minutes: 60,
    metadata: {}
  },
  {
    name: 'Chain Store Age',
    slug: 'chain-store-age',
    source_type: 'rss',
    url: 'https://chainstoreage.com',
    feed_url: 'https://chainstoreage.com/rss.xml',
    category: 'industry',
    platform: ['general'],
    is_active: true,
    priority_score: 70,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'Practical Commerce',
    slug: 'practical-commerce',
    source_type: 'rss',
    url: 'https://practicalcommerce.com',
    feed_url: 'https://practicalcommerce.com/feed',
    category: 'ecommerce',
    platform: ['general'],
    is_active: true,
    priority_score: 75,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'Helium 10',
    slug: 'helium-10',
    source_type: 'rss',
    url: 'https://www.helium10.com/blog',
    feed_url: 'https://www.helium10.com/blog/feed/',
    category: 'amazon',
    platform: ['amazon'],
    is_active: true,
    priority_score: 80,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'Carbon6',
    slug: 'carbon6',
    source_type: 'rss',
    url: 'https://carbon6.io/blog',
    feed_url: 'https://carbon6.io/blog/feed/',
    category: 'amazon',
    platform: ['amazon'],
    is_active: true,
    priority_score: 75,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'EcomCrew',
    slug: 'ecomcrew',
    source_type: 'rss',
    url: 'https://ecomcrew.com',
    feed_url: 'https://ecomcrew.com/feed/',
    category: 'ecommerce',
    platform: ['amazon', 'general'],
    is_active: true,
    priority_score: 75,
    fetch_frequency_minutes: 120,
    metadata: {}
  },
  {
    name: 'About Amazon',
    slug: 'about-amazon',
    source_type: 'rss',
    url: 'https://www.aboutamazon.com/news',
    feed_url: 'https://www.aboutamazon.com/news/feed',
    category: 'amazon',
    platform: ['amazon'],
    is_active: true,
    priority_score: 80,
    fetch_frequency_minutes: 60,
    metadata: {}
  },
  {
    name: 'Tinuiti',
    slug: 'tinuiti',
    source_type: 'rss',
    url: 'https://tinuiti.com/blog',
    feed_url: 'https://tinuiti.com/blog/feed/',
    category: 'advertising',
    platform: ['amazon', 'walmart', 'general'],
    is_active: true,
    priority_score: 75,
    fetch_frequency_minutes: 120,
    metadata: {}
  }
]

// AI Classification Schema
const articleClassificationSchema = z.object({
  category: z.enum([
    'announcements',
    'general',
    'amazon',
    'other-marketplaces',
    'profitability',
    'advertising',
    'logistics',
    'tools',
    'reviews',
    'deals',
    'wins',
    'help'
  ]),
  categoryConfidence: z.number().min(0).max(1),
  relevanceScore: z.number().min(0).max(1),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  keywords: z.array(z.string()).max(10),
  summary: z.string().max(300),
  isBreaking: z.boolean(),
  platforms: z.array(z.string()),
})

// Generate content hash for deduplication
export function generateContentHash(title: string, content: string): string {
  const normalized = (title + content).toLowerCase().replace(/\s+/g, ' ').trim()
  return crypto.createHash('md5').update(normalized).digest('hex')
}

// Generate URL-safe slug
export function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
  return `${base}-${id.substring(0, 8)}`
}

// Parse RSS feed
export async function parseRSSFeed(feedUrl: string): Promise<{
  items: Array<{
    title: string
    link: string
    description: string
    pubDate: string
    author?: string
    content?: string
    imageUrl?: string
  }>
}> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'EcomIntelHub/1.0 (News Aggregator)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`)
    }

    const text = await response.text()
    
    // Simple XML parsing for RSS
    const items: Array<{
      title: string
      link: string
      description: string
      pubDate: string
      author?: string
      content?: string
      imageUrl?: string
    }> = []

    // Extract items using regex (lightweight XML parsing)
    const itemMatches = text.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const itemXml of itemMatches.slice(0, 20)) { // Limit to 20 items
      const title = extractTag(itemXml, 'title')
      const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid')
      const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary')
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published') || extractTag(itemXml, 'dc:date')
      const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator')
      const content = extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content')
      
      // Try to extract image
      const imageMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/) ||
                        itemXml.match(/<enclosure[^>]*url="([^"]+)"/) ||
                        itemXml.match(/<img[^>]*src="([^"]+)"/)
      const imageUrl = imageMatch ? imageMatch[1] : undefined

      if (title && link) {
        items.push({
          title: cleanHtml(title),
          link: cleanHtml(link),
          description: cleanHtml(description || ''),
          pubDate: pubDate || new Date().toISOString(),
          author: author ? cleanHtml(author) : undefined,
          content: content ? cleanHtml(content) : undefined,
          imageUrl
        })
      }
    }

    return { items }
  } catch (error) {
    console.error(`Error parsing RSS feed ${feedUrl}:`, error)
    return { items: [] }
  }
}

// Helper to extract XML tag content
function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? (match[1] || match[2] || '').trim() : null
}

// Clean HTML tags from content
function cleanHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// AI-powered article classification using direct Anthropic API
export async function classifyArticle(
  title: string,
  content: string,
  sourcePlatforms: string[]
): Promise<z.infer<typeof articleClassificationSchema>> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.log('[v0] ANTHROPIC_API_KEY not set — using default classification')
    return {
      category: 'general',
      categoryConfidence: 0.5,
      relevanceScore: 0.5,
      sentiment: 'neutral',
      keywords: [],
      summary: content.substring(0, 200),
      isBreaking: false,
      platforms: sourcePlatforms,
    }
  }

  const systemPrompt = `You are an e-commerce news classifier. Analyze articles and classify them for an Amazon/Walmart seller audience.

Categories:
- announcements: Official platform announcements, policy changes
- amazon: Amazon-specific news, FBA updates, Seller Central changes
- other-marketplaces: Walmart, TikTok Shop, eBay, Etsy news
- profitability: Margin optimization, fees, pricing strategies
- advertising: PPC, sponsored products, marketing
- logistics: Shipping, FBA, 3PL, supply chain
- tools: Software, apps, seller tools
- industry: General e-commerce industry news
- general: Other relevant news

Determine:
1. Best category fit
2. Relevance score (0-1) for e-commerce sellers
3. Sentiment (positive/negative/neutral for sellers)
4. Key keywords (max 10)
5. Brief summary (max 300 chars)
6. If this is breaking/urgent news
7. Which platforms it relates to (amazon, walmart, tiktok, ebay, etsy, shopify, etc.)

Return ONLY valid JSON, no other text.`

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
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Title: ${title}\n\nContent: ${content.substring(0, 2000)}\n\nSource platforms: ${sourcePlatforms.join(', ')}\n\nReturn JSON with: category, categoryConfidence (0-1), relevanceScore (0-1), sentiment (positive/negative/neutral), keywords (array, max 10), summary (max 300 chars), isBreaking (boolean), platforms (array)`
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Anthropic API error ${response.status}:`, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'

    // Strip markdown fences and parse JSON
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim()
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return articleClassificationSchema.parse(parsed)
  } catch (error) {
    console.error('AI classification error:', error)
    // Return default classification on error
    return {
      category: 'general',
      categoryConfidence: 0.5,
      relevanceScore: 0.5,
      sentiment: 'neutral',
      keywords: [],
      summary: content.substring(0, 200),
      isBreaking: false,
      platforms: sourcePlatforms,
    }
  }
}

// Fetch and process articles from a source
export async function fetchFromSource(source: NewsSource): Promise<Article[]> {
  if (!source.feed_url || source.source_type !== 'rss') {
    return []
  }

  const { items } = await parseRSSFeed(source.feed_url)
  const articles: Article[] = []

  for (const item of items) {
    const content = item.content || item.description || ''
    const contentHash = generateContentHash(item.title, content)
    const externalId = crypto.createHash('md5').update(item.link).digest('hex')
    
    // Parse publication date
    let publishedAt: Date
    try {
      publishedAt = new Date(item.pubDate)
      if (isNaN(publishedAt.getTime())) {
        publishedAt = new Date()
      }
    } catch {
      publishedAt = new Date()
    }

    // Skip articles older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    if (publishedAt < thirtyDaysAgo) {
      continue
    }

    // AI classification
    const classification = await classifyArticle(
      item.title,
      content,
      source.platform
    )

    const article: Article = {
      external_id: externalId,
      source_id: source.id,
      source_name: source.name,
      source_url: item.link,
      title: item.title,
      slug: generateSlug(item.title, externalId),
      summary: item.description?.substring(0, 500) || null,
      body: content || null,
      excerpt: content?.substring(0, 200) || null,
      image_url: item.imageUrl || null,
      author: item.author || null,
      category: classification.category,
      platforms: classification.platforms,
      tags: [],
      keywords: classification.keywords,
      ai_relevance_score: classification.relevanceScore,
      ai_sentiment: classification.sentiment,
      ai_summary: classification.summary,
      ai_keywords: classification.keywords,
      ai_category_confidence: classification.categoryConfidence,
      published_at: publishedAt.toISOString(),
      fetched_at: new Date().toISOString(),
      is_breaking: classification.isBreaking,
      is_featured: classification.relevanceScore > 0.8,
      priority_score: Math.round(
        (source.priority_score * 0.4) + 
        (classification.relevanceScore * 100 * 0.4) +
        (classification.isBreaking ? 20 : 0)
      ),
      content_hash: contentHash,
    }

    articles.push(article)
  }

  return articles
}

// Initialize default sources
export async function initializeSources(): Promise<void> {
  const supabase = createAdminClient()

  for (const source of DEFAULT_RSS_SOURCES) {
    const { error } = await supabase
      .from('news_sources')
      .upsert(source, { onConflict: 'slug' })

    if (error) {
      console.error(`Error upserting source ${source.name}:`, error)
    }
  }
}

// Main aggregation function
export async function runAggregation(): Promise<{
  sourcesProcessed: number
  articlesFound: number
  articlesSaved: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const errors: string[] = []
  let articlesFound = 0
  let articlesSaved = 0

  // Get active sources
  const { data: sources, error: sourcesError } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true)

  if (sourcesError || !sources) {
    // Initialize sources if none exist
    await initializeSources()
    const { data: newSources } = await supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true)
    
    if (!newSources || newSources.length === 0) {
      return { sourcesProcessed: 0, articlesFound: 0, articlesSaved: 0, errors: ['No sources available'] }
    }
  }

  const activeSources = sources || []

  // Process each source
  for (const source of activeSources) {
    try {
      const articles = await fetchFromSource(source as NewsSource)
      articlesFound += articles.length

      // Insert articles (upsert to handle duplicates)
      for (const article of articles) {
        const { error: insertError } = await supabase
          .from('articles')
          .upsert(article, { 
            onConflict: 'slug',
            ignoreDuplicates: true 
          })

        if (insertError) {
          // Check if it's a duplicate error (which is fine)
          if (!insertError.message?.includes('duplicate')) {
            errors.push(`Error saving article "${article.title}": ${insertError.message}`)
          }
        } else {
          articlesSaved++
        }
      }

      // Update last_fetched_at
      await supabase
        .from('news_sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', source.id)

    } catch (error) {
      errors.push(`Error processing source ${source.name}: ${error}`)
    }
  }

  return {
    sourcesProcessed: activeSources.length,
    articlesFound,
    articlesSaved,
    errors
  }
}

// Get articles with filtering and sorting
export async function getArticles(options: {
  category?: string
  platform?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'recent' | 'relevance' | 'trending'
}): Promise<Article[]> {
  const supabase = createAdminClient()
  const { category, platform, search, limit = 50, offset = 0, sortBy = 'recent' } = options

  let query = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('is_approved', true)

  // Category filter
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // Platform filter
  if (platform) {
    query = query.contains('platforms', [platform])
  }

  // Full-text search
  if (search) {
    query = query.textSearch('title', search, { type: 'websearch' })
  }

  // Sorting
  switch (sortBy) {
    case 'relevance':
      query = query.order('ai_relevance_score', { ascending: false })
      break
    case 'trending':
      query = query.order('priority_score', { ascending: false })
      break
    case 'recent':
    default:
      query = query.order('published_at', { ascending: false })
  }

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
}

// Get breaking news
export async function getBreakingNews(limit = 5): Promise<Article[]> {
  const supabase = createAdminClient()
  
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_breaking', true)
    .eq('is_published', true)
    .gte('published_at', oneDayAgo.toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching breaking news:', error)
    return []
  }

  return data || []
}
