import { NextResponse } from "next/server"
import Parser from "rss-parser"

export const dynamic = 'force-dynamic'
export const revalidate = 900 // Revalidate every 15 minutes

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
  tier: number
  sourceType: 'industry' | 'google' | 'reddit'
}

interface RSSFeed {
  url: string
  name: string
  tier: number
  label?: string
}

interface FilterStats {
  totalFetched: number
  hardExcluded: number
  titleRejected: number
  consumerRejected: number
  lowScore: number
  duplicates: number
  final: number
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

let articlesCache: NormalizedArticle[] = []
let lastCacheUpdate: number = 0
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

// ============================================================================
// PART 1: TIGHTENED GOOGLE NEWS FEEDS
// ============================================================================

const GOOGLE_NEWS_FEEDS: RSSFeed[] = [
  // Amazon SELLER-specific news (excludes devices, entertainment, AWS)
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+seller%22+OR+%22Amazon+FBA%22+OR+%22Seller+Central%22+OR+%22FBA+fees%22+OR+%22Amazon+third-party+seller%22+OR+%22Buy+with+Prime%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Amazon Seller News',
    tier: 3
  },
  // Walmart / TikTok / Target marketplace seller news
  {
    url: 'https://news.google.com/rss/search?q=%22Walmart+marketplace%22+OR+%22Walmart+seller%22+OR+%22TikTok+Shop%22+OR+%22Target+Plus+marketplace%22+OR+%22Walmart+Connect%22+OR+%22Walmart+Fulfillment+Services%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Other Marketplace Sellers',
    tier: 3
  },
  // E-commerce industry (ONLY when paired with seller/marketplace terms)
  {
    url: 'https://news.google.com/rss/search?q=%22ecommerce+seller%22+OR+%22marketplace+seller%22+OR+%22online+marketplace%22+OR+%22ecommerce+fulfillment%22+OR+%22multichannel+selling%22+OR+%22retail+media+network%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'E-Commerce Industry',
    tier: 3
  },
  // M&A and deal flow
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+aggregator%22+OR+%22ecommerce+acquisition%22+OR+%22FBA+acquisition%22+OR+%22ecommerce+private+equity%22+OR+%22DTC+brand+acquisition%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'M&A Activity',
    tier: 3
  },
  // Advertising and retail media
  {
    url: 'https://news.google.com/rss/search?q=%22Amazon+advertising%22+OR+%22Amazon+DSP%22+OR+%22Sponsored+Products%22+OR+%22retail+media+network%22+OR+%22Walmart+Connect+advertising%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Retail Media & Ads',
    tier: 3
  },
  // Shopify ecosystem (seller/merchant focused only)
  {
    url: 'https://news.google.com/rss/search?q=%22Shopify+merchant%22+OR+%22Shopify+seller%22+OR+%22Shop+Pay%22+OR+%22Shopify+Fulfillment%22+OR+%22Shopify+marketplace%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Shopify Ecosystem',
    tier: 3
  },
  // Tariffs and trade policy affecting sellers
  {
    url: 'https://news.google.com/rss/search?q=%22ecommerce+tariff%22+OR+%22de+minimis+ecommerce%22+OR+%22import+duty+online+seller%22+OR+%22cross+border+ecommerce%22+OR+%22Section+301+ecommerce%22&hl=en-US&gl=US&ceid=US:en',
    name: 'Google News',
    label: 'Trade & Tariffs',
    tier: 3
  },
]

// ============================================================================
// PART 4: INDUSTRY RSS FEEDS (Expanded)
// ============================================================================

