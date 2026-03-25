"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart3,
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Bookmark,
  Share2,
  Clock,
  Eye,
  CheckCircle2,
  Flag,
  Loader2,
  Reply,
  MoreHorizontal,
  Users,
  ShoppingCart,
  Building2,
  Wrench,
  Briefcase,
  DollarSign,
} from "lucide-react"

// Types
interface CommunityUser {
  id: string
  display_name: string
  email: string
  role: string
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
}

interface ReplyType {
  id: string
  post_id: string
  parent_reply_id?: string
  body: string
  author_id: string
  author_name: string
  author_role: string
  created_at: string
  upvotes: number
  downvotes: number
  children?: ReplyType[]
}

const ROLES = [
  { id: 'brand_seller', name: 'Brand/Seller', icon: ShoppingCart },
  { id: 'agency', name: 'Agency', icon: Building2 },
  { id: 'saas_tech', name: 'SaaS/Tech', icon: Wrench },
  { id: 'service_provider', name: 'Service Provider', icon: Briefcase },
  { id: 'investor', name: 'Investor', icon: DollarSign },
]

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// Build nested reply tree
function buildReplyTree(replies: ReplyType[]): ReplyType[] {
  const replyMap = new Map<string, ReplyType>()
  const rootReplies: ReplyType[] = []
  
  // First pass: create map
  replies.forEach(reply => {
    replyMap.set(reply.id, { ...reply, children: [] })
  })
  
  // Second pass: build tree
  replies.forEach(reply => {
    const replyWithChildren = replyMap.get(reply.id)!
    if (reply.parent_reply_id) {
      const parent = replyMap.get(reply.parent_reply_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(replyWithChildren)
      } else {
        rootReplies.push(replyWithChildren)
      }
    } else {
      rootReplies.push(replyWithChildren)
    }
  })
  
  return rootReplies
}

