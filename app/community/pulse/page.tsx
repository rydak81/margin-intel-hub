import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  MessageSquareText,
  Sparkles,
  TrendingUp,
  Waves,
} from "lucide-react"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCommunitySnapshot, getLatestPulseArticles } from "@/lib/community-intelligence"

export const metadata: Metadata = {
  title: "Operator Pulse | MarketplaceBeta",
  description: "MarketplaceBeta's operator pulse on what sellers, agencies, and SaaS teams are discussing across the marketplace ecosystem.",
  alternates: {
    canonical: "https://marketplacebeta.com/community/pulse",
  },
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  return `${Math.floor(diffInHours / 24)}d ago`
}

export default async function CommunityPulsePage() {
  const [pulseArticles, snapshot] = await Promise.all([
    getLatestPulseArticles(6),
    getCommunitySnapshot(),
  ])

  const featuredPulse = pulseArticles[0]
  const recentPulses = pulseArticles.slice(1)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <PremiumSiteHeader active="community" deskLabel="Operator Pulse" backHref="/community" backLabel="Community" />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84)_48%,rgba(239,246,255,0.82))] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(15,23,42,0.74)_48%,rgba(30,41,59,0.82))] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/76 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <Waves className="h-4 w-4 text-sky-600" />
                <span className="text-muted-foreground">
                  Live seller and operator sentiment from MarketplaceBeta community intelligence
                </span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.68))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
                Operator intelligence built from real discussions
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
                The daily pulse on{" "}
                <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                  what operators are actually seeing
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Operator Pulse turns seller conversations, community signal, and platform chatter into a cleaner market read for agencies, brands, SaaS teams, and executives.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95">
                  <Link href={featuredPulse ? `/news/${featuredPulse.id}` : "/community"}>
                    Read the latest pulse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/60 bg-white/70 dark:border-white/10 dark:bg-slate-950/40">
                  <Link href="/community">Join the operator network</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Card className="border-white/70 bg-white/78 dark:border-white/10 dark:bg-slate-950/45">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <BrainCircuit className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Pulse Briefs</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{pulseArticles.length}</p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/78 dark:border-white/10 dark:bg-slate-950/45">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <TrendingUp className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Themes</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{snapshot.topThemes.length}</p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/78 dark:border-white/10 dark:bg-slate-950/45">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <MessageSquareText className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Live Signals</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{snapshot.hotTopics.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            {featuredPulse ? (
              <Card className="overflow-hidden border border-white/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] text-white shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] dark:border-white/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">Featured Pulse</Badge>
                    <span className="text-sm text-white/60">{formatTimeAgo(featuredPulse.publishedAt)}</span>
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-tight">{featuredPulse.title}</h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-white/76">
                    {featuredPulse.summary}
                  </p>
                  {featuredPulse.sentimentSummary ? (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Sentiment Read</p>
                      <p className="mt-2 text-sm leading-7 text-white/78">{featuredPulse.sentimentSummary}</p>
                    </div>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {featuredPulse.themes.slice(0, 5).map((theme) => (
                      <Badge key={theme} className="border-white/10 bg-white/10 text-white hover:bg-white/10">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="mt-6 bg-white text-slate-950 hover:bg-white/90">
                    <Link href={`/news/${featuredPulse.id}`}>
                      Open pulse article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Pulse briefs will appear here as community intelligence is processed and published.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {recentPulses.map((pulse) => (
                <Link key={pulse.id} href={`/news/${pulse.id}`}>
                  <Card className="h-full border-white/70 bg-white/82 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-950/45">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                        <BarChart3 className="h-4 w-4 text-sky-600" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Recent Pulse</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{pulse.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{pulse.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pulse.themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="secondary">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader>
                <CardTitle className="text-base">Top Themes This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.topThemes.length > 0 ? (
                  snapshot.topThemes.map((theme) => (
                    <div key={theme.theme} className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/76 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <span className="text-sm font-medium capitalize">{theme.theme}</span>
                      <Badge variant="secondary">{theme.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Theme counts will appear after more community topics are processed.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/82 dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader>
                <CardTitle className="text-base">Live Discussion Radar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {snapshot.hotTopics.length > 0 ? (
                  snapshot.hotTopics.map((topic) => (
                    <div key={topic.id} className="rounded-2xl border border-white/70 bg-white/76 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-semibold leading-6">{topic.title}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {topic.sourcePlatform.replace(/_/g, " ")}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>{topic.upvotes} upvotes</span>
                        <span>{topic.commentCount} comments</span>
                        <span>{formatTimeAgo(topic.publishedAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent discussion signals yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                  Next step
                </p>
                <h3 className="mt-2 text-lg font-bold">Turn signal into conversations</h3>
                <p className="mt-3 text-sm leading-7 text-primary-foreground/80">
                  Use the community to find operators, agencies, service providers, and product teams talking about the same themes you are tracking here.
                </p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/community">
                    Open the operator network
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
