"use client"

import { type ReactNode, useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  TrendingUp, 
  TrendingDown,
  Flame,
  Star,
  DollarSign,
  Package,
  BarChart3,
  ShoppingCart,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Zap,
  Globe,
  Store,
  Target,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calculator,
  Filter
} from "lucide-react"

// Types
interface ProductData {
  id: string
  name: string
  category: string
  price: number
  monthlySales: number
  monthlyRevenue: number
  reviews: number
  rating: number
  competition: 'low' | 'medium' | 'high'
  trend: 'rising' | 'stable' | 'declining'
  opportunity: number
  source: 'Amazon Movers' | 'Google Trends' | 'TikTok Viral' | 'Seasonal' | 'New Category'
  lastUpdated?: string
}

interface GoogleTrendItem {
  rank: number
  title: string
  traffic: string
  trafficNumber: number
  link: string
  pubDate: string
  trend: 'hot' | 'rising' | 'stable'
  category: string
  relatedNews: string[]
}

interface DataSource {
  name: string
  icon: ReactNode
  color: string
  enabled: boolean
}

interface SearchResult {
  id: string
  title: string
  price: number
  currency: string
  source: string
  sourceUrl: string
  rating: number
  reviews: number
  sales: number
  trend: 'hot' | 'rising' | 'stable' | 'declining'
  competition: 'low' | 'medium' | 'high'
  opportunity: number
  priceHistory: { date: string; price: number }[]
  relatedKeywords: string[]
  estimatedProfit?: {
    margin: number
    roi: number
    monthlySales: number
    monthlyProfit: number
  }
}

// Categories
const CATEGORIES = [
  "Home & Kitchen",
  "Sports & Outdoors", 
  "Beauty & Personal Care",
  "Electronics",
  "Health & Household",
  "Pet Supplies",
  "Tools & Home Improvement",
  "Baby",
  "Toys & Games",
  "Office Products"
]

// Calculate opportunity score using weighted formula
function calculateOpportunityScore(product: Omit<ProductData, 'opportunity'>): number {
  let score = 0
  
  // Revenue potential (30%): Higher monthly revenue = higher score
  const revenueScore = Math.min(product.monthlyRevenue / 50000, 1) * 30
  score += revenueScore
  
  // Competition gap (25%): Lower competition = higher score
  const competitionScores = { low: 25, medium: 15, high: 5 }
  score += competitionScores[product.competition]
  
  // Review velocity (15%): Products with moderate reviews (100-2000) score higher
  let reviewScore = 0
  if (product.reviews >= 100 && product.reviews <= 2000) {
    reviewScore = 15
  } else if (product.reviews > 2000 && product.reviews <= 5000) {
    reviewScore = 10
  } else if (product.reviews > 5000 && product.reviews <= 10000) {
    reviewScore = 5
  } else if (product.reviews < 100) {
    reviewScore = 7 // Unproven but potential
  } else {
    reviewScore = 2 // Saturated
  }
  score += reviewScore
  
  // Price sweet spot (15%): Products $15-$75 score highest
  let priceScore = 0
  if (product.price >= 15 && product.price <= 75) {
    priceScore = 15
  } else if (product.price > 75 && product.price <= 100) {
    priceScore = 10
  } else if (product.price > 100 && product.price <= 150) {
    priceScore = 5
  } else if (product.price < 15) {
    priceScore = 3 // Low margin
  } else {
    priceScore = 3 // High price barrier
  }
  score += priceScore
  
  // Trend bonus (15%): Rising = +15, Stable = +8, Declining = 0
  const trendScores = { rising: 15, stable: 8, declining: 0 }
  score += trendScores[product.trend]
  
  return Math.round(Math.min(score, 100))
}

