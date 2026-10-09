"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { EditorialIntro } from "@/components/editorial-intro"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { SiteBrand } from "@/components/site-brand"
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
    <Card className="group overflow-hidden rounded-xl border border-white/10 bg-slate-950 text-white editorial-elevated">
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
            <h2 className="text-2xl font-bold tracking-tight text-balance">{event.name}</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">{event.description}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">Dates</p>
              <p className="mt-2 text-base font-semibold text-white">{event.dates}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">Who It Fits</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">Ticket Status</p>
              <p className="mt-1 text-sm font-medium text-white/86">{event.price || "See official page"}</p>
            </div>
            <Button
              asChild
              className="border border-white/10 bg-white text-slate-950 editorial-elevated hover:bg-white/92"
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
    <Card className="overflow-hidden rounded-xl border border-border bg-white editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900">
      <CardContent className="p-0">
        <div className="flex h-full flex-col md:flex-row">
          <div className="relative flex min-h-[172px] items-end overflow-hidden border-b border-white/10 bg-slate-950 p-5 text-white md:min-h-0 md:w-[220px] md:border-b-0 md:border-r">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/52">{event.eventType}</p>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/48">Official Link</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{new URL(event.registrationUrl).hostname.replace("www.", "")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/48">Ticket Status</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{event.price || "See event page"}</p>
                </div>
              </div>

              <Button
                asChild
                className="border border-white/10 bg-card text-white editorial-elevated hover:opacity-95"
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
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="events" deskLabel="Events Desk" backHref="/" backLabel="Home" />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="border-b border-border pb-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <EditorialIntro eyebrow="Industry calendar" title="Be where commerce moves forward." description="Find ecommerce conferences and marketplace events. Compare dates, locations, and official event details to plan your time." />
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="border border-white/10 bg-card text-white editorial-elevated hover:opacity-95"
                >
                  <Link href="/newsletter">Get The Daily Brief</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-slate-200 bg-white/72 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-950/55"
                >
                  <a href="mailto:hello@marketplacebeta.com?subject=Submit%20an%20event%20to%20MarketplaceBeta">
                    Submit an Event
                    <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-white p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">Upcoming</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{sortedEvents.filter((event) => !isPastEvent(event)).length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">Official Links</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{EVENTS.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">Verified</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Mar 31</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-6 text-white editorial-elevated">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Calendar Standard</p>
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

        <section className="mt-8 rounded-xl border border-border bg-white p-5 editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900 md:p-6">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Featured Now</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">High-signal upcoming events</h2>
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Upcoming Schedule</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
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
            <Card className="rounded-xl border border-border bg-white editorial-elevated backdrop-blur dark:border-white/10 dark:bg-slate-900">
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Archive</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Completed events</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Card
                  key={event.id}
                  className="rounded-xl border border-white/10 bg-slate-950 text-white editorial-elevated"
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
          <Card className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 text-white editorial-elevated">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Need an event featured?</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Submit a marketplace or ecommerce event for review.</h2>
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

      <PremiumSiteFooter />
    </div>
  )
}
