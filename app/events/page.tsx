"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ExternalLink,
  Filter,
  Globe,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Presentation,
  Search,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  EVENTS,
  EVENT_VISUALS,
  getCountdownLabel,
  isPastEvent,
  sortEvents,
  type MarketplaceEvent,
} from "@/lib/events"

const ICONS = {
  sparkles: Sparkles,
  package: Package,
  "trending-up": TrendingUp,
  store: Store,
  megaphone: Megaphone,
  globe: Globe,
  users: Users,
  presentation: Presentation,
  calendar: CalendarDays,
  "bar-chart": BarChart3,
}

const sortedEvents = sortEvents(EVENTS)
const eventTypes = ["All", ...new Set(EVENTS.map((event) => event.eventType))]
const platforms = ["All", ...new Set(EVENTS.flatMap((event) => event.platforms))]

function getEventVisual(eventId: string) {
  return (
    EVENT_VISUALS[eventId] || {
      accent: "text-sky-300",
      badge: "border-sky-400/16 bg-sky-400/10 text-sky-100",
      gradient: "from-sky-400/18 via-violet-400/10 to-transparent",
      glow: "bg-sky-400/16",
      icon: "calendar" as const,
    }
  )
}

function EventFeatureCard({ event }: { event: MarketplaceEvent }) {
  const visual = getEventVisual(event.id)
  const EventIcon = ICONS[visual.icon]
  const countdown = getCountdownLabel(event)

  return (
    <Card className="group overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.68)]">
      <CardContent className="relative flex h-full flex-col p-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />
        <div className={`absolute -right-10 top-6 h-32 w-32 rounded-full ${visual.glow} blur-3xl`} />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <Badge className={`border ${visual.badge}`}>{event.eventType}</Badge>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <EventIcon className={`h-5 w-5 ${visual.accent}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/52">Verified Event Page</p>
                  <p className="text-sm font-medium text-white/82">{event.location}</p>
                </div>
              </div>
            </div>
            {countdown ? (
              <Badge className={countdown.urgent ? "border-0 bg-rose-500 text-white" : "border-0 bg-white/14 text-white"}>
                {countdown.text}
              </Badge>
            ) : null}
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-black tracking-tight text-balance">{event.name}</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">{event.description}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/48">Dates</p>
              <p className="mt-2 text-base font-semibold text-white">{event.dates}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/48">Who It Fits</p>
              <p className="mt-2 text-base font-semibold text-white">{event.platforms.join(" • ")}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {event.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="border-white/12 bg-white/6 text-white/76">
                {platform}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/48">Ticket Status</p>
              <p className="mt-1 text-sm font-medium text-white/86">{event.price || "See official page"}</p>
            </div>
            <Button
              asChild
              className="border border-white/10 bg-white text-slate-950 shadow-[0_18px_40px_-24px_rgba(255,255,255,0.6)] hover:bg-white/92"
            >
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                View Event
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EventListCard({ event }: { event: MarketplaceEvent }) {
  const visual = getEventVisual(event.id)
  const EventIcon = ICONS[visual.icon]
  const countdown = getCountdownLabel(event)

  return (
    <Card className="overflow-hidden rounded-[26px] border border-white/60 bg-white/84 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <CardContent className="p-0">
        <div className="flex h-full flex-col md:flex-row">
          <div className="relative flex min-h-[172px] items-end overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-5 text-white md:min-h-0 md:w-[220px] md:border-b-0 md:border-r">
            <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />
            <div className={`absolute left-6 top-6 h-24 w-24 rounded-full ${visual.glow} blur-3xl`} />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <EventIcon className={`h-5 w-5 ${visual.accent}`} />
                </div>
                {countdown ? (
                  <Badge className={countdown.urgent ? "border-0 bg-rose-500 text-white" : "border-0 bg-white/14 text-white"}>
                    {countdown.text}
                  </Badge>
                ) : null}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/52">{event.eventType}</p>
                <p className="mt-2 text-lg font-bold text-white">{event.dates}</p>
                <p className="mt-1 text-sm text-white/72">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {event.platforms.map((platform) => (
                  <Badge key={platform} variant="outline" className="border-slate-200 bg-white/70 text-slate-600 dark:border-white/10 dark:bg-white/6 dark:text-white/72">
                    {platform}
                  </Badge>
                ))}
              </div>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{event.name}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{event.description}</p>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/48">Official Link</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{new URL(event.registrationUrl).hostname.replace("www.", "")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/48">Ticket Status</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{event.price || "See event page"}</p>
                </div>
              </div>

              <Button
                asChild
                className="border border-white/10 bg-[linear-gradient(135deg,#0f172a,#1e293b_55%,#312e81)] text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.56)] hover:opacity-95"
              >
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                  Visit official event page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [platformFilter, setPlatformFilter] = useState("All")

  const filteredEvents = sortedEvents.filter((event) => {
    const query = searchQuery.trim().toLowerCase()
    if (
      query &&
      ![event.name, event.location, event.description, event.platforms.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query)
    ) {
      return false
    }
    if (typeFilter !== "All" && event.eventType !== typeFilter) return false
    if (platformFilter !== "All" && !event.platforms.includes(platformFilter)) return false
    return true
  })

  const upcomingEvents = filteredEvents.filter((event) => !isPastEvent(event))
  const pastEvents = filteredEvents.filter((event) => isPastEvent(event)).reverse()
  const featuredEvents = upcomingEvents.filter((event) => event.featured).slice(0, 3)
  const remainingEvents = upcomingEvents.filter((event) => !featuredEvents.some((featured) => featured.id === event.id))

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_34%)] bg-background">
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
                  Events Desk
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
            <Link href="/partners" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Partners
            </Link>
            <Link href="/tools" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Tools
            </Link>
            <Link href="/community" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Community
            </Link>
            <Link href="/events" className="text-sm font-semibold text-white">
              Events
            </Link>
            <Link href="/newsletter" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
              Newsletter
            </Link>
          </nav>

          <Button
            asChild
            size="sm"
            className="hidden border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-sm text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95 sm:flex"
          >
            <Link href="/newsletter">Subscribe</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84)_48%,rgba(239,246,255,0.82))] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.34)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(15,23,42,0.78)_48%,rgba(30,41,59,0.82))] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/76 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <CalendarDays className="h-4 w-4 text-sky-600" />
                <span className="text-muted-foreground">
                  Official-event calendar for <span className="font-semibold text-foreground">marketplace operators, sellers, agencies, and SaaS teams</span>
                </span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.68))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
                Premium Event Calendar for Commerce Teams
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-balance md:text-5xl lg:text-6xl">
                Track the{" "}
                <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                  ecommerce and marketplace events
                </span>{" "}
                that actually matter
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                We trimmed out stale listings, fixed broken links, and moved completed events into archive mode so this page stays useful for operator planning instead of feeling like a dead conference graveyard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95"
                >
                  <Link href="/newsletter">Get The Daily Brief</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-slate-200 bg-white/72 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-white dark:hover:bg-slate-950/55"
                >
                  <a href="mailto:hello@marketplacebeta.com?subject=Submit%20an%20event%20to%20MarketplaceBeta">
                    Submit an Event
                    <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">Upcoming</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{sortedEvents.filter((event) => !isPastEvent(event)).length}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">Official Links</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{EVENTS.length}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">Verified</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Mar 31</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-6 text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.68)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Calendar Standard</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">Only active events stay in the upcoming feed.</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Past events move into archive mode automatically after their end date.",
                  "Broken or weak links were replaced with official event pages only.",
                  "The page now favors higher-signal ecommerce, retail, and marketplace events.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm leading-6 text-white/78">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/60 bg-white/82 p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by event, location, platform, or description..."
                className="h-12 rounded-2xl border-slate-200 bg-white/80 pl-11 dark:border-white/10 dark:bg-white/6"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/6">
                <Filter className="mr-2 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/6">
                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {featuredEvents.length > 0 ? (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Featured Now</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">High-signal upcoming events</h2>
              </div>
              <p className="hidden max-w-md text-right text-sm leading-6 text-slate-500 dark:text-slate-400 md:block">
                These are the events most likely to matter if you are tracking marketplace strategy, operator workflow, or growth channels this year.
              </p>
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventFeatureCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Upcoming Schedule</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {upcomingEvents.length > 0 ? "Plan around what is actually ahead" : "No upcoming events match those filters"}
              </h2>
            </div>
            {upcomingEvents.length > 0 ? (
              <p className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">{upcomingEvents.length} verified event{upcomingEvents.length === 1 ? "" : "s"} in view</p>
            ) : null}
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-5">
              {(remainingEvents.length > 0 ? remainingEvents : upcomingEvents).map((event) => (
                <EventListCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <CardContent className="p-8 text-center">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">No events match the current filters.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Try clearing the search, switching the platform, or choosing a broader event type.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {pastEvents.length > 0 ? (
          <section className="mt-12">
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Archive</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Completed events</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Card
                  key={event.id}
                  className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))] text-white shadow-[0_28px_70px_-38px_rgba(15,23,42,0.72)]"
                >
                  <CardContent className="relative overflow-hidden p-5">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getEventVisual(event.id).gradient}`} />
                    <div className="relative">
                      <Badge className="border-white/10 bg-white/8 text-white">Completed</Badge>
                      <h3 className="mt-4 text-xl font-bold tracking-tight">{event.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/72">{event.dates}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-white/62">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-white/74">{event.description}</p>
                      <Button asChild variant="outline" className="mt-5 border-white/12 bg-white/6 text-white hover:bg-white/10 hover:text-white">
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                          Review Event Page
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <Card className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(49,46,129,0.92))] text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.7)]">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Need an event featured?</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">Submit a marketplace or ecommerce event for review.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
                  If it serves sellers, operators, agencies, or commerce software teams, send it over. We are prioritizing events with official landing pages, useful operator value, and credible ecommerce relevance.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-white text-slate-950 hover:bg-white/92">
                  <a href="mailto:hello@marketplacebeta.com?subject=Submit%20an%20event%20to%20MarketplaceBeta">
                    Submit by email
                    <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/12 bg-white/6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/newsletter">Subscribe for event updates</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-16 border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
            <div>
              <p className="font-semibold text-white">MarketplaceBeta</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Operator Events Desk</p>
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
            <Link href="/newsletter" className="transition-colors hover:text-white">
              Newsletter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
