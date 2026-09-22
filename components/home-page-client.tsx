"use client"

import { useState, useEffect, useCallback, useRef, Fragment, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArticleDetailModal } from "@/components/article-detail-modal"
import { AuthModal } from "@/components/auth-modal"
import { BackToTop } from "@/components/back-to-top"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { SiteBrand } from "@/components/site-brand"
import { getArticleFallbackImage, getArticleImageUrl as resolveArticleImageUrl } from "@/lib/article-images"
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
  
  SidebarCardSkeleton,
} from "@/components/article-skeleton"
import { useAuthAccount } from "@/hooks/use-auth-account"
import { buildUserPreferenceProfile, getPersonalizationLabel, personalizeArticles } from "@/lib/personalization"
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
  return resolveArticleImageUrl(
    article.imageUrl,
    article.title,
    article.category || "platform_updates",
    article.platforms || [],
    article.fullContent
  )
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
  const { currentUser, loading: accountLoading, metadata } = useAuthAccount()

  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>(
    initialBreakingNews.length > 0 ? initialBreakingNews : createFallbackBreakingNews()
  )
  const [loading, setLoading] = useState(initialArticles.length === 0)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [themeMounted, setThemeMounted] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [visibleArticleCount, setVisibleArticleCount] = useState(12)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  // Reset pagination when filters or search change
  useEffect(() => {
    setVisibleArticleCount(12)
  }, [selectedCategory, searchQuery])
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchResults, setSearchResults] = useState<NewsArticle[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const preferenceProfile = useMemo(() => buildUserPreferenceProfile(metadata), [metadata])
  const personalizationLabel = useMemo(() => getPersonalizationLabel(preferenceProfile), [preferenceProfile])

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
        if (window.matchMedia("(min-width: 1024px)").matches) setSearchExpanded(true)
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
      const personalizedResults = personalizeArticles(searchResults, preferenceProfile)
      if (selectedCategory === "all") return personalizedResults
      // Apply category filter on top of search results
      return personalizedResults.filter(article => {
        const allowedCategories = CATEGORY_MAPPINGS[selectedCategory] || []
        return allowedCategories.length === 0 || allowedCategories.includes(article.category)
      })
    }

    // No search — filter by category only (client-side)
    const baseArticles = articles.filter(article => {
      if (selectedCategory !== "all") {
        const allowedCategories = CATEGORY_MAPPINGS[selectedCategory] || []
        if (allowedCategories.length > 0 && !allowedCategories.includes(article.category)) {
          return false
        }
      }
      return true
    })

    return personalizeArticles(baseArticles, preferenceProfile)
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
  const regularArticles = selectedCategory === "all"
    ? deduplicatedFeed.filter(article => article.id !== featuredArticles[0]?.id)
    : deduplicatedFeed
  const trendingArticles = (() => {
    const seen = new Set<string>()
    return [...articles]
      .sort((a, b) => {
        const priorityA = Number(a.breaking || a.featured)
        const priorityB = Number(b.breaking || b.featured)
        if (priorityA !== priorityB) return priorityB - priorityA
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      .filter(a => {
        const normalizedTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
        if (seen.has(normalizedTitle)) return false
        seen.add(normalizedTitle)
        return true
      })
      .slice(0, 5)
  })()
  const sourceCount = new Set(articles.map((article) => article.source).filter(Boolean)).size
  const freshStoryCount = articles.filter((article) => {
    const publishedAt = new Date(article.publishedAt).getTime()
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return publishedAt >= oneDayAgo && publishedAt <= Date.now()
  }).length
  const heroSignals = [
    {
      label: "Stories in the past 24 hours",
      value: String(freshStoryCount),
      icon: Sparkles,
    },
    {
      label: "Sources in this briefing",
      value: String(sourceCount),
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
    <div className="min-h-screen bg-background">
      {/* Breaking News Ticker - Live updates */}
      {breakingNews.length > 0 && <div className="relative overflow-hidden border-b border-white/10 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex shrink-0 items-center gap-2 px-0 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-200">
            <Zap className="h-3.5 w-3.5 text-sky-200" />
            <span>In the briefing</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="animate-ticker flex whitespace-nowrap">
              {[...breakingNews, ...breakingNews].map((item, i) => (
                <span key={`${item.id}-${i}`} className="mx-6 flex items-center gap-3 text-sm text-white/88">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-200" />
                  <span className="font-medium text-white/95">{item.title}</span>
                  <span className="hidden text-white/60 sm:inline">{formatTimeAgo(item.timestamp)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      }

      <PremiumSiteHeader
        active="home"
        actions={
          <>
              {/* Expandable Search */}
              <div className="hidden lg:flex items-center">
                <div className={`flex items-center transition-all duration-300 ${
                  searchExpanded ? 'w-64' : 'w-11'
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
                        aria-label="Search news"
                        className="h-11 border-white/10 bg-white/10 pl-9 pr-8 text-sm text-white shadow-sm backdrop-blur placeholder:text-white/45"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          setSearchQuery('')
                          setSearchExpanded(false)
                        }}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open news search"
                      onClick={() => setSearchExpanded(true)}
                      className="h-11 w-11 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle color theme"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="h-11 w-11 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white"
              >
                {themeMounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {!accountLoading && currentUser ? (
                <Button asChild size="sm" variant="outline" className="hidden sm:flex border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white">
                  <Link href="/account" className="max-w-[160px] truncate">
                    {currentUser.display_name}
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setAuthDialogOpen(true)}
                  className="hidden h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 sm:flex"
                >
                  Sign In
                </Button>
              )}
          </>
        }
        mobileContent={
          <div className="mt-3 space-y-3 px-3">
            <Input aria-label="Search news" placeholder="Search news..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 border-white/20 bg-white/5 text-white placeholder:text-slate-400" />
            {currentUser ? <Link href="/account" className="block py-2">Your account</Link> : <button type="button" className="py-2 text-base font-semibold" onClick={() => setAuthDialogOpen(true)}>Sign in</button>}
          </div>
        }
      />

      {/* Editorial masthead */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:py-12 lg:grid-cols-[1fr_280px] lg:items-end lg:gap-16">
          <div>
            <p className="mb-5 flex items-center gap-2.5 text-sm font-semibold tracking-wide text-blue-700 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" />The marketplace intelligence desk
            </p>
            <h1 className="max-w-4xl text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.75rem] dark:text-white">
              A clearer view of<br className="hidden sm:block" /> marketplace commerce.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl dark:text-slate-300">
              The news that matters. The context behind it. Essential insights and practical tools for the people building modern commerce.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="h-12 rounded-lg bg-blue-600 px-6 text-base font-semibold text-white hover:bg-blue-700">
                <a href="#briefing">Explore the latest<ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 rounded-lg border-border bg-card px-6 text-base">
                <Link href="/newsletter">Get the daily brief</Link>
              </Button>
            </div>
            {currentUser && personalizationLabel ? <p className="mt-5 text-sm text-muted-foreground">{personalizationLabel}. <Link href="/account" className="font-medium text-primary underline underline-offset-4">Edit your preferences</Link></p> : null}
          </div>
          <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {heroSignals.map(signal => (
              <div key={signal.label}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><signal.icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />{signal.label}</div>
                <p className="mt-1 text-lg font-semibold tracking-tight">{signal.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Filter Indicator — only shows when a filter is active */}
      {selectedCategory !== "all" && (
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.76))] backdrop-blur dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.84),rgba(15,23,42,0.8))]">
          <div className="max-w-7xl mx-auto flex flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <span className="text-sm text-slate-600 dark:text-slate-200">
              Filtered by:
              <Badge variant="secondary" className="ml-2 rounded-full border border-sky-400/15 bg-white/85 px-3 py-1 text-slate-700 dark:border-sky-300/15 dark:bg-slate-950/60 dark:text-slate-100">
                {getCategoryConfig(selectedCategory).label}
              </Badge>
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory("all")} className="h-8 rounded-full px-3 text-xs text-slate-600 hover:bg-white/75 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-950/60 dark:hover:text-white">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="briefing" className="max-w-7xl mx-auto px-4 py-10 sm:px-6">
        {/* Hero Featured Article - Full Width (outside flex layout) */}
        {loading && selectedCategory === "all" && (
          <div className="mb-8">
            <FeaturedArticleSkeleton />
          </div>
        )}

        {!loading && featuredArticles.length > 0 && selectedCategory === "all" && (
          <section className="mb-12" aria-label="Lead story">
            <button
              type="button"
              onClick={() => { setSelectedArticle(featuredArticles[0]); setArticleModalOpen(true) }}
              className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:min-h-[380px]">
                  <img
                    src={getArticleImageUrl(featuredArticles[0])}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:absolute md:inset-0"
                    loading="eager"
                    onError={e => {
                      const fallback = getArticleFallbackImage(featuredArticles[0].title, featuredArticles[0].category, featuredArticles[0].platforms || [])
                      if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-medium">
                    <span className="text-blue-700 dark:text-blue-300">The lead story</span>
                    <span className="text-muted-foreground">{featuredArticles[0].category.replace(/[-_]/g, ' ')}</span>
                  </div>
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary sm:text-3xl lg:text-4xl">{featuredArticles[0].title}</h2>
                  <p className="mt-5 line-clamp-3 text-lg leading-8 text-muted-foreground">{featuredArticles[0].excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{featuredArticles[0].source}</span><span aria-hidden="true">·</span><span>{featuredArticles[0].readTime} min read</span>
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 text-base font-semibold text-primary">Read the story<ArrowRight className="h-4 w-4" /></span>
                </div>
              </div>
            </button>
          </section>
        )}

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed */}
          <div className="min-w-0 flex-1 space-y-8">
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
                  <div className="hidden rounded-full border border-sky-400/15 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200 md:inline-flex">
                    Editor&apos;s pick
                  </div>
                </div>
                
                <button
                  type="button"
                  className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
                  onClick={() => {
                    setSelectedArticle(heroArticle)
                    setArticleModalOpen(true)
                  }}
                >
                  {/* Large image */}
                  <div className="relative aspect-[16/9] w-full">
                    <img
                      src={getArticleImageUrl(heroArticle)}
                      alt={heroArticle.title}
                      className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  </div>
                  
                  {/* Story copy stays on a solid surface for readability. */}
                  <div className="p-6 md:p-8">
                    {/* Category + Impact badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[heroArticle.category] || '#2563EB' }}
                      >
                        {heroArticle.category.replace(/[-_]/g, ' ')}
                      </span>
                      {heroArticle.impactLevel && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">
                          {heroArticle.impactLevel === 'high' ? '●' : heroArticle.impactLevel === 'medium' ? '●' : '●'}{' '}
                          {heroArticle.impactLevel.toUpperCase()} IMPACT
                        </span>
                      )}
                      <span className="text-muted-foreground text-sm">
                        {formatTimeAgo(heroArticle.publishedAt)}
                      </span>
                    </div>
                    
                    {/* Headline */}
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3 leading-tight line-clamp-2 text-balance">
                      {heroArticle.title}
                    </h2>
                    
                    {/* Summary */}
                    <p className="text-muted-foreground text-lg leading-8 mb-5 line-clamp-2 max-w-3xl">
                      {heroArticle.aiSummary || heroArticle.excerpt}
                    </p>
                    
                    {/* Source + Read more */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="font-medium text-muted-foreground">
                          {heroArticle.source}
                        </span>
                        {heroArticle.platforms?.slice(0, 2).map(p => (
                          <span 
                            key={p} 
                            className="px-2 py-0.5 rounded bg-secondary text-xs capitalize"
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
                </button>
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
                        A focused briefing for operators, sellers, and partners. Get the stories that matter to your business.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    aria-label="Email address"
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  News Feed
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {searchQuery ? `Search Results` : 'Latest News'}
                </h2>
                <p className="mt-1 text-base text-muted-foreground">
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
                    <div className="cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-primary" role="button" tabIndex={0} aria-label={`Read ${article.title}`} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedArticle(article); setArticleModalOpen(true) } }} onClick={(e) => handleArticleClick(article, e)}>
                      <Card className="group h-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-none transition-shadow hover:shadow-md">
                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                          <img
                            src={getArticleImageUrl(article)}
                            alt={article.title}
                            className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading={index < 4 ? 'eager' : 'lazy'}
                            style={{ objectPosition: 'center center' }}
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
                        </div>
                        <CardContent className="p-5 md:p-6">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-white/88">
                                {article.category.replace(/[-_]/g, ' ')}
                              </span>
                              {article.aiSummary && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/15 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 dark:border-sky-400/18 dark:bg-sky-400/10 dark:text-sky-200">
                                  <Sparkles className="h-3 w-3" />
                                  AI Enhanced
                                </span>
                              )}
                              {article.impactLevel && (
                                <span className="rounded-full border border-amber-400/20 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 dark:border-amber-400/18 dark:bg-amber-400/10 dark:text-amber-200">
                                  {article.impactLevel} impact
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                              {formatTimeAgo(article.publishedAt)}
                            </span>
                          </div>

                          <h3 className="mb-3 text-[1.4rem] font-semibold leading-snug text-slate-950 transition-colors group-hover:text-sky-700 md:text-[1.6rem] dark:text-white dark:group-hover:text-sky-200 text-balance line-clamp-2">
                            {article.title}
                          </h3>

                          <p className="mb-4 text-base leading-7 text-slate-700 line-clamp-3 dark:text-slate-300">
                            {article.aiSummary || article.excerpt}
                          </p>

                          <div className="mb-5 flex flex-wrap items-center gap-2">
                            {article.platforms?.slice(0, 2).map((p) => (
                              <span
                                key={p}
                                className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600 dark:border-white/10 dark:bg-white/7 dark:text-slate-200"
                              >
                                {p}
                              </span>
                            ))}
                            {article.audience?.slice(0, 1).map((aud) => (
                              <span
                                key={aud}
                                className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-medium capitalize text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                              >
                                {aud.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 pt-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
                            <div className="flex min-w-0 items-center gap-2">
                              <Globe className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{article.source}</span>
                              <span className="text-slate-300 dark:text-white/20">|</span>
                              <span className="shrink-0">{article.readTime} min read</span>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 font-semibold text-sky-700 dark:text-sky-200">
                              Read more
                              <ArrowRight className="h-3.5 w-3.5" />
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
                    aria-label="Email address"
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
            {loading && (
              <>
                <SidebarCardSkeleton rows={5} />
                <SidebarCardSkeleton rows={3} />
                
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

            {/* Newsletter Signup - Sticky */}
            {!loading && (
            <Card className="sticky top-32 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94)_52%,rgba(55,48,163,0.86))] text-primary-foreground shadow-[0_26px_70px_-36px_rgba(15,23,42,0.58)]">
              <CardContent className="p-5">
                <Mail className="mb-3 h-8 w-8 text-sky-300" />
                <h3 className="mb-2 font-bold">Daily Marketplace Brief</h3>
                <p className="mb-4 text-sm text-white/76">
                  The most important news in 5 minutes or less. Free.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <Input
                    type="email"
                    aria-label="Email address"
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

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_22%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.1),transparent_20%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,1))] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr]">
            {/* Brand */}
            <div>
              <SiteBrand href="/" logoClassName="h-11" iconClassName="h-9 w-9" className="mb-4" priority />
              <p className="text-sm text-white/70 mb-4">
                The intelligence hub for marketplace commerce. News, tools, and insights for e-commerce professionals.
              </p>

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
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/partners" className="hover:text-white transition-colors">Partner Marketplace</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Operator Network</Link></li>
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
                    aria-label="Email address"
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

      <AuthModal
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        redirectTo="/account"
        title="Sign in to personalize MarketplaceBeta"
        description="Create an account to unlock community participation, saved preferences, and a smarter digest over time."
      />

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}

