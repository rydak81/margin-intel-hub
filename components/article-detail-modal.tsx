"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  ExternalLink,
  Clock,
  Globe,
  Share2,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  X,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Lightbulb,
} from "lucide-react"
import { getArticleFallbackImage } from "@/lib/article-images"
import { LinkedInPostGenerator } from "@/components/linkedin-post-generator"

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  fullContent?: string
  category: string
  source: string
  sourceUrl: string
  publishedAt: string
  readTime: number
  imageUrl?: string
  platforms?: string[]
  featured?: boolean
  // AI Enrichment fields
  audience?: string[]
  impactLevel?: 'high' | 'medium' | 'low'
  impactDetail?: string
  actionItem?: string
  keyStat?: string | null
  aiSummary?: string
  ourTake?: string
  whatThisMeans?: string
  keyTakeaways?: string[]
  relatedContext?: string
  bottomLine?: string
}

interface ArticleDetailModalProps {
  article: NewsArticle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  allArticles: NewsArticle[]
}

export function ArticleDetailModal({
  article,
  open,
  onOpenChange,
  allArticles
}: ArticleDetailModalProps) {
  // Get related articles from the same category
  const relatedArticles = useMemo(() => {
    if (!article) return []
    return allArticles
      .filter(a => a.id !== article.id && a.category === article.category)
      .slice(0, 3)
  }, [article, allArticles])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    if (!article) return

    // Share the on-site article URL, not the source
    const url = `${window.location.origin}/news/${article.id}`
    const text = article.title

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        break
    }
  }

  if (!article) return null

  const formatAudience = (tag: string) => tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const hasAISummary = !!(article.aiSummary && article.aiSummary.length > 10 && article.aiSummary !== article.excerpt)
  const hasOurTake = !!(article.ourTake && article.ourTake.length > 10)
  const hasKeyTakeaways = !!(article.keyTakeaways && article.keyTakeaways.length > 0)
  const hasKeyStat = !!(article.keyStat && article.keyStat.length > 2)
  const hasBottomLine = !!(article.bottomLine && article.bottomLine.length > 5)
  const hasAudience = !!(article.audience && article.audience.length > 0)
  const hasAnyInsight = hasAISummary || hasOurTake || hasKeyTakeaways || hasBottomLine

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
          <SheetHeader className="text-left">
            <SheetTitle className="text-sm font-normal text-muted-foreground">
              Article Preview
            </SheetTitle>
            <SheetDescription className="sr-only">
              Preview of the selected article with AI analysis
            </SheetDescription>
          </SheetHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Image */}
          {article.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget
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
          )}

          {/* Meta Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge>{article.category}</Badge>
            {article.platforms?.map(platform => (
              <Badge key={platform} variant="outline">
                {platform}
              </Badge>
            ))}
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
                }`}>●</span>
                {article.impactLevel.charAt(0).toUpperCase() + article.impactLevel.slice(1)} Impact
              </Badge>
            )}
            {hasAnyInsight && (
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight mb-4 text-balance">
            {article.title}
          </h1>

          {/* Source & Date — small, non-distracting */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {article.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime} min read
            </span>
          </div>

          {/* ========================================================= */}
          {/* AI ANALYSIS — Show everything inline, keep users engaged   */}
          {/* ========================================================= */}

          {/* Main summary/analysis */}
          <div className="mb-6">
            <p className="text-base leading-relaxed">
              {hasAISummary ? article.aiSummary : article.excerpt}
            </p>
          </div>

          {/* AI Intelligence Brief — Phase 5 four-section design */}
          {hasAnyInsight && (
            <div className="bg-primary/5 rounded-xl p-5 mb-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI Intelligence Brief</span>
              </div>

              <div className="grid gap-4">
                {/* The Operator's Edge */}
                {hasOurTake && (
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        The Operator&apos;s Edge
                      </span>
                      <p className="text-sm text-foreground italic">{article.ourTake}</p>
                    </div>
                  </div>
                )}

                {/* Key Stat */}
                {hasKeyStat && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Key Stat
                      </span>
                      <p className="text-sm font-semibold text-foreground">{article.keyStat}</p>
                    </div>
                  </div>
                )}

                {/* Moves to Make */}
                {hasKeyTakeaways && (
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Moves to Make
                      </span>
                      <ul className="mt-1 space-y-1">
                        {article.keyTakeaways!.map((point, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-1">&#8226;</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* The Bottom Line */}
                {hasBottomLine && (
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      The Bottom Line
                    </span>
                    <p className="text-sm font-medium text-foreground">{article.bottomLine}</p>
                  </div>
                )}

                {/* Audience */}
                {hasAudience && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Relevant For
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {article.audience!.map(aud => (
                          <Badge key={aud} variant="secondary" className="text-xs">
                            {formatAudience(aud)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Published Date */}
          <p className="text-sm text-muted-foreground mb-6">
            Published: {formatDate(article.publishedAt)}
          </p>

          {/* Read Full Analysis CTA — keeps user ON SITE */}
          <div className="bg-primary/5 rounded-xl p-6 mb-6 border border-primary/20">
            <h3 className="font-semibold mb-2">Read Full Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View the complete article with full coverage, AI insights, and related stories.
            </p>
            <Button asChild className="w-full">
              <Link href={`/news/${article.id}`} onClick={() => onOpenChange(false)}>
                Read Full Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Source link — small, de-emphasized inline text */}
          {article.sourceUrl && article.sourceUrl !== '#' && (
            <p className="text-xs text-muted-foreground mb-8">
              Source: {article.source}
              {' · '}
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                View original
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          )}

          {/* Share Buttons */}
          <div className="mb-8">
            <h4 className="text-sm font-medium mb-3">Share this article</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy')}
                className="gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <LinkedInPostGenerator
              article={{
                id: article.id,
                title: article.title,
                aiSummary: article.aiSummary,
                ourTake: article.ourTake,
                keyTakeaways: article.keyTakeaways,
                bottomLine: article.bottomLine,
                keyStat: article.keyStat,
                category: article.category,
                platforms: article.platforms,
              }}
            />
          </div>

          <Separator className="my-8" />

          {/* Related Stories — keeps users browsing on-site */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Related Stories</h3>
              <div className="space-y-4">
                {relatedArticles.map(related => (
                  <Card
                    key={related.id}
                    className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      onOpenChange(false)
                      setTimeout(() => {
                        window.location.href = `/news/${related.id}`
                      }, 100)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {related.imageUrl && (
                          <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                            <img
                              src={related.imageUrl}
                              alt={related.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget
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
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs mb-1">
                            {related.category}
                          </Badge>
                          <h4 className="font-medium text-sm line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {related.source}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
