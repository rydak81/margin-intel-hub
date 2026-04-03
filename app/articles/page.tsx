"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { getArticleFallbackImage } from "@/lib/article-images"
import { useAuthAccount } from "@/hooks/use-auth-account"
import { buildUserPreferenceProfile, getNewsDeskDefaults, getPersonalizationLabel } from "@/lib/personalization"
import {
  Search,
  X,
  Loader2,
  BarChart3,
  TrendingUp,
  Sparkles,
  Mail,
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

interface ArticlesPageProps {
  mode?: "articles" | "news"
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

export default function ArticlesPage({ mode = "articles" }: ArticlesPageProps) {
  const { currentUser, metadata } = useAuthAccount()
  const preferenceProfile = useMemo(() => buildUserPreferenceProfile(metadata), [metadata])
  const newsDeskDefaults = useMemo(() => getNewsDeskDefaults(preferenceProfile), [preferenceProfile])
  const personalizationLabel = useMemo(() => getPersonalizationLabel(preferenceProfile), [preferenceProfile])
  const defaultsAppliedRef = useRef(false)
  const isNewsDesk = mode === "news"
  const deskLabel = isNewsDesk ? "News Desk" : "Articles Desk"
  const heroPillCopy = isNewsDesk
    ? "Search, sort, and filter the full MarketplaceBeta news desk"
    : "Search, sort, and filter the full MarketplaceBeta reporting archive"
  const heroHeadlineAccent = isNewsDesk ? "marketplace news desk" : "marketplace intelligence archive"
  const heroDescription = isNewsDesk
    ? "Track the latest MarketplaceBeta reporting by topic, platform, and impact level so operators, agencies, and SaaS teams can stay current without losing the premium desk experience."
    : "Explore every MarketplaceBeta story by topic, platform, and impact level so operators, agencies, and SaaS teams can find the exact signal they need fast."

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

  useEffect(() => {
    if (!currentUser || defaultsAppliedRef.current) return
    defaultsAppliedRef.current = true

    if (newsDeskDefaults.platforms.length > 0) setSelectedPlatforms(newsDeskDefaults.platforms)
    if (newsDeskDefaults.category) setSelectedCategory(newsDeskDefaults.category)
    if (newsDeskDefaults.audience) setSelectedAudience(newsDeskDefaults.audience)
    if (newsDeskDefaults.platforms.length > 0 || newsDeskDefaults.category || newsDeskDefaults.audience) {
      setSortBy("relevant")
    }
  }, [currentUser, newsDeskDefaults])

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
  const categoryCount = Object.keys(facets.categories).length

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader
        active={isNewsDesk ? "news" : "articles"}
        deskLabel={deskLabel}
        backHref="/"
        backLabel="Home"
      />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <section className="mb-10">
          <div className="rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84)_48%,rgba(239,246,255,0.82))] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(15,23,42,0.72)_48%,rgba(30,41,59,0.8))] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/76 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-sky-300/15 dark:bg-slate-950/60">
                  <Search className="h-4 w-4 text-sky-600" />
                  <span className="text-slate-600 dark:text-slate-200">
                    {heroPillCopy}
                  </span>
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-balance md:text-5xl lg:text-6xl">
                  Search the{" "}
                  <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                    {heroHeadlineAccent}
                  </span>
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  {heroDescription}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <TrendingUp className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Results</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{totalCount || articles.length}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <BarChart3 className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Categories</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{categoryCount || 'All'}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <Search className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Filters</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{activeFilters || 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[26px] border border-white/70 bg-white/76 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              {currentUser && personalizationLabel ? (
                <div className="mb-5 rounded-2xl border border-sky-400/15 bg-sky-500/5 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-sky-300/15 dark:bg-slate-950/55 dark:text-slate-200">
                  <span className="font-semibold text-slate-950 dark:text-white">Personalized desk:</span> {personalizationLabel}. MarketplaceBeta is preloading filters and ranking from your account preferences.
                </div>
              ) : null}

              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, summary, or keywords..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOffset(0) }}
                  className="h-12 border-white/40 bg-white/85 pl-10 text-base shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45"
                />
              </div>

              <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px_auto]">
                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                    Category
                  </span>
                  <select
                    value={selectedCategory ?? ""}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value || null)
                      setOffset(0)
                    }}
                    className="h-11 w-full rounded-2xl border border-white/50 bg-white/80 px-4 text-sm font-medium text-slate-900 shadow-sm backdrop-blur outline-none transition focus:border-sky-400/30 dark:border-white/10 dark:bg-slate-950/45 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {Object.entries(facets.categories).map(([cat, count]) => (
                      <option key={cat} value={cat}>
                        {formatCategoryLabel(cat)} ({count})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                    Impact
                  </span>
                  <select
                    value={selectedImpact ?? ""}
                    onChange={(e) => {
                      setSelectedImpact(e.target.value || null)
                      setOffset(0)
                    }}
                    className="h-11 w-full rounded-2xl border border-white/50 bg-white/80 px-4 text-sm font-medium text-slate-900 shadow-sm backdrop-blur outline-none transition focus:border-sky-400/30 dark:border-white/10 dark:bg-slate-950/45 dark:text-white"
                  >
                    <option value="">All Levels</option>
                    {Object.entries(facets.impactLevels).map(([level, count]) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)} ({count})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                    Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as "newest" | "oldest" | "relevant" | "impact")
                      setOffset(0)
                    }}
                    className="h-11 w-full rounded-2xl border border-white/50 bg-white/80 px-4 text-sm font-medium text-slate-900 shadow-sm backdrop-blur outline-none transition focus:border-sky-400/30 dark:border-white/10 dark:bg-slate-950/45 dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="relevant">Most Relevant</option>
                    <option value="impact">Highest Impact</option>
                  </select>
                </label>

                {activeFilters > 0 ? (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-11 rounded-2xl px-4">
                      <X className="mr-1 h-4 w-4" />
                      Clear ({activeFilters})
                    </Button>
                  </div>
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>

              {Object.keys(facets.platforms).length > 0 ? (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                      Platforms
                    </span>
                    {selectedPlatforms.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlatforms([])
                          setOffset(0)
                        }}
                        className="text-xs font-medium text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                      >
                        Reset platforms
                      </button>
                    ) : null}
                  </div>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                    {Object.entries(facets.platforms).map(([platform, count]) => {
                      const selected = selectedPlatforms.includes(platform)
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                            selected
                              ? "border-sky-400/25 bg-sky-500/10 text-sky-700 dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-200"
                              : "border-white/50 bg-white/78 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200 dark:hover:bg-slate-900"
                          }`}
                        >
                          <span>{platform.replace(/_/g, " ")}</span>
                          <span className="text-xs opacity-70">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <p className="text-sm text-muted-foreground">
                {totalCount > 0 ? `Showing ${Math.min(offset + limit, totalCount)} of ${totalCount} articles` : "No articles found"}
              </p>
            </div>
          </div>
        </section>

        {loading && articles.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Searching articles...</p></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-[28px] border border-white/60 bg-white/84 py-16 text-center shadow-[0_22px_60px_-38px_rgba(15,23,42,0.26)] dark:border-white/10 dark:bg-slate-950/45">
            <p className="mb-4 text-muted-foreground">No articles match your filters.</p>
            <Button variant="outline" onClick={clearFilters} className="rounded-full">Clear filters</Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map(article => (
                <Link key={article.id} href={`/news/${article.id}`}>
                  <Card className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/84 shadow-[0_22px_54px_-34px_rgba(15,23,42,0.28)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_70px_-36px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/45">
                    {article.imageUrl && (
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <Image src={article.imageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => { const target = e.currentTarget as HTMLImageElement; const fallback = getArticleFallbackImage(article.title, article.category, article.platforms || []); if (target.src !== fallback) { target.src = fallback } }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4">
                          <Badge className={`${CATEGORY_COLORS[article.category] || 'bg-primary'} border-0 text-white shadow-lg`}>
                            {formatCategoryLabel(article.category)}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-7 transition-colors group-hover:text-primary">{article.title}</h3>
                      <p className="mb-4 flex-grow line-clamp-3 text-sm leading-6 text-muted-foreground">{article.summary}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.platforms?.slice(0, 2).map(platform => (<Badge key={platform} variant="secondary" className="rounded-full border border-sky-400/10 bg-sky-500/8 text-xs">{platform.replace(/_/g, ' ')}</Badge>))}
                        {article.impactLevel && (
                          <Badge variant="outline" className={`text-xs ${article.impactLevel === 'high' ? 'border-red-500/50 text-red-600' : article.impactLevel === 'medium' ? 'border-amber-500/50 text-amber-600' : 'border-green-500/50 text-green-600'}`}>
                            <span className={`mr-1 ${article.impactLevel === 'high' ? 'text-red-500' : article.impactLevel === 'medium' ? 'text-amber-500' : 'text-green-500'}`}>●</span>{article.impactLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-white/50 pt-3 text-xs text-muted-foreground dark:border-white/10">
                        <p>{article.sourceName} • {formatDate(article.publishedAt)}</p>
                        <span className="font-semibold text-primary">Read story</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mb-8">
                <Button variant="outline" onClick={loadMore} disabled={loading} className="gap-2 rounded-full border-sky-400/20 bg-white/84 px-6 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:hover:bg-slate-900">
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Loading...</>) : (<><TrendingUp className="h-4 w-4" />Load More Articles</>)}
                </Button>
              </div>
            )}

            <section className="mb-8 mt-12">
              <div className="grid gap-6 rounded-[30px] border border-white/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92)_52%,rgba(55,48,163,0.88))] p-6 text-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.68)] md:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/82 backdrop-blur">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    Premium marketplace intelligence for operators, agencies, and SaaS teams
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-tight text-balance md:text-4xl">
                    Turn the archive into a daily operating advantage.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 md:text-lg">
                    Follow the latest platform shifts, deal flow, profitability signals, and operator tactics with a cleaner desk experience built for decision-makers.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-white/92">
                      <Link href="/newsletter">
                        <Mail className="mr-2 h-4 w-4" />
                        Get the Daily Brief
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-white/8 text-white hover:bg-white/12">
                      <Link href="/partners">Explore Partners</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Archive Depth</p>
                    <p className="mt-3 text-3xl font-black text-white">{totalCount || articles.length}+</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">Search across reporting built for marketplace teams, operators, and partner-led growth.</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Best For</p>
                    <p className="mt-3 text-xl font-bold text-white">Decision-ready signal</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">Use the archive to prep outreach, brief leadership, and track the commerce moves that matter.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
