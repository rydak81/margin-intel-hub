import { callAIForJSON } from '@/lib/ai-client'

// Shared by the /api/news/classify cron and the one-off archive backfill
// (/api/news/backfill-classify). Moved verbatim from the classify route so both use the
// exact same prompt and operator-value rules.

/**
 * Strip HTML tags from text
 */
export function stripHTML(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0)
}

export function evaluateOperatorValue(article: any, classified: {
  aiSummary: string
  ourTake: string
  keyTakeaways: string[]
  bottomLine: string
  whatThisMeans: string | null
  category: string
  platforms: string[]
  audience: string[]
  impactLevel: string
  keyStat: string | null
  relevanceScore: number
  unsplashQuery: string
}) {
  const sourceName = String(article.source_name || '')
  const combinedText = [
    article.title || '',
    article.summary || '',
    article.full_content || '',
    classified.aiSummary || '',
    classified.ourTake || '',
    (classified.keyTakeaways || []).join(' '),
    classified.whatThisMeans || '',
  ].join(' ').toLowerCase()

  const developerSignals = countMatches(combinedText, [
    /\bapi\b/,
    /\bgraphql\b/,
    /\bwebhook\b/,
    /\bmutation\b/,
    /\bquery\b/,
    /\bsdk\b/,
    /\bdeveloper\b/,
    /\bextension\b/,
    /\bmetafield\b/,
    /\bmetaobject\b/,
    /\bversion\b/,
    /\bendpoint\b/,
    /\badmin api\b/,
  ])

  const operatorSignals = countMatches(combinedText, [
    /\bseller\b/,
    /\bmerchant\b/,
    /\bbrand\b/,
    /\bagency\b/,
    /\bcheckout\b/,
    /\bpayments?\b/,
    /\bconversion\b/,
    /\borders?\b/,
    /\breturns?\b/,
    /\brefunds?\b/,
    /\bshipping\b/,
    /\bfulfillment\b/,
    /\bfees?\b/,
    /\bpolicy\b/,
    /\benforcement\b/,
    /\baccount health\b/,
    /\badvertising\b/,
    /\bprofit(?:ability)?\b/,
    /\bmarketplace\b/,
    /\bmerchant impact\b/,
  ])

  const isShopifyDevChangelog = sourceName.toLowerCase().includes('shopify developer changelog')
  const isLowValueTechnical = isShopifyDevChangelog && developerSignals >= 2 && operatorSignals < 2

  if (!isLowValueTechnical) {
    return {
      ...classified,
      relevant: (classified.relevanceScore || 0) >= 0.4,
      rejectionReason: null as string | null,
    }
  }

  return {
    ...classified,
    category: 'tools_technology',
    impactLevel: 'low',
    relevanceScore: Math.min(classified.relevanceScore || 0.2, 0.18),
    aiSummary: 'Technical Shopify developer update with limited immediate impact for most marketplace sellers or operators.',
    ourTake: 'Unless this touches your checkout, orders, payments, or fulfillment stack directly, this is low-priority reading for most commerce teams.',
    keyTakeaways: ['Skip unless your development team confirms it affects live merchant workflows or customer operations.'],
    bottomLine: 'Developer note, not operator signal.',
    whatThisMeans: 'Useful for app developers, but not strong front-page intelligence for seller or agency audiences.',
    relevant: false,
    rejectionReason: 'low_operator_value_technical_changelog',
  }
}

/**
 * Extract keywords from text using simple NLP heuristics.
 */
export function extractKeywords(text: string): Array<{ keyword: string; weight: number }> {
  if (!text) return []

  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2)

  const brands = [
    'amazon', 'ebay', 'shopify', 'etsy', 'tiktok', 'instagram', 'facebook', 'google',
    'walmart', 'target', 'bestbuy', 'costco', 'stripe', 'paypal', 'fulfillment',
    'asin', 'sku', 'fba', 'msku', 'api', 'sdk', 'aws', 'azure', 'gcp'
  ]

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
    'with', 'from', 'by', 'as', 'this', 'that', 'these', 'those', 'it', 'its',
    'you', 'your', 'we', 'our', 'they', 'their', 'what', 'which', 'who', 'why',
    'how', 'where', 'when', 'all', 'each', 'every', 'both', 'either', 'neither'
  ])

  const wordFreq: Record<string, number> = {}
  words.forEach(word => {
    if (word.length > 2 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })

  const keywords: Array<{ keyword: string; weight: number }> = []

  brands.forEach(brand => {
    if (wordFreq[brand]) {
      keywords.push({
        keyword: brand,
        weight: Math.min(1.0, 0.7 + wordFreq[brand] * 0.05)
      })
    }
  })

  Object.entries(wordFreq)
    .filter(([word]) => !brands.includes(word))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .forEach(([word, freq]) => {
      keywords.push({
        keyword: word,
        weight: Math.min(1.0, 0.3 + freq * 0.02)
      })
    })

  return keywords.sort((a, b) => b.weight - a.weight).slice(0, 20)
}