const INDUSTRY_RSS_FEEDS: RSSFeed[] = [
  // Tier 1 — Core Industry Publications
  { url: 'https://www.marketplacepulse.com/feed', name: 'Marketplace Pulse', tier: 1 },
  { url: 'https://www.digitalcommerce360.com/feed/', name: 'Digital Commerce 360', tier: 1 },
  { url: 'https://www.modernretail.co/feed/', name: 'Modern Retail', tier: 1 },
  { url: 'https://www.retaildive.com/feeds/news/', name: 'Retail Dive', tier: 1 },
  { url: 'https://www.supplychaindive.com/feeds/news/', name: 'Supply Chain Dive', tier: 1 },
  { url: 'https://practicalcommerce.com/feed', name: 'Practical Ecommerce', tier: 1 },
  { url: 'https://www.ecommercebytes.com/feed/', name: 'EcommerceBytes', tier: 1 },
  { url: 'https://channelx.world/feed/', name: 'ChannelX', tier: 1 },
  
  // Tier 2 — Platform & Tool Blogs
  { url: 'https://www.junglescout.com/blog/feed/', name: 'Jungle Scout', tier: 2 },
  { url: 'https://www.helium10.com/blog/feed/', name: 'Helium 10', tier: 2 },
  { url: 'https://carbon6.io/blog/feed/', name: 'Carbon6', tier: 2 },
  { url: 'https://ecomcrew.com/feed/', name: 'EcomCrew', tier: 2 },
  { url: 'https://tinuiti.com/blog/feed/', name: 'Tinuiti', tier: 2 },
  { url: 'https://www.shopify.com/blog/feed', name: 'Shopify Blog', tier: 2 },
  { url: 'https://www.pacvue.com/blog/rss.xml', name: 'Pacvue', tier: 2 },
  { url: 'https://www.sellersnap.io/blog/feed/', name: 'Seller Snap', tier: 2 },
  
  // Tier 3 — Business Press (E-Commerce Sections)
  { url: 'https://www.aboutamazon.com/news/feed', name: 'About Amazon', tier: 3 },
  { url: 'https://techcrunch.com/category/commerce/feed/', name: 'TechCrunch Commerce', tier: 3 },
]

// Reddit feeds
const REDDIT_FEEDS: RSSFeed[] = [
  { url: 'https://www.reddit.com/r/FulfillmentByAmazon/hot/.rss', name: 'r/FulfillmentByAmazon', tier: 4 },
  { url: 'https://www.reddit.com/r/AmazonSeller/hot/.rss', name: 'r/AmazonSeller', tier: 4 },
  { url: 'https://www.reddit.com/r/ecommerce/hot/.rss', name: 'r/ecommerce', tier: 4 },
]

// ============================================================================
// PART 2A: HARD EXCLUSION LIST (instant reject)
// ============================================================================

const HARD_EXCLUSIONS = [
  // AWS / Cloud
  'aws', 'amazon web services', 'cloud computing', 'ec2 instance',
  's3 bucket', 'lambda function', 'sagemaker', 'bedrock ai',
  
  // Devices & Consumer Electronics
  'oled tv', 'led tv', '4k tv', '8k tv', 'smart tv',
  'fire tv', 'fire tablet', 'kindle', 'echo dot', 'echo show',
  'ring doorbell', 'ring camera', 'blink camera', 'eero router',
  'airpods', 'iphone', 'samsung galaxy', 'pixel phone', 'macbook',
  'playstation', 'xbox', 'nintendo switch', 'gaming console',
  'smart speaker', 'robot vacuum', 'air purifier', 'coffee maker',
  'panasonic', 'lg oled', 'sony bravia', 'tcl tv', 'hisense',
  'noise cancelling headphone', 'wireless earbud',
  
  // Entertainment / Media
  'prime video', 'amazon studios', 'amazon music', 'audible',
  'twitch stream', 'mgm', 'lord of the rings', 'fallout series',
  'movie release', 'tv show', 'streaming service', 'podcast episode',
  'book review', 'album release',
  
  // Amazon non-commerce
  'blue origin', 'bezos earth fund', 'bezos yacht', 'bezos space',
  'alexa skill', 'alexa voice', 'alexa routine',
  'amazon drone delivery', 'prime air',
  'amazon go store', 'just walk out',
  'amazon pharmacy', 'amazon clinic', 'one medical',
  'amazon fresh grocery', 'whole foods',
  'washington post',
  
  // Nature / Environment
  'amazon rainforest', 'deforestation', 'amazon river', 'climate change amazon',
  
  // Labor / HR (not seller-relevant)
  'warehouse workers union', 'nlrb amazon', 'amazon labor',
  'delivery driver strike', 'teamsters amazon',
  
  // General retail product launches (not seller news)
  'product launch event', 'unveils new', 'releases new model',
  'hands-on review', 'unboxing video', 'best deals today',
  'deal of the day', 'flash sale', 'prime day deal',
  'doorbusters', 'black friday deal', 'cyber monday deal',
  
  // Sports / Entertainment
  'nfl', 'nba', 'mlb', 'premier league', 'champions league',
  'world cup', 'olympic', 'super bowl', 'grammy', 'oscar', 'emmy',
  
  // Crypto / Finance (unless ecommerce-specific)
  'bitcoin', 'ethereum', 'cryptocurrency', 'nft drop', 'meme coin',
  'stock market crash', 'federal reserve interest rate',
  
  // Recipe / Food / Lifestyle  
  'recipe', 'cooking tip', 'meal prep', 'restaurant review',
  'fashion trend', 'celebrity style', 'red carpet',
  'travel destination', 'hotel review', 'flight deal',
]

