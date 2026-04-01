import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const OFFICIAL_COMMUNITY_QUERIES = [
  {
    query: 'site:sellercentral.amazon.com/seller-forums FBA fees OR reimbursement OR policy OR account health',
    sourcePlatform: 'sellercentral_amazon',
    author: 'Amazon Seller Forums',
  },
  {
    query: 'site:marketplacelearn.walmart.com/forum OR site:marketplacelearn.walmart.com/guides walmart marketplace seller policy',
    sourcePlatform: 'walmart_marketplacelearn',
    author: 'Walmart Marketplace Learn',
  },
  {
    query: 'site:community.shopify.com Shopify merchant issue OR update OR support OR checkout',
    sourcePlatform: 'shopify_community',
    author: 'Shopify Community',
  },
  {
    query: 'site:shopify.dev/changelog Shopify action required OR changelog merchant platform',
    sourcePlatform: 'shopify_changelog',
    author: 'Shopify Developer Changelog',
  },
  {
    query: 'site:seller-us.tiktok.com/university TikTok Shop policy OR seller enforcement OR listing policy',
    sourcePlatform: 'tiktok_shop_policy',
    author: 'TikTok Shop Academy',
  },
  {
    query: 'site:community.ebay.com "Seller News" OR announcements seller',
    sourcePlatform: 'ebay_community',
    author: 'eBay Community',
  },
  {
    query: 'site:plus.target.com OR site:corp.target.com "Target Plus" marketplace seller',
    sourcePlatform: 'target_plus',
    author: 'Target Plus',
  },
]

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    const MAX_RUNTIME_MS = 50000
    let totalFetched = 0
    let totalStored = 0
    const errors: string[] = []

    // ── Tier 1: Reddit JSON API ──
    const subreddits = [
      { name: 'FulfillmentByAmazon', platform: 'reddit_fba' },
      { name: 'AmazonSeller', platform: 'reddit_amzseller' },
      { name: 'ecommerce', platform: 'reddit_ecommerce' },
      { name: 'shopify', platform: 'reddit_shopify' },
    ]

    for (const sub of subreddits) {
      if (Date.now() - startTime > MAX_RUNTIME_MS) break

      try {
        for (const sort of ['hot', 'top'] as const) {
          const url = sort === 'top'
            ? `https://www.reddit.com/r/${sub.name}/top.json?t=week&limit=25`
            : `https://www.reddit.com/r/${sub.name}/${sort}.json?limit=25`

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'MarketplaceBeta/1.0 (community intelligence aggregator)'
            },
            signal: AbortSignal.timeout(8000)
          })

          if (!response.ok) {
            errors.push(`Reddit ${sub.name}/${sort}: HTTP ${response.status}`)
            continue
          }

          const data = await response.json()
          const posts = data?.data?.children || []
          totalFetched += posts.length

          for (const post of posts) {
            const p = post.data
            if (!p.title || !p.permalink) continue

            // Skip posts older than 14 days
            const postedAt = new Date(p.created_utc * 1000)
            const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            if (postedAt < fourteenDaysAgo) continue

            // Skip low-engagement posts (noise filter)
            if ((p.score || 0) < 3 && (p.num_comments || 0) < 2) continue

            const id = `ct_${sub.platform}_${p.id}`
            const topic = {
              id,
              title: cleanText(p.title),
              body_snippet: cleanText((p.selftext || '').substring(0, 1000)),
              source_platform: sub.platform,
              source_url: `https://www.reddit.com${p.permalink}`,
              author: p.author || 'unknown',
              upvotes: p.score || 0,
              comment_count: p.num_comments || 0,
              published_at: postedAt.toISOString(),
              fetched_at: new Date().toISOString(),
              processed: false,
            }

            const { error } = await supabaseAdmin
              .from('community_topics')
              .upsert(topic, { onConflict: 'source_url' })

            if (!error) totalStored++
          }
        }
      } catch (err) {
        errors.push(`Reddit ${sub.name}: ${String(err)}`)
      }
    }

    // ── Tier 2: Google-Indexed Seller Central Forum Topics ──
    if (Date.now() - startTime < MAX_RUNTIME_MS) {
      try {
        const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY
        const googleCx = process.env.GOOGLE_SEARCH_CX

        if (googleApiKey && googleCx) {
          // Use 2 rotating official-platform queries per run to stay within quota
          // while broadening coverage beyond Amazon.
          const queryIndex = Math.floor(Date.now() / (6 * 60 * 60 * 1000)) % OFFICIAL_COMMUNITY_QUERIES.length
          const selectedQueries = [
            OFFICIAL_COMMUNITY_QUERIES[queryIndex],
            OFFICIAL_COMMUNITY_QUERIES[(queryIndex + 1) % OFFICIAL_COMMUNITY_QUERIES.length],
          ]

          for (const definition of selectedQueries) {
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(definition.query)}&dateRestrict=m1&num=10`

            const response = await fetch(searchUrl, {
              signal: AbortSignal.timeout(8000)
            })

            if (!response.ok) continue

            const data = await response.json()
            for (const item of (data.items || [])) {
              const id = 'ct_sc_' + generateShortId(item.link)
              const topic = {
                id,
                title: cleanText(item.title),
                body_snippet: cleanText((item.snippet || '').substring(0, 500)),
                source_platform: definition.sourcePlatform,
                source_url: item.link,
                author: definition.author,
                upvotes: 0,
                comment_count: 0,
                published_at: new Date().toISOString(),
                fetched_at: new Date().toISOString(),
                processed: false,
              }

              const { error } = await supabaseAdmin
                .from('community_topics')
                .upsert(topic, { onConflict: 'source_url' })

              if (!error) totalStored++
              totalFetched++
            }
          }
        }
      } catch (err) {
        errors.push(`Google Search: ${String(err)}`)
      }
    }

    return NextResponse.json({
      success: true,
      topics_fetched: totalFetched,
      topics_stored: totalStored,
      errors: errors.length,
      error_details: errors.slice(0, 10),
      runtime_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Community aggregation error:', error)
    return NextResponse.json(
      { error: 'Community aggregation failed', details: String(error) },
      { status: 500 }
    )
  }
}

function cleanText(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
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
