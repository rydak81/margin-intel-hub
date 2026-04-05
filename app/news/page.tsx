import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, ArrowRight, BellRing, BookOpenText, CalendarDays, CircleDot, Sparkles, Target } from "lucide-react"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getArticleImageUrl } from "@/lib/article-images"
import { getDailyOperatorBriefing } from "@/lib/news-briefing"

export const metadata: Metadata = {
  title: "News | MarketplaceBeta",
  description: "MarketplaceBeta’s daily operator briefing with seller alerts, action items, and curated source coverage.",
  alternates: {
    canonical: "https://marketplacebeta.com/news",
  },
}

export const dynamic = "force-dynamic"

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString))
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)))
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

export default async function NewsPage() {
  const { briefing, articles } = await getDailyOperatorBriefing()
  const topCoverage = articles.slice(0, 8)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader active="news" deskLabel="News Desk" backHref="/" backLabel="Home" />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88)_48%,rgba(239,246,255,0.84))] p-6 shadow-[0_36px_90px_-44px_rgba(15,23,42,0.35)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(15,23,42,0.78)_52%,rgba(30,41,59,0.8))] md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-white/75 px-3 py-1.5 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-sky-300/15 dark:bg-slate-950/50 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-sky-600" />
                Daily operator intelligence briefing
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-balance text-slate-950 dark:text-white md:text-5xl">
                {briefing.headline}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {briefing.dek}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 dark:border-white/10 dark:bg-slate-950/40">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  {formatDate(briefing.generatedAt)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 dark:border-white/10 dark:bg-slate-950/40">
                  <BookOpenText className="h-4 w-4 text-sky-600" />
                  {articles.length} curated stories
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {briefing.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-6 text-white shadow-[0_30px_80px_-42px_rgba(15,23,42,0.55)]">
              <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/62">
                Today&apos;s operator actions
              </div>
              <div className="mt-6 space-y-4">
                {briefing.actionItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <p className="text-sm leading-6 text-white/82">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                  Coverage mix
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {briefing.categoryMix.map((item) => (
                    <Badge
                      key={item.label}
                      className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/84"
                    >
                      {item.label} · {item.count}
                    </Badge>
                  ))}
                </div>
                <Button
                  asChild
                  className="mt-6 w-full border border-white/10 bg-white text-slate-950 hover:bg-slate-100"
                >
                  <Link href="/articles">
                    Browse full article archive
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Seller alerts</h2>
            </div>
            <div className="mt-5 space-y-3">
              {briefing.sellerAlerts.map((alert) => (
                <div key={alert} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{alert}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
            <div className="flex items-center gap-2">
              <CircleDot className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Top signals today</h2>
            </div>
            <div className="mt-5 space-y-4">
              {briefing.signals.map((signal) => (
                <Link
                  key={signal.articleId}
                  href={`/news/${signal.articleId}`}
                  className="block rounded-[24px] border border-slate-200/70 bg-slate-50/85 p-5 transition hover:border-sky-300/40 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {signal.platforms.map((platform) => (
                      <Badge
                        key={platform}
                        className="rounded-full border border-sky-300/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200"
                      >
                        {platform}
                      </Badge>
                    ))}
                    {signal.impactLevel ? (
                      <Badge className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                        {signal.impactLevel} impact
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-slate-950 dark:text-white">
                    {signal.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {signal.summary}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-800 dark:text-slate-100">
                    <span className="font-semibold">Operator read:</span> {signal.whyItMatters}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {signal.source}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
                Source coverage
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Curated article coverage</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Below the briefing, MarketplaceBeta keeps the strongest supporting coverage so operators can click into the underlying reporting without wading through repeated versions of the same story.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/35">
              <Link href="/articles">Open archive filters</Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {topCoverage.map((article) => {
              const imageUrl = getArticleImageUrl(
                article.imageUrl,
                article.title,
                article.category,
                article.platforms || [],
                article.fullContent
              )

              return (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_34px_78px_-40px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950/45"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <Image
                      src={imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                        {article.platforms?.[0] || "multi-platform"}
                      </Badge>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold leading-tight text-slate-950 transition group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-200">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {article.aiSummary || article.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>{article.sourceName}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-200">
                        Read details
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
