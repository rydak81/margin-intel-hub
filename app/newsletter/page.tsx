"use client"

import { trackResourceEvent } from "@/lib/resource-analytics"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { EditorialIntro } from "@/components/editorial-intro"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { SiteBrand } from "@/components/site-brand"
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

      trackResourceEvent("newsletter_signup", "newsletter_page")
      setSubmitted(true)
    } catch (submitError) {
      console.error("Subscribe error:", submitError)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="newsletter" deskLabel="Daily Brief" backHref="/" backLabel="Home" />

      <main className="mx-auto max-w-7xl px-4 py-10">
        {submitted ? (
          <div className="mx-auto max-w-3xl">
            <Card className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 text-white editorial-elevated">
              <CardContent className="p-8 text-center md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 editorial-elevated">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <Badge className="border-white/10 bg-white/10 text-white">Subscription confirmed</Badge>
                <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">You&apos;re in.</h1>
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
            <Card className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 text-white editorial-elevated">
              <CardContent className="p-8 text-center md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <Mail className="h-10 w-10 text-sky-300" />
                </div>
                <Badge className="border-white/10 bg-white/10 text-white">Already subscribed</Badge>
                <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">You&apos;re already on the list.</h1>
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
              <EditorialIntro eyebrow="The daily brief" title="A clearer start to your operating day." description="Marketplace developments, platform changes, and research worth your attention. Read the context, follow the sources, and decide what matters for your business." />

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <Card className="rounded-xl border border-slate-800 bg-slate-950 text-white">
                  <CardContent className="p-6 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Read before you subscribe</p>
                    <h2 className="mt-4 text-2xl font-bold">The operator briefing, on the web.</h2>
                    <p className="mt-4 leading-7 text-slate-300">Explore the current briefing and its supporting coverage. Follow the source links to investigate the developments relevant to your business.</p>
                    <Button asChild className="mt-6 bg-white text-slate-950 hover:bg-slate-100"><Link href="/news">Read the current briefing →</Link></Button>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="rounded-xl border border-border bg-white editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900">
                    <CardContent className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/48">What you get</p>
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

                  <Card className="rounded-xl border border-border bg-white editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900">
                    <CardContent className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/48">Why teams subscribe</p>
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/6">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-white/56">
                            <Clock className="h-4 w-4 text-sky-600" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Daily cadence</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-white/78">Wake up with one clean read instead of piecing together signal from twenty tabs.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/6">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-white/56">
                            <BarChart3 className="h-4 w-4 text-sky-600" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Operator lens</span>
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
                  <Card key={item.title} className="rounded-xl border border-border bg-white editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900">
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
              <Card className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 text-white editorial-elevated">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Subscribe Free</p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight">Join the brief</h2>
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
                      Free to subscribe. Unsubscribe anytime.

                    </p>
                  </form>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: Clock, label: "Schedule", value: "7am ET" },
                      { icon: Users, label: "Audience", value: "Operators" },
                      { icon: Zap, label: "Read Time", value: "5 min" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center">
                        <item.icon className="mx-auto h-4 w-4 text-sky-300" />
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/46">{item.label}</p>
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

      <PremiumSiteFooter />
    </div>
  )
}
