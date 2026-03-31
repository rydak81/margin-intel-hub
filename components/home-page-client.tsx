"use client"

import { useState, useEffect, useCallback, useRef, Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArticleDetailModal } from "@/components/article-detail-modal"
import { BackToTop } from "@/components/back-to-top"
import { getArticleFallbackImage } from "@/lib/article-images"
import { EVENTS, isPastEvent, sortEvents } from "@/lib/events"
import {
  buildBreakingNews,
  createFallbackBreakingNews,
  type BreakingNews,
  type NewsArticle,
  toNewsArticle,
} from "@/lib/homepage-data"
import {
  ArticleGridSkeleton,
  CompactNewsletterSkeleton,
  FeaturedArticleSkeleton,
  HeroArticleSkeleton,
  MarketSnapshotSkeleton,
  SidebarCardSkeleton,
} from "@/components/article-skeleton"
import { AdBanner } from "@/components/AdBanner"
import { getActivePlacements } from "@/lib/sponsors"
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
  ChevronDown,
  FileText,
  Linkedin,
  Twitter,
  Sparkles,
} from "lucide-react"

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

// Map filter category IDs to actual article categories
// These must match the values returned by mapAICategory()
// Kept as reference for filter chips — actual filtering uses mapAICategory() output
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  all: [], // Shows all
  breaking: ["breaking"], // Breaking news
  market: ["market", "market_metrics", "market_trends", "consumer_trends", "international"], // Market & Metrics
  platform: ["platform", "platform_updates", "compliance_policy", "policy_regulatory", "ecommerce", "amazon", "other-marketplaces"], // Platform Updates
  profitability: ["profitability", "seller_profitability"], // Seller Profitability
  deals: ["deals", "mergers_acquisitions", "ma_deal_flow"], // M&A & Deal Flow
  tools: ["tools", "tools_technology", "seller_tools", "ai_technology"], // Tools & Technology
  advertising: ["advertising", "advertising_marketing"], // Advertising
  logistics: ["logistics", "logistics_supply_chain", "seller-operations"], // Logistics
  events: ["events"], // Events
  tactics: ["tactics"], // Tactics & Strategy
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

const HOMEPAGE_EVENTS = sortEvents(EVENTS)
  .filter((event) => !isPastEvent(event))
  .slice(0, 3)

// Get article image URL - the API already enriches with stock fallbacks
function getArticleImageUrl(article: NewsArticle): string {
  // The API now returns stock Unsplash images when RSS image is missing
  // so we can directly use article.imageUrl
  if (article.imageUrl) {
    return article.imageUrl
  }
  // Absolute last resort - OG fallback (shouldn't happen anymore)
  return `/api/og/article?title=${encodeURIComponent(article.title.substring(0, 100))}&category=${encodeURIComponent(article.category || 'platform')}&source=${encodeURIComponent(article.source || '')}`
}

// Category colors for hero badge
const CATEGORY_COLORS: Record<string, string> = {
  breaking: '#DC2626',
  platform: '#2563EB',
  'platform-updates': '#2563EB',
  market: '#0891B2',
  'market-trends': '#0891B2',
  profitability: '#059669',
  advertising: '#EA580C',
  logistics: '#475569',
  'seller-operations': '#475569',
  tools: '#0EA5E9',
  'tools-technology': '#0EA5E9',
  tactics: '#CA8A04',
  'strategy-tactics': '#CA8A04',
  'compliance-policy': '#7C3AED',
}

interface HomePageClientProps {
  initialArticles: NewsArticle[]
  initialBreakingNews: BreakingNews[]
}

