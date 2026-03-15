// Curated Unsplash images — free to use, high quality, relevant to e-commerce
// Using Unsplash Source URLs which serve optimized images
// Format: https://images.unsplash.com/photo-ID?w=800&h=450&fit=crop

const CATEGORY_IMAGES: Record<string, string[]> = {
  platform_updates: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // shopping cart on laptop
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop', // online shopping
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', // dashboard/analytics
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop', // laptop with data
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=450&fit=crop', // tech/laptop
  ],
  market_metrics: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop', // stock charts
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop', // financial data
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', // analytics dashboard
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=450&fit=crop', // charts/graphs
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop', // data visualization
  ],
  profitability: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop', // calculator/money
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop', // money/finance
    'https://images.unsplash.com/photo-1553729459-afe8f2e2ed08?w=800&h=450&fit=crop', // piggy bank
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop', // financial planning
  ],
  mergers_acquisitions: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop', // business handshake
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=450&fit=crop', // handshake deal
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop', // business meeting
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=450&fit=crop', // signing documents
  ],
  tools_technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop', // circuit board
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop', // monitors/code
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop', // code on screen
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop', // developer workspace
  ],
  advertising: [
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop', // megaphone/marketing
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=450&fit=crop', // marketing strategy
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=450&fit=crop', // social media marketing
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=450&fit=crop', // social media apps
  ],
  logistics: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop', // warehouse
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop', // shipping containers
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop', // delivery boxes
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=450&fit=crop', // packages/fulfillment
  ],
  events: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop', // conference
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop', // keynote stage
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop', // speaking event
  ],
  tactics: [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop', // notebook/strategy
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=450&fit=crop', // to-do list
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop', // team whiteboard
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=450&fit=crop', // planning session
  ],
  breaking: [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop', // breaking news
    'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=800&h=450&fit=crop', // urgent/alert
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop', // newspaper
  ],
  compliance_policy: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop', // legal/documents
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop', // contracts
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=450&fit=crop', // checklist
  ],
}

// Platform-specific images (used when platform is more relevant than category)
const PLATFORM_IMAGES: Record<string, string[]> = {
  amazon: [
    'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop', // amazon boxes
    'https://images.unsplash.com/photo-1590599145008-e4ec48682067?w=800&h=450&fit=crop', // package delivery
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=450&fit=crop', // ecommerce packaging
  ],
  walmart: [
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=450&fit=crop', // retail store
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&h=450&fit=crop', // grocery/retail
  ],
  tiktok: [
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop', // social media phone
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=450&fit=crop', // mobile social
  ],
  shopify: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // online store
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop', // shopping
  ],
  ebay: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', // marketplace
    'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&h=450&fit=crop', // online shopping
  ],
  multi_platform: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', // multiple screens
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', // analytics
  ],
}

/**
 * Simple hash function to get a consistent number from a string.
 * Used to deterministically pick the same image for the same article title.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Check if an image URL is a valid article image (not a favicon, logo, or tracking pixel).
 */
export function isGoodArticleImage(url: string | null | undefined): boolean {
  if (!url) return false
  if (!url.startsWith('http')) return false
  
  const lowerUrl = url.toLowerCase()
  
  // Skip known bad patterns
  const badPatterns = [
    'favicon',
    '1x1',
    'pixel.',
    'gravatar.com',
    's2/favicons',
    'wp-content/plugins',
    '/logo',
    'spacer',
    'blank',
    'transparent',
    'tracking',
    'beacon',
    'avatar',
    'icon',
    'badge',
  ]
  
  for (const pattern of badPatterns) {
    if (lowerUrl.includes(pattern)) return false
  }
  
  // Skip tiny gifs (usually tracking pixels)
  if (lowerUrl.match(/\.(gif)$/i) && !lowerUrl.includes('giphy')) {
    return false
  }
  
  return true
}

/**
 * Get a deterministic but varied fallback image for an article.
 * Uses a hash of the article title to consistently pick the same image 
 * for the same article (no random flickering on reload) while distributing 
 * images evenly across articles.
 */
export function getArticleFallbackImage(
  title: string, 
  category: string, 
  platforms: string[] = []
): string {
  const hash = hashString(title)

  // First try platform-specific images for single-platform articles
  const primaryPlatform = platforms?.[0]?.toLowerCase()
  if (primaryPlatform && 
      primaryPlatform !== 'multi_platform' && 
      PLATFORM_IMAGES[primaryPlatform]) {
    const images = PLATFORM_IMAGES[primaryPlatform]
    return images[hash % images.length]
  }
  
  // Normalize category name
  const normalizedCategory = category?.toLowerCase().replace(/[-\s]/g, '_') || 'platform_updates'
  
  // Fall back to category images
  const images = CATEGORY_IMAGES[normalizedCategory] || CATEGORY_IMAGES.platform_updates
  return images[hash % images.length]
}

/**
 * Get the best image URL for an article.
 * Returns the RSS image if valid, otherwise a curated stock fallback.
 */
export function getArticleImageUrl(
  rssImage: string | null | undefined,
  title: string,
  category: string,
  platforms: string[] = []
): string {
  if (isGoodArticleImage(rssImage)) {
    return rssImage!
  }
  return getArticleFallbackImage(title, category, platforms)
}

export { CATEGORY_IMAGES, PLATFORM_IMAGES }
