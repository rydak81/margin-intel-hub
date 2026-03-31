import eventsData from "@/data/events.json"

export type MarketplaceEventType =
  | "Conference"
  | "Workshop"
  | "Trade Show"
  | "Pitch Event"

export interface MarketplaceEvent {
  id: string
  name: string
  dates: string
  startDate: string
  endDate: string
  location: string
  description: string
  platforms: string[]
  eventType: MarketplaceEventType
  registrationUrl: string
  featured: boolean
  price?: string
}

export interface EventVisual {
  accent: string
  badge: string
  gradient: string
  glow: string
  icon: "sparkles" | "package" | "trending-up" | "store" | "megaphone" | "globe" | "users" | "presentation" | "calendar" | "bar-chart"
}

export const EVENTS: MarketplaceEvent[] = eventsData.events as MarketplaceEvent[]

export const EVENT_VISUALS: Record<string, EventVisual> = {
  "prosper-show-2026": {
    accent: "text-cyan-300",
    badge: "border-cyan-400/16 bg-cyan-400/10 text-cyan-100",
    gradient: "from-cyan-400/20 via-sky-400/8 to-transparent",
    glow: "bg-cyan-400/18",
    icon: "trending-up",
  },
  "shoptalk-spring-2026": {
    accent: "text-orange-300",
    badge: "border-orange-400/16 bg-orange-400/10 text-orange-100",
    gradient: "from-orange-400/20 via-rose-400/10 to-transparent",
    glow: "bg-orange-400/18",
    icon: "sparkles",
  },
  "new-seller-summit-2026": {
    accent: "text-amber-300",
    badge: "border-amber-400/16 bg-amber-400/10 text-amber-100",
    gradient: "from-amber-400/18 via-orange-400/10 to-transparent",
    glow: "bg-amber-300/18",
    icon: "presentation",
  },
  "commercenext-growth-show-2026": {
    accent: "text-sky-300",
    badge: "border-sky-400/16 bg-sky-400/10 text-sky-100",
    gradient: "from-sky-400/18 via-violet-400/10 to-transparent",
    glow: "bg-sky-300/16",
    icon: "bar-chart",
  },
  "amazon-accelerate-2026": {
    accent: "text-amber-300",
    badge: "border-amber-400/16 bg-amber-400/10 text-amber-100",
    gradient: "from-amber-300/18 via-orange-400/8 to-transparent",
    glow: "bg-amber-300/18",
    icon: "package",
  },
  "groceryshop-2026": {
    accent: "text-emerald-300",
    badge: "border-emerald-400/16 bg-emerald-400/10 text-emerald-100",
    gradient: "from-emerald-400/16 via-teal-400/8 to-transparent",
    glow: "bg-emerald-300/18",
    icon: "store",
  },
  "shoptalk-fall-2026": {
    accent: "text-fuchsia-300",
    badge: "border-fuchsia-400/16 bg-fuchsia-400/10 text-fuchsia-100",
    gradient: "from-fuchsia-400/18 via-sky-400/8 to-transparent",
    glow: "bg-fuchsia-300/18",
    icon: "sparkles",
  },
  "walmart-open-call-2026": {
    accent: "text-blue-300",
    badge: "border-blue-400/16 bg-blue-400/10 text-blue-100",
    gradient: "from-blue-400/18 via-cyan-400/8 to-transparent",
    glow: "bg-blue-300/18",
    icon: "megaphone",
  },
}

function startOfDay(dateString: string) {
  return new Date(`${dateString}T00:00:00`)
}

function endOfDay(dateString: string) {
  return new Date(`${dateString}T23:59:59`)
}

export function isPastEvent(event: MarketplaceEvent, now = new Date()) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return endOfDay(event.endDate).getTime() < today.getTime()
}

export function getDaysUntil(dateString: string, now = new Date()) {
  const eventDate = startOfDay(dateString)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getCountdownLabel(event: MarketplaceEvent) {
  const daysUntil = getDaysUntil(event.startDate)
  if (daysUntil < 0) return null
  if (daysUntil === 0) return { text: "Starts today", urgent: true }
  if (daysUntil <= 7) return { text: `${daysUntil} day${daysUntil === 1 ? "" : "s"} away`, urgent: true }
  if (daysUntil <= 21) return { text: `${daysUntil} days away`, urgent: false }
  return null
}

export function sortEvents(events: MarketplaceEvent[]) {
  return [...events].sort((left, right) => {
    const leftPast = isPastEvent(left)
    const rightPast = isPastEvent(right)
    if (leftPast && !rightPast) return 1
    if (!leftPast && rightPast) return -1
    return new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
  })
}
