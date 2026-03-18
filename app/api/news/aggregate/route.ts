import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // Allow up to 60s for aggregation

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Competitor domains to block (especially from Google News feeds)
const BLOCKED_DOMAINS = [
  'carbon6.io',
  'helium10.com',
  'junglescout.com',
  'sellersessions.com',
  'feedvisor.com',
  'tinuiti.com',
]

function isBlockedSource(url: string): boolean {
  return BLOCKED_DOMAINS.some(domain => url.includes(domain))
}

// GET handler - called by Vercel cron every 2 hours
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await runAggregationFromDB()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Aggregation error:', error)
    return NextResponse.json(
      { error: 'Aggregation failed', details: String(error) },
      { status: 500 }
    )
  }
}

// POST handler - manual trigger
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await runAggregationFromDB()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Aggregation error:', error)
    return NextResponse.json(
      { error: 'Aggregation failed', details: String(error) },
      { status: 500 }
    )
  }
}

async function runAggregationFromDB() {
  const startTime = Date.now()
  const MAX_RUNTIME_MS = 50000 // Stop at 50s to leave buffer for DB writes

  // 1. Fetch active sources from the news_sources table
  const { data: sources, error: sourcesError } = await supabaseAdmin
    .from('news_sources')
    .select('*')
    .eq('is_active', true)
    .order('priority_score', { ascending: false })

  if (sourcesError) throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
  if (!sources || sources.length === 0) throw new Error('No active sources found')

  console.log(`[Aggregate] Found ${sources.length} active sources`)

  let totalFetched = 0
  let totalStored = 0
  let totalErrors = 0
  let sourcesProcessed = 0
  let totalBlocked = 0
  const errors: string[] = []

  // 2. Process each source - fetch RSS, store (NO AI classification)
  for (const source of sources) {
    // Time guard: stop before hitting the 60s limit
    if (Date.now() - startTime > MAX_RUNTIME_MS) {
      console.log(`[Aggregate] Time limit reached after processing ${sourcesProcessed} sources`)
      break
    }

    try {
      // Skip reddit sources for now (need different parsing)
      if (source.source_type === 'reddit') continue

      const feedUrl = source.feed_url || source.url
      console.log(`[Aggregate] Fetching: ${source.name} (${feedUrl})`)

      // Fetch and parse RSS
      const articles = await fetchRSSFeed(feedUrl, source)
      totalFetched += articles.length
      sourcesProcessed++

      if (articles.length === 0) continue

      // Store in Supabase (upsert by source_url to avoid duplicates)
      // No AI classification here — that's handled by /api/news/classify
      for (const article of articles) {
        // Block competitor content
        if (isBlockedSource(article.source_url)) {
          console.log(`[Aggregate] Blocked competitor article: ${article.source_url}`)
          totalBlocked++
          continue
        }

        // Try OG image + body text extraction for articles missing images or with tiny RSS thumbnails
        const hasTinyThumb = article.image_url && (
          article.image_url.includes('150x150') ||
          article.image_url.includes('50x50') ||
          article.image_url.includes('100x100')
        )
        const needsImageExtraction = !article.image_url || hasTinyThumb

        if (needsImageExtraction || !article.full_content) {
          // Only attempt extraction if we have time
          if (Date.now() - startTime < MAX_RUNTIME_MS) {
            const { ogImage, bodyText } = await extractArticleData(article.source_url)

            if (ogImage) {
              article.og_image_url = ogImage
              article.image_url = ogImage
              article.has_real_image = true
              article.image_source = 'og'
            } else if (hasTinyThumb) {
              // Clear the tiny thumbnail so the fallback image system kicks in
              article.has_real_image = false
              article.image_source = 'rss_thumb'
            } else {
              article.image_source = article.image_url ? 'rss' : 'none'
            }

            if (bodyText && bodyText.length > 200) {
              article.full_content = bodyText
            }
          }
        } else {
          article.image_source = 'rss'
        }

        const { error: upsertError } = await supabaseAdmin
          .from('articles')
          .upsert(article, { onConflict: 'source_url' })

        if (!upsertError) {
          totalStored++
        }
      }

      // Update last_fetched_at on the source
      await supabaseAdmin
        .from('news_sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', source.id)

    } catch (err) {
      totalErrors++
      sourcesProcessed++
      const msg = `${source.name}: ${String(err)}`
      errors.push(msg)
      console.error(`[Aggregate] Error: ${msg}`)
    }
  }

  // 3. Fetch from NewsAPI if we still have time
  let newsApiCount = 0
  if (Date.now() - startTime < MAX_RUNTIME_MS) {
    console.log('[Aggregate] Fetching from NewsAPI...')
    try {
      const newsApiArticles = await fetchFromNewsAPI()
      for (const article of newsApiArticles) {
        if (isBlockedSource(article.source_url)) {
          totalBlocked++
          continue
        }
        const { error } = await supabaseAdmin
          .from('articles')
          .upsert(article, { onConflict: 'source_url' })
        if (!error) totalStored++
      }
      newsApiCount = newsApiArticles.length
      totalFetched += newsApiCount
    } catch (err) {
      console.error('[Aggregate] NewsAPI error:', err)
      errors.push(`NewsAPI: ${String(err)}`)
    }
  }

  return {
    sources_total: sources.length,
    sources_processed: sourcesProcessed,
    articles_fetched: totalFetched,
    articles_stored: totalStored,
    articles_blocked: totalBlocked,
    newsapi_articles: newsApiCount,
    errors: totalErrors,
    error_details: errors.slice(0, 10),
    runtime_ms: Date.now() - startTime
  }
}

