/**
 * Article Image Selection — Multi-Tier Fallback System
 *
 * Priority order:
 * 1. Source RSS image (validated — not a favicon/tracker)
 * 2. OG image extracted from article HTML content
 * 3. Keyword-matched Unsplash image (using title keywords + category)
 * 4. Category-based curated Unsplash image (deterministic hash)
 * 5. Platform-specific stock image
 */

// ============================================================================
// KEYWORD → IMAGE MAPPING (matches article topics to relevant images)
// ============================================================================

const KEYWORD_IMAGES: Record<string, string[]> = {
  // Platform-specific topics
  'amazon': [
    'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop', // amazon boxes
    'https://images.unsplash.com/photo-1590599145008-e4ec48682067?w=800&h=450&fit=crop', // package delivery
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // ecommerce
  ],
  'walmart': [
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=450&fit=crop', // retail store
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&h=450&fit=crop', // grocery retail
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop', // shopping mall
  ],
  'tiktok': [
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop', // social media phone
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=450&fit=crop', // mobile social
    'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=800&h=450&fit=crop', // video content
  ],
  'shopify': [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // online store
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop', // shopping
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', // dashboard
  ],
  'ebay': [
    'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&h=450&fit=crop', // online shopping
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // marketplace
    'https://images.unsplash.com/photo-1590599145008-e4ec48682067?w=800&h=450&fit=crop', // package
  ],

  // Business topics
  'tariff': [
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800&h=450&fit=crop', // shipping containers port
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop', // shipping containers
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=450&fit=crop', // global trade
  ],
  'fee': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop', // calculator money
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop', // money finance
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop', // financial planning
  ],
  'acquisition': [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop', // business handshake
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=450&fit=crop', // handshake deal
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=450&fit=crop', // signing documents
  ],
  'merger': [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=450&fit=crop',
  ],
  'funding': [
    'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=450&fit=crop', // money growth
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop', // financial
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop', // money
  ],
  'warehouse': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop', // warehouse
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop', // containers
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop', // delivery
  ],
  'fulfillment': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=450&fit=crop',
  ],
  'shipping': [
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop',
  ],
  'advertising': [
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop', // megaphone
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=450&fit=crop', // marketing strategy
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=450&fit=crop', // social media apps
  ],
  'ppc': [
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=450&fit=crop',
  ],
  'conference': [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop', // conference
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop', // keynote
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop', // speaking event
  ],
  'ai': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop', // AI circuit brain
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop', // code on screen
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop', // circuit board
  ],
  'data': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', // analytics dashboard
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=450&fit=crop', // charts
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop', // data viz
  ],
  'revenue': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop', // stock charts
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop', // financial data
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=450&fit=crop', // charts
  ],
  'earnings': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
  ],
  'policy': [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop', // legal
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=450&fit=crop', // checklist
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop', // documents
  ],
  'seller': [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // ecommerce
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop', // online shopping
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', // dashboard
  ],
  'brand': [
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop',
  ],
  'supply chain': [
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
  ],
  'software': [
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop',
  ],
}

// ============================================================================
// CATEGORY → IMAGE MAPPING (fallback when no keyword match)
// ============================================================================

const CATEGORY_IMAGES: Record<string, string[]> = {
  platform_updates: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=450&fit=crop',
  ],
  market_metrics: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop',
  ],
  profitability: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1553729459-afe8f2e2ed08?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop',
  ],
  mergers_acquisitions: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=450&fit=crop',
  ],
  tools_technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
  ],
  advertising: [
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=450&fit=crop',
  ],
  logistics: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=450&fit=crop',
  ],
  events: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop',
  ],
  tactics: [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=450&fit=crop',
  ],
  breaking: [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
  ],
  compliance_policy: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=450&fit=crop',
  ],
}

// Platform-specific images (used when platform is more relevant than category)
const PLATFORM_IMAGES: Record<string, string[]> = {
  amazon: KEYWORD_IMAGES['amazon'],
  walmart: KEYWORD_IMAGES['walmart'],
  tiktok: KEYWORD_IMAGES['tiktok'],
  shopify: KEYWORD_IMAGES['shopify'],
  ebay: KEYWORD_IMAGES['ebay'],
  multi_platform: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  ],
}

// ============================================================================
// HASH FUNCTION (deterministic image selection)
// ============================================================================

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

const BAD_PATTERNS = [
  'favicon', '1x1', 'pixel.', 'gravatar.com', 's2/favicons',
  'wp-content/plugins', '/logo', 'spacer', 'blank', 'transparent',
  'tracking', 'beacon', 'avatar', 'badge', 'newsletter',
  'default-image', 'no-image', 'missing-image',
]

// More permissive — allow small icons that are still usable
const TINY_ICON_PATTERNS = [
  '/icon-', '/icon.', '-icon.', '_icon.',
]

