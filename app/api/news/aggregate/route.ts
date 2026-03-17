import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // Allow up to 60s for aggregation

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET handler - called by Vercel cron every 2 hours
export async function GET(request: Request) {
  try {
    // Verify cron secret if configured
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
  const errors: string[] = []

  // 2. Process each source - fetch RSS, classify, store
  for (const source of sources) {
    try {
      // Skip reddit sources for now (need different parsing)
      if (source.source_type === 'reddit') continue

      const feedUrl = source.feed_url || source.url
      console.log(`[Aggregate] Fetching: ${source.name} (${feedUrl})`)

      // Fetch and parse RSS
      const articles = await fetchRSSFeed(feedUrl, source)
      totalFetched += articles.length

      if (articles.length === 0) continue

      // AI classify each article (batch)
      const classified = await classifyArticles(articles)

      // Store in Supabase (upsert by source_url to avoid duplicates)
      for (const article of classified) {
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
      const msg = `${source.name}: ${String(err)}`
      errors.push(msg)
      console.error(`[Aggregate] Error: ${msg}`)
    }
  }

  return {
    sources_processed: sources.length,
    articles_fetched: totalFetched,
    articles_stored: totalStored,
    errors: totalErrors,
    error_details: errors.slice(0, 10) // Cap error details
  }
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
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'dc:date')
    const imageUrl = extractMediaImage(item)

    if (!title || !link) continue

    // Skip articles older than 30 days
    const publishedAt = pubDate ? new Date(pubDate) : new Date()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (publishedAt < thirtyDaysAgo) continue

    // Generate a stable ID
    const id = 'art_' + generateShortId(link)

    articles.push({
      id,
      title: cleanHTML(title),
      summary: cleanHTML(description || '').substring(0, 500),
      source_name: source.name,
      source_url: link,
      published_at: publishedAt.toISOString(),
      image_url: imageUrl || null,
      original_rss_image: imageUrl || null,
      has_real_image: !!imageUrl,
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
      const description = extractTag(item, 'summary') || extractTag(item, 'content')
      const pubDate = extractTag(item, 'published') || extractTag(item, 'updated')
      const imageUrl = extractMediaImage(item)

      if (!title || !link) continue

      const publishedAt = pubDate ? new Date(pubDate) : new Date()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      if (publishedAt < thirtyDaysAgo) continue

      const id = 'art_' + generateShortId(link)

      articles.push({
        id,
        title: cleanHTML(title),
        summary: cleanHTML(description || '').substring(0, 500),
        source_name: source.name,
        source_url: link,
        published_at: publishedAt.toISOString(),
        image_url: imageUrl || null,
        original_rss_image: imageUrl || null,
        has_real_image: !!imageUrl,
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

// AI classification using Anthropic Claude
async function classifyArticles(articles: any[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return articles // Return unclassified if no API key

  // Process up to 10 articles per batch to stay within time limits
  const batch = articles.slice(0, 10)

  for (const article of batch) {
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
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Classify this e-commerce article. Return ONLY valid JSON, no markdown.
{
  "category": one of: "breaking", "market_metrics", "platform_updates", "seller_profitability", "ma_deal_flow", "tools_technology", "advertising", "logistics",
  "relevance_score": 1-100 (how relevant to marketplace sellers),
  "impact_level": "high" | "medium" | "low",
  "is_breaking": true/false,
  "platforms": array of: "amazon", "walmart", "ebay", "shopify", "tiktok", "target",
  "audience": array of: "brand_sellers", "agencies", "saas_tech", "investors", "service_providers",
  "ai_summary": 2-3 sentence summary for marketplace professionals,
  "action_item": one actionable takeaway for sellers (or null),
  "key_stat": key statistic from the article (or null)
}

Title: ${article.title}
Summary: ${article.summary}`
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.content?.[0]?.text || ''
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const classification = JSON.parse(jsonMatch[0])
          Object.assign(article, {
            category: classification.category || article.category,
            relevance_score: classification.relevance_score || article.relevance_score,
            impact_level: classification.impact_level || article.impact_level,
            is_breaking: classification.is_breaking || false,
            platforms: classification.platforms || article.platforms,
            audience: classification.audience || article.audience,
            ai_summary: classification.ai_summary || article.summary,
            action_item: classification.action_item || null,
            key_stat: classification.key_stat || null
          })
        }
      }
    } catch (err) {
      console.error(`[AI] Classification failed for: ${article.title}`, err)
      // Keep article with default classification
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
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