function isHardExcluded(title: string, summary: string): boolean {
  const text = (title + ' ' + (summary || '')).toLowerCase()
  return HARD_EXCLUSIONS.some(phrase => text.includes(phrase))
}

// ============================================================================
// PART 2D: TITLE-BASED QUICK REJECTIONS
// ============================================================================

function isTitleIrrelevant(title: string): boolean {
  const t = title.toLowerCase()
  
  // Product review/roundup patterns
  if (/^(best|top|\d+)\s+(phone|laptop|tablet|tv|headphone|speaker|camera|watch|gadget|appliance)/i.test(t)) return true
  
  // "X is on sale" or "X drops to $Y" patterns
  if (/\b(on sale|drops to|now \$|just \$|only \$|save \$|get \$\d+ off)\b/i.test(t)) return true
  
  // Product spec announcements  
  if (/\b(specs|megapixel|mah battery|gb ram|tb storage|refresh rate|nits)\b/i.test(t)) return true
  
  // Entertainment
  if (/\b(movie|film|series|season \d|episode|trailer|cast|soundtrack)\b/i.test(t)) return true
  
  // Weather / Politics / Sports (somehow got through)
  if (/\b(hurricane|earthquake|election|candidate|touchdown|playoff|championship)\b/i.test(t)) return true
  
  return false
}

// ============================================================================
// PART 2C: CONSUMER PRODUCT DETECTION
// ============================================================================

function isConsumerProductStory(title: string, summary: string): boolean {
  const text = (title + ' ' + (summary || '')).toLowerCase()
  
  // Pattern: mentions a brand/product + "available on Amazon" or "price"
  const CONSUMER_PRODUCT_SIGNALS = [
    /\b(launches?|releases?|unveils?|announces?|introduces?)\b.*\b(new|latest|updated)\b/i,
    /\b(review|hands-on|unboxing|first look|specs|features)\b/i,
    /\b(inch|display|screen|battery|camera|processor|chip)\b/i,
    /\b(best|top|cheapest|affordable|budget|premium)\b.*\b(buy|pick|deal|price)\b/i,
    /\$\d+.*\b(off|discount|savings?|sale|coupon|promo)\b/i,
    /\b(vs\.?|versus|compared? to|better than)\b/i,
  ]
  
  const HAS_SELLER_CONTEXT = [
    'seller', 'merchant', 'vendor', 'fba', 'marketplace',
    'listing', 'inventory', 'fulfillment', 'advertising',
    'sponsored', 'ppc', 'brand registry', 'buy box',
    'third-party', '3p', '1p', 'wholesale', 'private label',
    'reimbursement', 'account health', 'policy',
  ]
  
  const matchesConsumerPattern = CONSUMER_PRODUCT_SIGNALS.some(
    pattern => pattern.test(text)
  )
  const hasSellerContext = HAS_SELLER_CONTEXT.some(
    keyword => text.includes(keyword)
  )
  
  return matchesConsumerPattern && !hasSellerContext
}

