import { NextResponse } from 'next/server'

// Google Trends API - fetches trending searches
// Note: For production, you'd want to use official APIs or services like SerpAPI
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const geo = searchParams.get('geo') || 'US'
  const category = searchParams.get('category') || 'all'
  
  try {
    // Fetch from Google Trends RSS feed (publicly available)
    const response = await fetch(
      `https://trends.google.com/trending/rss?geo=${geo}`,
      { 
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AmazonFBAAnalyzer/1.0)'
        }
      }
    )
    
    if (!response.ok) {
      // If Google Trends fails, return simulated trending data
      return NextResponse.json({
        success: true,
        source: 'simulated',
        lastUpdated: new Date().toISOString(),
        trends: generateSimulatedTrends(geo)
      })
    }
    
    const xmlText = await response.text()
    const trends = parseGoogleTrendsXML(xmlText)
    
    return NextResponse.json({
      success: true,
      source: 'google_trends',
      lastUpdated: new Date().toISOString(),
      geo,
      trends
    })
  } catch (error) {
    console.error('Error fetching Google Trends:', error)
    
    // Return simulated data as fallback
    return NextResponse.json({
      success: true,
      source: 'simulated',
      lastUpdated: new Date().toISOString(),
      trends: generateSimulatedTrends(geo)
    })
  }
}

function parseGoogleTrendsXML(xml: string): TrendingItem[] {
  const items: TrendingItem[] = []
  
  // Simple XML parsing for RSS feed
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
  
  itemMatches.slice(0, 20).forEach((item, index) => {
    const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const traffic = item.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] || '10K+'
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const picture = item.match(/<ht:picture>(.*?)<\/ht:picture>/)?.[1] || ''
    const newsItems = item.match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/g) || []
    
    if (title) {
      items.push({
        rank: index + 1,
        title: decodeHTMLEntities(title),
        traffic: traffic,
        trafficNumber: parseTraffic(traffic),
        link,
        pubDate,
        picture,
        relatedNews: newsItems.map(n => decodeHTMLEntities(n.replace(/<\/?ht:news_item_title>/g, ''))),
        trend: calculateTrend(index),
        category: categorizeKeyword(title)
      })
    }
  })
  
  return items
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function parseTraffic(traffic: string): number {
  const match = traffic.match(/(\d+)([KM]?)\+?/)
  if (!match) return 10000
  
  let num = parseInt(match[1])
  if (match[2] === 'K') num *= 1000
  if (match[2] === 'M') num *= 1000000
  
  return num
}

function calculateTrend(rank: number): 'hot' | 'rising' | 'stable' {
  if (rank <= 5) return 'hot'
  if (rank <= 10) return 'rising'
  return 'stable'
}

function categorizeKeyword(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase()
  
  const categories: Record<string, string[]> = {
    'Electronics': ['phone', 'laptop', 'tablet', 'airpods', 'samsung', 'apple', 'iphone', 'android', 'computer', 'tech'],
    'Entertainment': ['movie', 'show', 'netflix', 'disney', 'music', 'concert', 'game', 'nba', 'nfl', 'sports'],
    'Fashion': ['dress', 'shoes', 'clothing', 'fashion', 'style', 'wear', 'outfit'],
    'Health': ['health', 'fitness', 'diet', 'wellness', 'medical', 'covid', 'vaccine'],
    'Home': ['home', 'kitchen', 'furniture', 'decor', 'garden', 'appliance'],
    'News': ['news', 'breaking', 'election', 'politics', 'president', 'congress']
  }
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lowerKeyword.includes(k))) {
      return category
    }
  }
  
  return 'General'
}

interface TrendingItem {
  rank: number
  title: string
  traffic: string
  trafficNumber: number
  link: string
  pubDate: string
  picture: string
  relatedNews: string[]
  trend: 'hot' | 'rising' | 'stable'
  category: string
}

function generateSimulatedTrends(geo: string): TrendingItem[] {
  const trendingTopics = [
    { title: 'Wireless Earbuds 2024', category: 'Electronics' },
    { title: 'Air Fryer Recipes', category: 'Home' },
    { title: 'Portable Blender', category: 'Home' },
    { title: 'LED Strip Lights', category: 'Home' },
    { title: 'Yoga Mat Premium', category: 'Health' },
    { title: 'Smart Water Bottle', category: 'Health' },
    { title: 'Ring Light Kit', category: 'Electronics' },
    { title: 'Massage Gun Mini', category: 'Health' },
    { title: 'Car Phone Mount', category: 'Electronics' },
    { title: 'Pet Grooming Brush', category: 'General' },
    { title: 'Kitchen Scale Digital', category: 'Home' },
    { title: 'Resistance Bands Set', category: 'Health' },
    { title: 'USB C Hub', category: 'Electronics' },
    { title: 'Essential Oil Diffuser', category: 'Home' },
    { title: 'Laptop Stand Adjustable', category: 'Electronics' },
    { title: 'Fitness Tracker Band', category: 'Health' },
    { title: 'Silicone Baking Mat', category: 'Home' },
    { title: 'Bluetooth Speaker Mini', category: 'Electronics' },
    { title: 'Electric Toothbrush', category: 'Health' },
    { title: 'Phone Case Magnetic', category: 'Electronics' }
  ]
  
  return trendingTopics.map((topic, index) => {
    const baseTraffic = Math.floor(100000 / (index + 1))
    
    return {
      rank: index + 1,
      title: topic.title,
      traffic: formatTraffic(baseTraffic),
      trafficNumber: baseTraffic,
      link: `https://trends.google.com/trends/explore?q=${encodeURIComponent(topic.title)}&geo=${geo}`,
      pubDate: new Date().toISOString(),
      picture: '',
      relatedNews: [],
      trend: index < 5 ? 'hot' : index < 10 ? 'rising' : 'stable',
      category: topic.category
    }
  })
}

function formatTraffic(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
  if (num >= 1000) return `${Math.floor(num / 1000)}K+`
  return `${num}+`
}
