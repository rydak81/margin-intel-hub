"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  ExternalLink,
  TrendingUp,
  Zap,
  Search,
  RefreshCw,
  Bookmark,
  Share2,
  ChevronRight,
  User,
  Calendar,
  ArrowRight,
  Loader2,
  Filter,
  Newspaper,
  Globe,
  Tag,
  Rss,
  X,
  Timer
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
}

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

const CATEGORIES = ["All", "Amazon", "Industry", "Strategy", "Retail", "D2C", "Logistics", "Tech", "Marketplaces", "Policy", "Tools"]

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5) // minutes

  const fetchNews = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const categoryParam = selectedCategory === "All" ? "" : `&category=${selectedCategory}`
      const response = await fetch(`/api/news?limit=50${categoryParam}`)
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.articles)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // Auto-refresh based on interval setting
  useEffect(() => {
    const interval = setInterval(fetchNews, refreshInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews, refreshInterval])

  // Search for articles
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false)
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const featuredArticles = filteredArticles.filter(a => a.featured)
  const regularArticles = filteredArticles.filter(a => !a.featured)
  const breakingNews = articles.find(a => a.breaking)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Amazon: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      Industry: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Strategy: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      Retail: "bg-rose-500/10 text-rose-700 border-rose-500/20",
      D2C: "bg-violet-500/10 text-violet-700 border-violet-500/20",
      Logistics: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
      Tech: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
      Marketplaces: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      Policy: "bg-red-500/10 text-red-700 border-red-500/20",
      Tools: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground">Loading latest news...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breaking News Banner */}
      {breakingNews && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="font-bold text-red-700 uppercase text-sm tracking-wide">Breaking</span>
          </div>
          <p className="font-semibold flex-1">{breakingNews.title}</p>
          <Button variant="ghost" size="sm" className="text-red-700">
            Read More <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:max-w-lg relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news and current events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            className="pl-10 pr-20"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-12 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="h-3 w-3" />
            <span>Auto-refresh:</span>
            <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 min</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground hidden md:block">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNews}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      {!showSearchResults && (
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Search Results */}
      {showSearchResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Search Results</h2>
              <p className="text-sm text-muted-foreground">
                {isSearching ? "Searching..." : `${searchResults.length} results for "${searchQuery}"`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearSearch}>
              <X className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          </div>
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Searching across news sources...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result) => (
                <Card key={result.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0 bg-card">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={result.imageUrl}
                      alt={result.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.relevanceScore}% match
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(result.category)}`}>
                        {result.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(result.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2 text-pretty">
                      {result.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {result.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 mr-1" />
                      <span>{result.source}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search terms or browse our latest news below.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Featured Articles */}
      {!showSearchResults && featuredArticles.length > 0 && selectedCategory === "All" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Featured */}
          <Card className="md:col-span-2 overflow-hidden group cursor-pointer hover:shadow-lg transition-all border-0 bg-card">
            <div className="aspect-[16/9] relative overflow-hidden">
              {featuredArticles[0].imageUrl ? (
                <Image
                  src={featuredArticles[0].imageUrl}
                  alt={featuredArticles[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Newspaper className="h-16 w-16 text-accent/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getCategoryColor(featuredArticles[0].category)}>
                  {featuredArticles[0].category}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(featuredArticles[0].publishedAt)}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors text-balance">
                {featuredArticles[0].title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {featuredArticles[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{featuredArticles[0].author}</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{featuredArticles[0].readTime} min read</span>
                </div>
                <Button variant="ghost" size="sm">
                  Read Article <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Featured */}
          <div className="space-y-4">
            {featuredArticles.slice(1, 3).map((article) => (
              <Card key={article.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2 text-pretty">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Articles Grid */}
      {!showSearchResults && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Latest News</h2>
            <span className="text-sm text-muted-foreground">
              {filteredArticles.length} articles
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedCategory === "All" ? regularArticles : filteredArticles).map((article) => (
              <Card key={article.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0 bg-card">
                {article.imageUrl && (
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2 text-pretty">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{article.source}</span>
                    </div>
                    <span>{article.readTime} min read</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {filteredArticles.length > 12 && (
            <div className="flex justify-center pt-8">
              <Button variant="outline" size="lg">
                Load More Articles
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
