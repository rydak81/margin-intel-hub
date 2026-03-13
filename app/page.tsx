"use client"

import { useState, useEffect, useCallback, useRef, Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArticleDetailModal } from "@/components/article-detail-modal"
import { BackToTop } from "@/components/back-to-top"
import { ArticleGridSkeleton, FeaturedArticleSkeleton, MarketSnapshotSkeleton } from "@/components/article-skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertTriangle,
  BarChart3,
  RefreshCw,
  DollarSign,
  Handshake,
  Wrench,
  Megaphone,
  Truck,
  Calendar,
  Lightbulb,
  Search,
  Clock,
  Bookmark,
  Share2,
  TrendingUp,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  Globe,
  Zap,
  Mail,
  Loader2,
  Calculator,
  Target,
  LineChart,
  Package,
  ChevronDown,
  FileText,
  Linkedin,
  Twitter,
} from "lucide-react"

// Types
interface NewsArticle {
  id: string
  title: string
  excerpt: string
  category: string
  source: string
  sourceUrl: string
  author: string
  publishedAt: string
  readTime: number
  tags: string[]
  featured: boolean
  breaking: boolean
  imageUrl?: string
  platforms?: string[]
}

interface BreakingNews {
  id: string
  title: string
  timestamp: string
  urgent: boolean
}

// Category configuration from design brief
const CATEGORIES = [
  { id: "all", label: "All", icon: Globe, color: "bg-primary" },
  { id: "breaking", label: "Breaking", icon: AlertTriangle, color: "bg-amber-500" },
  { id: "market", label: "Market & Metrics", icon: BarChart3, color: "bg-teal-500" },
  { id: "platform", label: "Platform Updates", icon: RefreshCw, color: "bg-blue-500" },
  { id: "profitability", label: "Seller Profitability", icon: DollarSign, color: "bg-emerald-500" },
  { id: "deals", label: "M&A & Deal Flow", icon: Handshake, color: "bg-purple-500" },
  { id: "tools", label: "Tools & Technology", icon: Wrench, color: "bg-cyan-500" },
  { id: "advertising", label: "Advertising", icon: Megaphone, color: "bg-orange-500" },
  { id: "logistics", label: "Logistics", icon: Truck, color: "bg-slate-500" },
  { id: "events", label: "Events", icon: Calendar, color: "bg-pink-500" },
  { id: "tactics", label: "Tactics & Strategy", icon: Lightbulb, color: "bg-yellow-500" },
]

const PLATFORMS = ["All", "Amazon", "Walmart", "TikTok Shop", "Shopify", "eBay"]

// Map filter category IDs to actual article categories from API
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  all: [], // Shows all
  breaking: ["Amazon", "Industry", "Marketplaces"], // Breaking news from major sources
  market: ["Industry", "Marketplaces", "Retail"], // Market & Metrics
  platform: ["Amazon", "Tech", "Marketplaces"], // Platform Updates
  profitability: ["Strategy", "Amazon", "D2C"], // Seller Profitability
  deals: ["Industry", "Marketplaces"], // M&A & Deal Flow
  tools: ["Tools", "Tech"], // Tools & Technology
  advertising: ["Amazon", "Strategy", "D2C"], // Advertising
  logistics: ["Logistics"], // Logistics
  events: ["Industry", "Marketplaces"], // Events
  tactics: ["Strategy", "D2C"], // Tactics & Strategy
}

// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  return `${Math.floor(diffInHours / 24)}d ago`
}

