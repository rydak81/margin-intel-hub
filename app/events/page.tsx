"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  Calendar,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Search,
  Users,
  Globe,
  Video,
  Filter,
  Mail,
  ShoppingBag,
  Truck,
  Sparkles,
  Store,
  Megaphone,
  TrendingUp,
  Package,
  Presentation,
  Building2,
} from "lucide-react"
import Image from "next/image"

interface Event {
  id: string
  name: string
  dates: string
  startDate: string
  location: string
  type: "Conference" | "Webinar" | "Workshop" | "Networking" | "Trade Show" | "Pitch Event"
  platforms: string[]
  description: string
  registrationUrl: string
  featured: boolean
  price?: string
  imageUrl?: string
  brandColor?: string
  brandIcon?: string
}

// Event brand colors and visual configuration
const EVENT_VISUALS: Record<string, { color: string, gradient: string, icon: string, imageUrl: string }> = {
  "shoptalk-2026": {
    color: "#FF6B35",
    gradient: "from-orange-500 to-red-500",
    icon: "sparkles",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80"
  },
  "amazon-accelerate-2026": {
    color: "#FF9900",
    gradient: "from-amber-500 to-orange-600",
    icon: "package",
    imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600&h=400&fit=crop&q=80"
  },
  "prosper-show-2026": {
    color: "#00A8E1",
    gradient: "from-cyan-500 to-blue-600",
    icon: "trending-up",
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=400&fit=crop&q=80"
  },
  "etail-west-2026": {
    color: "#6366F1",
    gradient: "from-indigo-500 to-purple-600",
    icon: "store",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&q=80"
  },
  "walmart-open-call-2026": {
    color: "#0071CE",
    gradient: "from-blue-500 to-blue-700",
    icon: "megaphone",
    imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=400&fit=crop&q=80"
  },
  "irce-2026": {
    color: "#059669",
    gradient: "from-emerald-500 to-teal-600",
    icon: "globe",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop&q=80"
  },
  "seller-summit-2026": {
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-600",
    icon: "users",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop&q=80"
  },
  "white-label-world-expo-2026": {
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-600",
    icon: "building",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80"
  },
  "tiktok-shop-summit-2026": {
    color: "#000000",
    gradient: "from-gray-900 to-black",
    icon: "video",
    imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop&q=80"
  },
}

// Get visual config for an event
const getEventVisuals = (eventId: string) => {
  return EVENT_VISUALS[eventId] || {
    color: "#6366F1",
    gradient: "from-primary to-primary/80",
    icon: "calendar",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop&q=80"
  }
}

// Get icon component based on event
const getEventIcon = (iconName: string) => {
  const icons: Record<string, typeof Calendar> = {
    sparkles: Sparkles,
    package: Package,
    "trending-up": TrendingUp,
    store: Store,
    megaphone: Megaphone,
    globe: Globe,
    users: Users,
    building: Building2,
    video: Video,
    calendar: Calendar,
    presentation: Presentation,
    truck: Truck,
    "shopping-bag": ShoppingBag,
  }
  return icons[iconName] || Calendar
}