export default function HomePageClient({
  initialArticles,
  initialBreakingNews,
}: HomePageClientProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>(
    initialBreakingNews.length > 0 ? initialBreakingNews : createFallbackBreakingNews()
  )
  const [loading, setLoading] = useState(initialArticles.length === 0)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [themeMounted, setThemeMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [visibleArticleCount, setVisibleArticleCount] = useState(12)

  // Reset pagination when filters or search change
  useEffect(() => {
    setVisibleArticleCount(12)
  }, [selectedCategory, searchQuery])
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchResults, setSearchResults] = useState<NewsArticle[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
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

  // Debounced full-text search via API
  useEffect(() => {
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null)
      setSearchLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/articles/search?q=${encodeURIComponent(searchQuery)}&limit=30`, {
          signal: controller.signal,
        })
        const data = await res.json()
        if (data.success && data.articles) {
          const mapped: NewsArticle[] = data.articles.map(toNewsArticle)
          setSearchResults(mapped)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        console.error('Search error:', err)
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false)
        }
      }
    }, 300) // 300ms debounce

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [searchQuery])

  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // Fetch news from AI-powered articles API
  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles?limit=50`)
      const data = await response.json()
      
      if (data.success && data.articles?.length > 0) {
        const transformedArticles: NewsArticle[] = data.articles.map(toNewsArticle)
        
        setArticles(transformedArticles)
        setBreakingNews(buildBreakingNews(transformedArticles))
      }
    } catch (error) {
      console.error("Failed to fetch AI-powered news:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialArticles.length === 0) {
      void fetchNews()
    }
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews, initialArticles.length])

  // Filter articles — use API search results when searching, client-side for category only
  const filteredArticles = (() => {
    // When searching via API, use search results directly
    if (searchQuery && searchQuery.length >= 2 && searchResults !== null) {
      if (selectedCategory === "all") return searchResults
      // Apply category filter on top of search results
      return searchResults.filter(article => {
        const allowedCategories = CATEGORY_MAPPINGS[selectedCategory] || []
        return allowedCategories.length === 0 || allowedCategories.includes(article.category)
      })
    }

    // No search — filter by category only (client-side)
    return articles.filter(article => {
      if (selectedCategory !== "all") {
        const allowedCategories = CATEGORY_MAPPINGS[selectedCategory] || []
        if (allowedCategories.length > 0 && !allowedCategories.includes(article.category)) {
          return false
        }
      }
      return true
    })
  })()

  // Select hero article: prioritize articles with REAL images (not stock fallbacks)
  // The hasRealImage flag is set by the API based on whether the RSS feed had a valid image
  const heroArticle = filteredArticles.find(a => a.hasRealImage) || filteredArticles[0]

  // Remove hero from regular feed so it doesn't show twice
  const feedArticles = filteredArticles.filter(a => a.id !== heroArticle?.id)

  // Deduplicate images so the same photo doesn't appear on multiple cards
  const deduplicatedFeed = (() => {
    const seenImages = new Set<string>()
    // Reserve the hero image
    if (heroArticle?.imageUrl) seenImages.add(heroArticle.imageUrl)
    return feedArticles.map(article => {
      if (article.imageUrl && seenImages.has(article.imageUrl)) {
        return { ...article, imageUrl: undefined, hasRealImage: false }
      }
      if (article.imageUrl) seenImages.add(article.imageUrl)
      return article
    })
  })()

  const featuredArticles = deduplicatedFeed.filter(a => a.featured).slice(0, 3)
  // Show ALL articles in the main grid — the old filter(a => !a.featured) was hiding
  // 95%+ of content because most articles score >= 80 (the "featured" threshold).
  // Featured articles still get priority placement in the sidebar/hero sections.
  const regularArticles = deduplicatedFeed
  const trendingArticles = [...articles]
    .sort((a, b) => {
      const priorityA = Number(a.breaking || a.featured)
      const priorityB = Number(b.breaking || b.featured)

      if (priorityA !== priorityB) {
        return priorityB - priorityA
      }

      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, 5)
  const sponsorContext = {
    topic: selectedCategory !== "all" ? selectedCategory : heroArticle?.category,
    audiences: heroArticle?.audience || [],
  }
  const topBanners = getActivePlacements('home', 'top-banner', sponsorContext)
  const sideBanners = getActivePlacements('home', 'sidebar', sponsorContext)
  const inlineBanners = getActivePlacements('home', 'inline', sponsorContext)
  const footerBanners = getActivePlacements('home', 'footer', sponsorContext)
  const sourceCount = new Set(articles.map((article) => article.source).filter(Boolean)).size
  const freshStoryCount = articles.filter((article) => {
    const publishedAt = new Date(article.publishedAt).getTime()
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return publishedAt >= oneDayAgo
  }).length
  const heroSignals = [
    {
      label: "Fresh stories",
      value: `${freshStoryCount || articles.length}+`,
      icon: Sparkles,
    },
    {
      label: "Sources tracked",
      value: `${sourceCount || 25}+`,
      icon: LineChart,
    },
    {
      label: "Operator focus",
      value: "Seller to SaaS",
      icon: Target,
    },
  ]

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

  const isDark = resolvedTheme === "dark"

  return (
    <div className={`min-h-screen bg-background ${
      isDark
        ? 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.14),transparent_20%),radial-gradient(circle_at_50%_12%,rgba(99,102,241,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.88),rgba(2,6,23,0.56)_18%,transparent_40%)]'
        : 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_20%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.14),transparent_18%),radial-gradient(circle_at_50%_12%,rgba(99,102,241,0.08),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.76)_18%,transparent_34%)]'
    }`}>
      {/* Breaking News Ticker - Live updates */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(30,41,59,0.88))] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.09),transparent_16%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)] pointer-events-none" />
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5">
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88 backdrop-blur">
            <Zap className="h-3.5 w-3.5 text-sky-300" />
            <span>Live Signal</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="animate-ticker flex whitespace-nowrap">
              {[...breakingNews, ...breakingNews].map((item, i) => (
                <span key={`${item.id}-${i}`} className="mx-8 flex items-center gap-3 text-sm text-white/84">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-300" />
                  <span className="font-medium text-white">{item.title}</span>
                  <span className="text-white/52">{formatTimeAgo(item.timestamp)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b relative ${
        isScrolled 
          ? 'bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.82))] backdrop-blur-2xl shadow-[0_24px_70px_-42px_rgba(15,23,42,0.62)]' 
          : 'bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.7))] backdrop-blur-2xl'
      }`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/28 via-cyan-300/14 to-fuchsia-400/24 blur-sm" />
                <Image 
                  src="/brand-icon.png"
                  alt="MarketplaceBeta logo" 
                  width={32} 
                  height={32} 
                  className="relative h-8 w-8 rounded-lg object-cover ring-1 ring-sky-400/20"
                />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold leading-none text-white">MarketplaceBeta</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  Operator Intelligence Desk
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Home
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-white/82 transition-colors hover:text-white">
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
              <Link href="/articles" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Articles
              </Link>
              <Link href="/partners" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Partners
              </Link>
              <Link href="/tools" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Tools
              </Link>
              <Link href="/community" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Community
              </Link>
              <Link href="/events" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Events
              </Link>
              <Link href="/newsletter" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
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
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => {
                          if (!searchQuery) setSearchExpanded(false)
                        }}
                        className="h-9 border-white/10 bg-white/10 pl-9 pr-8 text-sm text-white shadow-sm backdrop-blur placeholder:text-white/45"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          setSearchQuery('')
                          setSearchExpanded(false)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchExpanded(true)}
                      className="h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/16"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/16"
              >
                {themeMounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button asChild size="sm" className="hidden sm:flex border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-sm text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/16"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-white/10 py-4 lg:hidden">
              <nav className="flex flex-col gap-2">
                <Link href="/" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/articles" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Articles</Link>
                <Link href="/partners" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Partners</Link>
                <Link href="/tools" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Tools</Link>
                <Link href="/community" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Community</Link>
                <Link href="/events" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                <Link href="/newsletter" className="rounded-md px-4 py-2 text-white/82 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Newsletter</Link>
                <div className="px-4 py-2">
                  <Input
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-white/10 bg-white/10 text-white placeholder:text-white/45"
                  />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_18%),linear-gradient(180deg,rgba(37,99,235,0.05),transparent_44%)]" />
        <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="text-muted-foreground">
                  Live operator desk tracking <span className="font-semibold text-foreground">marketplace shifts, tools, and deal flow</span>
                </span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.68))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
                Premium Intelligence for Marketplace Teams
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
                The intelligence hub for{" "}
                <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                  marketplace commerce
                </span>
              </h1>

              <p className={`mt-6 max-w-3xl text-lg md:text-xl md:leading-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Breaking news, platform updates, M&amp;A activity, and operator-grade analysis for Amazon sellers,
                agencies, SaaS providers, and commerce teams who need signal instead of noise.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="border border-sky-400/20 bg-[linear-gradient(135deg,#0f3f96,#2563eb_62%,#4f46e5)] text-white shadow-[0_22px_44px_-24px_rgba(37,99,235,0.8)] hover:opacity-95">
                  <a href="#briefing">
                    Read Today&apos;s Briefing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-200 bg-white/75 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:hover:bg-slate-900">
                  <Link href="/newsletter">
                    Get the Daily Brief
                    <Mail className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.24)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45"
                  >
                    <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                      <signal.icon className="h-4 w-4 text-sky-600" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{signal.label}</span>
                    </div>
                    <p className={`mt-3 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{signal.value}</p>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* Active Filter Indicator — only shows when a filter is active */}
      {selectedCategory !== "all" && (
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,250,252,0.72))] backdrop-blur dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.72),rgba(15,23,42,0.68))]">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Filtered by:
              <Badge variant="secondary" className="ml-2 rounded-full border border-sky-400/15 bg-white/75 px-3 py-1 dark:border-white/10 dark:bg-slate-950/45">
                {getCategoryConfig(selectedCategory).label}
              </Badge>
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory("all")} className="h-8 rounded-full px-3 text-xs hover:bg-white/75 dark:hover:bg-slate-950/45">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="briefing" className="max-w-7xl mx-auto px-4 py-10">
        {/* Top Ad Banners */}
        {topBanners.map(p => (
          <AdBanner key={p.id} sponsor={p.sponsor} variant="top-banner" dismissible={p.dismissible} />
        ))}

        {/* Hero Featured Article - Full Width (outside flex layout) */}
        {loading && selectedCategory === "all" && (
          <div className="mb-8">
            <FeaturedArticleSkeleton />
          </div>
        )}

        {!loading && featuredArticles.length > 0 && selectedCategory === "all" && (
          <div className="mb-8">
            <div 
              onClick={() => {
                setSelectedArticle(featuredArticles[0])
                setArticleModalOpen(true)
              }}
              className="cursor-pointer"
            >
              <Card className="group cursor-pointer overflow-hidden border border-white/50 bg-white/85 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.42)] transition-all hover:-translate-y-1 hover:shadow-[0_32px_90px_-44px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-slate-950/45">
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
                  <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-6 md:p-8">
                    <div className="rounded-full border border-white/15 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/88 backdrop-blur-md">
                      Lead Briefing
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                      {featuredArticles[0].readTime} min read
                    </div>
                  </div>
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
            {/* Clean section header */}

            {/* Hero Article Section - Top Story */}
            {loading && !searchQuery && <HeroArticleSkeleton />}

            {!loading && heroArticle && !searchQuery && (
              <section className="mb-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                      Top Story
                    </span>
                  </div>
                  <div className="hidden rounded-full border border-sky-400/15 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200 md:inline-flex">
                    Editor&apos;s pick
                  </div>
                </div>
                
                <div 
                  className="group relative overflow-hidden rounded-[28px] border border-white/50 bg-white/85 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/45"
                  onClick={() => {
                    setSelectedArticle(heroArticle)
                    setArticleModalOpen(true)
                  }}
                >
                  {/* Large image */}
                  <div className="relative w-full h-[300px] md:h-[400px]">
                    <img
                      src={getArticleImageUrl(heroArticle)}
                      alt={heroArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="eager"
                      onError={(e) => {
                        const target = e.currentTarget
                        // Use curated stock image fallback instead of OG
                        const fallback = getArticleFallbackImage(
                          heroArticle.title,
                          heroArticle.category,
                          heroArticle.platforms || []
                        )
                        if (target.src !== fallback) {
                          target.src = fallback
                        }
                      }}
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    {/* Category + Impact badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[heroArticle.category] || '#2563EB' }}
                      >
                        {heroArticle.category.replace(/[-_]/g, ' ')}
                      </span>
                      {heroArticle.impactLevel && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white">
                          {heroArticle.impactLevel === 'high' ? '●' : heroArticle.impactLevel === 'medium' ? '●' : '●'}{' '}
                          {heroArticle.impactLevel.toUpperCase()} IMPACT
                        </span>
                      )}
                      <span className="text-white/60 text-sm">
                        {formatTimeAgo(heroArticle.publishedAt)}
                      </span>
                    </div>
                    
                    {/* Headline */}
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight line-clamp-2 text-balance">
                      {heroArticle.title}
                    </h2>
                    
                    {/* Summary */}
                    <p className="text-white/80 text-sm md:text-base mb-3 line-clamp-2 max-w-3xl">
                      {heroArticle.aiSummary || heroArticle.excerpt}
                    </p>
                    
                    {/* Source + Read more */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <span className="font-medium text-white/80">
                          {heroArticle.source}
                        </span>
                        {heroArticle.platforms?.slice(0, 2).map(p => (
                          <span 
                            key={p} 
                            className="px-2 py-0.5 rounded bg-white/10 text-xs capitalize"
                          >
                            {p.replace(/[-_]/g, ' ')}
                          </span>
                        ))}
                      </div>
                      <span className="text-primary font-medium text-sm group-hover:underline">
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Compact Newsletter CTA */}
            {loading && <CompactNewsletterSkeleton />}

            {!loading && filteredArticles.length > 3 && (
              <div className="mb-6 overflow-hidden rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82)_50%,rgba(239,246,255,0.84)_100%)] p-4 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.34)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(15,23,42,0.74)_50%,rgba(30,41,59,0.84)_100%)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f3f96,#2563eb_62%,#7c3aed)] text-white shadow-[0_18px_40px_-24px_rgba(37,99,235,0.6)]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">Daily Marketplace Brief</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Join <span className="font-semibold text-foreground">5,000+ operators, sellers, and partners</span> getting the sharpest signal in five minutes or less.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-44 border-white/40 bg-white/85 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45"
                  />
                  <Button type="submit" size="sm" className="h-10 border border-sky-400/20 bg-[linear-gradient(135deg,#0f3f96,#2563eb_62%,#4f46e5)] text-white shadow-[0_16px_36px_-24px_rgba(37,99,235,0.7)]" disabled={isSubscribing || subscribed}>
                    {subscribed ? "Done" : isSubscribing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Subscribe"}
                  </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Regular Articles Grid */}
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/40 pb-4 dark:border-white/10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  News Feed
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {searchQuery ? `Search Results` : 'Latest News'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Curated for operators, sellers, agencies, and marketplace tech teams.
                </p>
              </div>
              <div className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                {loading ? '' : `${feedArticles.length} article${feedArticles.length !== 1 ? 's' : ''}`}
              </div>
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
                {regularArticles.slice(0, visibleArticleCount).map((article, index) => (
                  <Fragment key={article.id}>
                    <div onClick={(e) => handleArticleClick(article, e)}>
                      <Card className="group h-full cursor-pointer overflow-hidden rounded-[24px] border border-white/60 bg-white/82 shadow-[0_22px_54px_-34px_rgba(15,23,42,0.28)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_70px_-36px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/45">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={getArticleImageUrl(article)}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading={index < 4 ? 'eager' : 'lazy'}
                            onError={(e) => {
                              const target = e.currentTarget
                              // Use curated stock image fallback instead of OG
                              const fallback = getArticleFallbackImage(
                                article.title,
                                article.category,
                                article.platforms || []
                              )
                              if (target.src !== fallback) {
                                target.src = fallback
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent opacity-80" />
                          <div className="absolute left-4 top-4 flex items-center gap-2">
                            <span className="rounded-full border border-white/20 bg-slate-950/48 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                              {article.category.replace(/[-_]/g, ' ')}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <div className="mb-3 flex items-center gap-2 flex-wrap">
                            {article.platforms?.slice(0, 2).map((p) => (
                              <Badge key={p} variant="secondary" className="rounded-full border border-sky-400/10 bg-sky-500/8 text-xs">
                                {p}
                              </Badge>
                            ))}
                            {/* AI Impact Badge */}
                            {article.impactLevel && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  article.impactLevel === 'high' 
                                    ? 'border-red-500/50 text-red-600 bg-red-500/10' 
                                    : article.impactLevel === 'medium' 
                                    ? 'border-amber-500/50 text-amber-600 bg-amber-500/10' 
                                    : 'border-green-500/50 text-green-600 bg-green-500/10'
                                }`}
                              >
                                <span className={`mr-1 ${
                                  article.impactLevel === 'high' ? 'text-red-500' 
                                  : article.impactLevel === 'medium' ? 'text-amber-500' 
                                  : 'text-green-500'
                                }`}>●</span>
                                {article.impactLevel.charAt(0).toUpperCase() + article.impactLevel.slice(1)} Impact
                              </Badge>
                            )}
                            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(article.publishedAt)}
                            </span>
                          </div>
                          {/* AI Enhanced indicator */}
                          {article.aiSummary && (
                            <div className="flex items-center gap-1 mb-2">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <span className="text-[10px] text-primary font-medium">AI Enhanced</span>
                            </div>
                          )}
                          <h3 className="mb-2 text-lg font-semibold leading-7 group-hover:text-primary transition-colors line-clamp-2 text-balance">
                            {article.title}
                          </h3>
                          <p className="mb-4 text-sm text-muted-foreground line-clamp-3 leading-6">
                            {article.aiSummary || article.excerpt}
                          </p>
                          {/* Audience pills */}
                          {article.audience && article.audience.length > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              <span className="text-[10px] text-muted-foreground">For:</span>
                              {article.audience.slice(0, 3).map((aud) => (
                                <span 
                                  key={aud} 
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize"
                                >
                                  {aud}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-white/50 pt-3 dark:border-white/10">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {article.tier === 1 ? (
                                <span className="flex items-center gap-1">
                                  <span className="text-amber-500">&#10022;</span>
                                  <span className="font-medium text-foreground">{article.source}</span>
                                </span>
                              ) : (
                                <>
                                  <Globe className="h-3 w-3" />
                                  <span>{article.source}</span>
                                </>
                              )}
                              <span className="mx-1">|</span>
                              <span>{article.readTime} min read</span>
                            </div>
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
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
                        <Card className="overflow-hidden rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(37,99,235,0.86)_58%,rgba(79,70,229,0.82))] text-white shadow-[0_26px_64px_-36px_rgba(15,23,42,0.62)] dark:border-white/10">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
                                  <Mail className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Operator Brief</p>
                                  <p className="mt-1 text-sm text-white/90">Getting value from these insights? Get the sharpest stories delivered every morning.</p>
                                </div>
                              </div>
                              <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="h-10 w-full border-white/15 bg-white text-slate-950 placeholder:text-slate-500 sm:w-48"
                                />
                                <Button type="submit" size="sm" className="h-10 bg-slate-950 text-white hover:bg-slate-900" disabled={isSubscribing || subscribed}>
                                  {subscribed ? "Subscribed!" : isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                                </Button>
                              </form>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    {/* Inline Ad Banners after 6th article */}
                    {index === 5 && inlineBanners.length > 0 && (
                      <div key={`inline-ad-${index}`} className="md:col-span-2">
                        <AdBanner sponsor={inlineBanners[0].sponsor} variant="inline" dismissible={inlineBanners[0].dismissible} />
                      </div>
                    )}
                    {/* Second inline ad after 12th article */}
                    {index === 11 && inlineBanners.length > 1 && (
                      <div key={`inline-ad-2-${index}`} className="md:col-span-2">
                        <AdBanner sponsor={inlineBanners[1].sponsor} variant="inline" dismissible={inlineBanners[1].dismissible} />
                      </div>
                    )}

                    {/* MarginPro CTA - shows in Seller Profitability category after every 8th article */}
                    {selectedCategory === "profitability" && (index + 1) % 8 === 0 && index < regularArticles.length - 1 && (
                      <div key={`marginpro-cta-${index}`} className="md:col-span-2">
                        <Card className="overflow-hidden rounded-[24px] border border-emerald-500/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(236,253,245,0.94)_55%,rgba(209,250,229,0.9))] shadow-[0_22px_60px_-38px_rgba(5,150,105,0.28)] dark:border-emerald-500/15 dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.28),rgba(4,47,46,0.34)_55%,rgba(6,95,70,0.24))]">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                  <DollarSign className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">Losing margin to Amazon billing errors?</p>
                                  <p className="text-xs text-muted-foreground">MarginPro recovers an average of 1-3% of revenue from overcharges, shortages, and billing mistakes.</p>
                                </div>
                              </div>
                              <Link href="/solutions">
                                <Button variant="outline" size="sm" className="whitespace-nowrap border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300">
                                  Get a Free Audit
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
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
            {regularArticles.length > visibleArticleCount && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-sky-400/20 bg-white/80 px-6 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:hover:bg-slate-900"
                  onClick={() => setVisibleArticleCount(prev => prev + 12)}
                >
                  Load More Articles ({regularArticles.length - visibleArticleCount} remaining)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Sidebar Ad Banners */}
            {sideBanners.map(p => (
              <AdBanner key={p.id} sponsor={p.sponsor} variant="sidebar" dismissible={p.dismissible} />
            ))}

            {loading && (
              <>
                <SidebarCardSkeleton rows={5} />
                <SidebarCardSkeleton rows={3} />
                <MarketSnapshotSkeleton />
                <SidebarCardSkeleton rows={2} />
              </>
            )}

            {/* Trending This Week */}
            {!loading && (
            <Card className="overflow-hidden rounded-[24px] border border-white/60 bg-white/82 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingArticles.map((article, i) => (
                  <Link key={article.id} href={`/news/${article.id}`} className="group flex gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-sky-400/15 hover:bg-sky-500/5">
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
            )}

            {/* Upcoming Events */}
            {!loading && (
            <Card className="overflow-hidden rounded-[24px] border border-white/60 bg-white/82 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {HOMEPAGE_EVENTS.map((event) => (
                  <div key={event.name} className="group flex items-start gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-sky-400/15 hover:bg-sky-500/5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {event.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.dates} | {event.location}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full rounded-full border-sky-400/15 bg-white/75 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:hover:bg-slate-900" asChild>
                  <Link href="/events">
                    View All Events
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            )}

            {/* Marketplace Metrics */}
            {!loading && (
            <Card className="overflow-hidden rounded-[24px] border border-white/60 bg-white/82 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950/45">
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
                  <div key={metric.label} className="flex items-center justify-between border-b border-white/50 py-2 last:border-0 dark:border-white/10">
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
            )}

            {/* Newsletter Signup - Sticky */}
            {!loading && (
            <Card className="sticky top-32 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(37,99,235,0.94)_58%,rgba(79,70,229,0.92))] text-primary-foreground shadow-[0_26px_70px_-36px_rgba(15,23,42,0.72)]">
              <CardContent className="p-5">
                <Mail className="mb-3 h-8 w-8" />
                <h3 className="mb-2 font-bold">Daily Marketplace Brief</h3>
                <p className="mb-4 text-sm text-primary-foreground/80">
                  The most important news in 5 minutes or less. Free.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/15 bg-white text-foreground placeholder:text-slate-500"
                  />
                  <Button type="submit" variant="secondary" className="w-full bg-slate-950 text-white hover:bg-slate-900" disabled={isSubscribing || subscribed}>
                    {subscribed ? "You're In!" : isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe Free"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            )}

            {/* Quick Tools Access */}
            {!loading && (
            <Card className="overflow-hidden rounded-[24px] border border-white/60 bg-white/82 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Seller Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { name: "Profit Calculator", icon: Calculator, href: "/tools#profit" },
                  { name: "Profit Recovery", icon: DollarSign, href: "/solutions" },
                  { name: "Listing Optimizer", icon: Target, href: "/tools#listing" },
                  { name: "Keyword Research", icon: LineChart, href: "/tools#keywords" },
                ].map((tool) => (
                  <Button key={tool.name} variant="outline" size="sm" className="h-auto rounded-2xl border-white/60 bg-white/78 py-3 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:hover:bg-slate-900" asChild>
                    <Link href={tool.href}>
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.name}</span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
            )}

            {/* Solutions CTA - Coming Soon */}
          </aside>
        </div>
      </main>
      {/* Footer Ad Banners */}
      <div className="max-w-7xl mx-auto px-4">
        {footerBanners.map(p => (
          <AdBanner key={p.id} sponsor={p.sponsor} variant="footer" dismissible={p.dismissible} />
        ))}
      </div>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_22%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.1),transparent_20%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,1))] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                <span className="font-bold text-xl">MarketplaceBeta</span>
              </div>
              <p className="text-sm text-white/70 mb-4">
                The intelligence hub for marketplace commerce. News, tools, and insights for e-commerce professionals.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="h-9 w-9 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-white/70">
                {CATEGORIES.slice(1, 7).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="hover:text-white transition-colors"
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
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">Partner Marketplace</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Operator Network</Link></li>
                <li><Link href="/submit" className="hover:text-white transition-colors">Submit a Tip</Link></li>
                <li><Link href="/tools" className="hover:text-white transition-colors">Seller Tools</Link></li>
                <li><Link href="/articles" className="hover:text-white transition-colors">Search Articles</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-white/70 mb-4">
                Get the daily brief delivered to your inbox every morning.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-white/10 bg-white/8 text-white placeholder:text-white/45"
                />
                <Button type="submit" disabled={isSubscribing || subscribed} className="bg-white text-slate-950 hover:bg-white/90">
                  {subscribed ? "Done" : "Go"}
                </Button>
              </form>
            </div>
          </div>

          <Separator className="my-8 bg-white/10" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p>2026 MarketplaceBeta. All rights reserved.</p>
              <p className="text-xs italic">Built for the marketplace commerce community</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-3">
                <a 
                  href="https://twitter.com/ecomintel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="https://linkedin.com/company/ecom-intel-hub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-white/45">
            News updates throughout the day
          </div>
        </div>
      </footer>

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