// Fetch articles from NewsAPI (free tier: 100 requests/day)
async function fetchFromNewsAPI(): Promise<any[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return []

  const queries = [
    'amazon marketplace seller',
    'walmart marketplace ecommerce',
    'shopify seller store',
    'tiktok shop ecommerce',
    'ecommerce tariffs import',
    'amazon FBA fulfillment',
  ]

  const articles: any[] = []

  // Only use 2-3 queries per run to conserve the 100/day limit
  const selectedQueries = queries.slice(0, 2)

  for (const query of selectedQueries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`

      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) continue
      const data = await response.json()

      for (const item of data.articles || []) {
        if (!item.title || !item.url) continue
        // Skip removed/placeholder articles from NewsAPI
        if (item.title === '[Removed]') continue

        const id = 'art_' + generateShortId(item.url)

        articles.push({
          id,
          title: item.title,
          summary: item.description || '',
          source_name: item.source?.name || 'NewsAPI',
          source_url: item.url,
          published_at: item.publishedAt || new Date().toISOString(),
          image_url: item.urlToImage || null,
          original_rss_image: item.urlToImage || null,
          has_real_image: !!item.urlToImage,
          category: 'platform_updates',
          platforms: [],
          source_type: 'google', // Mark as external API source
          relevant: true,
          relevance_score: 50, // Will be updated by AI classification
          impact_level: 'medium',
          is_breaking: false,
          audience: ['brand_sellers'],
          tier: 2
        })
      }
    } catch (err) {
      console.error(`[NewsAPI] Error for query "${query}":`, err)
    }
  }

  return articles
}

// Extract OG image and article body text from article source URL
// Returns both the OG image URL and extracted body text so we can store full_content
async function extractArticleData(url: string): Promise<{ ogImage: string | null; bodyText: string | null }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MarketplaceBeta/1.0 (news aggregator)' }
    })
    clearTimeout(timeout)

    if (!response.ok) return { ogImage: null, bodyText: null }

    // Read up to 200KB — enough for head OG tags AND the article body
    const reader = response.body?.getReader()
    if (!reader) return { ogImage: null, bodyText: null }

    let html = ''
    const decoder = new TextDecoder()

    while (html.length < 200000) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })

      // Stop early once we've read body content (past </article> or 200KB)
      if (html.length > 100000 && (html.includes('</article>') || html.includes('</main>'))) break
    }
    reader.cancel()

    // --- Extract OG image ---
    let ogImage: string | null = null
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

    if (ogMatch?.[1]) {
      const imgUrl = ogMatch[1]
      if (!imgUrl.includes('placeholder') && !imgUrl.includes('default') && !imgUrl.includes('1x1')) {
        ogImage = imgUrl
      }
    }

    if (!ogImage) {
      const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)
      ogImage = twitterMatch?.[1] || null
    }

    // --- Extract article body text ---
    // Try semantic article containers first, then fall back to body
    let bodyText: string | null = null

    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || html.match(/<div[^>]*class=["'][^"']*(article|post|content|entry)[^"']*["'][^>]*>([\s\S]{500,}?)<\/div>/i)

    if (articleMatch) {
      const rawHtml = articleMatch[1] || articleMatch[2] || ''
      // Strip scripts, styles, nav, aside, footer elements
      const cleaned = rawHtml
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (cleaned.length > 200) {
        bodyText = cleaned.substring(0, 5000) // Cap at 5000 chars
      }
    }

    return { ogImage, bodyText }
  } catch {
    return { ogImage: null, bodyText: null }
  }
}

// Kept for backward compatibility — wraps extractArticleData
async function extractOGImage(url: string): Promise<string | null> {
  const { ogImage } = await extractArticleData(url)
  return ogImage
}

// Parse RSS feed XML into article objects
async function fetchRSSFeed(feedUrl: string, source: any) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout per feed

  try {
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MarketplaceBeta/1.0 NewsAggregator' }
    })
    clearTimeout(timeout)

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const xml = await response.text()
    return parseRSSXML(xml, source)
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

// Simple RSS/Atom XML parser
function parseRSSXML(xml: string, source: any) {
  const articles: any[] = []

  // Try RSS 2.0 format first
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]

    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link') || extractAttr(item, 'link', 'href')
    const description = extractTag(item, 'description') || extractTag(item, 'summary')
    // content:encoded often contains the full article HTML — extract it for richer AI analysis
    const fullContentRaw = extractTag(item, 'content:encoded') || extractTag(item, 'content')
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'dc:date')
    const imageUrl = extractMediaImage(item)

    if (!title || !link) continue

    // Skip articles older than 30 days
    const publishedAt = pubDate ? new Date(pubDate) : new Date()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (publishedAt < thirtyDaysAgo) continue

    // Generate a stable ID
    const id = 'art_' + generateShortId(link)

    // Strip HTML tags from full content to get plain text for AI
    const fullContentText = fullContentRaw
      ? cleanHTML(fullContentRaw).substring(0, 5000)
      : null

    // Try to extract a better image from content:encoded if no RSS image
    const contentImage = !imageUrl && fullContentRaw ? extractMediaImage(fullContentRaw) : null

    articles.push({
      id,
      title: cleanHTML(title),
      summary: cleanHTML(description || '').substring(0, 500),
      full_content: fullContentText,
      source_name: source.name,
      source_url: link,
      published_at: publishedAt.toISOString(),
      image_url: contentImage || imageUrl || null,
      original_rss_image: contentImage || imageUrl || null,
      has_real_image: !!(contentImage || imageUrl),
      category: source.category || 'platform_updates',
      platforms: source.platform || [],
      source_type: 'industry',
      relevant: true,
      relevance_score: source.priority_score || 50,
      impact_level: 'medium',
      is_breaking: false,
      audience: ['brand_sellers', 'agencies'],
      tier: source.priority_score >= 90 ? 1 : source.priority_score >= 80 ? 2 : 3
    })
  }

  // Try Atom format if no RSS items found
  if (articles.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi
    while ((match = entryRegex.exec(xml)) !== null) {
      const item = match[1]

      const title = extractTag(item, 'title')
      const link = extractAttr(item, 'link', 'href')
      const description = extractTag(item, 'summary')
      const fullContentRaw = extractTag(item, 'content') || extractTag(item, 'content:encoded')
      const pubDate = extractTag(item, 'published') || extractTag(item, 'updated')
      const imageUrl = extractMediaImage(item)

      if (!title || !link) continue

      const publishedAt = pubDate ? new Date(pubDate) : new Date()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      if (publishedAt < thirtyDaysAgo) continue

      const id = 'art_' + generateShortId(link)

      const fullContentText = fullContentRaw
        ? cleanHTML(fullContentRaw).substring(0, 5000)
        : null
      const contentImage = !imageUrl && fullContentRaw ? extractMediaImage(fullContentRaw) : null

      articles.push({
        id,
        title: cleanHTML(title),
        summary: cleanHTML(description || fullContentRaw || '').substring(0, 500),
        full_content: fullContentText,
        source_name: source.name,
        source_url: link,
        published_at: publishedAt.toISOString(),
        image_url: contentImage || imageUrl || null,
        original_rss_image: contentImage || imageUrl || null,
        has_real_image: !!(contentImage || imageUrl),
        category: source.category || 'platform_updates',
        platforms: source.platform || [],
        source_type: 'industry',
        relevant: true,
        relevance_score: source.priority_score || 50,
        impact_level: 'medium',
        is_breaking: false,
        audience: ['brand_sellers', 'agencies'],
        tier: source.priority_score >= 90 ? 1 : source.priority_score >= 80 ? 2 : 3
      })
    }
  }

  return articles
}

// Helper functions
function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1]

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

function extractMediaImage(xml: string): string | null {
  // Try media:content
  const mediaMatch = xml.match(/url="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i)
  if (mediaMatch) return mediaMatch[1]
  // Try enclosure
  const enclosureMatch = xml.match(/<enclosure[^>]+url="(https?:\/\/[^"]+)"/i)
  if (enclosureMatch) return enclosureMatch[1]
  // Try og:image or img in content
  const imgMatch = xml.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i)
  if (imgMatch) return imgMatch[1]
  return null
}

function cleanHTML(text: string): string {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    // Decode numeric HTML entities (decimal: &#8217; and hex: &#x2019;)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    // Decode named HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&trade;/g, '\u2122')
    .replace(/&copy;/g, '\u00A9')
    .replace(/&reg;/g, '\u00AE')
    .replace(/\s+/g, ' ')
    .trim()
}

function generateShortId(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36).substring(0, 6)
}
