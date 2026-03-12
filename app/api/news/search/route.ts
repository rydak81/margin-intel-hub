import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

interface SearchResult {
  id: string
  title: string
  excerpt: string
  source: string
  sourceUrl: string
  imageUrl: string
  publishedAt: string
  category: string
  relevanceScore: number
}

// Simulated search results based on query
// In production, this would connect to a news API like NewsAPI, Google News API, or Bing News
const generateSearchResults = (query: string): SearchResult[] => {
  const queryLower = query.toLowerCase()
  
  // E-commerce related search result templates
  const searchTemplates: { keywords: string[], results: Partial<SearchResult>[] }[] = [
    {
      keywords: ["amazon", "fba", "seller"],
      results: [
        {
          title: `Amazon Announces New FBA Policies Affecting "${query}" Sellers`,
          excerpt: "New policies will impact how sellers manage inventory and pricing strategies for competitive products.",
          source: "Marketplace Pulse",
          category: "Amazon",
          imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop",
        },
        {
          title: `How Top Amazon Sellers Are Winning with "${query}" Products`,
          excerpt: "Analysis of successful strategies from leading FBA sellers in this competitive niche.",
          source: "eCommerceBytes",
          category: "Strategy",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop",
        },
        {
          title: `${query} Category Sees 45% Growth on Amazon in Q1 2026`,
          excerpt: "Market data reveals significant opportunities for sellers entering this growing segment.",
          source: "Jungle Scout",
          category: "Industry",
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
        },
      ]
    },
    {
      keywords: ["tiktok", "social", "shop"],
      results: [
        {
          title: `TikTok Shop Success Stories: Brands Crushing It with "${query}"`,
          excerpt: "Inside look at how emerging brands are leveraging TikTok Shop for explosive growth.",
          source: "Modern Retail",
          category: "D2C",
          imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop",
        },
        {
          title: `Social Commerce Trends: What "${query}" Reveals About Consumer Behavior`,
          excerpt: "Deep dive into how social platforms are reshaping e-commerce purchase decisions.",
          source: "TechCrunch",
          category: "Tech",
          imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop",
        },
      ]
    },
    {
      keywords: ["tariff", "import", "china", "shipping"],
      results: [
        {
          title: `New Tariff Implications for "${query}" Products from China`,
          excerpt: "Analysis of how recent trade policy changes will affect import costs and pricing strategies.",
          source: "Supply Chain Dive",
          category: "Policy",
          imageUrl: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=450&fit=crop",
        },
        {
          title: `Shipping Costs for "${query}" Expected to Rise 15% in Q2`,
          excerpt: "Logistics experts warn of continued pressure on international shipping rates.",
          source: "Logistics Management",
          category: "Logistics",
          imageUrl: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=450&fit=crop",
        },
      ]
    },
  ]

  const results: SearchResult[] = []
  const now = new Date()
  
  // Add matching template results
  searchTemplates.forEach(template => {
    const matches = template.keywords.some(kw => queryLower.includes(kw))
    if (matches || Math.random() > 0.5) {
      template.results.forEach((result, index) => {
        const hoursAgo = Math.floor(Math.random() * 48) + 1
        results.push({
          id: `search-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          title: result.title || `Latest News About "${query}" in E-commerce`,
          excerpt: result.excerpt || "Breaking coverage of this developing story in the e-commerce industry.",
          source: result.source || "Ecom Intel Hub",
          sourceUrl: "#",
          imageUrl: result.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
          publishedAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
          category: result.category || "Industry",
          relevanceScore: Math.floor(Math.random() * 30) + 70,
        })
      })
    }
  })

  // Add generic query-based results
  const genericResults = [
    {
      title: `"${query}" Market Analysis: Opportunities and Challenges for Sellers`,
      excerpt: "Comprehensive breakdown of market dynamics, competition, and growth potential.",
      source: "Practical Ecommerce",
      category: "Strategy",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    },
    {
      title: `Expert Roundup: Seller Perspectives on "${query}"`,
      excerpt: "Top e-commerce sellers share their insights and predictions for this market segment.",
      source: "Seller Sessions",
      category: "Industry",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
    },
    {
      title: `How AI Tools Are Transforming "${query}" Product Research`,
      excerpt: "New AI-powered analytics tools help sellers identify profitable opportunities faster.",
      source: "eCommerceBytes",
      category: "Tools",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    },
    {
      title: `Consumer Trends: Growing Demand for "${query}" Products`,
      excerpt: "Research reveals shifting consumer preferences and what it means for marketplace sellers.",
      source: "Retail Dive",
      category: "Retail",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop",
    },
  ]

  genericResults.forEach((result, index) => {
    const hoursAgo = Math.floor(Math.random() * 72) + 1
    results.push({
      id: `search-generic-${Date.now()}-${index}`,
      title: result.title,
      excerpt: result.excerpt,
      source: result.source,
      sourceUrl: "#",
      imageUrl: result.imageUrl,
      publishedAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
      category: result.category,
      relevanceScore: Math.floor(Math.random() * 20) + 60,
    })
  })

  // Sort by relevance score
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 12)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query || query.trim().length === 0) {
    return NextResponse.json({
      success: false,
      error: "Search query is required",
      results: [],
    }, { status: 400 })
  }

  try {
    // In production, you would call external APIs here:
    // - NewsAPI.org (newsapi.org)
    // - Google News API
    // - Bing News Search API
    // - RSS feeds from e-commerce publications
    
    const results = generateSearchResults(query.trim())
    
    return NextResponse.json({
      success: true,
      query: query.trim(),
      results,
      totalResults: results.length,
      searchedAt: new Date().toISOString(),
      sources: ["Marketplace Pulse", "eCommerceBytes", "Modern Retail", "TechCrunch", "Supply Chain Dive", "Retail Dive"],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Search failed",
      results: [],
    }, { status: 500 })
  }
}
