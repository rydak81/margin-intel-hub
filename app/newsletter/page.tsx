"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Mail,
  Check,
  Clock,
  Users,
  Zap,
  Loader2,
  Building,
  ShoppingBag,
  Wrench,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
} from "lucide-react"

const ROLES = [
  { id: "brand_seller", label: "Brand / Seller", icon: ShoppingBag },
  { id: "agency", label: "Agency", icon: Building },
  { id: "saas_tech", label: "SaaS / Tech", icon: Wrench },
  { id: "investor", label: "Investor", icon: TrendingUp },
  { id: "service_provider", label: "Service Provider", icon: Briefcase },
  { id: "other", label: "Other", icon: MoreHorizontal },
]

const FEATURES = [
  "Breaking news from Amazon, Walmart, TikTok Shop, and the broader marketplace ecosystem",
  "Fee, policy, and platform changes that affect operator decisions fast",
  "M&A activity, funding rounds, and ecosystem movement worth tracking",
  "Actionable tactics from top sellers, operators, and agency leaders",
  "Tool recommendations and software shifts that impact workflow",
  "Market data and trend context you can actually use in conversations",
]

const SOCIAL_PROOF = [
  { metric: "5,000+", label: "Subscribers" },
  { metric: "5 min", label: "Average Read" },
  { metric: "45%", label: "Open Rate" },
  { metric: "Daily", label: "Delivery" },
]

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [company, setCompany] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setEmail(value)
    setEmailError(null)
    setError(null)
    setAlreadySubscribed(false)

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address")
    }
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((previous) =>
      previous.includes(roleId)
        ? previous.filter((role) => role !== roleId)
        : [...previous, roleId]
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setAlreadySubscribed(false)

    if (!email) {
      setEmailError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    if (selectedRoles.length === 0) {
      setError("Please select at least one role")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim() || undefined,
          company: company.trim() || undefined,
          role: selectedRoles[0],
          source: "newsletter_page",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "already_subscribed") {
          setAlreadySubscribed(true)
        } else {
          setError(data.error || "Failed to subscribe. Please try again.")
        }
        return
      }

      setSubmitted(true)
    } catch (submitError) {
      console.error("Subscribe error:", submitError)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_34%)] bg-background">
      <PremiumSiteHeader active="newsletter" deskLabel="Daily Brief" backHref="/" backLabel="Home" />

      <main className="mx-auto max-w-7xl px-4 py-10">
        {submitted ? (
          <div className="mx-auto max-w-3xl">
            <Card className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(49,46,129,0.9))] text-white shadow-[0_34px_90px_-42px_rgba(15,23,42,0.74)]">
              <CardContent className="p-8 text-center md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_20px_50px_-24px_rgba(16,185,129,0.68)]">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <Badge className="border-white/10 bg-white/10 text-white">Subscription confirmed</Badge>
                <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">You&apos;re in.</h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/74">
                  Welcome to the Daily Marketplace Brief. Check your inbox for a confirmation message. Your first edition will land at 7am ET with the top platform shifts, operator signals, and commerce moves to know.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-white/92">
                    <Link href="/">Read today&apos;s news</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/12 bg-white/6 text-white hover:bg-white/10 hover:text-white">
                    <Link href="/tools">Explore seller tools</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : alreadySubscribed ? (
          <div className="mx-auto max-w-3xl">
            <Card className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(49,46,129,0.9))] text-white shadow-[0_34px_90px_-42px_rgba(15,23,42,0.74)]">
              <CardContent className="p-8 text-center md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <Mail className="h-10 w-10 text-sky-300" />
                </div>
                <Badge className="border-white/10 bg-white/10 text-white">Already subscribed</Badge>
                <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">You&apos;re already on the list.</h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/74">
                  Great news. You should already be receiving the Daily Marketplace Brief each weekday at 7am ET. If you don&apos;t see it, check spam or promotions first.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-white/92">
                    <Link href="/">Read today&apos;s news</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/12 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      setAlreadySubscribed(false)
                      setEmail("")
                    }}
                  >
                    Try different email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <section className="rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84)_48%,rgba(239,246,255,0.82))] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(15,23,42,0.74)_48%,rgba(30,41,59,0.8))] md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/76 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <Mail className="h-4 w-4 text-sky-600" />
                  <span className="text-muted-foreground">
                    Free weekday briefing for <span className="font-semibold text-foreground">sellers, agencies, SaaS teams, and operators</span>
                  </span>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.68))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                  <Zap className="h-3.5 w-3.5 text-fuchsia-500" />
                  Premium Morning Brief for Marketplace Teams
                </div>

                <h1 className="mt-5 text-4xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
                  Start every morning with the{" "}
                  <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                    Daily Marketplace Brief
                  </span>
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  Join 5,000+ commerce professionals who want the most important marketplace news, platform moves, policy changes, and operator-grade takeaways in 5 minutes or less.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {SOCIAL_PROOF.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">{item.label}</p>
                      <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{item.metric}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <Card className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.68)]">
                  <CardContent className="relative overflow-hidden p-6 md:p-7">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.16),transparent_22%)]" />
                    <div className="relative">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Sample Briefing</p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/28 via-cyan-300/14 to-fuchsia-400/24 blur-sm" />
                          <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={36} height={36} className="relative h-9 w-9 rounded-lg object-cover ring-1 ring-sky-400/20" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">The Daily Marketplace Brief</p>
                          <p className="text-xs text-white/54">Tuesday, March 31, 2026</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border-0 bg-amber-500 text-white">Breaking</Badge>
                          <Badge className="border-white/10 bg-white/8 text-white">Platform</Badge>
                          <Badge className="border-white/10 bg-white/8 text-white">Strategy</Badge>
                        </div>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-white/80">
                          <p>Amazon tightens policy language around profitability pressure and fee transparency.</p>
                          <p>TikTok Shop expands fulfillment coverage while more operators rethink multi-channel margin mix.</p>
                          <p>Investor and operator sentiment is rotating toward infrastructure, retention, and operational efficiency.</p>
                        </div>
                        <p className="mt-5 text-xs italic text-white/48">+ 5 more stories and quick takes in the full brief</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                    <CardContent className="p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/48">What you get</p>
                      <div className="mt-4 space-y-3">
                        {FEATURES.slice(0, 3).map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                    <CardContent className="p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/48">Why teams subscribe</p>
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/6">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-white/56">
                            <Clock className="h-4 w-4 text-sky-600" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Daily cadence</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-white/78">Wake up with one clean read instead of piecing together signal from twenty tabs.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/6">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-white/56">
                            <BarChart3 className="h-4 w-4 text-sky-600" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Operator lens</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-white/78">We prioritize what actually changes decisions for sellers, agencies, and commerce software teams.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <section className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: ShoppingBag,
                    title: "For sellers",
                    body: "Fee changes, platform moves, catalog strategy, and the tactics that shape margin and growth.",
                  },
                  {
                    icon: Building,
                    title: "For agencies",
                    body: "Client-facing signal you can turn into outreach, strategy decks, and better partnership conversations.",
                  },
                  {
                    icon: Wrench,
                    title: "For SaaS teams",
                    body: "Market shifts, operator pain points, and ecosystem changes that help shape product and positioning.",
                  },
                ].map((item) => (
                  <Card key={item.title} className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                    <CardContent className="p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>
            </div>

            <div className="xl:sticky xl:top-24">
              <Card className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.68)]">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Subscribe Free</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight">Join the brief</h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                      <Mail className="h-5 w-5 text-sky-300" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-white/72">
                    Get the best marketplace coverage in one clean morning edition. Free, fast, and built for operator relevance.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        className={`h-12 border-white/10 bg-white/8 text-white placeholder:text-white/36 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {emailError ? <p className="text-sm text-red-300">{emailError}</p> : null}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="h-12 border-white/10 bg-white/8 text-white placeholder:text-white/36"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-white/80">Company</Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Acme Inc."
                          value={company}
                          onChange={(event) => setCompany(event.target.value)}
                          className="h-12 border-white/10 bg-white/8 text-white placeholder:text-white/36"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white/80">What best describes you? *</Label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {ROLES.map((role) => (
                          <div
                            key={role.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleRole(role.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                toggleRole(role.id)
                              }
                            }}
                            className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                              selectedRoles.includes(role.id)
                                ? "border-sky-400/40 bg-sky-400/10"
                                : "border-white/10 bg-white/6 hover:bg-white/10"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                selectedRoles.includes(role.id)
                                  ? "border-sky-400 bg-sky-400 text-slate-950"
                                  : "border-white/20"
                              }`}
                            >
                              {selectedRoles.includes(role.id) ? <Check className="h-3 w-3" /> : null}
                            </div>
                            <role.icon className="h-4 w-4 text-white/60" />
                            <span className="text-sm text-white/86">{role.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-white text-slate-950 hover:bg-white/92"
                      disabled={isSubmitting || !email || selectedRoles.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe to Daily Brief
                          <Mail className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {error ? (
                      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3">
                        <p className="text-center text-sm text-red-200">{error}</p>
                      </div>
                    ) : null}

                    <p className="text-center text-xs leading-6 text-white/48">
                      Free forever. No spam. Unsubscribe anytime.
                      <br />
                      By subscribing, you agree to our{" "}
                      <Link href="/privacy" className="underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </form>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: Clock, label: "Schedule", value: "7am ET" },
                      { icon: Users, label: "Readers", value: "5,000+" },
                      { icon: Zap, label: "Read Time", value: "5 min" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center">
                        <item.icon className="mx-auto h-4 w-4 text-sky-300" />
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
            <div>
              <p className="font-semibold text-white">MarketplaceBeta</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Daily Brief</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/articles" className="transition-colors hover:text-white">
              Articles
            </Link>
            <Link href="/partners" className="transition-colors hover:text-white">
              Partners
            </Link>
            <Link href="/tools" className="transition-colors hover:text-white">
              Tools
            </Link>
            <Link href="/community" className="transition-colors hover:text-white">
              Community
            </Link>
            <Link href="/events" className="transition-colors hover:text-white">
              Events
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
