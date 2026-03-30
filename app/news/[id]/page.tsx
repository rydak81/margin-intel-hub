import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"
import { AdBanner } from "@/components/AdBanner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getArticleFallbackImage, getArticleImageUrl } from "@/lib/article-images"
import type { ClassifiedArticle } from "@/lib/ai-classifier"
import { getArticleById, getRelatedArticles } from "@/lib/article-store"
import { getActivePlacements } from "@/lib/sponsors"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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

function formatCategoryLabel(category: string): string {
  return category.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatAudience(tag: string): string {
  return tag.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function getReadTime(content: string): number {
  const wordCount = content.split(/\s+/).length
  return Math.max(2, Math.ceil(wordCount / 200))
}

function stripHtml(html: string | undefined): string {
  if (!html) return ""
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function paragraphize(content: string | undefined): string[] {
  const plainText = stripHtml(content)
  if (!plainText) return []

  return plainText
    .split(/\s{2,}|\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function resolveArticleImage(article: Pick<ClassifiedArticle, "imageUrl" | "title" | "category" | "platforms" | "fullContent">): string {
  return getArticleImageUrl(
    article.imageUrl,
    article.title,
    article.category,
    article.platforms || [],
    article.fullContent
  )
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticleById(id)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(id, article.category, 4)
  const articleImage = resolveArticleImage(article)
  const contentText = stripHtml(article.fullContent || article.summary || article.aiSummary || "")
  const paragraphs = paragraphize(article.fullContent || article.summary || article.aiSummary)
  const readTime = getReadTime(contentText)
  const articleSideBanners = getActivePlacements("article", "sidebar", {
    topic: article.category,
    audiences: article.audience || [],
  })
  const articleInlineBanners = getActivePlacements("article", "inline", {
    topic: article.category,
    audiences: article.audience || [],
  })
  const articleFooterBanners = getActivePlacements("article", "footer", {
    topic: article.category,
    audiences: article.audience || [],
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
            <span className="font-bold text-lg hidden sm:block">MarketplaceBeta</span>
          </Link>
          <div className="w-24 sm:w-32" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge>{formatCategoryLabel(article.category)}</Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
            </div>

            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">{article.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {article.sourceName}
              </span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
              {article.platforms?.slice(0, 3).map((platform) => (
                <Badge key={platform} variant="outline" className="capitalize">
                  {platform.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>

            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted">
              <Image
                src={articleImage}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 960px"
                priority
              />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {article.aiSummary ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">AI Summary</span>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{article.aiSummary}</p>
                  </CardContent>
                </Card>
              ) : null}
              {article.whatThisMeans ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">What This Means</span>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{article.whatThisMeans}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {article.ourTake ? (
              <Card className="mt-6 border-0 shadow-sm bg-primary/[0.04]">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Operator Take</span>
                  </div>
                  <p className="text-base leading-8 text-foreground/90">{article.ourTake}</p>
                </CardContent>
              </Card>
            ) : null}

            {article.audience && article.audience.length > 0 ? (
              <Card className="mt-6 border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Relevant For</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.audience.map((audience) => (
                      <Badge key={audience} variant="secondary">
                        {formatAudience(audience)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Separator className="my-8" />

            {articleInlineBanners.map((placement) => (
              <AdBanner
                key={placement.id}
                sponsor={placement.sponsor}
                variant="inline"
                dismissible={placement.dismissible}
              />
            ))}

            <section className="mt-8">
              <div className="mb-5 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Full Coverage</h2>
              </div>
              <div className="space-y-6">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p
                      key={`${article.id}-paragraph-${index}`}
                      className={`text-lg leading-8 text-muted-foreground ${
                        index === 0
                          ? "first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-foreground"
                          : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-lg leading-8 text-muted-foreground">{article.summary}</p>
                )}
              </div>
            </section>

            {article.keyTakeaways && article.keyTakeaways.length > 0 ? (
              <Card className="mt-8 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Key Takeaways</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {article.keyTakeaways.map((takeaway) => (
                    <div key={takeaway} className="flex gap-3">
                      <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                      <p className="text-sm leading-7 text-muted-foreground">{takeaway}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {article.sourceUrl ? (
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>Source: {article.sourceName}</span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View original
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : null}
          </article>

          <aside className="space-y-6">
            {articleSideBanners.map((placement) => (
              <AdBanner
                key={placement.id}
                sponsor={placement.sponsor}
                variant="sidebar"
                dismissible={placement.dismissible}
              />
            ))}

            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="p-6">
                <Mail className="h-6 w-6 mb-3" />
                <h3 className="font-bold text-lg mb-2">Daily Marketplace Brief</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Get the most important marketplace news delivered to your inbox daily.
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/newsletter">Subscribe Free</Link>
                </Button>
              </CardContent>
            </Card>

            {relatedArticles.length > 0 ? (
              <div>
                <h3 className="font-bold text-base mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => {
                    const relatedImage = related.imageUrl
                      ? resolveArticleImage(related)
                      : getArticleFallbackImage(related.title, related.category, related.platforms || [])

                    return (
                      <Link key={related.id} href={`/news/${related.id}`}>
                        <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-all border-0 mb-4">
                          <div className="aspect-video relative overflow-hidden">
                            <Image
                              src={relatedImage}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="320px"
                            />
                          </div>
                          <CardContent className="p-4">
                            <Badge variant="outline" className="text-xs mb-2">
                              {formatCategoryLabel(related.category)}
                            </Badge>
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                              {related.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-2">
                              {related.sourceName} · {formatTimeAgo(related.publishedAt)}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All News
              </Link>
            </Button>
          </aside>
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4">
        {articleFooterBanners.map((placement) => (
          <AdBanner
            key={placement.id}
            sponsor={placement.sponsor}
            variant="footer"
            dismissible={placement.dismissible}
          />
        ))}
      </div>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
              <span className="font-bold">MarketplaceBeta</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/articles" className="hover:text-foreground transition-colors">Articles</Link>
              <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
              <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
              <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
              <Link href="/newsletter" className="hover:text-foreground transition-colors">Newsletter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
