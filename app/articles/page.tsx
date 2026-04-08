"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getArticleFallbackImage } from "@/lib/article-images"
import { SiteLogo } from "@/components/site-logo"
import {
  Search,
  X,
  ChevronDown,
  Loader2,
  ArrowLeft,
  BarChart3,
  TrendingUp,
} from "lucide-react"

interface Article {
  id: string
  title: string
  summary: string
  category: string
  sourceName: string
  publishedAt: string
  imageUrl?: string
  platforms?: string[]
  impactLevel?: 'high' | 'medium' | 'low'
  relevanceScore?: number
}

interface SearchResponse {
  success: boolean
  articles: Article[]
  total: number
  facets: {
    categories: Record<string, number>
    platforms: Record<string, number>
    impactLevels: Record<string, number>
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  breaking: 'bg-red-500',
  platform_updates: 'bg-blue-500',
  market_metrics: 'bg-teal-500',
  profitability: 'bg-emerald-500',
  mergers_acquisitions: 'bg-purple-500',
  tools_technology: 'bg-cyan-500',
  advertising: 'bg-orange-500',
  logistics: 'bg-slate-500',
  events: 'bg-pink-500',
  tactics: 'bg-yellow-600',
  compliance_policy: 'bg-violet-500',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  return `${Math.floor(diffInHours / 24)}d ago`
}

function formatCategoryLabel(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function ArticlesPage() {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null)
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "relevant" | "impact">("newest")
  const [articles, setArticles] = useState<Article[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [facets, setFacets] = useState({
    categories: {} as Record<string, number>,
    platforms: {} as Record<string, number>,
    impactLevels: {} as Record<string, number>,
  })
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 12

  const fetchArticles = useCallback(
    async (resetOffset = true) => {
      setLoading(true)
      const newOffset = resetOffset ? 0 : offset
      if (resetOffset) setOffset(0)
      try {
        const params = new URLSearchParams({
          q: query, sort: sortBy, limit: limit.toString(), offset: newOffset.toString(),
        })
        if (selectedCategory) params.append("category", selectedCategory)
        if (selectedPlatforms.length > 0) params.append("platforms", selectedPlatforms.join(","))
        if (selectedImpact) params.append("impact", selectedImpact)
        if (selectedAudience) params.append("audience", selectedAudience)

        const response = await fetch(`/api/articles/search?${params.toString()}`)
        const data: SearchResponse = await response.json()
        if (data.success) {
          if (resetOffset) { setArticles(data.articles) } else { setArticles(prev => [...prev, ...data.articles]) }
          setTotalCount(data.total)
          setFacets(data.facets)
          setHasMore(newOffset + data.articles.length < data.total)
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error)
      } finally {
        setLoading(false)
      }
    },
    [query, selectedCategory, selectedPlatforms, selectedImpact, selectedAudience, sortBy, offset]
  )

  useEffect(() => { fetchArticles(true) }, [query, selectedCategory, selectedPlatforms, selectedImpact, selectedAudience, sortBy])

  const loadMore = () => { const newOffset = offset + limit; setOffset(newOffset); fetchArticles(false) }
  const clearFilters = () => { setQuery(""); setSelectedCategory(null); setSelectedPlatforms([]); setSelectedImpact(null); setSelectedAudience(null); setSortBy("newest"); setOffset(0) }
  const togglePlatform = (platform: string) => { setSelectedPlatforms(prev => prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]); setOffset(0) }
  const activeFilters = [query, selectedCategory, selectedPlatforms.length > 0, selectedImpact, selectedAudience].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
          <SiteLogo size="sm" />
          <div className="w-32" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search Articles</h1>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search by title, summary, or keywords..." value={query} onChange={(e) => { setQuery(e.target.value); setOffset(0) }} className="pl-10 h-10" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Category Filter */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors">
                <span className="text-sm font-medium">Category</span><ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-lg shadow-lg p-2 hidden group-hover:block z-20">
                <button onClick={() => setSelectedCategory(null)} className={`w-full text-left px-3 py-2 rounded text-sm ${!selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All Categories</button>
                {Object.entries(facets.categories).map(([cat, count]) => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat); setOffset(0) }} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span>{formatCategoryLabel(cat)}</span><span className="text-xs opacity-70">({count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors">
                <span className="text-sm font-medium">Platforms</span>
                {selectedPlatforms.length > 0 && <Badge variant="secondary" className="text-xs">{selectedPlatforms.length}</Badge>}
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-lg shadow-lg p-2 hidden group-hover:block z-20">
                <button onClick={() => { setSelectedPlatforms([]); setOffset(0) }} className={`w-full text-left px-3 py-2 rounded text-sm ${selectedPlatforms.length === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All Platforms</button>
                {Object.entries(facets.platforms).map(([platform, count]) => (
                  <button key={platform} onClick={() => togglePlatform(platform)} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between ${selectedPlatforms.includes(platform) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span>{platform.replace(/_/g, " ")}</span><span className="text-xs opacity-70">({count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Filter */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors">
                <span className="text-sm font-medium">Impact</span><ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-40 bg-background border rounded-lg shadow-lg p-2 hidden group-hover:block z-20">
                <button onClick={() => { setSelectedImpact(null); setOffset(0) }} className={`w-full text-left px-3 py-2 rounded text-sm ${!selectedImpact ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All Levels</button>
                {Object.entries(facets.impactLevels).map(([level, count]) => (
                  <button key={level} onClick={() => { setSelectedImpact(level); setOffset(0) }} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between ${selectedImpact === level ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span><span className="text-xs opacity-70">({count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="relative group ml-auto">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors">
                <span className="text-sm font-medium">Sort</span><ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full right-0 mt-1 w-40 bg-background border rounded-lg shadow-lg p-2 hidden group-hover:block z-20">
                {[{ value: "newest", label: "Newest First" }, { value: "oldest", label: "Oldest First" }, { value: "relevant", label: "Most Relevant" }, { value: "impact", label: "Highest Impact" }].map(option => (
                  <button key={option.value} onClick={() => { setSortBy(option.value as any); setOffset(0) }} className={`w-full text-left px-3 py-2 rounded text-sm ${sortBy === option.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{option.label}</button>
                ))}
              </div>
            </div>

            {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-2"><X className="h-4 w-4 mr-1" />Clear ({activeFilters})</Button>}
          </div>

          <p className="text-sm text-muted-foreground">
            {totalCount > 0 ? `Showing ${Math.min(offset + limit, totalCount)} of ${totalCount} articles` : "No articles found"}
          </p>
        </div>

        {loading && articles.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Searching articles...</p></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No articles match your filters.</p>
            <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map(article => (
                <Link key={article.id} href={`/news/${article.id}`}>
                  <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full flex flex-col border-0">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image src={article.imageUrl || getArticleFallbackImage(article.title, article.category, article.platforms || [])} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => { const target = e.currentTarget as HTMLImageElement; const fallback = getArticleFallbackImage(article.title, article.category, article.platforms || []); if (target.src !== fallback) { target.src = fallback } }} />
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <div className="mb-3"><Badge className={`${CATEGORY_COLORS[article.category] || 'bg-primary'} text-white border-0`}>{formatCategoryLabel(article.category)}</Badge></div>
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">{article.summary}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.platforms?.slice(0, 2).map(platform => (<Badge key={platform} variant="secondary" className="text-xs">{platform.replace(/_/g, ' ')}</Badge>))}
                        {article.impactLevel && (
                          <Badge variant="outline" className={`text-xs ${article.impactLevel === 'high' ? 'border-red-500/50 text-red-600' : article.impactLevel === 'medium' ? 'border-amber-500/50 text-amber-600' : 'border-green-500/50 text-green-600'}`}>
                            <span className={`mr-1 ${article.impactLevel === 'high' ? 'text-red-500' : article.impactLevel === 'medium' ? 'text-amber-500' : 'text-green-500'}`}>●</span>{article.impactLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{article.sourceName} • {formatDate(article.publishedAt)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mb-8">
                <Button variant="outline" onClick={loadMore} disabled={loading} className="gap-2">
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Loading...</>) : (<><TrendingUp className="h-4 w-4" />Load More Articles</>)}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
