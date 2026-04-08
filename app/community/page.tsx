"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { SiteLogo } from "@/components/site-logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  BarChart3,
  Search,
  Plus,
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
  Filter,
  SortAsc,
  Eye,
  CheckCircle2,
  Building2,
  Briefcase,
  Award,
  ChevronRight,
  Loader2,
  Shield,
  Flag,
} from "lucide-react"

// Types
interface CommunityUser {
  id: string
  display_name: string
  email: string
  role: 'brand_seller' | 'agency' | 'saas_tech' | 'service_provider' | 'investor'
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

// Category configuration
const CATEGORIES = [
  { id: 'all', name: 'All Posts', icon: MessageSquare, color: 'bg-muted' },
  { id: 'announcements', name: 'Announcements', icon: Megaphone, color: 'bg-category-breaking' },
  { id: 'general', name: 'General Discussion', icon: MessageSquare, color: 'bg-primary' },
  { id: 'amazon', name: 'Amazon', icon: ShoppingCart, color: 'bg-orange-500' },
  { id: 'other-marketplaces', name: 'Other Marketplaces', icon: Building2, color: 'bg-blue-500' },
  { id: 'profitability', name: 'Profitability', icon: DollarSign, color: 'bg-category-profitability' },
  { id: 'advertising', name: 'Advertising', icon: TrendingUp, color: 'bg-category-advertising' },
  { id: 'logistics', name: 'Logistics', icon: Package, color: 'bg-category-logistics' },
  { id: 'tools', name: 'Tools & Software', icon: Wrench, color: 'bg-category-tools' },
  { id: 'reviews', name: 'Reviews', icon: Star, color: 'bg-yellow-500' },
  { id: 'deals', name: 'Deals & Partnerships', icon: Handshake, color: 'bg-category-deals' },
  { id: 'wins', name: 'Wins & Milestones', icon: Trophy, color: 'bg-green-500' },
  { id: 'help', name: 'Help Needed', icon: HelpCircle, color: 'bg-red-500' },
]

const POST_TYPES = [
  { id: 'discussion', name: 'Discussion' },
  { id: 'question', name: 'Question' },
  { id: 'deal', name: 'Deal/Partnership' },
  { id: 'case_study', name: 'Case Study' },
  { id: 'resource', name: 'Resource' },
]

const ROLES = [
  { id: 'brand_seller', name: 'Brand/Seller', icon: ShoppingCart },
  { id: 'agency', name: 'Agency', icon: Building2 },
  { id: 'saas_tech', name: 'SaaS/Tech', icon: Wrench },
  { id: 'service_provider', name: 'Service Provider', icon: Briefcase },
  { id: 'investor', name: 'Investor', icon: DollarSign },
]

const PLATFORM_TAGS = ['Amazon', 'Walmart', 'TikTok Shop', 'Shopify', 'eBay', 'Multi-Platform']

// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'brand_seller': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'agency': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'saas_tech': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'service_provider': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    case 'investor': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getRoleLabel(role: string): string {
  return ROLES.find(r => r.id === role)?.name || role
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Sample data for initial display
const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    title: 'Amazon just announced new FBA fees for 2026 - here\'s my breakdown',
    body: 'Just got the notification about the new fee structure. Looks like storage fees are going up again but fulfillment fees have some interesting changes...',
    author_id: '1',
    author_name: 'Sarah Chen',
    author_role: 'brand_seller',
    category: 'amazon',
    post_type: 'discussion',
    platform_tags: ['Amazon'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes: 47,
    downvotes: 3,
    reply_count: 23,
    is_pinned: true,
    view_count: 1250,
  },
  {
    id: '2',
    title: 'Looking for 3PL recommendation for oversized items',
    body: 'We\'re launching a new product line with oversized items and need a reliable 3PL. Currently doing about 500 units/month. Any recommendations?',
    author_id: '2',
    author_name: 'Mike Johnson',
    author_role: 'brand_seller',
    category: 'logistics',
    post_type: 'question',
    platform_tags: ['Amazon', 'Multi-Platform'],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    upvotes: 12,
    downvotes: 0,
    reply_count: 8,
    is_pinned: false,
    view_count: 340,
  },
  {
    id: '3',
    title: '[Case Study] How we scaled from $50k to $500k/month on TikTok Shop',
    body: 'After 8 months of experimentation, we finally cracked the code on TikTok Shop. Here\'s our complete playbook including content strategy, affiliate management, and what actually moved the needle...',
    author_id: '3',
    author_name: 'Jessica Williams',
    author_role: 'agency',
    category: 'other-marketplaces',
    post_type: 'case_study',
    platform_tags: ['TikTok Shop'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 156,
    downvotes: 5,
    reply_count: 67,
    is_pinned: false,
    view_count: 4520,
  },
  {
    id: '4',
    title: 'Hit 7 figures this month! 🎉 Here\'s what worked',
    body: 'Finally crossed the $100k/month milestone after 3 years of grinding. Main factors: niche selection, supply chain optimization, and aggressive advertising...',
    author_id: '4',
    author_name: 'David Park',
    author_role: 'brand_seller',
    category: 'wins',
    post_type: 'discussion',
    platform_tags: ['Amazon', 'Walmart'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 234,
    downvotes: 8,
    reply_count: 89,
    is_pinned: false,
    view_count: 6780,
  },
  {
    id: '5',
    title: 'Agency looking for brand partners - Q1 2026 slots available',
    body: 'We\'re a full-service Amazon agency with 50+ brand clients. Looking to take on 3-5 new brands for Q1. Specializing in consumables and supplements...',
    author_id: '5',
    author_name: 'Emily Rodriguez',
    author_role: 'agency',
    category: 'deals',
    post_type: 'deal',
    platform_tags: ['Amazon'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 18,
    downvotes: 2,
    reply_count: 12,
    is_pinned: false,
    view_count: 890,
    deal_type: 'partnership',
    looking_for: ['brand_seller'],
  },
  {
    id: '6',
    title: 'Best PPC software for managing 100+ campaigns?',
    body: 'Currently using Helium 10 but feeling limited. Looking for recommendations for managing large-scale advertising across multiple brands...',
    author_id: '6',
    author_name: 'Alex Thompson',
    author_role: 'saas_tech',
    category: 'advertising',
    post_type: 'question',
    platform_tags: ['Amazon', 'Multi-Platform'],
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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS)
  const [loading, setLoading] = useState(false)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null)
  
  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    category: 'general',
    post_type: 'discussion',
    platform_tags: [] as string[],
  })
  