// ============================================================================
// PART 2B: RELEVANCE SCORING
// ============================================================================

const HIGH_VALUE_KEYWORDS = [
  // Platform-specific seller terms (title match = +20, summary = +10)
  'amazon seller', 'seller central', 'vendor central', 'fba', 'fbm',
  'amazon marketplace', 'amazon 3p', 'amazon 1p', 'buy with prime',
  'walmart marketplace', 'walmart seller', 'walmart fulfillment',
  'tiktok shop', 'tiktok seller', 'target plus', 'target+',
  'ebay seller', 'etsy seller', 'shopify merchant',
  'marketplace seller', 'third-party seller', 'online seller',
  
  // Operations & fees
  'fba fees', 'referral fee', 'fulfillment fee', 'storage fee',
  'reimbursement', 'shortage claim', 'buy box', 'brand registry',
  'listing optimization', 'product listing', 'a+ content',
  'account suspension', 'account health', 'policy violation',
  'private label', 'wholesale amazon', 'retail arbitrage',
  'prep and ship', 'inbound shipment',
  
  // Advertising
  'amazon advertising', 'sponsored products', 'sponsored brands',
  'sponsored display', 'amazon dsp', 'walmart connect',
  'retail media', 'acos', 'roas', 'tacos', 'amazon ppc',
  
  // Business / M&A
  'ecommerce acquisition', 'amazon aggregator', 'fba aggregator',
  'ecommerce funding', 'marketplace m&a', 'dtc brand',
  'ecommerce saas', 'seller tools',
  
  // Fulfillment / Logistics
  'ecommerce fulfillment', '3pl ecommerce', 'last mile delivery',
  'cross-border ecommerce', 'supply chain ecommerce',
  'fba inbound', 'amazon logistics',
  
  // Industry terms
  'e-commerce', 'ecommerce', 'multichannel', 'omnichannel',
  'marketplace pulse', 'prosper show', 'amazon accelerate',
]

const SOFT_EXCLUSIONS = [
  // These reduce score but don't auto-reject (might be relevant in context)
  'smart home', 'voice assistant', 'autonomous vehicle',
  'space launch', 'artificial intelligence' // too broad without ecom context
]

const TRUSTED_SOURCES = [
  'marketplace pulse', 'digital commerce 360', 'modern retail',
  'retail dive', 'supply chain dive', 'practical ecommerce',
  'ecommercebytes', 'channelx', 'jungle scout', 'helium 10',
  'carbon6', 'ecomcrew', 'ecomengine', 'seller snap',
  'tinuiti', 'pacvue', 'walmart seller blog', 'shopify blog',
  'techcrunch', 'about amazon'
]

function calculateRelevanceScore(
  title: string, 
  summary: string, 
  sourceName: string, 
  tier: number,
  sourceType: 'industry' | 'google' | 'reddit'
): number {
  const titleLower = title.toLowerCase()
  const summaryLower = (summary || '').toLowerCase()
  const text = titleLower + ' ' + summaryLower
  const sourceNameLower = sourceName.toLowerCase()
  let score = 0
  
  // High-value keyword matches
  for (const keyword of HIGH_VALUE_KEYWORDS) {
    if (titleLower.includes(keyword)) {
      score += 20
    } else if (summaryLower.includes(keyword)) {
      score += 10
    }
  }
  
  // Soft exclusion penalty
  for (const keyword of SOFT_EXCLUSIONS) {
    if (text.includes(keyword)) {
      score -= 10
    }
  }
  
  // Trusted source bonus
  if (TRUSTED_SOURCES.some(source => sourceNameLower.includes(source))) {
    score += 25
  }
  
  // Source tier bonus
  if (tier === 1) score += 15
  else if (tier === 2) score += 12
  else if (tier === 3) score += 8
  else if (tier === 4) score += 5
  
  // Reddit gets a baseline (subreddits are already topic-filtered)
  if (sourceType === 'reddit') {
    score = Math.max(score, 15)
  }
  
  return score
}