export function isGoodArticleImage(url: string | null | undefined): boolean {
  if (!url) return false
  if (!url.startsWith('http')) return false

  const lowerUrl = url.toLowerCase()

  for (const pattern of BAD_PATTERNS) {
    if (lowerUrl.includes(pattern)) return false
  }

  // Allow icons if they're larger format (from src URLs)
  for (const pattern of TINY_ICON_PATTERNS) {
    if (lowerUrl.includes(pattern) && !lowerUrl.match(/\d{3,}x\d{3,}/)) return false
  }

  // Skip tracking GIFs (but allow content GIFs)
  if (lowerUrl.match(/\.(gif)$/i) && !lowerUrl.includes('giphy') && !lowerUrl.includes('content')) {
    return false
  }

  return true
}

// ============================================================================
// OG IMAGE EXTRACTION (from HTML content)
// ============================================================================

/**
 * Extract the best image from HTML content.
 * Looks for og:image, large images in article body, etc.
 */
export function extractBestImageFromHTML(html: string | null | undefined): string | null {
  if (!html || html.length < 20) return null

  // 1. Try og:image meta tag (if HTML includes head)
  const ogMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  if (ogMatch?.[1] && isGoodArticleImage(ogMatch[1])) {
    return ogMatch[1]
  }

  // 2. Try twitter:image
  const twitterMatch = html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)
  if (twitterMatch?.[1] && isGoodArticleImage(twitterMatch[1])) {
    return twitterMatch[1]
  }

  // 3. Find large images in article body (look for width/height attributes)
  const imgTags = html.match(/<img[^>]+>/gi) || []
  for (const img of imgTags) {
    const src = img.match(/src=["']([^"']+)["']/i)?.[1]
    if (!src || !isGoodArticleImage(src)) continue

    // Prefer images with larger dimensions
    const width = parseInt(img.match(/width=["']?(\d+)/i)?.[1] || '0')
    const height = parseInt(img.match(/height=["']?(\d+)/i)?.[1] || '0')

    if (width >= 300 || height >= 200) {
      return src
    }

    // Also accept images with classes suggesting they're content images
    if (img.match(/class=["'][^"']*(featured|hero|main|article|post|content|wp-image)[^"']*["']/i)) {
      return src
    }
  }

  // 4. Fall back to first reasonable image
  for (const img of imgTags.slice(0, 3)) {
    const src = img.match(/src=["']([^"']+)["']/i)?.[1]
    if (src && isGoodArticleImage(src) && src.startsWith('http')) {
      return src
    }
  }

  return null
}

// ============================================================================
// KEYWORD-MATCHED IMAGE SELECTION
// ============================================================================

/**
 * Match article title keywords to relevant stock images.
 * This provides much better image relevance than random category picks.
 */
function getKeywordMatchedImage(title: string): string | null {
  const lowerTitle = title.toLowerCase()

  // Check each keyword group for a match
  for (const [keyword, images] of Object.entries(KEYWORD_IMAGES)) {
    if (lowerTitle.includes(keyword)) {
      const hash = hashString(title)
      return images[hash % images.length]
    }
  }

  return null
}

// ============================================================================
// MAIN IMAGE SELECTION FUNCTIONS
// ============================================================================

/**
 * Get a deterministic fallback image for an article.
 * Uses keyword matching first, then category/platform fallback.
 */
export function getArticleFallbackImage(
  title: string,
  category: string,
  platforms: string[] = []
): string {
  // 1. Try keyword-matched image (best relevance)
  const keywordImage = getKeywordMatchedImage(title)
  if (keywordImage) return keywordImage

  const hash = hashString(title)

  // 2. Try platform-specific images for single-platform articles
  const primaryPlatform = platforms?.[0]?.toLowerCase()
  if (primaryPlatform &&
      primaryPlatform !== 'multi_platform' &&
      PLATFORM_IMAGES[primaryPlatform]) {
    const images = PLATFORM_IMAGES[primaryPlatform]
    return images[hash % images.length]
  }

  // 3. Fall back to category images
  const normalizedCategory = category?.toLowerCase().replace(/[-\s]/g, '_') || 'platform_updates'
  const images = CATEGORY_IMAGES[normalizedCategory] || CATEGORY_IMAGES.platform_updates
  return images[hash % images.length]
}

/**
 * Get the best image URL for an article.
 * Tries RSS image → OG extraction → keyword match → category fallback.
 */
export function getArticleImageUrl(
  rssImage: string | null | undefined,
  title: string,
  category: string,
  platforms: string[] = [],
  htmlContent?: string
): string {
  // 1. Use RSS image if valid
  if (isGoodArticleImage(rssImage)) {
    return rssImage!
  }

  // 2. Try extracting from HTML content
  if (htmlContent) {
    const ogImage = extractBestImageFromHTML(htmlContent)
    if (ogImage) return ogImage
  }

  // 3. Keyword-matched or category fallback
  return getArticleFallbackImage(title, category, platforms)
}

export { CATEGORY_IMAGES, PLATFORM_IMAGES, KEYWORD_IMAGES }
