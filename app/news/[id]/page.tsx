"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Bookmark,
  ExternalLink,
  Globe,
  TrendingUp,
  ChevronRight,
  Loader2,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  MessageSquare
} from "lucide-react"

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
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

interface RelatedArticle {
  id: string
  title: string
  category: string
  publishedAt: string
  imageUrl?: string
}

// Format article content from API or generate formatted content
function formatArticleContent(article: Article): string {
  // If article has full content from the API, use it
  if (article.content && article.content.length > 200) {
    // Clean up NewsAPI content (often truncated with [+XXX chars])
    const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '')
    return `
      <p class="lead">${article.excerpt}</p>
      <p>${cleanContent}</p>
      <div class="source-notice">
        <p><em>This article was originally published by <strong>${article.source}</strong>. Click the button below to read the full story on the original source.</em></p>
      </div>
    `
  }
  
  // Otherwise, show excerpt with link to source
  return `
    <p class="lead">${article.excerpt}</p>
    <p>This content is sourced from <strong>${article.source}</strong>. For the complete article with all details, analysis, and expert commentary, please visit the original source.</p>
    <div class="source-notice">
      <p><em>Click the button below to read the full story on ${article.source}.</em></p>
    </div>
  `
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

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Amazon: "bg-amber-500",
    Industry: "bg-blue-500",
    Strategy: "bg-emerald-500",
    Logistics: "bg-purple-500",
    Tech: "bg-cyan-500",
    Retail: "bg-rose-500",
    D2C: "bg-orange-500",
    Marketplaces: "bg-indigo-500",
    Policy: "bg-slate-500",
    Tools: "bg-teal-500",
  }
  return colors[category] || "bg-primary"
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      console.log("[v0] Fetching article with ID:", params.id)
      
      try {
        let foundArticle = null
        let allArticles: Article[] = []
        
        // Try RSS-based articles API first (same as homepage)
        try {
          const articlesResponse = await fetch('/api/articles?limit=100')
          const articlesData = await articlesResponse.json()
          
          console.log("[v0] Articles API response:", articlesData.success, "count:", articlesData.articles?.length)
          
          if (articlesData.success && articlesData.articles) {
            allArticles = articlesData.articles
            foundArticle = articlesData.articles.find((a: Article) => a.id === params.id)
            console.log("[v0] Found in articles API:", !!foundArticle)
            
            // Log first few IDs for debugging
            if (!foundArticle) {
              console.log("[v0] Looking for ID:", params.id)
              console.log("[v0] Available IDs (first 5):", articlesData.articles.slice(0, 5).map((a: Article) => a.id))
            }
          }
        } catch (e) {
          console.error("[v0] Failed to fetch from /api/articles:", e)
        }
        
        // If not found, try the news API
        if (!foundArticle) {
          try {
            const newsResponse = await fetch('/api/news')
            const newsData = await newsResponse.json()
            
            console.log("[v0] News API response:", newsData.success, "count:", newsData.articles?.length)
            
            if (newsData.success && newsData.articles) {
              allArticles = [...allArticles, ...newsData.articles]
              foundArticle = newsData.articles.find((a: Article) => a.id === params.id)
              console.log("[v0] Found in news API:", !!foundArticle)
            }
          } catch (e) {
            console.error("[v0] Failed to fetch from /api/news:", e)
          }
        }
        
        if (foundArticle) {
          console.log("[v0] Setting article:", foundArticle.title)
          setArticle(foundArticle)
          
          // Get related articles from same category
          const related = allArticles
            .filter((a: Article) => a.id !== params.id && a.category === foundArticle.category)
            .slice(0, 4)
          setRelatedArticles(related)
        } else {
          console.log("[v0] Article not found for ID:", params.id)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch article:", error)
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
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">Ecom Intel Hub</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleShare("copy")}>
              {copied ? <Link2 className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {article.imageUrl && (
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] max-h-[500px]">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
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
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className={`${getCategoryColor(article.category)} text-white border-0`}>
                  {article.category}
                </Badge>
                {article.breaking && (
                  <Badge className="bg-red-500 text-white border-0">Breaking</Badge>
                )}
                {article.platforms?.map((platform) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance leading-tight">
                {article.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{article.source}</span>
                </div>
              </div>
            </header>

            <Separator className="my-8" />

            {/* Article Body */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert 
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:leading-relaxed prose-p:mb-6
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                prose-ul:my-6 prose-li:my-2
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: formatArticleContent(article) }}
            />

            {/* Read Full Story Button */}
            {article.sourceUrl && article.sourceUrl !== '#' && (
              <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Read the Full Story</h3>
                    <p className="text-sm text-muted-foreground">
                      Continue reading on {article.source}
                    </p>
                  </div>
                  <Button asChild className="gap-2">
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Read on {article.source}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <Card className="border-0 bg-muted/30">
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
          <aside className="space-y-8">
            {/* Newsletter CTA */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Stay Informed</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Get the latest e-commerce news delivered to your inbox daily.
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/newsletter">Subscribe Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={`/news/${related.id}`}>
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0">
                        {related.imageUrl && (
                          <div className="aspect-video relative overflow-hidden">
                            <Image
                              src={related.imageUrl}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="300px"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <Badge variant="outline" className="text-xs mb-2">
                            {related.category}
                          </Badge>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimeAgo(related.publishedAt)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

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
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Ecom Intel Hub</span>
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