  // Join form state
  const [joinForm, setJoinForm] = useState({
    display_name: '',
    email: '',
    role: 'brand_seller',
    company: '',
    bio: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  // Fetch posts from database
  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, sortBy])

  async function fetchPosts() {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('is_approved', true)
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }
      
      if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'top') {
        query = query.order('upvotes', { ascending: false })
      } else {
        // Hot: combination of recency and upvotes
        query = query.order('created_at', { ascending: false })
      }
      
      query = query.limit(50)
      
      const { data, error } = await query
      
      if (error) {
        console.log('[v0] Error fetching posts:', error)
        // Keep sample data on error
      } else if (data && data.length > 0) {
        setPosts(data)
      }
      // If no posts in DB, keep sample data
    } catch {
      console.log('[v0] Error in fetchPosts')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinCommunity(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('community_users')
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
        console.log('[v0] Error creating user:', error)
        alert('Error joining community. Email may already be registered.')
      } else {
        setCurrentUser(data)
        setJoinDialogOpen(false)
        setCreatePostOpen(true)
      }
    } catch {
      console.log('[v0] Error in handleJoinCommunity')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
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
        console.log('[v0] Error creating post:', error)
        alert('Error creating post. Please try again.')
      } else {
        setCreatePostOpen(false)
        setNewPost({
          title: '',
          body: '',
          category: 'general',
          post_type: 'discussion',
          platform_tags: [],
        })
        fetchPosts()
      }
    } catch {
      console.log('[v0] Error in handleCreatePost')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVote(postId: string, voteType: 'up' | 'down') {
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }
    
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          upvotes: voteType === 'up' ? p.upvotes + 1 : p.upvotes,
          downvotes: voteType === 'down' ? p.downvotes + 1 : p.downvotes,
        }
      }
      return p
    }))
    
    try {
      // Record vote
      await supabase.from('votes').insert({
        user_id: currentUser.id,
        post_id: postId,
        vote_type: voteType,
      })
      
      // Update post count
      const post = posts.find(p => p.id === postId)
      if (post) {
        await supabase.from('posts').update({
          [voteType === 'up' ? 'upvotes' : 'downvotes']: voteType === 'up' ? post.upvotes + 1 : post.downvotes + 1,
        }).eq('id', postId)
      }
    } catch {
      console.log('[v0] Error voting')
      // Revert on error
      fetchPosts()
    }
  }

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        post.author_name.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    
    if (sortBy === 'new') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === 'top') {
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
    } else {
      // Hot: weighted by recency and score
      const scoreA = (a.upvotes - a.downvotes) / Math.pow((Date.now() - new Date(a.created_at).getTime()) / 3600000 + 2, 1.5)
      const scoreB = (b.upvotes - b.downvotes) / Math.pow((Date.now() - new Date(b.created_at).getTime()) / 3600000 + 2, 1.5)
      return scoreB - scoreA
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <SiteLogo size="md" />

            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                <Link href="/" className="text-base font-semibold hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/tools" className="text-base font-semibold hover:text-primary transition-colors">
                  Tools
                </Link>
                <Link href="/community" className="text-base font-semibold text-primary">
                  Community
                </Link>
                <Link href="/events" className="text-base font-semibold hover:text-primary transition-colors">
                  Events
                </Link>
                <Link href="/newsletter" className="text-base font-semibold hover:text-primary transition-colors">
                  Newsletter
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/community/admin">
                <Button variant="outline" size="sm" className="gap-1 hidden sm:flex">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(currentUser.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">{currentUser.display_name}</span>
                </div>
              ) : (
                <Button onClick={() => setJoinDialogOpen(true)} size="sm">
                  Join Community
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm">
            <nav className="flex flex-col p-4 gap-2">
              <Link href="/" className="px-4 py-2 hover:bg-muted rounded-lg">Home</Link>
              <Link href="/tools" className="px-4 py-2 hover:bg-muted rounded-lg">Tools</Link>
              <Link href="/community" className="px-4 py-2 bg-primary/10 text-primary rounded-lg">Community</Link>
              <Link href="/events" className="px-4 py-2 hover:bg-muted rounded-lg">Events</Link>
              <Link href="/newsletter" className="px-4 py-2 hover:bg-muted rounded-lg">Newsletter</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted-foreground text-lg">
                Connect with sellers, agencies, and service providers. Share wins, ask questions, find partners.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                  </DialogHeader>
                  {currentUser ? (
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="What's on your mind?"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
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
                              {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'announcements').map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                              {POST_TYPES.map(type => (
                                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Platform Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORM_TAGS.map(tag => (
                            <Badge
                              key={tag}
                              variant={newPost.platform_tags.includes(tag) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                setNewPost(prev => ({
                                  ...prev,
                                  platform_tags: prev.platform_tags.includes(tag)
                                    ? prev.platform_tags.filter(t => t !== tag)
                                    : [...prev.platform_tags, tag]
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
                          placeholder="Share your thoughts, ask a question, or describe your case study..."
                          value={newPost.body}
                          onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                          className="min-h-[150px]"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setCreatePostOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Post
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Join the community to create posts</p>
                      <Button onClick={() => { setCreatePostOpen(false); setJoinDialogOpen(true); }}>
                        Join Community
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span><strong className="text-foreground">2,847</strong> members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span><strong className="text-foreground">{posts.length}</strong> posts</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span><strong className="text-foreground">156</strong> online now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Categories</h3>
              <nav className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.name}</span>
                    </button>
                  )
                })}
              </nav>
              
              <Separator className="my-6" />
              
              {/* Community Guidelines */}
              <Card className="border-0 bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Community Guidelines</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>Be respectful and professional</li>
                    <li>No spam or self-promotion</li>
                    <li>Share actionable insights</li>
                    <li>Tag posts appropriately</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Posts Feed */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <TabsList>
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

            {/* Posts List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedPosts.length === 0 ? (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                  <Button onClick={() => setCreatePostOpen(true)}>Create Post</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedPosts.map((post) => {
                  const CategoryIcon = CATEGORIES.find(c => c.id === post.category)?.icon || MessageSquare
                  return (
                    <Card key={post.id} className={`hover:shadow-md transition-shadow ${post.is_pinned ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Vote Column */}
                          <div className="flex flex-col items-center py-4 px-3 bg-muted/30 rounded-l-lg">
                            <button
                              onClick={() => handleVote(post.id, 'up')}
                              className="p-1 hover:text-primary transition-colors"
                            >
                              <ArrowBigUp className="h-6 w-6" />
                            </button>
                            <span className="font-semibold text-sm my-1">
                              {post.upvotes - post.downvotes}
                            </span>
                            <button
                              onClick={() => handleVote(post.id, 'down')}
                              className="p-1 hover:text-destructive transition-colors"
                            >
                              <ArrowBigDown className="h-6 w-6" />
                            </button>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 p-4">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {post.is_pinned && (
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Pinned
                                </Badge>
                              )}
                              <Badge variant="outline" className="gap-1">
                                <CategoryIcon className="h-3 w-3" />
                                {CATEGORIES.find(c => c.id === post.category)?.name}
                              </Badge>
                              {post.post_type !== 'discussion' && (
                                <Badge variant="secondary">
                                  {POST_TYPES.find(t => t.id === post.post_type)?.name}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Title */}
                            <Link href={`/community/post/${post.id}`}>
                              <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer line-clamp-2">
                                {post.title}
                              </h3>
                            </Link>
                            
                            {/* Preview */}
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                              {post.body}
                            </p>
                            
                            {/* Platform Tags */}
                            {post.platform_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.platform_tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-muted">
                                      {getInitials(post.author_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{post.author_name}</span>
                                  <Badge className={`text-xs ${getRoleBadgeColor(post.author_role)}`}>
                                    {getRoleLabel(post.author_role)}
                                  </Badge>
                                </div>
                                <span className="text-muted-foreground">
                                  {formatTimeAgo(post.created_at)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.view_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.reply_count}
                                </span>
                                <button className="hover:text-primary transition-colors">
                                  <Bookmark className="h-4 w-4" />
                                </button>
                                <button className="hover:text-primary transition-colors">
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
          </div>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Top Contributors */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-sm">Top Contributors</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Sarah Chen', role: 'brand_seller', points: 2450, verified: true },
                    { name: 'Mike Johnson', role: 'agency', points: 1890, verified: true },
                    { name: 'Jessica Williams', role: 'saas_tech', points: 1654, verified: false },
                    { name: 'David Park', role: 'brand_seller', points: 1420, verified: true },
                    { name: 'Emily Rodriguez', role: 'agency', points: 1215, verified: false },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{user.name}</span>
                            {user.verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                          </div>
                          <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{user.points} pts</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-sm">Trending Topics</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['FBA Fee Changes 2026', 'TikTok Shop Strategy', 'Q4 Prep Tips', 'Inventory Planning', 'PPC Optimization'].map((topic, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <span className="text-sm">{topic}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* CTA */}
              {!currentUser && (
                <Card className="border-0 bg-primary/10">
                  <CardContent className="p-6 text-center">
                    <Users className="h-10 w-10 mx-auto text-primary mb-3" />
                    <h4 className="font-semibold mb-2">Join the Community</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect with 2,800+ e-commerce professionals
                    </p>
                    <Button onClick={() => setJoinDialogOpen(true)} className="w-full">
                      Join Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Join Community Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Community</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleJoinCommunity} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="How you want to be known"
                value={joinForm.display_name}
                onChange={(e) => setJoinForm({ ...joinForm, display_name: e.target.value })}
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
                onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">What describes you best?</Label>
              <Select
                value={joinForm.role}
                onValueChange={(value) => setJoinForm({ ...joinForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
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
                onChange={(e) => setJoinForm({ ...joinForm, company: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself (max 200 characters)"
                value={joinForm.bio}
                onChange={(e) => setJoinForm({ ...joinForm, bio: e.target.value.slice(0, 200) })}
                className="resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {joinForm.bio.length}/200
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Join Community
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MarketplaceBeta Community - Connecting marketplace professionals worldwide</p>
        </div>
      </footer>
    </div>
  )
}
