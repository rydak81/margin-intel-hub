"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  Menu,
  X,
  Search,
  Plus,
  Check,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Bookmark,
  Share2,
  Clock,
  Users,
  TrendingUp,
  HelpCircle,
  Megaphone,
  ShoppingCart,
  DollarSign,
  Package,
  Wrench,
  Star,
  Handshake,
  Trophy,
  Eye,
  CheckCircle2,
  Building2,
  Briefcase,
  Award,
  ChevronRight,
  Loader2,
  Shield,
  ArrowLeft,
  Sparkles,
  Mail,
  Zap,
  Target,
  Network,
} from "lucide-react"

interface CommunityUser {
  id: string
  display_name: string
  email: string
  role: "brand_seller" | "agency" | "saas_tech" | "service_provider" | "investor"
  company?: string
  bio?: string
  joined_at: string
  reputation_score: number
  post_count: number
  is_verified: boolean
  is_admin: boolean
}

interface Post {
  id: string
  title: string
  body: string
  author_id: string
  author_name: string
  author_role: string
  category: string
  post_type: string
  platform_tags: string[]
  created_at: string
  updated_at: string
  upvotes: number
  downvotes: number
  reply_count: number
  is_pinned: boolean
  view_count: number
  deal_type?: string
  looking_for?: string[]
}

const CATEGORIES = [
  { id: "all", name: "All Posts", icon: MessageSquare },
  { id: "announcements", name: "Announcements", icon: Megaphone },
  { id: "general", name: "General Discussion", icon: MessageSquare },
  { id: "amazon", name: "Amazon", icon: ShoppingCart },
  { id: "other-marketplaces", name: "Other Marketplaces", icon: Building2 },
  { id: "profitability", name: "Profitability", icon: DollarSign },
  { id: "advertising", name: "Advertising", icon: TrendingUp },
  { id: "logistics", name: "Logistics", icon: Package },
  { id: "tools", name: "Tools & Software", icon: Wrench },
  { id: "reviews", name: "Reviews", icon: Star },
  { id: "deals", name: "Deals & Partnerships", icon: Handshake },
  { id: "wins", name: "Wins & Milestones", icon: Trophy },
  { id: "help", name: "Help Needed", icon: HelpCircle },
]

const POST_TYPES = [
  { id: "discussion", name: "Discussion" },
  { id: "question", name: "Question" },
  { id: "deal", name: "Deal / Partnership" },
  { id: "case_study", name: "Case Study" },
  { id: "resource", name: "Resource" },
]

const ROLES = [
  { id: "brand_seller", name: "Brand / Seller", icon: ShoppingCart },
  { id: "agency", name: "Agency", icon: Building2 },
  { id: "saas_tech", name: "SaaS / Tech", icon: Wrench },
  { id: "service_provider", name: "Service Provider", icon: Briefcase },
  { id: "investor", name: "Investor", icon: DollarSign },
]

const PLATFORM_TAGS = ["Amazon", "Walmart", "TikTok Shop", "Shopify", "eBay", "Multi-Platform"]

const NETWORK_LANES = [
  {
    icon: Network,
    title: "Find operators and partners",
    body: "Use structured posts to source agencies, software, service providers, and strategic relationships.",
  },
  {
    icon: MessageSquare,
    title: "Turn news into signal",
    body: "Discuss fee changes, platform moves, and tactics in one place instead of chasing scattered threads.",
  },
  {
    icon: Target,
    title: "Create better outreach",
    body: "Spot live pain points, partnership needs, and operator sentiment you can use for smarter conversations.",
  },
]

const NETWORK_GUIDELINES = [
  "Be useful before being promotional.",
  "Share specifics, not vague hot takes.",
  "Use the right category and platform tags.",
  "Post opportunities clearly and professionally.",
]

