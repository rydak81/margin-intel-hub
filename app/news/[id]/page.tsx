import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Lightbulb,
  ListChecks,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react"
import { AdBanner } from "@/components/AdBanner"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getArticleFallbackImage, getArticleImageUrl } from "@/lib/article-images"
import type { ClassifiedArticle } from "@/lib/ai-classifier"
import { getLatestPulseArticles, getRelevantCommunityTopics } from "@/lib/community-intelligence"
import { getArticleById, getRelatedArticles } from "@/lib/article-store"
import { getSourceIntelligence } from "@/lib/source-intelligence"
import { getActivePlacements } from "@/lib/sponsors"
import { LinkedInPostGenerator } from "@/components/linkedin-post-generator"

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

type ContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] }

function paragraphize(content: string | undefined): ContentBlock[] {
  if (!content) return []

  const normalized = content
    .replace(/<\/(p|div|section|article|h1|h2|h3|h4|blockquote)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(ul|ol)>/gi, "\n\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim()

  if (!normalized) return []

  return normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)

      if (lines.length > 0 && lines.every((line) => line.startsWith("• "))) {
        return [{ type: "list", items: lines.map((line) => line.replace(/^•\s*/, "").trim()) } satisfies ContentBlock]
      }

      return [{ type: "paragraph", content: block.replace(/\s+/g, " ").trim() } satisfies ContentBlock]
    })
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
  const contentBlocks = paragraphize(article.fullContent || article.summary || article.aiSummary)
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
  const sourceIntelligence = getSourceIntelligence(article.sourceName, article.sourceType)
  const [operatorNotes, pulseArticles] = await Promise.all([
    getRelevantCommunityTopics(article, 3),
    getLatestPulseArticles(2),
  ])
  const latestPulse = pulseArticles.find((pulse) => pulse.id !== article.id)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"
  const articleUrl = `${siteUrl}/news/${article.id}`
  const articleDescription = article.aiSummary || article.summary || "Read the full analysis on MarketplaceBeta"
  const standfirst = article.aiSummary || article.summary
  const intelligenceHighlights = [
    article.whatThisMeans
      ? {
          label: "Why It Matters",
          icon: Target,
          content: article.whatThisMeans,
        }
      : null,
    article.ourTake
      ? {
          label: "Operator Take",
          icon: Lightbulb,
          content: article.ourTake,
        }
      : null,
    article.actionItem
      ? {
          label: "What To Do Next",
          icon: ListChecks,
          content: article.actionItem,
        }
      : null,
    article.relatedContext
      ? {
          label: "Context",
          icon: BookOpen,
          content: article.relatedContext,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; icon: typeof Target; content: string }>

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: articleDescription,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    image: [articleImage],
    mainEntityOfPage: articleUrl,
    publisher: {
      "@type": "Organization",
      name: "MarketplaceBeta",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand-icon.png`,
      },
    },
    author: {
      "@type": "Organization",
      name: article.sourceName || "MarketplaceBeta",
    },
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent_22%),linear-gradient(180deg,rgba(248,250,252,0.7),transparent_30%)] bg-background">
      <Script
        id={`news-article-jsonld-${article.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <PremiumSiteHeader active="news" deskLabel="Intelligence Brief" backHref="/news" backLabel="News Desk" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge>{formatCategoryLabel(article.category)}</Badge>
              <Badge variant="secondary">{sourceIntelligence.label}</Badge>
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

            {standfirst ? (
              <div className="mt-8 rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.16em]">Executive Summary</span>
                </div>
                <p className="mt-4 text-lg leading-8 text-foreground/90 md:text-xl md:leading-9">
                  {standfirst}
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {intelligenceHighlights.map((highlight) => (
                <Card key={highlight.label} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <highlight.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{highlight.label}</span>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{highlight.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {article.impactDetail || article.bottomLine ? (
              <Card className="mt-6 border-0 shadow-sm bg-primary/[0.04]">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Decision Snapshot</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Operational Impact</p>
                      <p className="mt-3 text-base leading-8 text-foreground/90">
                        {article.impactDetail || "This story may require teams to revisit workflows, monitoring, or platform assumptions."}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Bottom Line</p>
                      <p className="mt-3 text-base leading-8 text-foreground/90">
                        {article.bottomLine || "Treat this as an operator signal worth monitoring rather than a passive headline."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="mt-6 border-0 shadow-sm">
              <CardContent className="grid gap-4 p-6 md:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Source Lens</p>
                  <p className="mt-2 text-sm font-semibold">{sourceIntelligence.label}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{sourceIntelligence.description}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Impact Level</p>
                  <p className="mt-2 text-sm font-semibold capitalize">{article.impactLevel || "medium"}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {article.bottomLine || "Use this briefing to decide whether your team needs an immediate workflow, policy, or reporting change."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Key Stat / Trigger</p>
                  <p className="mt-2 text-sm font-semibold">{article.keyStat || "No single quantitative trigger surfaced in this report."}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Focus on the operational implication, not just the headline.
                  </p>
                </div>
              </CardContent>
            </Card>

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
              <div className="rounded-[28px] border border-white/70 bg-white/86 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 md:p-8">
                <div className="space-y-6">
                  {contentBlocks.length > 0 ? (
                    contentBlocks.map((block, index) =>
                      block.type === "paragraph" ? (
                        <p
                          key={`${article.id}-paragraph-${index}`}
                          className={`text-[1.05rem] leading-8 text-slate-700 dark:text-slate-200 ${
                            index === 0
                              ? "first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-foreground"
                              : ""
                          }`}
                        >
                          {block.content}
                        </p>
                      ) : (
                        <div
                          key={`${article.id}-list-${index}`}
                          className="rounded-2xl border border-white/70 bg-white/72 p-5 dark:border-white/10 dark:bg-white/5"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Key points from the source
                          </p>
                          <ul className="mt-4 space-y-3">
                            {block.items.map((item) => (
                              <li key={item} className="flex gap-3 text-[1.02rem] leading-8 text-slate-700 dark:text-slate-200">
                                <ChevronRight className="mt-2 h-4 w-4 flex-shrink-0 text-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )
                ) : (
                    <p className="text-[1.05rem] leading-8 text-slate-700 dark:text-slate-200">{article.summary}</p>
                )}
              </div>
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
              <Card className="mt-8 border-0 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Original Source</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      This briefing is based on reporting from <span className="font-semibold text-foreground">{article.sourceName}</span>. Use the original post for full primary-source context.
                    </p>
                  </div>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View original
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            ) : null}

            <div className="mt-8">
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

            <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader>
                <CardTitle className="text-base">Source Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary">{sourceIntelligence.label}</Badge>
                <p className="text-sm leading-7 text-muted-foreground">{sourceIntelligence.description}</p>
                <div className="rounded-2xl border border-white/70 bg-white/76 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Why it matters</p>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    MarketplaceBeta uses source quality to separate direct platform changes from community chatter and general industry context.
                  </p>
                </div>
              </CardContent>
            </Card>

            {operatorNotes.length > 0 ? (
              <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
                <CardHeader>
                  <CardTitle className="text-base">Operator Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {operatorNotes.map((note) => (
                    <div key={note.id} className="rounded-2xl border border-white/70 bg-white/76 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Waves className="h-4 w-4 text-sky-600" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                          {note.sourcePlatform.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6">{note.title}</p>
                      {note.bodySnippet ? (
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{note.bodySnippet}</p>
                      ) : null}
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>{note.upvotes} upvotes</span>
                        <span>{note.commentCount} comments</span>
                        <span>{formatTimeAgo(note.publishedAt)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {latestPulse ? (
              <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] text-white dark:border-white/10">
                <CardContent className="p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Operator Pulse</p>
                  <h3 className="mt-2 text-lg font-bold">{latestPulse.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/76">{latestPulse.summary}</p>
                  <Button asChild variant="secondary" className="mt-4 w-full">
                    <Link href={`/news/${latestPulse.id}`}>Read the pulse</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

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
              <Link href="/news">Back to News Desk</Link>
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

      <PremiumSiteFooter />
    </div>
  )
}