// Helper function to calculate days until event
function getDaysUntil(dateString: string): number {
  const eventDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = eventDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Helper function to check if event is past
function isPastEvent(dateString: string): boolean {
  return getDaysUntil(dateString) < 0
}

const EVENTS: Event[] = [
  {
    id: "shoptalk-2026",
    name: "Shoptalk 2026",
    dates: "March 23-26, 2026",
    startDate: "2026-03-23",
    location: "Las Vegas, NV",
    type: "Conference",
    platforms: ["Multi-Platform"],
    description: "The world's largest retail and e-commerce event, featuring the biggest brands, startups, investors, and tech providers.",
    registrationUrl: "https://shoptalk.com",
    featured: true,
    price: "$3,200+"
  },
  {
    id: "amazon-accelerate-2026",
    name: "Amazon Accelerate 2026",
    dates: "April 15-17, 2026",
    startDate: "2026-04-15",
    location: "Seattle, WA",
    type: "Conference",
    platforms: ["Amazon"],
    description: "Amazon's annual conference for third-party sellers featuring product announcements, educational sessions, and networking opportunities with Amazon leadership.",
    registrationUrl: "https://sell.amazon.com/accelerate",
    featured: true,
    price: "Free"
  },
  {
    id: "prosper-show-2026",
    name: "Prosper Show 2026",
    dates: "May 8-10, 2026",
    startDate: "2026-05-08",
    location: "Las Vegas, NV",
    type: "Conference",
    platforms: ["Amazon", "Multi-Platform"],
    description: "The premier conference for Amazon sellers with tactical sessions, solution provider exhibits, and elite networking events.",
    registrationUrl: "https://prospershow.com",
    featured: true,
    price: "$999+"
  },
  {
    id: "etail-west-2026",
    name: "eTail West 2026",
    dates: "June 12-14, 2026",
    startDate: "2026-06-12",
    location: "Palm Springs, CA",
    type: "Conference",
    platforms: ["Multi-Platform"],
    description: "The largest e-commerce and omnichannel retail conference in North America, bringing together 1500+ retail leaders.",
    registrationUrl: "https://etailwest.wbresearch.com",
    featured: false,
    price: "$2,499+"
  },
  {
    id: "walmart-open-call-2026",
    name: "Walmart Open Call 2026",
    dates: "June 25-26, 2026",
    startDate: "2026-06-25",
    location: "Bentonville, AR",
    type: "Pitch Event",
    platforms: ["Walmart"],
    description: "Annual event where entrepreneurs pitch products directly to Walmart buyers for a chance to get on shelves nationwide.",
    registrationUrl: "https://corporate.walmart.com/open-call",
    featured: false,
    price: "Free"
  },
  {
    id: "irce-2026",
    name: "IRCE 2026",
    dates: "July 15-17, 2026",
    startDate: "2026-07-15",
    location: "Chicago, IL",
    type: "Conference",
    platforms: ["Multi-Platform"],
    description: "Internet Retailer Conference + Exhibition - leading e-commerce event with expert-led sessions and expo hall.",
    registrationUrl: "https://irce.com",
    featured: false,
    price: "$1,495+"
  },
  {
    id: "seller-summit-2026",
    name: "Seller Summit 2026",
    dates: "August 5-7, 2026",
    startDate: "2026-08-05",
    location: "Fort Lauderdale, FL",
    type: "Conference",
    platforms: ["Amazon", "Multi-Platform"],
    description: "Intimate gathering of successful Amazon and e-commerce sellers sharing advanced strategies and tactics.",
    registrationUrl: "https://sellersummit.com",
    featured: false,
    price: "$1,297+"
  },
  {
    id: "white-label-world-expo-2026",
    name: "White Label World Expo",
    dates: "September 18-19, 2026",
    startDate: "2026-09-18",
    location: "Las Vegas, NV",
    type: "Trade Show",
    platforms: ["Multi-Platform"],
    description: "North America's leading white label, private label, and contract manufacturing trade show for retailers.",
    registrationUrl: "https://www.whitelabelworldexpo.com/en/las-vegas.html",
    featured: false,
    price: "Free"
  },
  {
    id: "tiktok-shop-summit-2026",
    name: "TikTok Shop Seller Summit",
    dates: "November 12-13, 2026",
    startDate: "2026-11-12",
    location: "Los Angeles, CA",
    type: "Conference",
    platforms: ["TikTok Shop"],
    description: "Annual gathering for TikTok Shop sellers featuring platform updates, creator partnerships, and live commerce strategies.",
    registrationUrl: "https://seller-us.tiktok.com",
    featured: false,
    price: "Free"
  },
]

// Sort events by start date (soonest first), with past events at the end
const sortedEvents = [...EVENTS].sort((a, b) => {
  const aIsPast = isPastEvent(a.startDate)
  const bIsPast = isPastEvent(b.startDate)
  if (aIsPast && !bIsPast) return 1
  if (!aIsPast && bIsPast) return -1
  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
})

const EVENT_TYPES = ["All", "Conference", "Webinar", "Workshop", "Networking", "Trade Show", "Pitch Event"]
const PLATFORMS = ["All", "Amazon", "Walmart", "TikTok Shop", "Multi-Platform"]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [platformFilter, setPlatformFilter] = useState("All")

  const filteredEvents = sortedEvents.filter(event => {
    if (searchQuery && !event.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (typeFilter !== "All" && event.type !== typeFilter) return false
    if (platformFilter !== "All" && !event.platforms.includes(platformFilter)) return false
    return true
  })

  const upcomingEvents = filteredEvents.filter(e => !isPastEvent(e.startDate))
  const pastEvents = filteredEvents.filter(e => isPastEvent(e.startDate))
  const featuredEvents = upcomingEvents.filter(e => e.featured)
  const otherEvents = upcomingEvents.filter(e => !e.featured)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Conference": return Users
      case "Webinar": return Video
      case "Workshop": return Calendar
      case "Networking": return Globe
      case "Trade Show": return Globe
      case "Pitch Event": return Users
      default: return Calendar
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Conference": return "bg-blue-500"
      case "Webinar": return "bg-purple-500"
      case "Workshop": return "bg-emerald-500"
      case "Networking": return "bg-orange-500"
      case "Trade Show": return "bg-cyan-500"
      case "Pitch Event": return "bg-amber-500"
      default: return "bg-primary"
    }
  }

  // Get countdown badge for events within 14 days
  const getCountdownBadge = (startDate: string) => {
    const daysUntil = getDaysUntil(startDate)
    if (daysUntil <= 0) return null
    if (daysUntil <= 7) return { text: `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`, urgent: true }
    if (daysUntil <= 14) return { text: `${daysUntil} days away`, urgent: false }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-bold text-xl hidden sm:block">MarketplaceBeta</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-base font-semibold hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/tools" className="text-base font-semibold hover:text-primary transition-colors">
                Tools
              </Link>
              <Link href="/events" className="text-base font-semibold text-primary">
                Events
              </Link>
              <Link href="/newsletter" className="text-base font-semibold hover:text-primary transition-colors">
                Newsletter
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button asChild className="hidden sm:flex">
                <Link href="/newsletter">Subscribe</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <Badge variant="outline" className="mb-4">
            <Calendar className="h-3 w-3 mr-1" />
            Events Calendar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Industry Events & Conferences
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Stay connected with the e-commerce community. Find upcoming conferences, 
            webinars, workshops, and networking events.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(platform => (
                  <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Featured Events</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredEvents.map(event => {
                const visuals = getEventVisuals(event.id)
                const EventIcon = getEventIcon(visuals.icon)
                const countdown = getCountdownBadge(event.startDate)
                return (
                  <Card key={event.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all group">
                    {/* Event Image */}
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={visuals.imageUrl}
                        alt={event.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${visuals.gradient} opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {/* Event Icon Badge */}
                      <div 
                        className="absolute top-3 left-3 h-10 w-10 rounded-lg flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: visuals.color }}
                      >
                        <EventIcon className="h-5 w-5 text-white" />
                      </div>
                      {/* Countdown Badge */}
                      {countdown && (
                        <Badge 
                          className={`absolute top-3 right-3 ${countdown.urgent ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'} shadow-lg`}
                        >
                          {countdown.text}
                        </Badge>
                      )}
                      {/* Event Type */}
                      <Badge variant="secondary" className="absolute bottom-3 left-3 bg-white/90 text-foreground shadow">
                        {event.type}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {event.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.dates}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {event.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        {event.price && (
                          <span className="text-sm font-semibold" style={{ color: visuals.color }}>{event.price}</span>
                        )}
                      </div>
                      <Button 
                        className="w-full text-white" 
                        style={{ backgroundColor: visuals.color }}
                        asChild
                      >
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                          Register Now
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            {featuredEvents.length > 0 ? "More Events" : "All Events"}
            <span className="text-muted-foreground font-normal ml-2">
              ({otherEvents.length})
            </span>
          </h2>
          <div className="space-y-4">
            {otherEvents.map(event => {
              const visuals = getEventVisuals(event.id)
              const EventIcon = getEventIcon(visuals.icon)
              const countdown = getCountdownBadge(event.startDate)
              return (
                <Card key={event.id} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Left side - Image/Icon section */}
                      <div 
                        className={`relative w-full sm:w-24 h-24 sm:h-auto flex-shrink-0 bg-gradient-to-br ${visuals.gradient} flex items-center justify-center`}
                      >
                        <EventIcon className="h-8 w-8 text-white" />
                        {countdown && (
                          <Badge 
                            className={`absolute top-2 right-2 sm:hidden ${countdown.urgent ? 'bg-red-500' : 'bg-amber-500'} text-white text-xs`}
                          >
                            {countdown.text}
                          </Badge>
                        )}
                      </div>
                      {/* Right side - Content */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold truncate">{event.name}</h3>
                            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                              {countdown && (
                                <Badge 
                                  className={`${countdown.urgent ? 'bg-red-500' : 'bg-amber-500'} text-white text-xs`}
                                >
                                  {countdown.text}
                                </Badge>
                              )}
                              <Badge variant="outline">{event.type}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {event.dates}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location}
                            </span>
                            <div className="flex items-center gap-1">
                              {event.platforms.map(platform => (
                                <Badge key={platform} variant="secondary" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                            {event.price && (
                              <span className="font-medium" style={{ color: visuals.color }}>{event.price}</span>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          asChild 
                          className="flex-shrink-0 border-2 hover:text-white transition-colors"
                          style={{ borderColor: visuals.color, color: visuals.color }}
                        >
                          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                            Register
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Past Events Archive */}
        {pastEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6 text-muted-foreground">
              Past Events
              <span className="font-normal ml-2">({pastEvents.length})</span>
            </h2>
            <div className="space-y-3 opacity-60">
              {pastEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.dates} - {event.location}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Completed</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Event CTA */}
        <Card className="mt-12 border-0 bg-muted/50">
          <CardContent className="p-8 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Have an Event to Share?</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Submit your e-commerce event to be featured in our calendar and reach thousands of industry professionals.
            </p>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Submit an Event
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
              <span>MarketplaceBeta</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