const TRENDING_THEMES = [
  "Amazon fee pressure",
  "TikTok Shop growth playbooks",
  "Agency partner discovery",
  "Marketplace profitability",
  "Catalog and logistics ops",
]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "brand_seller":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    case "agency":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "saas_tech":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    case "service_provider":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
    case "investor":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getRoleLabel(role: string): string {
  return ROLES.find((entry) => entry.id === role)?.name || role
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const SAMPLE_POSTS: Post[] = [
  {
    id: "1",
    title: "Amazon just announced new FBA fees for 2026. Here is my operator breakdown.",
    body: "Just got the notification about the new fee structure. Storage fees are moving again, but the bigger issue is how this compounds with margin pressure and ad spend allocation across the catalog.",
    author_id: "1",
    author_name: "Sarah Chen",
    author_role: "brand_seller",
    category: "amazon",
    post_type: "discussion",
    platform_tags: ["Amazon"],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes: 47,
    downvotes: 3,
    reply_count: 23,
    is_pinned: true,
    view_count: 1250,
  },
  {
    id: "2",
    title: "Looking for a 3PL recommendation for oversized items in the Midwest",
    body: "We are launching a new oversized product line and need a reliable 3PL. Currently around 500 units per month with room to scale fast if the first launch wave goes well.",
    author_id: "2",
    author_name: "Mike Johnson",
    author_role: "brand_seller",
    category: "logistics",
    post_type: "question",
    platform_tags: ["Amazon", "Multi-Platform"],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    upvotes: 12,
    downvotes: 0,
    reply_count: 8,
    is_pinned: false,
    view_count: 340,
  },
  {
    id: "3",
    title: "[Case Study] How we scaled from $50k to $500k/month on TikTok Shop",
    body: "After 8 months of testing, we finally cracked a repeatable TikTok Shop motion. Here is the playbook, the affiliate setup, and what actually drove conversion instead of vanity traction.",
    author_id: "3",
    author_name: "Jessica Williams",
    author_role: "agency",
    category: "other-marketplaces",
    post_type: "case_study",
    platform_tags: ["TikTok Shop"],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 156,
    downvotes: 5,
    reply_count: 67,
    is_pinned: false,
    view_count: 4520,
  },
  {
    id: "4",
    title: "Hit 7 figures this month. Here is what actually moved the needle.",
    body: "We finally crossed the milestone after 3 years of grinding. Main drivers were catalog focus, supply chain cleanup, and being ruthless about ad efficiency instead of chasing growth everywhere.",
    author_id: "4",
    author_name: "David Park",
    author_role: "brand_seller",
    category: "wins",
    post_type: "discussion",
    platform_tags: ["Amazon", "Walmart"],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 234,
    downvotes: 8,
    reply_count: 89,
    is_pinned: false,
    view_count: 6780,
  },
  {
    id: "5",
    title: "Agency looking for 3 new brand partners for Q2 marketplace growth",
    body: "We are a full-service Amazon and Walmart agency with a strong operator bench. Looking to take on 3 brand partners in consumables, supplements, and home categories this quarter.",
    author_id: "5",
    author_name: "Emily Rodriguez",
    author_role: "agency",
    category: "deals",
    post_type: "deal",
    platform_tags: ["Amazon", "Walmart"],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 18,
    downvotes: 2,
    reply_count: 12,
    is_pinned: false,
    view_count: 890,
    deal_type: "partnership",
    looking_for: ["brand_seller"],
  },
  {
    id: "6",
    title: "Best PPC software for managing 100+ campaigns across multiple brands?",
    body: "Currently using Helium 10 but feeling limited. Looking for recommendations that are better for scaling large ad programs and team workflows without turning reporting into a mess.",
    author_id: "6",
    author_name: "Alex Thompson",
    author_role: "saas_tech",
    category: "advertising",
    post_type: "question",
    platform_tags: ["Amazon", "Multi-Platform"],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 29,
    downvotes: 1,
    reply_count: 34,
    is_pinned: false,
    view_count: 1120,
  },
]

export default function CommunityPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot")
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS)
  const [loading, setLoading] = useState(false)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null)
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    category: "general",
    post_type: "discussion",
    platform_tags: [] as string[],
  })
  const [joinForm, setJoinForm] = useState({
    display_name: "",
    email: "",
    role: "brand_seller",
    company: "",
    bio: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, sortBy])

  async function fetchPosts() {
    setLoading(true)
    try {
      let query = supabase.from("posts").select("*").eq("is_approved", true)

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      if (sortBy === "new") {
        query = query.order("created_at", { ascending: false })
      } else if (sortBy === "top") {
        query = query.order("upvotes", { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      query = query.limit(50)

      const { data, error } = await query

      if (error) {
        console.log("[v0] Error fetching posts:", error)
      } else if (data && data.length > 0) {
        setPosts(data)
      }
    } catch {
      console.log("[v0] Error in fetchPosts")
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinCommunity(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("community_users")
        .insert({
          display_name: joinForm.display_name,
          email: joinForm.email,
          role: joinForm.role,
          company: joinForm.company || null,
          bio: joinForm.bio || null,
        })
        .select()
        .single()

      if (error) {
        console.log("[v0] Error creating user:", error)
        alert("Error joining community. Email may already be registered.")
      } else {
        setCurrentUser(data)
        setJoinDialogOpen(false)
        setCreatePostOpen(true)
      }
    } catch {
      console.log("[v0] Error in handleJoinCommunity")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreatePost(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("posts").insert({
        title: newPost.title,
        body: newPost.body,
        author_id: currentUser.id,
        author_name: currentUser.display_name,
        author_role: currentUser.role,
        category: newPost.category,
        post_type: newPost.post_type,
        platform_tags: newPost.platform_tags,
      })

      if (error) {
        console.log("[v0] Error creating post:", error)
        alert("Error creating post. Please try again.")
      } else {
        setCreatePostOpen(false)
        setNewPost({
          title: "",
          body: "",
          category: "general",
          post_type: "discussion",
          platform_tags: [],
        })
        fetchPosts()
      }
    } catch {
      console.log("[v0] Error in handleCreatePost")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVote(postId: string, voteType: "up" | "down") {
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }

    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== postId) return post
        return {
          ...post,
          upvotes: voteType === "up" ? post.upvotes + 1 : post.upvotes,
          downvotes: voteType === "down" ? post.downvotes + 1 : post.downvotes,
        }
      })
    )

    try {
      await supabase.from("votes").insert({
        user_id: currentUser.id,
        post_id: postId,
        vote_type: voteType,
      })

      const post = posts.find((entry) => entry.id === postId)
      if (post) {
        await supabase
          .from("posts")
          .update({
            [voteType === "up" ? "upvotes" : "downvotes"]:
              voteType === "up" ? post.upvotes + 1 : post.downvotes + 1,
          })
          .eq("id", postId)
      }
    } catch {
      console.log("[v0] Error voting")
      fetchPosts()
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query) ||
      post.author_name.toLowerCase().includes(query)
    )
  })

  const sortedPosts = [...filteredPosts].sort((left, right) => {
    if (left.is_pinned && !right.is_pinned) return -1
    if (!left.is_pinned && right.is_pinned) return 1

    if (sortBy === "new") {
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    }

    if (sortBy === "top") {
      return right.upvotes - right.downvotes - (left.upvotes - left.downvotes)
    }

    const leftScore =
      (left.upvotes - left.downvotes) /
      Math.pow((Date.now() - new Date(left.created_at).getTime()) / 3600000 + 2, 1.5)
    const rightScore =
      (right.upvotes - right.downvotes) /
      Math.pow((Date.now() - new Date(right.created_at).getTime()) / 3600000 + 2, 1.5)
    return rightScore - leftScore
  })

  const featuredOpportunities = sortedPosts
    .filter((post) => post.category === "deals" || post.post_type === "deal")
    .slice(0, 3)

  const featuredInsights = sortedPosts
    .filter((post) => post.post_type === "case_study" || post.category === "wins")
    .slice(0, 3)

  const topContributors = [
    { name: "Sarah Chen", role: "brand_seller", points: 2450, verified: true },
    { name: "Mike Johnson", role: "agency", points: 1890, verified: true },
    { name: "Jessica Williams", role: "saas_tech", points: 1654, verified: false },
    { name: "David Park", role: "brand_seller", points: 1420, verified: true },
    { name: "Emily Rodriguez", role: "agency", points: 1215, verified: false },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_16%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84)_18%,transparent_32%)] bg-background">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.76))] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_right_top,rgba(217,70,239,0.08),transparent_18%)] pointer-events-none" />
        <div className="mx-auto px-4">
          <div className="flex h-14 items-center justify-between gap-4">
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
                    Operator Network
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
              <Link href="/community" className="text-sm font-semibold text-white">
                Community
              </Link>
              <Link href="/events" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Events
              </Link>
              <Link href="/newsletter" className="text-sm font-semibold text-white/82 transition-colors hover:text-white">
                Newsletter
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/community/admin" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-white/10 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>

              {currentUser ? (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 text-white">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-white/14 text-xs text-white">
                      {getInitials(currentUser.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">{currentUser.display_name}</span>
                </div>
              ) : (
                <Button
                  onClick={() => setJoinDialogOpen(true)}
                  size="sm"
                  className="hidden border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95 sm:flex"
                >
                  Join Network
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/16"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] md:hidden">
            <nav className="flex flex-col gap-2 px-4 py-4">
              <Link href="/" className="rounded-xl px-4 py-2 text-white/82 hover:bg-white/10">
                Home
              </Link>
              <Link href="/articles" className="rounded-xl px-4 py-2 text-white/82 hover:bg-white/10">
                Articles
              </Link>
              <Link href="/partners" className="rounded-xl px-4 py-2 text-white/82 hover:bg-white/10">
                Partners
              </Link>
              <Link href="/tools" className="rounded-xl px-4 py-2 text-white/82 hover:bg-white/10">
                Tools
              </Link>
              <Link href="/community" className="rounded-xl bg-white text-slate-950 px-4 py-2">
                Community
              </Link>
              <Link href="/events" className="rounded-xl px-4 py-2 text-white/82 hover:bg-white/10">
                Events
              </Link>
              <Link href="/newsletter" className="rounded-xl px-4 py-2 text-white/82 hover:bg-white/10">
                Newsletter
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_18%),linear-gradient(180deg,rgba(37,99,235,0.05),transparent_44%)]" />
        <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                <Users className="h-4 w-4 text-sky-500" />
                <span className="text-muted-foreground">
                  Verified operator network for <span className="font-semibold text-foreground">sellers, agencies, SaaS teams, service partners, and investors</span>
                </span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.68))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
                Community, deal flow, and operator signal
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
                The operator network for{" "}
                <span className="bg-[linear-gradient(135deg,#0f3f96_0%,#2563eb_38%,#7c3aed_72%,#d946ef_100%)] bg-clip-text text-transparent">
                  marketplace commerce
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Not just a forum. This is where marketplace operators ask smarter questions, share real case studies,
                source partners, spot deal flow, and turn industry news into better commercial decisions.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="border border-white/10 bg-[linear-gradient(135deg,#2563eb,#4f46e5_72%,#7c3aed)] text-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.72)] hover:opacity-95">
                      <Plus className="mr-2 h-4 w-4" />
                      Post to the network
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create a Network Post</DialogTitle>
                    </DialogHeader>
                    {currentUser ? (
                      <form onSubmit={handleCreatePost} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            placeholder="Share a case study, ask for help, or open a partnership conversation"
                            value={newPost.title}
                            onChange={(event) => setNewPost({ ...newPost, title: event.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={newPost.category}
                              onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.filter((category) => category.id !== "all" && category.id !== "announcements").map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="post_type">Post Type</Label>
                            <Select
                              value={newPost.post_type}
                              onValueChange={(value) => setNewPost({ ...newPost, post_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {POST_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Platform Tags</Label>
                          <div className="flex flex-wrap gap-2">
                            {PLATFORM_TAGS.map((tag) => (
                              <Badge
                                key={tag}
                                variant={newPost.platform_tags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  setNewPost((previous) => ({
                                    ...previous,
                                    platform_tags: previous.platform_tags.includes(tag)
                                      ? previous.platform_tags.filter((entry) => entry !== tag)
                                      : [...previous.platform_tags, tag],
                                  }))
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="body">Content</Label>
                          <Textarea
                            id="body"
                            placeholder="Share context, numbers, operator insight, or what kind of partner/help you need..."
                            value={newPost.body}
                            onChange={(event) => setNewPost({ ...newPost, body: event.target.value })}
                            className="min-h-[170px]"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setCreatePostOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Publish post
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="py-8 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-muted-foreground">Join the operator network to create posts and connect with members.</p>
                        <Button
                          onClick={() => {
                            setCreatePostOpen(false)
                            setJoinDialogOpen(true)
                          }}
                        >
                          Join the network
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {!currentUser ? (
                  <Button
                    variant="outline"
                    onClick={() => setJoinDialogOpen(true)}
                    className="border-slate-200 bg-white/72 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-white dark:hover:bg-slate-950/55"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Join the network
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  asChild
                  className="border-slate-200 bg-white/72 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-white dark:hover:bg-slate-950/55"
                >
                  <Link href="/articles">Read operator coverage</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Members", value: "2,847" },
                  { label: "Network Posts", value: `${posts.length}` },
                  { label: "Live Opportunities", value: `${featuredOpportunities.length}` },
                  { label: "Online Now", value: "156" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">
                      {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-6 text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.68)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Operator Network Standard</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">Built for signal, partnerships, and operator relevance.</h2>
              <div className="mt-5 space-y-3">
                {NETWORK_LANES.map((lane) => (
                  <div key={lane.title} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-white/72">
                      <lane.icon className="h-4 w-4 text-sky-300" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{lane.title}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/74">{lane.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {NETWORK_LANES.map((lane) => (
            <Card key={lane.title} className="rounded-[26px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <lane.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{lane.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{lane.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="space-y-6">
            <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">
                  Network Lanes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const active = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-[linear-gradient(135deg,#0f172a,#1e293b_55%,#312e81)] text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.5)]"
                          : "text-slate-700 hover:bg-slate-100 dark:text-white/72 dark:hover:bg-white/6"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/52">
                  Network Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {NETWORK_GUIDELINES.map((rule) => (
                  <div key={rule} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="leading-6">{rule}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div>
            <div className="rounded-[28px] border border-white/60 bg-white/82 p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search operator posts, partner requests, case studies, or member names..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-12 rounded-2xl border-slate-200 bg-white/80 pl-11 dark:border-white/10 dark:bg-white/6"
                  />
                </div>

                <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                    <TabsTrigger value="hot" className="gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Hot
                    </TabsTrigger>
                    <TabsTrigger value="new" className="gap-1">
                      <Clock className="h-4 w-4" />
                      New
                    </TabsTrigger>
                    <TabsTrigger value="top" className="gap-1">
                      <Award className="h-4 w-4" />
                      Top
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {(featuredOpportunities.length > 0 || featuredInsights.length > 0) ? (
              <section className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] text-white shadow-[0_28px_70px_-38px_rgba(15,23,42,0.72)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Live Opportunity Board</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {featuredOpportunities.length > 0 ? (
                      featuredOpportunities.map((post) => (
                        <Link key={post.id} href={`/community/post/${post.id}`} className="block rounded-2xl border border-white/10 bg-white/6 p-4 transition-colors hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <Badge className="border-0 bg-white text-slate-950">Opportunity</Badge>
                            {post.looking_for?.length ? (
                              <Badge className="border-white/10 bg-white/8 text-white">
                                Looking for {post.looking_for.map(getRoleLabel).join(", ")}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-3 font-semibold leading-6 text-white">{post.title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/70">{post.author_name} • {getRoleLabel(post.author_role)}</p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-white/68">No live opportunities yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Operator Insight Board</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {featuredInsights.length > 0 ? (
                      featuredInsights.map((post) => (
                        <Link key={post.id} href={`/community/post/${post.id}`} className="block rounded-2xl border border-slate-200 bg-white/72 p-4 transition-colors hover:border-sky-400/20 hover:bg-white/92 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{post.post_type === "case_study" ? "Case Study" : "Operator Win"}</Badge>
                            <Badge className={getRoleBadgeColor(post.author_role)}>{getRoleLabel(post.author_role)}</Badge>
                          </div>
                          <p className="mt-3 font-semibold leading-6 text-slate-950 dark:text-white">{post.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.body}</p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No featured insights yet.</p>
                    )}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            <section className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <Card key={index} className="animate-pulse rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                      <CardContent className="p-6">
                        <div className="h-4 w-3/4 rounded bg-muted mb-4" />
                        <div className="h-3 w-1/2 rounded bg-muted mb-2" />
                        <div className="h-3 w-1/4 rounded bg-muted" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sortedPosts.length === 0 ? (
                <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold">No posts found</h3>
                    <p className="mb-4 text-muted-foreground">Be the first to open a discussion, share a case study, or source a partner.</p>
                    <Button onClick={() => setCreatePostOpen(true)}>Create Post</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.map((post) => {
                    const CategoryIcon = CATEGORIES.find((category) => category.id === post.category)?.icon || MessageSquare
                    return (
                      <Card
                        key={post.id}
                        className={`overflow-hidden rounded-[28px] border shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur transition-all hover:-translate-y-0.5 dark:bg-slate-950/45 ${
                          post.is_pinned
                            ? "border-sky-400/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,255,0.82))] dark:border-sky-400/25 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.86),rgba(30,41,59,0.78))]"
                            : "border-white/60 bg-white/82 dark:border-white/10"
                        }`}
                      >
                        <CardContent className="p-0">
                          <div className="flex">
                            <div className="flex flex-col items-center justify-start gap-1 border-r border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] px-3 py-5 text-white">
                              <button onClick={() => handleVote(post.id, "up")} className="rounded-full p-1 transition-colors hover:bg-white/10 hover:text-sky-300">
                                <ArrowBigUp className="h-6 w-6" />
                              </button>
                              <span className="text-sm font-semibold">{post.upvotes - post.downvotes}</span>
                              <button onClick={() => handleVote(post.id, "down")} className="rounded-full p-1 transition-colors hover:bg-white/10 hover:text-rose-300">
                                <ArrowBigDown className="h-6 w-6" />
                              </button>
                            </div>

                            <div className="flex-1 p-5 md:p-6">
                              <div className="flex flex-wrap items-center gap-2">
                                {post.is_pinned ? (
                                  <Badge className="gap-1 border-0 bg-sky-600 text-white">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Pinned
                                  </Badge>
                                ) : null}
                                <Badge variant="outline" className="gap-1">
                                  <CategoryIcon className="h-3 w-3" />
                                  {CATEGORIES.find((category) => category.id === post.category)?.name}
                                </Badge>
                                {post.post_type !== "discussion" ? (
                                  <Badge variant="secondary">
                                    {POST_TYPES.find((type) => type.id === post.post_type)?.name}
                                  </Badge>
                                ) : null}
                              </div>

                              <Link href={`/community/post/${post.id}`}>
                                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950 transition-colors hover:text-primary dark:text-white">
                                  {post.title}
                                </h3>
                              </Link>

                              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {post.body}
                              </p>

                              {post.platform_tags.length > 0 ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {post.platform_tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              ) : null}

                              <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                      <AvatarFallback className="bg-muted text-xs">
                                        {getInitials(post.author_name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-slate-900 dark:text-white">{post.author_name}</span>
                                    <Badge className={`text-xs ${getRoleBadgeColor(post.author_role)}`}>
                                      {getRoleLabel(post.author_role)}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {post.view_count}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    {post.reply_count}
                                  </span>
                                  <button className="transition-colors hover:text-primary">
                                    <Bookmark className="h-4 w-4" />
                                  </button>
                                  <button className="transition-colors hover:text-primary">
                                    <Share2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContributors.map((user) => (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
                          {user.verified ? <CheckCircle2 className="h-3 w-3 text-primary" /> : null}
                        </div>
                        <Badge className={`mt-1 text-xs ${getRoleBadgeColor(user.role)}`}>{getRoleLabel(user.role)}</Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.points} pts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/60 bg-white/82 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.26)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What Operators Are Watching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TRENDING_THEMES.map((topic) => (
                  <button
                    key={topic}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-3 text-left text-sm transition-colors hover:border-sky-400/20 hover:bg-white/92 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10"
                  >
                    <span className="text-slate-700 dark:text-white/78">{topic}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>

            {!currentUser ? (
              <Card className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(49,46,129,0.92))] text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.7)]">
                <CardContent className="p-6">
                  <Users className="mb-4 h-10 w-10 text-sky-300" />
                  <h3 className="text-xl font-bold tracking-tight">Join the operator network</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    Create posts, source partners, share operator insight, and build higher-signal conversations in one place.
                  </p>
                  <Button onClick={() => setJoinDialogOpen(true)} className="mt-5 w-full bg-white text-slate-950 hover:bg-white/92">
                    Join now
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(49,46,129,0.92))] text-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.7)]">
                <CardContent className="p-6">
                  <Mail className="mb-4 h-10 w-10 text-sky-300" />
                  <h3 className="text-xl font-bold tracking-tight">Use the network with the daily brief</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    The strongest version of MarketplaceBeta is news plus operator insight plus partner discovery. Use both.
                  </p>
                  <Button asChild className="mt-5 w-full bg-white text-slate-950 hover:bg-white/92">
                    <Link href="/newsletter">Subscribe free</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </aside>
        </section>
      </main>

      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Operator Network</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleJoinCommunity} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="How you want to be known"
                value={joinForm.display_name}
                onChange={(event) => setJoinForm({ ...joinForm, display_name: event.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={joinForm.email}
                onChange={(event) => setJoinForm({ ...joinForm, email: event.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">What describes you best?</Label>
              <Select value={joinForm.role} onValueChange={(value) => setJoinForm({ ...joinForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                placeholder="Your company name"
                value={joinForm.company}
                onChange={(event) => setJoinForm({ ...joinForm, company: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell the network a bit about what you do and what kind of conversations you care about"
                value={joinForm.bio}
                onChange={(event) => setJoinForm({ ...joinForm, bio: event.target.value.slice(0, 200) })}
                className="resize-none"
                maxLength={200}
              />
              <p className="text-right text-xs text-muted-foreground">{joinForm.bio.length}/200</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Join network
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="mt-16 border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand-icon.png" alt="MarketplaceBeta logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
            <div>
              <p className="font-semibold text-white">MarketplaceBeta</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Operator Network</p>
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
            <Link href="/newsletter" className="transition-colors hover:text-white">
              Newsletter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