/**
 * Classify a single article using Claude (via AI Gateway or direct Anthropic)
 * Concise, seller-operator-focused intelligence for marketplace professionals
 */
export async function classifyArticle(article: any) {
  const prompt = `You are a marketplace intelligence analyst writing for Amazon, Walmart, and Target sellers, agency owners, and brand operators. Be direct and concise. No fluff.

ARTICLE:
Title: ${article.title}
Source: ${article.source_name || 'Unknown'}
Published: ${article.published_at || 'Recent'}
Summary: ${article.summary || ''}
${article.full_content ? `Full Content: ${article.full_content.substring(0, 4000)}` : ''}

RELEVANCE FILTER: Rate 0.0-1.0 how relevant this is to someone who sells on Amazon/Walmart/Target, runs an ecommerce agency, or manages marketplace brands. Score below 0.3 if the article is about general retail/tech news with no direct seller impact. Score 0.7+ only if it directly affects seller fees, policies, operations, advertising, profitability, or customer-facing commerce workflows.

IMPORTANT FILTERING RULE:
- Pure developer changelogs, API updates, SDK notes, webhooks, and GraphQL changes should score below 0.25 UNLESS they clearly affect merchant operations, checkout, fulfillment, payments, subscriptions, customer experience, or agency execution in the next 30 days.
- If the article is primarily for app developers and not for sellers/operators, classify it as low relevance and low impact.

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "aiSummary": "2 sentences MAX. What changed and who it impacts. Lead with the number or policy change, not background. Be specific with dates, percentages, platform names.",

  "ourTake": "2 sentences. The non-obvious second-order effect. What should a seller or agency DO differently? Name the report to pull, the metric to check, or the setting to change.",

  "keyTakeaways": [
    "One specific action: Name the exact tool, report, or setting. Format: 'Do X in Y to avoid Z' or 'Check X -- if above Y, then Z.'",
    "One preparation step: What to set up or adjust in the next 30 days."
  ],

  "bottomLine": "Under 20 words. The Slack-worthy headline. Format: 'X means Y for sellers.'",

  "whatThisMeans": "1-2 sentences. Where this fits in the bigger picture: platform consolidation, margin compression, AI disruption, regulatory shifts, or competitive dynamics.",

  "category": "one of: breaking, platform_updates, market_metrics, profitability, mergers_acquisitions, tools_technology, advertising, logistics, events, tactics, compliance_policy",
  "platforms": ["only include platforms directly mentioned or affected: amazon, walmart, shopify, ebay, tiktok, target, etsy"],
  "audience": ["who benefits most: sellers, agencies, brands, new_sellers, experts"],
  "impactLevel": "high = directly changes fees/policy/revenue; medium = operational change; low = informational only",
  "keyStat": "The single most important number as a complete phrase, e.g. '$2.3B in Q4 revenue' or '15% fee increase effective April 1'. null if no quantitative data.",
  "relevanceScore": 0.0-1.0,
  "unsplashQuery": "2-3 word photo search query"
}

RULES:
- Be CONCISE. Short sentences. No filler words like 'This development' or 'It is worth noting.'
- Each field must add UNIQUE value. Never repeat information across fields.
- aiSummary = WHAT happened. ourTake = WHY it matters. keyTakeaways = WHAT TO DO. bottomLine = HEADLINE.
- All text on single lines (no newlines within strings).
- Only valid JSON, no other text.`

  const { data: parsed, provider, model } = await callAIForJSON<any>({
    prompt,
    maxTokens: 2048
  })
  console.log(`[Classify] Article classified via ${provider} (${model})`)

  return {
    aiSummary: parsed.aiSummary || '',
    ourTake: parsed.ourTake || '',
    keyTakeaways: parsed.keyTakeaways || [],
    bottomLine: parsed.bottomLine || '',
    whatThisMeans: parsed.whatThisMeans || null,
    category: parsed.category || 'market_metrics',
    platforms: parsed.platforms || [],
    audience: parsed.audience || [],
    impactLevel: parsed.impactLevel || 'medium',
    keyStat: parsed.keyStat || null,
    relevanceScore: parsed.relevanceScore || 0.5,
    unsplashQuery: parsed.unsplashQuery || ''
  }
}

