"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
  Mail,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Target,
  Users,
  TrendingUp,
} from "lucide-react"

interface NewsArticle {
  id: string
  title: string
  excerpt: string
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
    
    const url = article.sourceUrl || window.location.href
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
        // Could add a toast notification here
        break
    }
  }

  if (!article) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
<SheetHeader className="text-left">
              <SheetTitle className="text-sm font-normal text-muted-foreground">
                Article Preview
              </SheetTitle>
              <SheetDescription className="sr-only">
                Preview of the selected article with options to read the full story
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
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
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
            {/* AI Impact Badge */}
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
            {/* AI Enhanced indicator */}
            {article.aiSummary && (
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

          {/* Source & Date */}
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

          {/* Excerpt */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {article.aiSummary || article.excerpt}
          </p>

          {/* AI Insights Section */}
          {(article.impactLevel || article.actionItem || article.keyStat || article.audience?.length) && (
            <div className="bg-muted/30 rounded-xl p-5 mb-6 border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI Insights</span>
              </div>
              
              <div className="grid gap-4">
                {/* Impact Assessment */}
                {article.impactLevel && (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      article.impactLevel === 'high' ? 'text-red-500' 
                      : article.impactLevel === 'medium' ? 'text-amber-500' 
                      : 'text-green-500'
                    }`} />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Impact Level
                      </span>
                      <p className={`text-sm font-medium ${
                        article.impactLevel === 'high' ? 'text-red-600' 
                        : article.impactLevel === 'medium' ? 'text-amber-600' 
                        : 'text-green-600'
                      }`}>
                        {article.impactLevel.charAt(0).toUpperCase() + article.impactLevel.slice(1)} Impact
                      </p>
                      {article.impactDetail && (
                        <p className="text-sm text-muted-foreground mt-1">{article.impactDetail}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Key Stat */}
                {article.keyStat && (
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
                
                {/* Action Item */}
                {article.actionItem && (
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Action Item
                      </span>
                      <p className="text-sm text-foreground">{article.actionItem}</p>
                    </div>
                  </div>
                )}
                
                {/* Audience */}
                {article.audience && article.audience.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Relevant For
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {article.audience.map(aud => (
                          <Badge key={aud} variant="secondary" className="text-xs capitalize">
                            {aud}
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

          {/* Read Full Article CTA */}
          <div className="bg-primary/5 rounded-xl p-6 mb-8 border border-primary/20">
            <h3 className="font-semibold mb-2">Read the Full Story</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Continue reading on {article.source} for the complete article, analysis, and expert commentary.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <a 
                href={article.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Read on {article.source}
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

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

          <Separator className="my-8" />

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Related Stories</h3>
              <div className="space-y-4">
                {relatedArticles.map(related => (
                  <Card 
                    key={related.id} 
                    className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      // Update to show the related article
                      onOpenChange(false)
                      setTimeout(() => {
                        window.location.href = `/news/${related.id}`
                      }, 100)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {related.imageUrl && (
                          <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={related.imageUrl}
                              alt={related.title}
                              fill
                              className="object-cover"
                              sizes="80px"
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

          <Separator className="my-8" />

          {/* Newsletter CTA */}
          <div className="bg-primary text-primary-foreground rounded-xl p-6">
            <Mail className="h-8 w-8 mb-3" />
            <h3 className="font-bold mb-2">Get stories like this daily</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Join 5,000+ e-commerce professionals who start their day with the Daily Marketplace Brief.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground text-foreground flex-1"
              />
              <Button variant="secondary" asChild>
                <Link href="/newsletter">
                  Subscribe
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