function getCategoryConfig(categoryId: string) {
  return CATEGORIES.find(c => c.id === categoryId.toLowerCase()) || CATEGORIES[0]
}

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "shared">("latest")
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Track scroll position for header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle article click - open modal instead of navigating
  const handleArticleClick = (article: NewsArticle, e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedArticle(article)
    setArticleModalOpen(true)
  }

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Escape to clear and blur search
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('')
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // Fetch news from RSS-powered API (with fallback to old API)
  const fetchNews = useCallback(async () => {
    try {
      // Try the new RSS-based articles API first
      let response = await fetch("/api/articles?limit=50")
      let data = await response.json()
      
      // If RSS API fails or returns no articles, fall back to news API
      if (!data.success || !data.articles?.length) {
        response = await fetch("/api/news")
        data = await response.json()
      }
      
      if (data.success && data.articles?.length > 0) {
        setArticles(data.articles)
        const breaking = data.articles
          .filter((a: NewsArticle) => a.breaking)
          .map((a: NewsArticle) => ({
            id: a.id,
            title: a.title,
            timestamp: a.publishedAt,
            urgent: true,
          }))
        setBreakingNews(breaking.length > 0 ? breaking : [
          { id: "1", title: "Amazon announces Q2 FBA fee structure changes effective April 2026", timestamp: new Date().toISOString(), urgent: true },
          { id: "2", title: "TikTok Shop US GMV surpasses $10B milestone in Q1", timestamp: new Date().toISOString(), urgent: true },
          { id: "3", title: "New tariff regulations impact cross-border sellers starting May 1", timestamp: new Date().toISOString(), urgent: false },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)
      // Try fallback API on error
      try {
        const fallbackResponse = await fetch("/api/news")
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.success) {
          setArticles(fallbackData.articles)
        }
      } catch (fallbackError) {
        console.error("Fallback API also failed:", fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // Filter articles
  const filteredArticles = articles.filter(article => {
    // Category filter using mappings
    if (selectedCategory !== "all") {
      const allowedCategories = CATEGORY_MAPPINGS[selectedCategory] || []
      if (allowedCategories.length > 0 && !allowedCategories.includes(article.category)) {
        return false
      }
    }
    if (selectedPlatform !== "All" && !article.platforms?.includes(selectedPlatform)) return false
    // Enhanced search - searches across title, excerpt, source, category, and platforms
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableText = [
        article.title,
        article.excerpt || '',
        article.source || '',
        article.category || '',
        ...(article.platforms || [])
      ].join(' ').toLowerCase()
      if (!searchableText.includes(query)) return false
    }
    return true
  })

  const featuredArticles = filteredArticles.filter(a => a.featured).slice(0, 3)
  const regularArticles = filteredArticles.filter(a => !a.featured)
  const trendingArticles = [...articles].sort(() => Math.random() - 0.5).slice(0, 5)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return
    }
    
    setIsSubscribing(true)
    
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: "homepage_widget",
        }),
      })
      
      const data = await response.json()
      
      // Consider "already subscribed" as success for the widget
      if (response.ok || data.error === "already_subscribed") {
        setSubscribed(true)
      }
    } catch (error) {
      console.error("Subscribe error:", error)
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-amber-500 text-amber-950 py-2 overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 px-4 flex items-center gap-2 font-semibold border-r border-amber-600">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">BREAKING</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-ticker flex whitespace-nowrap">
                {[...breakingNews, ...breakingNews].map((item, i) => (
                  <span key={`${item.id}-${i}`} className="mx-8 flex items-center gap-2 text-sm">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-amber-700">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                    <span className="text-amber-600">|</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-sm' 
          : 'bg-background/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                Ecom Intel Hub
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
                Home
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1">
                  Categories <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {CATEGORIES.slice(1).map((cat) => (
                    <DropdownMenuItem key={cat.id} onClick={() => setSelectedCategory(cat.id)}>
                      <cat.icon className="h-4 w-4 mr-2" />
                      {cat.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/tools" className="text-sm font-semibold hover:text-primary transition-colors">
                Tools
              </Link>
              <Link href="/community" className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1.5">
                Community
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">BETA</span>
              </Link>
              <Link href="/events" className="text-sm font-semibold hover:text-primary transition-colors">
                Events
              </Link>
              <Link href="/newsletter" className="text-sm font-semibold hover:text-primary transition-colors">
                Newsletter
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Expandable Search */}
              <div className="hidden md:flex items-center">
                <div className={`flex items-center transition-all duration-300 ${
                  searchExpanded ? 'w-64' : 'w-9'
                }`}>
                  {searchExpanded ? (
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => {
                          if (!searchQuery) setSearchExpanded(false)
                        }}
                        className="pl-9 pr-8 h-9 text-sm"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          setSearchQuery('')
                          setSearchExpanded(false)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchExpanded(true)}
                      className="h-9 w-9"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="h-9 w-9"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button asChild size="sm" className="hidden sm:flex text-sm">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <nav className="flex flex-col gap-2">
                <Link href="/" className="px-4 py-2 rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/tools" className="px-4 py-2 rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Tools</Link>
                <Link href="/community" className="px-4 py-2 rounded-md flex items-center gap-2 hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  Community
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">BETA</span>
                </Link>
                <Link href="/events" className="px-4 py-2 rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                <Link href="/newsletter" className="px-4 py-2 rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Newsletter</Link>
                <div className="px-4 py-2">
                  <Input
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl">
            {/* Live Counter Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-muted-foreground">
                Tracking <span className="font-semibold text-foreground">6 platforms</span> 
                {" "}from <span className="font-semibold text-foreground">25+ sources</span>
                {" "}updated hourly
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              The Intelligence Hub for{" "}
              <span className="text-primary">Marketplace Commerce</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              Breaking news, platform updates, M&A activity, and actionable insights for Amazon sellers, 
              agencies, SaaS providers, and e-commerce operators — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <a href="#briefing">
                  Read Today&apos;s Briefing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/newsletter">
                  Get the Daily Brief
                  <Mail className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <div className="bg-muted/50 border-y">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">2.1M+</div>
              <div className="text-xs text-muted-foreground">Amazon 3P Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-emerald-600">22%</div>
              <div className="text-xs text-muted-foreground">Avg FBA Margin</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-orange-500">+180%</div>
              <div className="text-xs text-muted-foreground">TikTok Shop YoY</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-600">22.7%</div>
              <div className="text-xs text-muted-foreground">Ecom % of Retail</div>
            </div>
            <div className="hidden lg:block text-center">
              <div className="text-xl md:text-2xl font-bold text-purple-600">$5.5T</div>
              <div className="text-xs text-muted-foreground">Global Ecom 2026</div>
            </div>
          </div>
          <div className="text-center mt-3 text-[10px] text-muted-foreground/70">
            Sources: Marketplace Pulse, eMarketer, US Census Bureau
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-2 py-3">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  <cat.icon className="h-4 w-4 mr-1.5" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <main id="briefing" className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Featured Article - Full Width (outside flex layout) */}
        {!loading && featuredArticles.length > 0 && selectedCategory === "all" && (
          <div className="mb-8">
            <div 
              onClick={() => {
                setSelectedArticle(featuredArticles[0])
                setArticleModalOpen(true)
              }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all border-0">
                <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] min-h-[350px] md:min-h-[400px] lg:min-h-[450px] relative overflow-hidden">
                  {featuredArticles[0]?.imageUrl ? (
                    <Image
                      src={featuredArticles[0].imageUrl}
                      alt={featuredArticles[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="100vw"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  {/* Strong gradient overlay for text readability on any image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                        <Badge className="bg-category-breaking text-white border-0 px-3 py-1 shadow-lg">
                          Featured
                        </Badge>
                        <Badge className={`${getCategoryConfig(featuredArticles[0].category).color} text-white border-0 shadow-lg`}>
                          {featuredArticles[0].category}
                        </Badge>
                        <span className="text-sm text-white/90 drop-shadow-md">
                          {formatTimeAgo(featuredArticles[0].publishedAt)}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white text-balance leading-tight drop-shadow-lg [text-shadow:_0_2px_12px_rgb(0_0_0_/_60%)]">
                        {featuredArticles[0].title}
                      </h2>
                      <p className="text-base md:text-lg text-white/95 line-clamp-2 md:line-clamp-3 max-w-2xl mb-4 drop-shadow-md [text-shadow:_0_1px_6px_rgb(0_0_0_/_50%)]">
                        {featuredArticles[0].excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-white/90 drop-shadow-md">
                        <span className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {featuredArticles[0].source}
                        </span>
                        <span>{featuredArticles[0].readTime} min read</span>
                        <span className="ml-auto inline-flex items-center gap-2 bg-white/25 hover:bg-white/35 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors shadow-lg">
                          Read Full Story <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed */}
          <div className="flex-1 space-y-8">
            {/* Platform Filter & Sort */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {PLATFORMS.map((platform) => (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                    className="text-xs whitespace-nowrap"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Sort:</span>
                {(["latest", "popular", "shared"] as const).map((sort) => (
                  <Button
                    key={sort}
                    variant={sortBy === sort ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy(sort)}
                    className="text-xs capitalize"
                  >
                    {sort === "latest" ? "Latest" : sort === "popular" ? "Most Read" : "Most Shared"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Inline Newsletter CTA */}
            {!loading && filteredArticles.length > 3 && (
              <Card className="bg-primary text-primary-foreground border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Get the Daily Marketplace Brief</h3>
                      <p className="text-primary-foreground/80">
                        Join 5,000+ e-commerce professionals who start their day with the most important marketplace news.
                      </p>
                    </div>
                    <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-primary-foreground text-foreground w-full md:w-64"
                      />
                      <Button type="submit" variant="secondary" disabled={isSubscribing || subscribed}>
                        {subscribed ? "Subscribed!" : isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regular Articles Grid */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {searchQuery ? `Search Results` : 'Latest News'}
              </h2>
              <span className="text-sm text-muted-foreground">
                {loading ? '' : `${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            
            {/* Loading State with Skeletons */}
            {loading ? (
              <ArticleGridSkeleton count={6} />
            ) : filteredArticles.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search term or browse by category.`
                      : 'No articles match your current filters. Try adjusting your selection.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    )}
                    {selectedCategory !== 'all' && (
                      <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                        Show All Categories
                      </Button>
                    )}
                    {selectedPlatform !== 'All' && (
                      <Button variant="outline" onClick={() => setSelectedPlatform('All')}>
                        Show All Platforms
                      </Button>
                    )}
                  </div>
                  {/* Suggested Categories */}
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-3">Browse popular categories:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Breaking', 'Platform Updates', 'M&A & Deal Flow', 'Tools & Technology'].map((cat) => (
                        <Badge 
                          key={cat} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory(cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))
                          }}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {regularArticles.map((article, index) => (
                  <Fragment key={article.id}>
                    <div onClick={(e) => handleArticleClick(article, e)}>
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0 h-full">
                        {article.imageUrl && (
                          <div className="aspect-video relative overflow-hidden">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        )}
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            {article.platforms?.slice(0, 2).map((p) => (
                              <Badge key={p} variant="secondary" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(article.publishedAt)}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 text-balance">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              <span>{article.source}</span>
                              <span className="mx-1">|</span>
                              <span>{article.readTime} min read</span>
                            </div>
                            <span className="text-xs text-primary font-medium flex items-center gap-1">
                              Read more
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Inline Newsletter CTA after every 6th article */}
                    {(index + 1) % 6 === 0 && index < regularArticles.length - 1 && (
                      <div key={`newsletter-cta-${index}`} className="md:col-span-2">
                        <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">Getting value from these insights?</p>
                                  <p className="text-xs text-muted-foreground">Get them delivered to your inbox daily.</p>
                                </div>
                              </div>
                              <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full sm:w-48 h-9"
                                />
                                <Button type="submit" size="sm" disabled={isSubscribing || subscribed}>
                                  {subscribed ? "Subscribed!" : isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                                </Button>
                              </form>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            )}

            {/* Load More */}
            {regularArticles.length > 8 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" size="lg">
                  Load More Articles
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Trending This Week */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingArticles.map((article, i) => (
                  <Link key={article.id} href={`/news/${article.id}`} className="flex gap-3 group cursor-pointer">
                    <span className="text-2xl font-bold text-muted-foreground/50 group-hover:text-primary transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {article.source} | {formatTimeAgo(article.publishedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Amazon Accelerate 2026", date: "Apr 15-17", location: "Seattle, WA" },
                  { name: "Prosper Show", date: "May 8-10", location: "Las Vegas, NV" },
                  { name: "eTail West", date: "Jun 12-14", location: "Palm Springs, CA" },
                ].map((event) => (
                  <div key={event.name} className="flex items-start gap-3 group cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {event.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} | {event.location}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/events">
                    View All Events
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Marketplace Metrics */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Market Snapshot
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Updated monthly</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Amazon 3P GMV", value: "$420B", change: "+12%", positive: true },
                  { label: "Amazon 1P GMV", value: "$280B", change: "+5%", positive: true },
                  { label: "Amazon 3P Share", value: "60%", change: "+2pts", positive: true },
                  { label: "Amazon 1P Share", value: "40%", change: "-2pts", positive: false },
                  { label: "TikTok Shop GMV", value: "$10.5B", change: "+185%", positive: true },
                  { label: "Walmart Marketplace", value: "$75B", change: "+28%", positive: true },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <div className="text-right">
                      <span className="font-semibold">{metric.value}</span>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-xs ${metric.positive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'}`}
                      >
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Sources: Marketplace Pulse, eMarketer, Company Filings
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup - Sticky */}
            <Card className="border-0 shadow-sm bg-primary text-primary-foreground sticky top-32">
              <CardContent className="p-5">
                <Mail className="h-8 w-8 mb-3" />
                <h3 className="font-bold mb-2">Daily Marketplace Brief</h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  The most important news in 5 minutes or less. Free.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-primary-foreground text-foreground"
                  />
                  <Button type="submit" variant="secondary" className="w-full" disabled={isSubscribing || subscribed}>
                    {subscribed ? "You're In!" : isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe Free"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Tools Access */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Seller Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { name: "Profit Calculator", icon: Calculator, href: "/tools#profit" },
                  { name: "Listing Optimizer", icon: Target, href: "/tools#listing" },
                  { name: "Keyword Research", icon: LineChart, href: "/tools#keywords" },
                  { name: "Hot Products", icon: Package, href: "/tools#products" },
                ].map((tool) => (
                  <Button key={tool.name} variant="outline" size="sm" className="h-auto py-3 flex-col gap-1" asChild>
                    <Link href={tool.href}>
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.name}</span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      {/* Popular Tools Strip */}
      <section className="bg-muted/30 border-y py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Popular Seller Tools</h2>
            <p className="text-muted-foreground">Free tools to help you make better business decisions</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: "Profit Calculator", 
                icon: Calculator, 
                description: "Calculate true profit margins with all fees included",
                href: "/tools#calculator",
                color: "bg-emerald-500"
              },
              { 
                name: "Listing Optimizer", 
                icon: Target, 
                description: "Score and improve your product listings instantly",
                href: "/tools#listing",
                color: "bg-blue-500"
              },
              { 
                name: "Keyword Research", 
                icon: LineChart, 
                description: "Find high-converting keywords for your products",
                href: "/tools#keywords",
                color: "bg-purple-500"
              },
              { 
                name: "Hot Products", 
                icon: TrendingUp, 
                description: "Discover trending products with opportunity scores",
                href: "/tools#products",
                color: "bg-orange-500"
              },
            ].map((tool) => (
              <Link key={tool.name} href={tool.href}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all h-full group cursor-pointer">
                  <CardContent className="p-5">
                    <div className={`h-10 w-10 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                    <span className="text-sm text-primary font-medium flex items-center gap-1">
                      Try Free <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Used by <span className="font-semibold text-foreground">10,000+</span> sellers, agencies, and SaaS teams
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Ecom Intel Hub</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The intelligence hub for marketplace commerce. News, tools, and insights for e-commerce professionals.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CATEGORIES.slice(1, 7).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="hover:text-foreground transition-colors"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/advertise" className="hover:text-foreground transition-colors">Advertise</Link></li>
                <li><Link href="/submit" className="hover:text-foreground transition-colors">Submit a Tip</Link></li>
                <li><Link href="/tools" className="hover:text-foreground transition-colors">Seller Tools</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get the daily brief delivered to your inbox every morning.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubscribing || subscribed}>
                  {subscribed ? "Done" : "Go"}
                </Button>
              </form>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p>2026 Ecom Intel Hub. All rights reserved.</p>
              <p className="text-xs italic">Built for the marketplace commerce community</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-3">
                <a 
                  href="https://twitter.com/ecomintel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="https://linkedin.com/company/ecom-intel-hub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              </div>
            </div>
          </div>
<div className="mt-4 text-center text-xs text-muted-foreground/70">
            News updates throughout the day
          </div>
        </div>
      </footer>

      {/* Mobile Subscribe Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-3 sm:hidden z-50">
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/newsletter">
            <Mail className="h-4 w-4 mr-2" />
            Subscribe to Daily Brief
          </Link>
        </Button>
      </div>

      {/* Article Detail Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        open={articleModalOpen}
        onOpenChange={setArticleModalOpen}
        allArticles={articles}
      />

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}
