import { NextResponse } from 'next/server'

// Simulated product data API with realistic e-commerce metrics
// In production, this would connect to Amazon SP-API, Keepa, Jungle Scout, etc.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  const source = searchParams.get('source') || 'all'
  const limit = parseInt(searchParams.get('limit') || '20')
  
  try {
    const products = generateProducts(limit, category, source)
    
    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      refreshInterval: 300, // Recommend refresh every 5 minutes
      products,
      meta: {
        total: products.length,
        sources: ['Amazon Best Sellers', 'TikTok Shop', 'Google Trends', 'AliExpress Hot'],
        categories: [...new Set(products.map(p => p.category))]
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

interface ProductData {
  id: string
  name: string
  category: string
  price: number
  bsr: number
  bsrChange: number
  reviews: number
  rating: number
  monthlySales: number
  monthlyRevenue: number
  trend: 'hot' | 'rising' | 'stable' | 'declining'
  source: string
  competition: 'low' | 'medium' | 'high'
  opportunity: number
  lastUpdated: string
}

function generateProducts(count: number, categoryFilter: string, sourceFilter: string): ProductData[] {
  const categories = [
    "Electronics", "Home & Kitchen", "Sports & Outdoors", "Health & Beauty",
    "Toys & Games", "Pet Supplies", "Office Products", "Automotive"
  ]
  
  const productTemplates = [
    { name: "Wireless Charging Pad", category: "Electronics", basePrice: 25, baseBsr: 5000 },
    { name: "Portable Blender", category: "Home & Kitchen", basePrice: 35, baseBsr: 3000 },
    { name: "LED Strip Lights", category: "Home & Kitchen", basePrice: 20, baseBsr: 2000 },
    { name: "Yoga Mat Premium", category: "Sports & Outdoors", basePrice: 40, baseBsr: 4000 },
    { name: "Air Fryer Accessories", category: "Home & Kitchen", basePrice: 30, baseBsr: 6000 },
    { name: "Phone Stand Holder", category: "Electronics", basePrice: 15, baseBsr: 8000 },
    { name: "Resistance Bands Set", category: "Sports & Outdoors", basePrice: 25, baseBsr: 5500 },
    { name: "Essential Oil Diffuser", category: "Health & Beauty", basePrice: 35, baseBsr: 4500 },
    { name: "Silicone Baking Mat", category: "Home & Kitchen", basePrice: 15, baseBsr: 7000 },
    { name: "Car Phone Mount", category: "Automotive", basePrice: 20, baseBsr: 3500 },
    { name: "Massage Gun Mini", category: "Health & Beauty", basePrice: 60, baseBsr: 2500 },
    { name: "Smart Water Bottle", category: "Health & Beauty", basePrice: 45, baseBsr: 9000 },
    { name: "Laptop Stand Adjustable", category: "Office Products", basePrice: 35, baseBsr: 4000 },
    { name: "Ring Light Kit", category: "Electronics", basePrice: 40, baseBsr: 3000 },
    { name: "Electric Toothbrush Heads", category: "Health & Beauty", basePrice: 20, baseBsr: 1500 },
    { name: "Bluetooth Speaker Mini", category: "Electronics", basePrice: 30, baseBsr: 2800 },
    { name: "Pet Grooming Brush", category: "Pet Supplies", basePrice: 15, baseBsr: 6500 },
    { name: "Kitchen Scale Digital", category: "Home & Kitchen", basePrice: 25, baseBsr: 5000 },
    { name: "Fitness Tracker Band", category: "Sports & Outdoors", basePrice: 50, baseBsr: 3200 },
    { name: "USB C Hub", category: "Electronics", basePrice: 35, baseBsr: 4200 },
    { name: "Memory Foam Pillow", category: "Home & Kitchen", basePrice: 45, baseBsr: 2200 },
    { name: "Workout Gloves", category: "Sports & Outdoors", basePrice: 20, baseBsr: 7500 },
    { name: "Desk Organizer Set", category: "Office Products", basePrice: 25, baseBsr: 5800 },
    { name: "Dog Chew Toys", category: "Pet Supplies", basePrice: 18, baseBsr: 4800 }
  ]
  
  const sources = ["Amazon Best Sellers", "TikTok Shop", "Google Trends", "AliExpress Hot"]
  const trends: ('hot' | 'rising' | 'stable' | 'declining')[] = ['hot', 'rising', 'stable', 'declining']
  const competitions: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']

  // Use time-based seed for consistent but changing data
  const timeSeed = Math.floor(Date.now() / 60000) // Changes every minute
  const seededRandom = (index: number) => {
    const x = Math.sin(timeSeed + index) * 10000
    return x - Math.floor(x)
  }

  let products = productTemplates.map((template, i) => {
    const priceVariation = 1 + (seededRandom(i * 1) - 0.5) * 0.4
    const price = Number((template.basePrice * priceVariation).toFixed(2))
    const bsrVariation = 1 + (seededRandom(i * 2) - 0.5) * 0.6
    const bsr = Math.floor(template.baseBsr * bsrVariation)
    const monthlySales = Math.floor(50000 / (Math.sqrt(bsr) + 1) * (0.8 + seededRandom(i * 3) * 0.4))
    
    return {
      id: `prod-${i}-${timeSeed}`,
      name: template.name,
      category: template.category,
      price,
      bsr,
      bsrChange: Math.floor((seededRandom(i * 4) - 0.5) * 100),
      reviews: Math.floor(seededRandom(i * 5) * 10000) + 100,
      rating: Number((3.5 + seededRandom(i * 6) * 1.5).toFixed(1)),
      monthlySales,
      monthlyRevenue: Math.floor(price * monthlySales),
      trend: trends[Math.floor(seededRandom(i * 7) * 4)],
      source: sources[Math.floor(seededRandom(i * 8) * sources.length)],
      competition: competitions[Math.floor(seededRandom(i * 9) * 3)],
      opportunity: Math.floor(seededRandom(i * 10) * 40) + 60,
      lastUpdated: new Date().toISOString()
    }
  })

  // Apply filters
  if (categoryFilter !== 'all') {
    products = products.filter(p => p.category === categoryFilter)
  }
  
  if (sourceFilter !== 'all') {
    products = products.filter(p => p.source === sourceFilter)
  }

  return products.slice(0, count)
}