const MINIMUM_SCORE = 15

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
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80)
  return normalize(title1) === normalize(title2)
}

// ============================================================================
// DYNAMIC IMAGE SELECTION
// ============================================================================

const KEYWORD_IMAGES: { keywords: string[], images: string[] }[] = [
  {
    keywords: ['amazon', 'fba', 'seller central', 'buy box', 'a9', 'amazon prime'],
    images: [
      'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['walmart', 'walmart marketplace', 'walmart connect'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['tiktok', 'tiktok shop', 'social commerce', 'influencer'],
    images: [
      'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['advertising', 'ppc', 'sponsored', 'ads', 'campaign', 'roas', 'acos', 'retail media'],
    images: [
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['logistics', 'fulfillment', 'shipping', 'warehouse', 'supply chain', '3pl', 'delivery'],
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['acquisition', 'merger', 'investment', 'funding', 'valuation', 'aggregator', 'private equity'],
    images: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['software', 'tool', 'automation', 'ai', 'technology', 'saas', 'platform', 'api'],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['profit', 'margin', 'revenue', 'fee', 'cost', 'pricing', 'financial', 'earnings'],
    images: [
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['data', 'analytics', 'metrics', 'report', 'insight', 'trend', 'statistics'],
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['conference', 'event', 'summit', 'webinar', 'prosper', 'unboxed', 'accelerate'],
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['strategy', 'tactic', 'optimization', 'growth', 'scale', 'launch', 'listing'],
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['breaking', 'news', 'update', 'announce', 'change', 'policy', 'new'],
    images: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['shopify', 'dtc', 'direct to consumer', 'ecommerce store', 'online store'],
    images: [
      'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
    ]
  },
  {
    keywords: ['ecommerce', 'e-commerce', 'online', 'marketplace', 'seller', 'retail'],
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop',
    ]
  },
]

const GLOBAL_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop',
]

function getImageForArticle(title: string, summary: string, index: number): string {
  const text = `${title} ${summary}`.toLowerCase()
  
  const candidateImages: string[] = []
  
  for (const group of KEYWORD_IMAGES) {
    for (const keyword of group.keywords) {
      if (text.includes(keyword)) {
        candidateImages.push(...group.images)
        break
      }
    }
  }
  
  if (candidateImages.length > 0) {
    const hash = Math.abs(hashString(title))
    const imageIndex = (hash + index * 3) % candidateImages.length
    return candidateImages[imageIndex]
  }
  
  const hash = Math.abs(hashString(title))
  const imageIndex = (hash + index * 7) % GLOBAL_FALLBACK_IMAGES.length
  return GLOBAL_FALLBACK_IMAGES[imageIndex]
}

// ============================================================================
// RSS FETCHING WITH FILTERING
// ============================================================================

async function fetchRSSFeed(
  feed: RSSFeed, 
  sourceType: 'industry' | 'google' | 'reddit',
  stats: FilterStats
): Promise<NormalizedArticle[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: sourceType === 'reddit' ? { 'User-Agent': 'EcomIntelHub/1.0' } : {},
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
      stats.totalFetched++
      
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
      
      // FILTER STEP 1: Hard exclusion check
      if (isHardExcluded(cleanTitle, summary)) {
        stats.hardExcluded++
        continue
      }
      
      // FILTER STEP 2: Title-based quick rejection
      if (isTitleIrrelevant(cleanTitle)) {
        stats.titleRejected++
        continue
      }
      
      // FILTER STEP 3: Consumer product story detection
      if (isConsumerProductStory(cleanTitle, summary)) {
        stats.consumerRejected++
        continue
      }
      
      // FILTER STEP 4: Calculate relevance score
      const relevanceScore = calculateRelevanceScore(cleanTitle, summary, actualSourceName, feed.tier, sourceType)
      
      if (relevanceScore < MINIMUM_SCORE) {
        stats.lowScore++
        continue
      }
      
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
        imageUrl = getImageForArticle(cleanTitle, summary, articles.length)
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
        tier: feed.tier,
        sourceType,
      })
    }
    
    return articles
  } catch (error) {
    // Silently handle feed errors - don't let one broken feed crash everything
    return []
  }
}