// Reply component with nesting
function ReplyComponent({ 
  reply, 
  depth = 0, 
  currentUser, 
  onReply, 
  onVote 
}: { 
  reply: ReplyType
  depth?: number
  currentUser: CommunityUser | null
  onReply: (parentId: string) => void
  onVote: (replyId: string, voteType: 'up' | 'down') => void
}) {
  const maxDepth = 4
  const canNest = depth < maxDepth
  
  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="py-4">
        <div className="flex gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => onVote(reply.id, 'up')}
              className="p-1 hover:text-primary transition-colors"
            >
              <ArrowBigUp className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {reply.upvotes - reply.downvotes}
            </span>
            <button
              onClick={() => onVote(reply.id, 'down')}
              className="p-1 hover:text-destructive transition-colors"
            >
              <ArrowBigDown className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(reply.author_name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{reply.author_name}</span>
              <Badge className={`text-xs ${getRoleBadgeColor(reply.author_role)}`}>
                {getRoleLabel(reply.author_role)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(reply.created_at)}
              </span>
            </div>
            
            {/* Reply body */}
            <p className="text-sm whitespace-pre-wrap mb-2">{reply.body}</p>
            
            {/* Actions */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {canNest && (
                <button
                  onClick={() => onReply(reply.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
              )}
              <button className="flex items-center gap-1 hover:text-destructive transition-colors">
                <Flag className="h-4 w-4" />
                Report
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nested replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="space-y-0">
          {reply.children.map(childReply => (
            <ReplyComponent
              key={childReply.id}
              reply={childReply}
              depth={depth + 1}
              currentUser={currentUser}
              onReply={onReply}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<ReplyType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinForm, setJoinForm] = useState({
    display_name: '',
    email: '',
    role: 'brand_seller',
    company: '',
    bio: '',
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchPost()
    fetchReplies()
    incrementViewCount()
  }, [id])

  async function fetchPost() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.log('[v0] Error fetching post:', error)
        // Use sample post for demo
        setPost({
          id: id,
          title: 'Amazon just announced new FBA fees for 2026 - here\'s my breakdown',
          body: `Just got the notification about the new fee structure. Looks like storage fees are going up again but fulfillment fees have some interesting changes.

**Key Changes:**
- Standard size fulfillment fees increased by 3-5%
- Low-inventory level fees now apply to items under 28 days of stock
- New "peak season" surcharge from October through December
- Reduced fees for products under 1 lb

**My Take:**
These changes will significantly impact profitability for many sellers, especially those with slow-moving inventory. I recommend:
1. Audit your inventory velocity
2. Consider alternative fulfillment for slow movers
3. Update your pricing models

What's everyone's strategy for dealing with these changes?`,
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
        })
      } else {
        setPost(data)
      }
    } catch {
      console.log('[v0] Error in fetchPost')
    } finally {
      setLoading(false)
    }
  }

  async function fetchReplies() {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.log('[v0] Error fetching replies:', error)
        // Use sample replies for demo
        setReplies([
          {
            id: '1',
            post_id: id,
            body: 'Great breakdown! I\'ve been dreading this announcement. The low-inventory fee is going to hurt small sellers the most.',
            author_id: '2',
            author_name: 'Mike Johnson',
            author_role: 'brand_seller',
            created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            upvotes: 12,
            downvotes: 0,
          },
          {
            id: '2',
            post_id: id,
            parent_reply_id: '1',
            body: 'Agreed. We\'re looking at diversifying to Walmart for some SKUs. The fee structure there is still more favorable for certain categories.',
            author_id: '3',
            author_name: 'Jessica Williams',
            author_role: 'agency',
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            upvotes: 8,
            downvotes: 0,
          },
          {
            id: '3',
            post_id: id,
            body: 'We\'ve been building tools to help sellers analyze the impact of these fee changes. Happy to share our calculator if anyone\'s interested.',
            author_id: '4',
            author_name: 'David Park',
            author_role: 'saas_tech',
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            upvotes: 15,
            downvotes: 1,
          },
          {
            id: '4',
            post_id: id,
            parent_reply_id: '3',
            body: 'Yes please! Would love to see that calculator. Can you share the link?',
            author_id: '5',
            author_name: 'Emily Rodriguez',
            author_role: 'brand_seller',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            upvotes: 3,
            downvotes: 0,
          },
        ])
      } else {
        setReplies(data || [])
      }
    } catch {
      console.log('[v0] Error in fetchReplies')
    }
  }

  async function incrementViewCount() {
    try {
      await supabase.rpc('increment_view_count', { post_id: id })
    } catch {
      // Silently fail - view count is not critical
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
      }
    } catch {
      console.log('[v0] Error in handleJoinCommunity')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }
    
    if (!replyContent.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('replies')
        .insert({
          post_id: id,
          parent_reply_id: replyingTo || null,
          body: replyContent,
          author_id: currentUser.id,
          author_name: currentUser.display_name,
          author_role: currentUser.role,
        })
      
      if (error) {
        console.log('[v0] Error creating reply:', error)
        alert('Error posting reply. Please try again.')
      } else {
        setReplyContent('')
        setReplyingTo(null)
        fetchReplies()
        
        // Update reply count
        if (post) {
          await supabase.from('posts').update({
            reply_count: post.reply_count + 1,
          }).eq('id', id)
        }
      }
    } catch {
      console.log('[v0] Error in handleSubmitReply')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVotePost(voteType: 'up' | 'down') {
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }
    
    if (!post) return
    
    // Optimistic update
    setPost(prev => prev ? {
      ...prev,
      upvotes: voteType === 'up' ? prev.upvotes + 1 : prev.upvotes,
      downvotes: voteType === 'down' ? prev.downvotes + 1 : prev.downvotes,
    } : null)
    
    try {
      await supabase.from('votes').insert({
        user_id: currentUser.id,
        post_id: id,
        vote_type: voteType,
      })
      
      await supabase.from('posts').update({
        [voteType === 'up' ? 'upvotes' : 'downvotes']: voteType === 'up' ? post.upvotes + 1 : post.downvotes + 1,
      }).eq('id', id)
    } catch {
      console.log('[v0] Error voting')
      fetchPost()
    }
  }

  async function handleVoteReply(replyId: string, voteType: 'up' | 'down') {
    if (!currentUser) {
      setJoinDialogOpen(true)
      return
    }
    
    const reply = replies.find(r => r.id === replyId)
    if (!reply) return
    
    // Optimistic update
    setReplies(prev => prev.map(r => {
      if (r.id === replyId) {
        return {
          ...r,
          upvotes: voteType === 'up' ? r.upvotes + 1 : r.upvotes,
          downvotes: voteType === 'down' ? r.downvotes + 1 : r.downvotes,
        }
      }
      return r
    }))
    
    try {
      await supabase.from('votes').insert({
        user_id: currentUser.id,
        reply_id: replyId,
        vote_type: voteType,
      })
      
      await supabase.from('replies').update({
        [voteType === 'up' ? 'upvotes' : 'downvotes']: voteType === 'up' ? reply.upvotes + 1 : reply.downvotes + 1,
      }).eq('id', replyId)
    } catch {
      console.log('[v0] Error voting on reply')
      fetchReplies()
    }
  }

  const replyTree = buildReplyTree(replies)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <Link href="/community">
            <Button>Back to Community</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/homepage-logo.svg" alt="MarketplaceBeta logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                <span className="font-bold text-xl hidden sm:block">MarketplaceBeta</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Post */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="flex">
              {/* Vote Column */}
              <div className="flex flex-col items-center py-6 px-4 bg-muted/30 rounded-l-lg">
                <button
                  onClick={() => handleVotePost('up')}
                  className="p-2 hover:text-primary transition-colors"
                >
                  <ArrowBigUp className="h-8 w-8" />
                </button>
                <span className="font-bold text-xl my-1">
                  {post.upvotes - post.downvotes}
                </span>
                <button
                  onClick={() => handleVotePost('down')}
                  className="p-2 hover:text-destructive transition-colors"
                >
                  <ArrowBigDown className="h-8 w-8" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {post.is_pinned && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  <Badge variant="outline">{post.category}</Badge>
                  {post.post_type !== 'discussion' && (
                    <Badge variant="secondary">{post.post_type}</Badge>
                  )}
                  {post.platform_tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Title */}
                <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                
                {/* Author info */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(post.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author_name}</span>
                      <Badge className={getRoleBadgeColor(post.author_role)}>
                        {getRoleLabel(post.author_role)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Posted {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
                
                {/* Body */}
                <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                  {post.body.split('\n').map((paragraph, i) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return <h3 key={i} className="font-semibold mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</h3>
                    }
                    if (paragraph.startsWith('- ')) {
                      return <li key={i} className="ml-4">{paragraph.substring(2)}</li>
                    }
                    if (paragraph.match(/^\d+\. /)) {
                      return <li key={i} className="ml-4">{paragraph.substring(3)}</li>
                    }
                    return paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
                  })}
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {replies.length} replies
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="font-semibold">
              {replyingTo ? 'Reply to comment' : 'Leave a reply'}
            </h3>
            {replyingTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="w-fit"
              >
                Cancel reply
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <form onSubmit={handleSubmitReply}>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[100px] mb-4"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || !replyContent.trim()}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Post Reply
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">Join the community to reply</p>
                <Button onClick={() => setJoinDialogOpen(true)}>Join Community</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        <div>
          <h3 className="font-semibold mb-4">{replies.length} Replies</h3>
          
          {replyTree.length === 0 ? (
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-0 divide-y">
              {replyTree.map(reply => (
                <ReplyComponent
                  key={reply.id}
                  reply={reply}
                  currentUser={currentUser}
                  onReply={setReplyingTo}
                  onVote={handleVoteReply}
                />
              ))}
            </div>
          )}
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
    </div>
  )
}
