import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Handshake,
  Mail,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import { SponsorLogo } from "@/components/SponsorLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ALL_SPONSORS, getModuleTypeLabel, type SponsorConfig } from "@/lib/sponsors"

function PartnerVisual({ sponsor }: { sponsor: SponsorConfig }) {
  if (sponsor.id === "threecolts") {
    return (
      <div className="relative h-full min-h-[240px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(87,169,247,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(189,82,249,0.18),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-5 text-white">
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute right-0 top-16 h-40 w-40 rounded-full bg-fuchsia-500/16 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-28 w-28 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <SponsorLogo
              name={sponsor.name}
              logoUrl={sponsor.logoUrl}
              sizes="160px"
              className="h-12 w-40 rounded-full border-white/15 bg-white px-3"
              imageClassName="p-3"
              fallbackClassName="text-sm"
            />
            <div className="mt-5 space-y-1">
              <p className="text-[clamp(1.65rem,2.8vw,2.8rem)] font-black leading-[0.94] tracking-[-0.05em] text-sky-300">
                Keep more.
              </p>
              <p className="text-[clamp(1.65rem,2.8vw,2.8rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                Sell more.
              </p>
              <p className="text-[clamp(1.65rem,2.8vw,2.8rem)] font-black leading-[0.94] tracking-[-0.05em] text-fuchsia-300">
                Scale faster.
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/74">
              The operating system for marketplace teams that need profitability, automation, and operational visibility in one stack.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["Operator stack", "Agency fit", "Partner growth"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Featured Angle</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">{sponsor.highlights[0]}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sponsor.id === "marginpro") {
    return (
      <div className="relative h-full min-h-[240px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.16),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-5 text-white">
        <div className="absolute -right-8 top-6 h-28 w-28 rounded-full bg-teal-300/14 blur-3xl" />
        <div className="absolute -left-8 bottom-6 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <SponsorLogo
              name={sponsor.name}
              logoUrl={sponsor.logoUrl}
              sizes="96px"
              className="h-12 w-12 rounded-2xl border-white/15 bg-white"
              imageClassName="p-2"
              fallbackClassName="text-sm"
            />
            <div className="mt-5 space-y-1">
              <p className="text-[clamp(1.55rem,2.5vw,2.55rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                Know your
              </p>
              <p className="text-[clamp(1.55rem,2.5vw,2.55rem)] font-black leading-[0.94] tracking-[-0.05em] text-teal-300">
                true margins.
              </p>
              <p className="text-[clamp(1.55rem,2.5vw,2.55rem)] font-black leading-[0.94] tracking-[-0.05em] text-white/88">
                Recover profit.
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/74">
              A profitability command center for Amazon operators tracking fees, reimbursements, ad spend, and hidden margin leaks.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["Fees", "Reimbursements", "Profit"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Featured Angle</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">{sponsor.highlights[1]}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sponsor.id === "cedcommerce") {
    return (
      <div className="relative h-full min-h-[240px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.2),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-5 text-white">
        <div className="absolute -right-10 top-8 h-32 w-32 rounded-full bg-indigo-400/16 blur-3xl" />
        <div className="absolute left-6 bottom-0 h-24 w-24 rounded-full bg-violet-400/12 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <SponsorLogo
              name={sponsor.name}
              logoUrl={sponsor.logoUrl}
              sizes="96px"
              className="h-12 w-12 rounded-2xl border-white/15 bg-white"
              imageClassName="p-2"
              fallbackClassName="text-sm"
            />
            <div className="mt-5 space-y-1">
              <p className="text-[clamp(1.5rem,2.45vw,2.45rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                Connect more
              </p>
              <p className="text-[clamp(1.5rem,2.45vw,2.45rem)] font-black leading-[0.94] tracking-[-0.05em] text-indigo-300">
                channels.
              </p>
              <p className="text-[clamp(1.5rem,2.45vw,2.45rem)] font-black leading-[0.94] tracking-[-0.05em] text-white/88">
                Scale cleanly.
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/74">
              A multi-channel operations layer for syncing catalog, inventory, and orders across marketplaces without adding chaos.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["Amazon", "Walmart", "TikTok Shop"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Featured Angle</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">{sponsor.highlights[0]}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sponsor.id === "marketplacepulse") {
    return (
      <div className="relative h-full min-h-[240px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.16),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95))] p-5 text-white">
        <div className="absolute -right-10 top-8 h-32 w-32 rounded-full bg-sky-400/14 blur-3xl" />
        <div className="absolute -left-8 bottom-6 h-32 w-32 rounded-full bg-slate-200/8 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
              Research Partner
            </Badge>
            <div className="mt-5 space-y-1">
              <p className="text-[clamp(1.75rem,3vw,2.7rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                Everyone has
              </p>
              <p className="text-[clamp(1.75rem,3vw,2.7rem)] font-black leading-[0.94] tracking-[-0.05em] text-sky-300">
                an opinion.
              </p>
              <p className="text-[clamp(1.75rem,3vw,2.7rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                We have data.
              </p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/74">
              Market structure, seller movement, and benchmark context for teams that need signal stronger than hot takes.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["Data", "Research", "Analysis"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Featured Signal</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">{sponsor.highlights[0]}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-[240px] overflow-hidden rounded-[26px] border border-white/10 bg-slate-100/5">
      {sponsor.bannerImageUrl ? (
        <Image
          src={sponsor.bannerImageUrl}
          alt={sponsor.bannerImageAlt || sponsor.name}
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover"
          style={{ objectPosition: sponsor.imageFocus?.inline || "center center" }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06),rgba(2,6,23,0.3)_52%,rgba(2,6,23,0.72))]" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
          {getModuleTypeLabel(sponsor.moduleType)}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/84">{sponsor.trustLabel}</p>
      </div>
    </div>
  )
}

export default function PartnersPage() {
  const featuredSponsor = ALL_SPONSORS.find((sponsor) => sponsor.id === "threecolts") || ALL_SPONSORS[0]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.76))] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)] pointer-events-none" />
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white sm:inline-flex"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-sky-400/28 via-cyan-300/14 to-fuchsia-400/24 blur-sm" />
                <Image
                  src="/brand-icon.png"
                  alt="MarketplaceBeta logo"
                  width={32}
                  height={32}
                  className="relative h-8 w-8 rounded-lg object-cover ring-1 ring-sky-400/20"
                />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold leading-none text-white">MarketplaceBeta</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  Partner Marketplace
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/articles" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Articles
            </Link>
            <Link href="/partners" className="text-sm font-semibold text-white">
              Partners
            </Link>
            <Link href="/tools" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Tools
            </Link>
            <Link href="/community" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Community
            </Link>
            <Link href="/events" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Events
            </Link>
            <Link href="/newsletter" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Newsletter
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white sm:hidden"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hidden border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-sm text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95 sm:flex"
            >
              <Link href="/newsletter">Subscribe</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <section className="mb-12 rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84)_46%,rgba(239,246,255,0.82))] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(15,23,42,0.72)_48%,rgba(30,41,59,0.8))] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/76 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span className="text-muted-foreground">
                  A premium partner desk for agencies, operators, and marketplace growth teams
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full uppercase tracking-[0.18em]">
                  Partner Marketplace
                </Badge>
                <Badge variant="outline" className="rounded-full uppercase tracking-[0.18em]">
                  Trusted tools, research, and ecosystem partners
                </Badge>
              </div>
              <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                A curated{" "}
                <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                  partner marketplace
                </span>{" "}
                for modern marketplace teams.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                MarketplaceBeta can be more than a content destination. This page turns partner modules into premium
                operator resources that support lead generation, better outreach, and more relevant conversations with
                agencies, sellers, and software teams.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <a href={featuredSponsor.ctaUrl} target="_blank" rel="noopener noreferrer sponsored">
                    Explore Threecolts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/solutions">Request a Partner Introduction</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: Target, label: "Qualified sponsor positioning", value: "Lead-ready" },
                { icon: Handshake, label: "Agency-focused partner story", value: "High intent" },
                { icon: BarChart3, label: "Research-backed context", value: `${ALL_SPONSORS.length} featured` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45"
                >
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                    <item.icon className="h-4 w-4 text-sky-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{item.label}</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="grid gap-6 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.12),transparent_20%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-6 text-white shadow-[0_30px_90px_-40px_rgba(2,6,23,0.82)] md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                Featured Partner
              </Badge>
              <div className="mt-5 flex items-center gap-4">
                <SponsorLogo
                  name={featuredSponsor.name}
                  logoUrl={featuredSponsor.logoUrl}
                  sizes="96px"
                  className="h-16 w-44 rounded-full border-white/15 bg-white px-4"
                  imageClassName="p-4"
                  fallbackClassName="text-sm"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{featuredSponsor.badge}</p>
                  <p className="mt-1 text-sm text-white/78">{featuredSponsor.partnerType}</p>
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-balance md:text-4xl">{featuredSponsor.tagline}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">{featuredSponsor.description}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Proof Point</p>
                  <p className="text-sm leading-6 text-white">{featuredSponsor.proofPoint}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Why It Matters</p>
                  <p className="text-sm leading-6 text-white">{featuredSponsor.whyRelevant}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {featuredSponsor.highlights.map((highlight) => (
                  <Badge key={highlight} variant="outline" className="rounded-full border-white/15 bg-white/5 text-white">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>

            <PartnerVisual sponsor={featuredSponsor} />
          </div>
        </section>

        <section className="mb-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "For agencies",
              text: "Use partner modules as warm, relevant conversation starters for account growth, outreach, and better client positioning.",
            },
            {
              icon: Building2,
              title: "For operators",
              text: "Map market shifts to real tools, research, and partner options that make the reporting more actionable.",
            },
            {
              icon: CheckCircle2,
              title: "For MarketplaceBeta",
              text: "Build a premium lead engine that connects content, partner trust, operator use cases, and stronger sponsor fit.",
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="overflow-hidden rounded-[24px] border border-white/60 bg-white/84 shadow-[0_22px_54px_-34px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950/45"
            >
              <CardContent className="p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mb-14">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Trusted Tools and Partners</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-balance">
                Premium partner recommendations that feel like operator resources
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Each partner is framed around audience fit, use case, and why the recommendation matters in the context
              of marketplace decisions rather than generic ad inventory.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {ALL_SPONSORS.map((sponsor) => (
              <Card
                key={sponsor.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))] text-white shadow-[0_24px_70px_-34px_rgba(2,6,23,0.9)]"
              >
                <CardContent className="grid gap-0 p-0 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="border-b border-white/10 p-4 md:border-b-0 md:border-r">
                    <PartnerVisual sponsor={sponsor} />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="border border-white/10 bg-white/10 text-white">
                        {sponsor.badge}
                      </Badge>
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                        {sponsor.partnerType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <SponsorLogo
                        name={sponsor.name}
                        logoUrl={sponsor.logoUrl}
                        sizes="80px"
                        className={
                          sponsor.id === "threecolts" || sponsor.id === "marketplacepulse"
                            ? "h-14 w-40 rounded-full border-white/15 bg-white px-3"
                            : "h-14 w-14 rounded-xl border-white/15 bg-white"
                        }
                        imageClassName={sponsor.id === "threecolts" || sponsor.id === "marketplacepulse" ? "p-3" : "p-2"}
                        fallbackClassName="text-sm"
                      />
                      <div>
                        <p className="text-2xl font-bold leading-none">{sponsor.name}</p>
                        <p className="mt-1 text-sm text-white/68">{getModuleTypeLabel(sponsor.moduleType)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-balance">{sponsor.tagline}</p>
                      <p className="mt-3 text-sm leading-7 text-white/72">{sponsor.description}</p>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Proof Point</p>
                        <p className="text-sm font-medium text-white">{sponsor.proofPoint}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Use Case</p>
                        <p className="text-sm font-medium text-white">{sponsor.useCase}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                          Why This Partner Is Relevant
                        </p>
                        <p className="text-sm font-medium text-white">{sponsor.whyRelevant}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sponsor.highlights.map((highlight) => (
                        <Badge key={highlight} variant="outline" className="rounded-full border-white/15 bg-white/5 text-white">
                          {highlight}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button asChild className="border border-white/10 bg-white text-slate-950 hover:bg-white/90">
                        <a href={sponsor.ctaUrl} target="_blank" rel="noopener noreferrer sponsored">
                          {sponsor.ctaText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        <Link href="/solutions">Request Intro</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94)_52%,rgba(55,48,163,0.9))] p-6 text-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.68)] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/82 backdrop-blur">
                <Mail className="h-4 w-4 text-sky-300" />
                Use MarketplaceBeta as a content, partner, and outreach engine
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-balance md:text-4xl">
                Want the partner marketplace to generate more conversations?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 md:text-lg">
                Pair these partner modules with the Daily Brief, premium article coverage, and targeted operator
                research to turn site traffic into stronger outbound and warmer intros.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-white/92">
                  <Link href="/newsletter">
                    Get the Daily Brief
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-white/8 text-white hover:bg-white/12">
                  <Link href="/articles">Browse Articles</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Best For</p>
                <p className="mt-3 text-xl font-bold text-white">Partner-led growth</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Give agencies, operators, and SaaS teams reasons to come back for signal and recommendations.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Next Layer</p>
                <p className="mt-3 text-xl font-bold text-white">Dynamic sponsor modules</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Rotate in featured research or current high-sentiment stories to keep partner spots fresher and more useful.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