// ============================================================================
// MAIN AGGREGATION
// ============================================================================

async function fetchAllArticles(): Promise<{ articles: NormalizedArticle[], stats: FilterStats }> {
  const stats: FilterStats = {
    totalFetched: 0,
    hardExcluded: 0,
    titleRejected: 0,
    consumerRejected: 0,
    lowScore: 0,
    duplicates: 0,
    final: 0,
  }
  
  // Fetch all feeds in parallel using Promise.allSettled
  const allFeeds = [
    ...INDUSTRY_RSS_FEEDS.map(feed => ({ feed, type: 'industry' as const })),
    ...GOOGLE_NEWS_FEEDS.map(feed => ({ feed, type: 'google' as const })),
    ...REDDIT_FEEDS.map(feed => ({ feed, type: 'reddit' as const })),
  ]
  
  const feedPromises = allFeeds.map(({ feed, type }) => fetchRSSFeed(feed, type, stats))
  const feedResults = await Promise.allSettled(feedPromises)
  
  // Combine all articles
  let allArticles: NormalizedArticle[] = []
  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      allArticles = allArticles.concat(result.value)
    }
  }
  
  // Deduplicate by title similarity (first 80 chars)
  const uniqueArticles: NormalizedArticle[] = []
  for (const article of allArticles) {
    const isDuplicate = uniqueArticles.some(existing => 
      isSimilarTitle(existing.title, article.title)
    )
    if (isDuplicate) {
      stats.duplicates++
    } else {
      uniqueArticles.push(article)
    }
  }
  
  // Sort: featured first (high score), then by publishedAt (newest), then by score
  uniqueArticles.sort((a, b) => {
    // Sort by date first (newest)
    const dateDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    if (Math.abs(dateDiff) > 6 * 60 * 60 * 1000) { // More than 6 hours difference
      return dateDiff
    }
    // Then by relevance score
    return b.relevanceScore - a.relevanceScore
  })
  
  stats.final = uniqueArticles.length
  
  // Log filter stats for debugging
  console.log(`[Articles API] Fetched: ${stats.totalFetched} | Hard excluded: ${stats.hardExcluded} | Title rejected: ${stats.titleRejected} | Consumer product: ${stats.consumerRejected} | Low score: ${stats.lowScore} | Duplicates: ${stats.duplicates} | Final: ${stats.final}`)
  
  return { articles: uniqueArticles, stats }
}

async function getArticlesWithCache(): Promise<NormalizedArticle[]> {
  const now = Date.now()
  
  // Return cached articles if still fresh
  if (articlesCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
    return articlesCache
  }
  
  // Fetch fresh articles
  const { articles } = await fetchAllArticles()
  
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
      tier: article.tier,
      sourceType: article.sourceType,
      relevanceScore: article.relevanceScore,
    }))
    
    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      totalCount: articles.length,
      lastUpdated: new Date().toISOString(),
      cacheAge: Date.now() - lastCacheUpdate,
    })
  } catch (error) {
    console.error('[Articles API] Error:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch articles",
      articles: [],
    }, { status: 500 })
  }
}
