"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getArticleFallbackImage } from "@/lib/article-images"
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  ExternalLink,
  Globe,
  TrendingUp,
  Loader2,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Sparkles,
  AlertTriangle,
  Target,
  Users,
  BarChart3,
  ArrowRight,
  Mail,
  ChevronRight,
  Zap,
  BookOpen,
  Lightbulb,
} from "lucide-react"

interface Article {
  id: string
  title: string
  summary: string
  fullContent?: string
  aiSummary?: string
  category: string
  sourceName: string
  sourceUrl: string
  publishedAt: string
  imageUrl?: string
  hasRealImage?: boolean
  platforms?: string[]
  isBreaking?: boolean
  relevanceScore?: number
  audience?: string[]
  impactLevel?: 'high' | 'medium' | 'low'
  impactDetail?: string
  actionItem?: string
  keyStat?: string | null
  tier?: number
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  return `${Math.floor(diffInHours / 24)}d ago`
}

function getReadTime(content: string): number {
  const wordCount = content.split(/\s+/).length
  return Math.max(2, Math.ceil(wordCount / 200))
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

function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Clean and format article HTML content for safe rendering.
 */
function cleanArticleHTML(html: string): string {
  if (!html) return ''
  let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  clean = clean.replace(/\son\w+="[^"]*"/gi, '')
  clean = clean.replace(/\son\w+='[^']*'/gi, '')
  return clean
}

/**
 * Strip HTML tags to get plain text length.
 */
function getPlainTextLength(html: string): number {
  if (!html) return 0
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().length
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)

      try {
        // Try dedicated article detail endpoint first
        try {
          const detailResponse = await fetch(`/api/articles/${params.id}`)
          const detailData = await detailResponse.json()

          if (detailData.success && detailData.article) {
            setArticle(detailData.article)
            if (detailData.relatedArticles) {
              setRelatedArticles(detailData.relatedArticles)
            }
            setLoading(false)
            return
          }
        } catch (e) {
          console.error("Failed to fetch from /api/articles/[id]:", e)
        }

        // Fallback: search in the main articles list
        let foundArticle = null
        let allArticles: Article[] = []

        try {
          const articlesResponse = await fetch('/api/articles?limit=100')
          const articlesData = await articlesResponse.json()

          if (articlesData.success && articlesData.articles) {
            allArticles = articlesData.articles
            foundArticle = articlesData.articles.find((a: Article) => a.id === params.id)
          }
        } catch (e) {
          console.error("Failed to fetch from /api/articles:", e)
        }

        if (foundArticle) {
          setArticle(foundArticle)
          const related = allArticles
            .filter((a: Article) => a.id !== params.id && a.category === foundArticle.category)
            .slice(0, 4)
          setRelatedArticles(related)
        }
      } catch (error) {
        console.error("Failed to fetch article:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = article?.title || ""

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank")
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "copy":
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const allContent = [article.fullContent, article.aiSummary, article.summary].filter(Boolean).join(' ')
  const readTime = getReadTime(allContent)
  const hasRichContent = getPlainTextLength(article.fullContent || '') > 300
  const hasAISummary = !!(article.aiSummary && article.aiSummary.length > 10 && article.aiSummary !== article.summary)
  const hasImpactDetail = !!(article.impactDetail && article.impactDetail.length > 5)
  const hasActionItem = !!(article.actionItem && article.actionItem.length > 5)
  const hasKeyStat = !!(article.keyStat && article.keyStat.length > 2)
  const hasAudience = !!(article.audience && article.audience.length > 0)
  const hasAnyInsight = hasAISummary || hasImpactDetail || hasActionItem || hasKeyStat

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">MarketplaceBeta</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare("copy")}>
              {copied ? <Link2 className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {article.imageUrl && (
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] max-h-[450px]">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}

      {/* Article Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`${CATEGORY_COLORS[article.category] || 'bg-primary'} text-white border-0`}>
                  {formatCategoryLabel(article.category)}
                </Badge>
                {article.isBreaking && (
                  <Badge className="bg-red-500 text-white border-0">Breaking</Badge>
                )}
                {article.impactLevel && (
                  <Badge
                    variant="outline"
                    className={`${
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
                    }`}>&#9679;</span>
                    {article.impactLevel.charAt(0).toUpperCase() + article.impactLevel.slice(1)} Impact
                  </Badge>
                )}
                {article.platforms?.map((platform) => (
                  <Badge key={platform} variant="outline" className="text-xs capitalize">
                    {platform.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-balance leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {article.sourceName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </span>
                {hasAnyInsight && (
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
            </header>

            {/* ========================================================= */}
            {/* AI INTELLIGENCE BRIEF — The star of the page               */}
            {/* ========================================================= */}
            {hasAnyInsight && (
              <div className="bg-primary/5 rounded-xl p-6 md:p-8 mb-8 border border-primary/20">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-primary">AI Intelligence Brief</h2>
                    <p className="text-xs text-muted-foreground">Automated analysis by MarketplaceBeta</p>
                  </div>
                </div>

                {/* AI Summary — the main analysis paragraph */}
                {hasAISummary && (
                  <div className="mb-6">
                    <p className="text-base md:text-lg leading-relaxed">
                      {article.aiSummary}
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Key Stat */}
                  {hasKeyStat && (
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key Stat</span>
                      </div>
                      <p className="font-bold text-lg">{article.keyStat}</p>
                    </div>
                  )}

                  {/* Impact Assessment */}
                  {article.impactLevel && (
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          article.impactLevel === 'high' ? 'text-red-500'
                          : article.impactLevel === 'medium' ? 'text-amber-500'
                          : 'text-green-500'
                        }`} />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Impact</span>
                      </div>
                      <p className={`font-bold ${
                        article.impactLevel === 'high' ? 'text-red-600'
                        : article.impactLevel === 'medium' ? 'text-amber-600'
                        : 'text-green-600'
                      }`}>
                        {article.impactLevel.charAt(0).toUpperCase() + article.impactLevel.slice(1)} Impact
                      </p>
                      {hasImpactDetail && (
                        <p className="text-sm text-muted-foreground mt-1">{article.impactDetail}</p>
                      )}
                    </div>
                  )}

                  {/* Action Item */}
                  {hasActionItem && (
                    <div className="bg-background rounded-lg p-4 border sm:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommended Action</span>
                      </div>
                      <p className="text-sm font-medium">{article.actionItem}</p>
                    </div>
                  )}

                  {/* Audience */}
                  {hasAudience && (
                    <div className="bg-background rounded-lg p-4 border sm:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Relevant For</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {article.audience!.map(aud => (
                          <Badge key={aud} variant="secondary" className="capitalize">
                            {aud.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* ========================================================= */}
            {/* ARTICLE BODY — Rich content or expanded summary             */}
            {/* ========================================================= */}
            {hasRichContent ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-bold text-xl">Full Coverage</h2>
                </div>
                <div
                  className="prose prose-lg max-w-none dark:prose-invert
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-p:leading-relaxed prose-p:mb-6
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6
                    prose-blockquote:italic prose-blockquote:bg-muted/30 prose-blockquote:py-4
                    prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                    prose-ul:my-6 prose-li:my-2
                    prose-strong:text-foreground
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: cleanArticleHTML(article.fullContent || '') }}
                />
              </>
            ) : (
              <div className="space-y-8">
                {/* When there's no full RSS content, make the summary the main body */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-bold text-xl">Summary</h2>
                  </div>
                  <p className="text-lg leading-relaxed text-foreground">
                    {article.summary}
                  </p>
                </div>

                {/* If AI summary is different from summary, show it as additional analysis */}
                {hasAISummary && (
                  <div className="bg-muted/30 rounded-xl p-6 border">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <h3 className="font-bold text-base">Our Take</h3>
                    </div>
                    <p className="leading-relaxed text-foreground">{article.aiSummary}</p>
                  </div>
                )}

                {/* What This Means section — helps fill content when RSS is thin */}
                {(hasImpactDetail || hasActionItem) && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <h2 className="font-bold text-xl">What This Means for Sellers</h2>
                    </div>

                    {hasImpactDetail && (
                      <div className="pl-4 border-l-2 border-primary/30">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide mb-2">Impact Assessment</h4>
                        <p className="leading-relaxed">{article.impactDetail}</p>
                      </div>
                    )}

                    {hasActionItem && (
                      <div className="pl-4 border-l-2 border-emerald-500/30">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide mb-2">What You Should Do</h4>
                        <p className="leading-relaxed">{article.actionItem}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Separator className="my-8" />

            {/* Source Attribution — small, non-distracting */}
            {article.sourceUrl && article.sourceUrl !== '#' && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span>
                  Source: {article.sourceName}
                  {' · '}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View original
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
            )}

            {/* Share */}
            <Card className="border-0 bg-muted/30 mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Share this article</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" onClick={() => handleShare("twitter")}>
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare("linkedin")}>
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare("facebook")}>
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => handleShare("copy")}>
                    <Link2 className="h-4 w-4 mr-2" />
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Newsletter CTA */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="p-6">
                <Mail className="h-6 w-6 mb-3" />
                <h3 className="font-bold text-lg mb-2">Daily Marketplace Brief</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Get the most important e-commerce news delivered to your inbox daily.
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/newsletter">Subscribe Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div>
                <h3 className="font-bold text-base mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={`/news/${related.id}`}>
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0 mb-4">
                        {related.imageUrl && (
                          <div className="aspect-video relative overflow-hidden">
                            <Image
                              src={related.imageUrl}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="300px"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                const fallback = getArticleFallbackImage(
                                  related.title,
                                  related.category,
                                  related.platforms || []
                                )
                                if (target.src !== fallback) {
                                  target.src = fallback
                                }
                              }}
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <Badge variant="outline" className="text-xs mb-2">
                            {formatCategoryLabel(related.category)}
                          </Badge>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-2">
                            {related.sourceName} &middot; {formatTimeAgo(related.publishedAt)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tools CTA */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm mb-3">Seller Tools</h3>
                <div className="space-y-2">
                  {[
                    { name: "Profit Calculator", href: "/tools#calculator" },
                    { name: "Listing Optimizer", href: "/tools#listing" },
                    { name: "Keyword Research", href: "/tools#keywords" },
                  ].map((tool) => (
                    <Link key={tool.name} href={tool.href} className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors text-sm">
                      {tool.name}
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Back to Home */}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All News
              </Link>
            </Button>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold">MarketplaceBeta</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
              <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
              <Link href="/newsletter" className="hover:text-foreground transition-colors">Newsletter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