// Generate comprehensive product dataset
function generateProducts(): ProductData[] {
  const products: Omit<ProductData, 'opportunity'>[] = [
    // High opportunity / low competition products (exciting finds)
    { id: "1", name: "Portable Blender USB Rechargeable Personal Size", category: "Home & Kitchen", price: 24.99, monthlySales: 4200, monthlyRevenue: 104958, reviews: 856, rating: 4.3, competition: "low", trend: "rising", source: "Amazon Movers" },
    { id: "2", name: "LED Strip Lights 50ft RGB Color Changing", category: "Home & Kitchen", price: 19.99, monthlySales: 8500, monthlyRevenue: 169915, reviews: 1245, rating: 4.4, competition: "low", trend: "rising", source: "TikTok Viral" },
    { id: "3", name: "Posture Corrector for Men and Women", category: "Health & Household", price: 21.99, monthlySales: 3800, monthlyRevenue: 83562, reviews: 432, rating: 4.1, competition: "low", trend: "rising", source: "Google Trends" },
    { id: "4", name: "Reusable Silicone Food Storage Bags Set", category: "Home & Kitchen", price: 18.99, monthlySales: 5200, monthlyRevenue: 98748, reviews: 678, rating: 4.5, competition: "low", trend: "rising", source: "New Category" },
    { id: "5", name: "Pet Hair Remover Roller Self-Cleaning", category: "Pet Supplies", price: 14.99, monthlySales: 6100, monthlyRevenue: 91439, reviews: 1890, rating: 4.6, competition: "low", trend: "stable", source: "Amazon Movers" },
    { id: "6", name: "Sunrise Alarm Clock Wake Up Light", category: "Home & Kitchen", price: 39.99, monthlySales: 2800, monthlyRevenue: 111972, reviews: 523, rating: 4.2, competition: "low", trend: "rising", source: "Seasonal" },
    { id: "7", name: "Acupressure Mat and Pillow Set", category: "Health & Household", price: 29.99, monthlySales: 3100, monthlyRevenue: 92969, reviews: 945, rating: 4.4, competition: "low", trend: "stable", source: "Google Trends" },
    { id: "8", name: "Collapsible Water Bottle BPA Free", category: "Sports & Outdoors", price: 12.99, monthlySales: 7200, monthlyRevenue: 93528, reviews: 1567, rating: 4.3, competition: "low", trend: "rising", source: "TikTok Viral" },
    
    // High revenue / high competition products (established categories)
    { id: "9", name: "Wireless Earbuds Bluetooth 5.3 Headphones", category: "Electronics", price: 49.99, monthlySales: 12000, monthlyRevenue: 599880, reviews: 24500, rating: 4.4, competition: "high", trend: "stable", source: "Amazon Movers" },
    { id: "10", name: "Electric Toothbrush Rechargeable Sonic", category: "Beauty & Personal Care", price: 34.99, monthlySales: 9500, monthlyRevenue: 332405, reviews: 18200, rating: 4.5, competition: "high", trend: "stable", source: "Amazon Movers" },
    { id: "11", name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker", category: "Home & Kitchen", price: 89.99, monthlySales: 6200, monthlyRevenue: 557938, reviews: 145000, rating: 4.7, competition: "high", trend: "stable", source: "Amazon Movers" },
    { id: "12", name: "Robot Vacuum Cleaner Self-Charging", category: "Home & Kitchen", price: 149.99, monthlySales: 3200, monthlyRevenue: 479968, reviews: 8900, rating: 4.3, competition: "high", trend: "stable", source: "Amazon Movers" },
    { id: "13", name: "Air Fryer 5.8 Quart Large Capacity", category: "Home & Kitchen", price: 79.99, monthlySales: 7800, monthlyRevenue: 623922, reviews: 35000, rating: 4.6, competition: "high", trend: "stable", source: "Amazon Movers" },
    { id: "14", name: "Memory Foam Neck Pillow for Travel", category: "Home & Kitchen", price: 29.99, monthlySales: 11000, monthlyRevenue: 329890, reviews: 42000, rating: 4.4, competition: "high", trend: "stable", source: "Amazon Movers" },
    
    // Rising trend products (momentum plays)
    { id: "15", name: "Stanley Quencher H2.0 Tumbler 40oz", category: "Sports & Outdoors", price: 45.00, monthlySales: 15000, monthlyRevenue: 675000, reviews: 8900, rating: 4.8, competition: "medium", trend: "rising", source: "TikTok Viral" },
    { id: "16", name: "Theragun Mini Massage Gun", category: "Health & Household", price: 129.00, monthlySales: 2100, monthlyRevenue: 270900, reviews: 3400, rating: 4.5, competition: "medium", trend: "rising", source: "Google Trends" },
    { id: "17", name: "Ice Roller for Face and Eye Puffiness", category: "Beauty & Personal Care", price: 9.99, monthlySales: 18000, monthlyRevenue: 179820, reviews: 2100, rating: 4.2, competition: "medium", trend: "rising", source: "TikTok Viral" },
    { id: "18", name: "Kindle Paperwhite Signature Edition", category: "Electronics", price: 189.99, monthlySales: 4500, monthlyRevenue: 854955, reviews: 12000, rating: 4.7, competition: "medium", trend: "rising", source: "Amazon Movers" },
    { id: "19", name: "Weighted Blanket 15lbs for Adults", category: "Home & Kitchen", price: 49.99, monthlySales: 5600, monthlyRevenue: 279944, reviews: 4500, rating: 4.5, competition: "medium", trend: "rising", source: "Seasonal" },
    { id: "20", name: "Smart Watch Fitness Tracker with Heart Rate", category: "Electronics", price: 39.99, monthlySales: 8900, monthlyRevenue: 355911, reviews: 5600, rating: 4.1, competition: "medium", trend: "rising", source: "Amazon Movers" },
    { id: "21", name: "Resistance Bands Set for Working Out", category: "Sports & Outdoors", price: 16.99, monthlySales: 9200, monthlyRevenue: 156308, reviews: 7800, rating: 4.4, competition: "medium", trend: "rising", source: "Google Trends" },
    { id: "22", name: "Blue Light Blocking Glasses Computer Gaming", category: "Health & Household", price: 15.99, monthlySales: 7400, monthlyRevenue: 118326, reviews: 3200, rating: 4.0, competition: "medium", trend: "rising", source: "TikTok Viral" },
    
    // Declining products (categories to avoid)
    { id: "23", name: "Fidget Spinner Metal Hand Toy", category: "Toys & Games", price: 8.99, monthlySales: 800, monthlyRevenue: 7192, reviews: 25000, rating: 4.1, competition: "high", trend: "declining", source: "Amazon Movers" },
    { id: "24", name: "Face Shield Protective Full Face Cover", category: "Health & Household", price: 12.99, monthlySales: 450, monthlyRevenue: 5846, reviews: 8900, rating: 4.0, competition: "high", trend: "declining", source: "Amazon Movers" },
    { id: "25", name: "Magnetic Phone Car Mount Dashboard", category: "Electronics", price: 14.99, monthlySales: 1200, monthlyRevenue: 17988, reviews: 15000, rating: 3.9, competition: "high", trend: "declining", source: "Amazon Movers" },
    { id: "26", name: "Pop Socket Phone Grip Stand", category: "Electronics", price: 9.99, monthlySales: 2800, monthlyRevenue: 27972, reviews: 45000, rating: 4.2, competition: "high", trend: "declining", source: "Amazon Movers" },
    
    // Additional products for variety
    { id: "27", name: "Electric Wine Opener Automatic Corkscrew", category: "Home & Kitchen", price: 24.99, monthlySales: 3400, monthlyRevenue: 84966, reviews: 890, rating: 4.3, competition: "low", trend: "stable", source: "Seasonal" },
    { id: "28", name: "Yoga Mat Extra Thick 1/2 Inch Non Slip", category: "Sports & Outdoors", price: 29.99, monthlySales: 6700, monthlyRevenue: 200933, reviews: 3400, rating: 4.5, competition: "medium", trend: "stable", source: "Amazon Movers" },
    { id: "29", name: "Baby Monitor with Camera WiFi 1080P", category: "Baby", price: 59.99, monthlySales: 2900, monthlyRevenue: 173971, reviews: 2100, rating: 4.2, competition: "medium", trend: "stable", source: "Amazon Movers" },
    { id: "30", name: "Desk Organizer with Drawer Desktop Storage", category: "Office Products", price: 26.99, monthlySales: 4100, monthlyRevenue: 110659, reviews: 1450, rating: 4.4, competition: "low", trend: "rising", source: "New Category" },
    { id: "31", name: "Gaming Mouse Pad XXL Extended Large Mat", category: "Electronics", price: 14.99, monthlySales: 8200, monthlyRevenue: 122918, reviews: 5600, rating: 4.5, competition: "medium", trend: "stable", source: "Amazon Movers" },
    { id: "32", name: "Essential Oil Diffuser 500ml Humidifier", category: "Home & Kitchen", price: 27.99, monthlySales: 5100, monthlyRevenue: 142749, reviews: 6700, rating: 4.3, competition: "medium", trend: "stable", source: "Amazon Movers" },
    { id: "33", name: "Dog Paw Cleaner Portable Pet Washer", category: "Pet Supplies", price: 16.99, monthlySales: 4800, monthlyRevenue: 81552, reviews: 2300, rating: 4.1, competition: "low", trend: "rising", source: "TikTok Viral" },
    { id: "34", name: "Beard Trimmer Kit All-in-One Grooming", category: "Beauty & Personal Care", price: 44.99, monthlySales: 3600, monthlyRevenue: 161964, reviews: 4500, rating: 4.4, competition: "medium", trend: "stable", source: "Amazon Movers" },
    { id: "35", name: "Kids Tablet 7 Inch Android Educational", category: "Electronics", price: 69.99, monthlySales: 2400, monthlyRevenue: 167976, reviews: 3200, rating: 4.0, competition: "medium", trend: "stable", source: "Seasonal" },
    { id: "36", name: "Portable Charger 20000mAh Power Bank", category: "Electronics", price: 25.99, monthlySales: 7600, monthlyRevenue: 197524, reviews: 8900, rating: 4.4, competition: "high", trend: "stable", source: "Amazon Movers" },
    { id: "37", name: "Stainless Steel Insulated Lunch Box", category: "Home & Kitchen", price: 32.99, monthlySales: 3200, monthlyRevenue: 105568, reviews: 1200, rating: 4.5, competition: "low", trend: "rising", source: "New Category" },
    { id: "38", name: "Ring Light 10 Inch with Tripod Stand", category: "Electronics", price: 29.99, monthlySales: 5400, monthlyRevenue: 161946, reviews: 7800, rating: 4.3, competition: "high", trend: "declining", source: "TikTok Viral" },
    { id: "39", name: "Cat Water Fountain Stainless Steel 2.5L", category: "Pet Supplies", price: 34.99, monthlySales: 2800, monthlyRevenue: 97972, reviews: 890, rating: 4.6, competition: "low", trend: "rising", source: "Amazon Movers" },
    { id: "40", name: "Laptop Stand Adjustable Aluminum Portable", category: "Office Products", price: 29.99, monthlySales: 4600, monthlyRevenue: 137954, reviews: 2100, rating: 4.5, competition: "medium", trend: "stable", source: "Amazon Movers" },
  ]
  
  // Calculate opportunity scores for all products
  return products.map(p => ({
    ...p,
    opportunity: calculateOpportunityScore(p)
  }))
}

const REFRESH_INTERVALS = [
  { value: 0, label: "Manual" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
]

const ITEMS_PER_PAGE = 15

type SortField = 'name' | 'category' | 'price' | 'monthlySales' | 'monthlyRevenue' | 'reviews' | 'rating' | 'competition' | 'trend' | 'opportunity'
type SortDirection = 'asc' | 'desc'

export function TrendingProducts() {
  // Data state
  const [products, setProducts] = useState<ProductData[]>([])
  const [googleTrends, setGoogleTrends] = useState<GoogleTrendItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [trendsLastUpdated, setTrendsLastUpdated] = useState<Date | null>(null)
  const [refreshInterval, setRefreshInterval] = useState(300)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [dataSource, setDataSource] = useState<'live' | 'simulated' | 'mixed'>('simulated')
  const [trendsSource, setTrendsSource] = useState<'google_trends' | 'simulated'>('simulated')
  const [productDisclaimer, setProductDisclaimer] = useState("Preview product signals. Live marketplace catalog integrations are still being connected.")
  const [searchDisclaimer, setSearchDisclaimer] = useState("Preview search results are modeled until live marketplace search integrations are connected.")
  const [searchMode, setSearchMode] = useState<'live' | 'simulated'>('simulated')
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [minRevenue, setMinRevenue] = useState(0)
  const [competitionFilters, setCompetitionFilters] = useState<string[]>(['low', 'medium', 'high'])
  const [trendFilters, setTrendFilters] = useState<string[]>(['rising', 'stable', 'declining'])
  const [minOpportunity, setMinOpportunity] = useState(0)
  const [sourceFilter, setSourceFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('opportunity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal state
  const [analyzeProduct, setAnalyzeProduct] = useState<ProductData | null>(null)
  const [profitCalcProduct, setProfitCalcProduct] = useState<ProductData | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchModalQuery, setSearchModalQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [trendSearchQuery, setTrendSearchQuery] = useState("")

  const [dataSources, setDataSources] = useState<DataSource[]>([
    { name: "Amazon Best Sellers", icon: <ShoppingCart className="h-4 w-4" />, color: "bg-amber-500", enabled: true },
    { name: "TikTok Shop", icon: <Sparkles className="h-4 w-4" />, color: "bg-pink-500", enabled: true },
    { name: "Google Trends", icon: <Globe className="h-4 w-4" />, color: "bg-blue-500", enabled: true },
    { name: "AliExpress Hot", icon: <Store className="h-4 w-4" />, color: "bg-red-500", enabled: true },
    { name: "Social Media", icon: <Zap className="h-4 w-4" />, color: "bg-purple-500", enabled: false },
  ])

  // Fetch products from API or generate simulated data
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (data.success && data.products?.length > 0) {
        setProducts(data.products)
        setLastUpdated(new Date())
        setDataSource(data.sourceMode === 'live' ? 'live' : data.sourceMode === 'mixed' ? 'mixed' : 'simulated')
        setProductDisclaimer(data.disclaimer || "Preview product signals. Live marketplace catalog integrations are still being connected.")
      } else {
        // Use generated data
        setProducts(generateProducts())
        setLastUpdated(new Date())
        setDataSource('simulated')
        setProductDisclaimer("Preview product signals. Live marketplace catalog integrations are still being connected.")
      }
    } catch {
      // Use generated data on error
      setProducts(generateProducts())
      setLastUpdated(new Date())
      setDataSource('simulated')
      setProductDisclaimer("Preview product signals. Live marketplace catalog integrations are still being connected.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Search products across sources
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results)
        setSearchMode(data.mode === 'live' ? 'live' : 'simulated')
        setSearchDisclaimer(data.disclaimer || "Preview search results are modeled until live marketplace search integrations are connected.")
      }
    } catch {
      // Handle error silently
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle find products from trends
  const handleFindProducts = (trendTitle: string) => {
    setSearchModalQuery(trendTitle)
    setSearchModalOpen(true)
    searchProducts(trendTitle)
  }

  // Fetch Google Trends
  const fetchGoogleTrends = useCallback(async () => {
    setIsLoadingTrends(true)
    try {
      const response = await fetch('/api/trends?geo=US')
      const data = await response.json()
      
      if (data.success) {
        setGoogleTrends(data.trends)
        setTrendsLastUpdated(new Date())
        setTrendsSource(data.source === 'google_trends' ? 'google_trends' : 'simulated')
      }
    } catch {
      // Handle error silently
    } finally {
      setIsLoadingTrends(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProducts()
    fetchGoogleTrends()
  }, [fetchProducts, fetchGoogleTrends])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval === 0) return

    const interval = setInterval(() => {
      fetchProducts()
      fetchGoogleTrends()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchProducts, fetchGoogleTrends])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, priceRange, minRevenue, competitionFilters, trendFilters, minOpportunity, sourceFilter])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }
    
    // Price range filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    
    // Min revenue filter
    if (minRevenue > 0) {
      filtered = filtered.filter(p => p.monthlyRevenue >= minRevenue)
    }
    
    // Competition filter
    filtered = filtered.filter(p => competitionFilters.includes(p.competition))
    
    // Trend filter
    filtered = filtered.filter(p => trendFilters.includes(p.trend))
    
    // Opportunity filter
    if (minOpportunity > 0) {
      filtered = filtered.filter(p => p.opportunity >= minOpportunity)
    }
    
    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(p => p.source === sourceFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal: number | string = a[sortField]
      let bVal: number | string = b[sortField]
      
      // Handle competition sorting
      if (sortField === 'competition') {
        const order = { low: 1, medium: 2, high: 3 }
        aVal = order[a.competition]
        bVal = order[b.competition]
      }
      
      // Handle trend sorting
      if (sortField === 'trend') {
        const order = { rising: 1, stable: 2, declining: 3 }
        aVal = order[a.trend]
        bVal = order[b.trend]
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
    
    return filtered
  }, [products, searchQuery, categoryFilter, priceRange, minRevenue, competitionFilters, trendFilters, minOpportunity, sourceFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const stats = useMemo(() => {
    const risingProducts = filteredAndSortedProducts.filter(p => p.trend === 'rising').length
    const avgOpportunity = filteredAndSortedProducts.reduce((sum, p) => sum + p.opportunity, 0) / filteredAndSortedProducts.length || 0
    const totalRevenue = filteredAndSortedProducts.reduce((sum, p) => sum + p.monthlyRevenue, 0)
    const lowCompetition = filteredAndSortedProducts.filter(p => p.competition === 'low').length
    
    return { risingProducts, avgOpportunity, totalRevenue, lowCompetition }
  }, [filteredAndSortedProducts])

  // Toggle competition filter
  const toggleCompetition = (comp: string) => {
    setCompetitionFilters(prev => 
      prev.includes(comp) 
        ? prev.filter(c => c !== comp)
        : [...prev, comp]
    )
  }

  // Toggle trend filter
  const toggleTrend = (trend: string) => {
    setTrendFilters(prev => 
      prev.includes(trend) 
        ? prev.filter(t => t !== trend)
        : [...prev, trend]
    )
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setPriceRange([0, 200])
    setMinRevenue(0)
    setCompetitionFilters(['low', 'medium', 'high'])
    setTrendFilters(['rising', 'stable', 'declining'])
    setMinOpportunity(0)
    setSourceFilter("all")
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Export CSV
  const exportCSV = () => {
    const headers = ['Product Name', 'Category', 'Price', 'Monthly Sales', 'Monthly Revenue', 'Reviews', 'Rating', 'Competition', 'Trend', 'Opportunity Score', 'Source']
    const rows = filteredAndSortedProducts.map(p => [
      `"${p.name}"`,
      p.category,
      p.price,
      p.monthlySales,
      p.monthlyRevenue,
      p.reviews,
      p.rating,
      p.competition,
      p.trend,
      p.opportunity,
      p.source
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hot-products-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSource = (sourceName: string) => {
    setDataSources(prev => prev.map(s => 
      s.name === sourceName ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <Badge className="bg-red-500 text-white"><Flame className="h-3 w-3 mr-1" /> Hot</Badge>
      case 'rising':
        return <Badge className="bg-emerald-500 text-white"><TrendingUp className="h-3 w-3 mr-1" /> Rising</Badge>
      case 'stable':
        return <Badge variant="secondary"><ArrowRight className="h-3 w-3 mr-1" /> Stable</Badge>
      case 'declining':
        return <Badge variant="outline" className="text-red-500 border-red-300"><TrendingDown className="h-3 w-3 mr-1" /> Declining</Badge>
      default:
        return null
    }
  }

  const getCompetitionBadge = (competition: string) => {
    switch (competition) {
      case 'low':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Low</Badge>
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">Medium</Badge>
      case 'high':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">High</Badge>
      default:
        return null
    }
  }

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      'Amazon Movers': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      'Google Trends': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      'TikTok Viral': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
      'Seasonal': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
      'New Category': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    }
    return <Badge className={colors[source] || 'bg-gray-100 text-gray-700'}>{source}</Badge>
  }

  const getOpportunityBar = (score: number) => {
    let color = 'bg-red-500'
    let label = 'Low'
    
    if (score >= 80) {
      color = 'bg-emerald-500'
      label = 'Excellent'
    } else if (score >= 60) {
      color = 'bg-teal-500'
      label = 'Good'
    } else if (score >= 40) {
      color = 'bg-amber-500'
      label = 'Fair'
    }
    
    return (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs font-medium tabular-nums w-8">{score}%</span>
      </div>
    )
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3" />
      : <ArrowDown className="h-3 w-3" />
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never'
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'text-emerald-500'
      case 'medium': return 'text-amber-500'
      case 'high': return 'text-red-500'
      default: return ''
    }
  }

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 200 || minRevenue > 0 || competitionFilters.length < 3 || trendFilters.length < 3 || minOpportunity > 0 || sourceFilter !== 'all'
  const statusLabel =
    isLoading || isLoadingTrends
      ? 'Updating signals...'
      : dataSource === 'live' && trendsSource === 'google_trends'
        ? 'Live marketplace signals'
        : trendsSource === 'google_trends'
          ? 'Mixed live + preview signals'
          : 'Preview data mode'

  return (
    <div className="space-y-6">
      {/* Data Status Bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isLoading || isLoadingTrends ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-sm font-medium">
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Products: {formatTimeAgo(lastUpdated)}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>Trends: {formatTimeAgo(trendsLastUpdated)}</span>
              </div>
              <div className="flex items-center gap-2">
                {dataSource === 'live' ? (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    API Connected
                  </Badge>
                ) : trendsSource === 'google_trends' ? (
                  <Badge variant="outline" className="text-sky-500 border-sky-500">
                    <Globe className="h-3 w-3 mr-1" />
                    Live Trends + Preview Products
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Preview / Demo Data
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch 
                  id="auto-refresh" 
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
              </div>
              <Select 
                value={refreshInterval.toString()} 
                onValueChange={(v) => setRefreshInterval(parseInt(v))}
                disabled={!autoRefresh}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFRESH_INTERVALS.map(interval => (
                    <SelectItem key={interval.value} value={interval.value.toString()}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  fetchProducts()
                  fetchGoogleTrends()
                }}
                disabled={isLoading || isLoadingTrends}
              >
                {isLoading || isLoadingTrends ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            {productDisclaimer}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Hot Products</span>
            <span className="sm:hidden">Products</span>
          </TabsTrigger>
          <TabsTrigger value="google-trends" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Google Trends</span>
            <span className="sm:hidden">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Data Sources</span>
            <span className="sm:hidden">Sources</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analysis</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* Hot Products Tab - Now with Data Table */}
        <TabsContent value="discover" className="space-y-6 mt-6">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-300">
                    Beta Signal Layer
                  </Badge>
                  <span className="text-sm font-medium">Product discovery is still in preview</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use this tab for directional research and idea generation. MarketplaceBeta is still connecting live catalog, pricing, and search APIs for full operator-grade accuracy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rising Products</p>
                    <p className="text-2xl font-bold tabular-nums">{stats.risingProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Opportunity</p>
                    <p className="text-2xl font-bold tabular-nums">{stats.avgOpportunity.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold tabular-nums">${(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Zap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Competition</p>
                    <p className="text-2xl font-bold tabular-nums">{stats.lowCompetition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-4">
                {/* Primary filters row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant={showFilters ? "secondary" : "outline"} 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
                    )}
                  </Button>
                  <Button variant="outline" onClick={exportCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                </div>

                {/* Advanced filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    {/* Price Range */}
                    <div className="space-y-2">
                      <Label className="text-sm">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as [number, number])}
                        min={0}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Min Revenue */}
                    <div className="space-y-2">
                      <Label className="text-sm">Min Monthly Revenue: ${minRevenue.toLocaleString()}</Label>
                      <Slider
                        value={[minRevenue]}
                        onValueChange={(v) => setMinRevenue(v[0])}
                        min={0}
                        max={500000}
                        step={10000}
                        className="mt-2"
                      />
                    </div>

                    {/* Min Opportunity */}
                    <div className="space-y-2">
                      <Label className="text-sm">Min Opportunity Score: {minOpportunity}%</Label>
                      <Slider
                        value={[minOpportunity]}
                        onValueChange={(v) => setMinOpportunity(v[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Source */}
                    <div className="space-y-2">
                      <Label className="text-sm">Data Source</Label>
                      <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="Amazon Movers">Amazon Movers</SelectItem>
                          <SelectItem value="Google Trends">Google Trends</SelectItem>
                          <SelectItem value="TikTok Viral">TikTok Viral</SelectItem>
                          <SelectItem value="Seasonal">Seasonal</SelectItem>
                          <SelectItem value="New Category">New Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Competition */}
                    <div className="space-y-2">
                      <Label className="text-sm">Competition Level</Label>
                      <div className="flex gap-4 mt-2">
                        {['low', 'medium', 'high'].map((comp) => (
                          <div key={comp} className="flex items-center gap-2">
                            <Checkbox
                              id={`comp-${comp}`}
                              checked={competitionFilters.includes(comp)}
                              onCheckedChange={() => toggleCompetition(comp)}
                            />
                            <Label htmlFor={`comp-${comp}`} className="text-sm capitalize">{comp}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="space-y-2">
                      <Label className="text-sm">Trend</Label>
                      <div className="flex gap-4 mt-2">
                        {['rising', 'stable', 'declining'].map((trend) => (
                          <div key={trend} className="flex items-center gap-2">
                            <Checkbox
                              id={`trend-${trend}`}
                              checked={trendFilters.includes(trend)}
                              onCheckedChange={() => toggleTrend(trend)}
                            />
                            <Label htmlFor={`trend-${trend}`} className="text-sm capitalize">{trend}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reset button */}
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={resetFilters} className="gap-2">
                        <X className="h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Product Database</CardTitle>
                <Badge variant="secondary">
                  Showing {paginatedProducts.length} of {filteredAndSortedProducts.length} products
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="min-w-[200px]">
                        <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-semibold" onClick={() => handleSort('name')}>
                          Product Name <SortIcon field="name" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-semibold" onClick={() => handleSort('category')}>
                          Category <SortIcon field="category" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold" onClick={() => handleSort('price')}>
                          Price <SortIcon field="price" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold" onClick={() => handleSort('monthlySales')}>
                          Sales <SortIcon field="monthlySales" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold" onClick={() => handleSort('monthlyRevenue')}>
                          Revenue <SortIcon field="monthlyRevenue" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold" onClick={() => handleSort('reviews')}>
                          Reviews <SortIcon field="reviews" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold" onClick={() => handleSort('rating')}>
                          Rating <SortIcon field="rating" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-semibold" onClick={() => handleSort('competition')}>
                          Competition <SortIcon field="competition" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-semibold" onClick={() => handleSort('trend')}>
                          Trend <SortIcon field="trend" />
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[130px]">
                        <Button variant="ghost" size="sm" className="gap-1 -ml-3 font-semibold" onClick={() => handleSort('opportunity')}>
                          Opportunity <SortIcon field="opportunity" />
                        </Button>
                      </TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product, index) => (
                      <TableRow 
                        key={product.id} 
                        className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                        onClick={() => setAnalyzeProduct(product)}
                      >
                        <TableCell className="font-medium">
                          <span className="line-clamp-1" title={product.name}>
                            {product.name.length > 60 ? product.name.slice(0, 60) + '...' : product.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{product.category}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums">{product.monthlySales.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">${(product.monthlyRevenue / 1000).toFixed(1)}K</TableCell>
                        <TableCell className="text-right tabular-nums">{product.reviews.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="tabular-nums">{product.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getCompetitionBadge(product.competition)}</TableCell>
                        <TableCell>{getTrendBadge(product.trend)}</TableCell>
                        <TableCell>{getOpportunityBar(product.opportunity)}</TableCell>
                        <TableCell>{getSourceBadge(product.source)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => setAnalyzeProduct(product)}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => setProfitCalcProduct(product)}
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Trends Tab */}
        <TabsContent value="google-trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Google Trends - Trending Searches
              </CardTitle>
              <CardDescription>
                Real-time trending searches from Google Trends. Click on any trend to find related products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search trends..."
                  value={trendSearchQuery}
                  onChange={(e) => setTrendSearchQuery(e.target.value)}
                />
              </div>
              
              {isLoadingTrends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : googleTrends.length > 0 ? (
                <div className="space-y-3">
                  {googleTrends
                    .filter(t => !trendSearchQuery || t.title.toLowerCase().includes(trendSearchQuery.toLowerCase()))
                    .map((trend) => (
                    <Card key={trend.rank} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                              {trend.rank}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{trend.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{trend.traffic}</span>
                                <span>•</span>
                                <span>{trend.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getTrendBadge(trend.trend)}
                            <Button size="sm" onClick={() => handleFindProducts(trend.title)}>
                              Find Products
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trends available. Click refresh to load latest data.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Configuration</CardTitle>
              <CardDescription>
                Preview the connectors MarketplaceBeta is modeling today. Source toggles do not yet represent direct live marketplace integrations for every listed platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${source.color}/10`}>
                      {source.icon}
                    </div>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.enabled ? 'Active' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={() => toggleSource(source.name)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Score Breakdown</CardTitle>
                <CardDescription>How the opportunity score is calculated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Potential</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <Progress value={30} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Competition Gap</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Review Velocity</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price Sweet Spot ($15-$75)</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trend Bonus</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Legend</CardTitle>
                <CardDescription>Understanding opportunity scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                  <div className="h-4 w-4 rounded bg-emerald-500" />
                  <div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-400">Excellent (80-100%)</p>
                    <p className="text-sm text-muted-foreground">High potential, low competition</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-500/10">
                  <div className="h-4 w-4 rounded bg-teal-500" />
                  <div>
                    <p className="font-medium text-teal-700 dark:text-teal-400">Good (60-79%)</p>
                    <p className="text-sm text-muted-foreground">Solid opportunity worth exploring</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10">
                  <div className="h-4 w-4 rounded bg-amber-500" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">Fair (40-59%)</p>
                    <p className="text-sm text-muted-foreground">Moderate potential, needs differentiation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
                  <div className="h-4 w-4 rounded bg-red-500" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Low (0-39%)</p>
                    <p className="text-sm text-muted-foreground">High risk, saturated or declining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Analysis Modal */}
      <Dialog open={!!analyzeProduct} onOpenChange={() => setAnalyzeProduct(null)}>
        <DialogContent className="w-[min(90vw,560px)] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Analysis
            </DialogTitle>
            <DialogDescription>
              Detailed analysis and market insights for this product
            </DialogDescription>
          </DialogHeader>
          {analyzeProduct && (
            <ScrollArea className="max-h-[calc(90vh-100px)] overflow-y-auto">
              <div className="space-y-6 p-6 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold line-clamp-2">{analyzeProduct.name}</h3>
                    <p className="text-sm text-muted-foreground">{analyzeProduct.category}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {getTrendBadge(analyzeProduct.trend)}
                  </div>
                </div>

                {/* Top Metrics */}
                <div className="flex flex-wrap gap-3">
                  <Card className="flex-1 min-w-[100px]">
                    <CardContent className="px-3 py-4 overflow-hidden">
                      <p className="text-xs text-muted-foreground truncate">Price</p>
                      <p className="text-xl font-bold tabular-nums truncate">${analyzeProduct.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="flex-1 min-w-[100px]">
                    <CardContent className="px-3 py-4 overflow-hidden">
                      <p className="text-xs text-muted-foreground truncate">Monthly Sales</p>
                      <p className="text-xl font-bold tabular-nums truncate">{analyzeProduct.monthlySales.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="flex-1 min-w-[100px]">
                    <CardContent className="px-3 py-4 overflow-hidden">
                      <p className="text-xs text-muted-foreground truncate">Revenue</p>
                      <p className="text-xl font-bold tabular-nums truncate">${(analyzeProduct.monthlyRevenue / 1000).toFixed(1)}K</p>
                    </CardContent>
                  </Card>
                  <Card className="flex-1 min-w-[100px]">
                    <CardContent className="px-3 py-4 overflow-hidden">
                      <p className="text-xs text-muted-foreground truncate">Opportunity</p>
                      <p className="text-xl font-bold tabular-nums truncate">{analyzeProduct.opportunity}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profit Analysis */}
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Estimated Profit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[110px] p-3 rounded-lg bg-muted/30 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Est. Cost (30%)</p>
                        <p className="text-base font-semibold tabular-nums truncate">${(analyzeProduct.price * 0.3).toFixed(2)}</p>
                      </div>
                      <div className="flex-1 min-w-[110px] p-3 rounded-lg bg-muted/30 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Amazon Fees (15%)</p>
                        <p className="text-base font-semibold tabular-nums truncate">${(analyzeProduct.price * 0.15).toFixed(2)}</p>
                      </div>
                      <div className="flex-1 min-w-[110px] p-3 rounded-lg bg-muted/30 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Est. Profit/Unit</p>
                        <p className="text-base font-semibold text-emerald-500 tabular-nums truncate">
                          ${(analyzeProduct.price * 0.55 - 5).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[120px] p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Monthly Profit</p>
                        <p className="text-base font-semibold text-emerald-500 tabular-nums truncate">
                          ${((analyzeProduct.price * 0.55 - 5) * analyzeProduct.monthlySales).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competition Analysis */}
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Competition Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[80px] text-center p-3 rounded-lg bg-muted/30 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Competition</p>
                        <p className={`text-base font-semibold truncate ${getCompetitionColor(analyzeProduct.competition)}`}>
                          {analyzeProduct.competition.charAt(0).toUpperCase() + analyzeProduct.competition.slice(1)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[80px] text-center p-3 rounded-lg bg-muted/30 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Reviews</p>
                        <p className="text-base font-semibold tabular-nums truncate">{analyzeProduct.reviews.toLocaleString()}</p>
                      </div>
                      <div className="flex-1 min-w-[80px] text-center p-3 rounded-lg bg-muted/30 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">Rating</p>
                        <div className="flex items-center justify-center gap-1 flex-nowrap">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                          <span className="text-base font-semibold tabular-nums">{analyzeProduct.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="flex-1" onClick={() => handleFindProducts(analyzeProduct.name)}>
                    <Search className="h-4 w-4 mr-2" />
                    Find Similar Products
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`https://www.amazon.com/s?k=${encodeURIComponent(analyzeProduct.name)}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Amazon
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Profit Calculator Modal */}
      <Dialog open={!!profitCalcProduct} onOpenChange={() => setProfitCalcProduct(null)}>
        <DialogContent className="w-[min(90vw,480px)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Profit Calculator
            </DialogTitle>
            <DialogDescription>
              Estimate your potential profit margins
            </DialogDescription>
          </DialogHeader>
          {profitCalcProduct && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold line-clamp-2">{profitCalcProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{profitCalcProduct.category}</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Selling Price</p>
                    <p className="text-2xl font-bold tabular-nums">${profitCalcProduct.price.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Est. Monthly Sales</p>
                    <p className="text-2xl font-bold tabular-nums">{profitCalcProduct.monthlySales.toLocaleString()}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product Cost (30%)</span>
                    <span className="font-medium tabular-nums">-${(profitCalcProduct.price * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amazon Referral Fee (15%)</span>
                    <span className="font-medium tabular-nums">-${(profitCalcProduct.price * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FBA Fee (est.)</span>
                    <span className="font-medium tabular-nums">-$5.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Profit per Unit</span>
                    <span className="font-bold text-emerald-500 tabular-nums">
                      ${(profitCalcProduct.price * 0.55 - 5).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Monthly Profit</span>
                    <span className="font-bold text-emerald-500 tabular-nums">
                      ${((profitCalcProduct.price * 0.55 - 5) * profitCalcProduct.monthlySales).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className="font-medium tabular-nums">
                      {(((profitCalcProduct.price * 0.55 - 5) / profitCalcProduct.price) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Search Modal */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="w-[min(90vw,600px)] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Find Products</DialogTitle>
            <DialogDescription>
              Search for products related to &quot;{searchModalQuery}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-300">
                  {searchMode === 'live' ? 'Live Search' : 'Preview Search'}
                </Badge>
                Search quality note
              </div>
              <p className="mt-2">{searchDisclaimer}</p>
            </div>
            <Input
              placeholder="Search..."
              value={searchModalQuery}
              onChange={(e) => setSearchModalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchProducts(searchModalQuery)}
            />
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <Card key={result.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium line-clamp-2">{result.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>${result.price}</span>
                              <span>•</span>
                              <span>{result.reviews.toLocaleString()} reviews</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {result.rating}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter a search term to find products</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
