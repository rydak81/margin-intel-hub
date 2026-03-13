"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart3,
  Users,
  MessageSquare,
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowLeft,
  Loader2,
  Ban,
  CheckCircle2,
  MoreHorizontal,
  Pin,
} from "lucide-react"

// Types
interface Post {
  id: string
  title: string
  body: string
  author_name: string
  author_role: string
  category: string
  created_at: string
  upvotes: number
  reply_count: number
  is_pinned: boolean
  is_approved: boolean
  is_reported: boolean
  view_count: number
}

interface Report {
  id: string
  reporter_id: string
  post_id?: string
  reply_id?: string
  reason: string
  created_at: string
  is_resolved: boolean
  post?: { title: string; author_name: string }
  reply?: { body: string; author_name: string }
}

interface CommunityUser {
  id: string
  display_name: string
  email: string
  role: string
  company?: string
  joined_at: string
  reputation_score: number
  post_count: number
  is_verified: boolean
  is_admin: boolean
}

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

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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

// Sample data for demo
const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    title: 'Amazon just announced new FBA fees for 2026',
    body: 'Just got the notification about the new fee structure...',
    author_name: 'Sarah Chen',
    author_role: 'brand_seller',
    category: 'amazon',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes: 47,
    reply_count: 23,
    is_pinned: true,
    is_approved: true,
    is_reported: false,
    view_count: 1250,
  },
  {
    id: '2',
    title: 'SPAM: Get rich quick selling on Amazon!',
    body: 'Buy my course for only $999...',
    author_name: 'Scammer123',
    author_role: 'brand_seller',
    category: 'general',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    upvotes: 0,
    reply_count: 1,
    is_pinned: false,
    is_approved: false,
    is_reported: true,
    view_count: 45,
  },
  {
    id: '3',
    title: 'TikTok Shop case study - $500k in 8 months',
    body: 'After 8 months of experimentation...',
    author_name: 'Jessica Williams',
    author_role: 'agency',
    category: 'other-marketplaces',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 156,
    reply_count: 67,
    is_pinned: false,
    is_approved: true,
    is_reported: false,
    view_count: 4520,
  },
]

const SAMPLE_REPORTS: Report[] = [
  {
    id: '1',
    reporter_id: '1',
    post_id: '2',
    reason: 'This is obvious spam/scam content promoting a course',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_resolved: false,
    post: { title: 'SPAM: Get rich quick selling on Amazon!', author_name: 'Scammer123' },
  },
  {
    id: '2',
    reporter_id: '2',
    reply_id: '5',
    reason: 'Personal attack against another member',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_resolved: false,
    reply: { body: 'You don\'t know what you\'re talking about...', author_name: 'AngryUser' },
  },
]

const SAMPLE_USERS: CommunityUser[] = [
  {
    id: '1',
    display_name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'brand_seller',
    company: 'Chen Brands LLC',
    joined_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    reputation_score: 2450,
    post_count: 45,
    is_verified: true,
    is_admin: false,
  },
  {
    id: '2',
    display_name: 'Mike Johnson',
    email: 'mike@agency.com',
    role: 'agency',
    company: 'Growth Agency',
    joined_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    reputation_score: 1890,
    post_count: 32,
    is_verified: true,
    is_admin: false,
  },
  {
    id: '3',
    display_name: 'Scammer123',
    email: 'scam@fake.com',
    role: 'brand_seller',
    joined_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reputation_score: -15,
    post_count: 3,
    is_verified: false,
    is_admin: false,
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS)
  const [reports, setReports] = useState<Report[]>(SAMPLE_REPORTS)
  const [users, setUsers] = useState<CommunityUser[]>(SAMPLE_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | 'pin' | 'unpin'>('approve')
  const [actionNote, setActionNote] = useState('')
  const [isActioning, setIsActioning] = useState(false)

  const supabase = createClient()

  // Fetch data from database
  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      if (activeTab === 'posts' || activeTab === 'overview') {
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        
        if (postsData && postsData.length > 0) {
          setPosts(postsData)
        }
      }

      if (activeTab === 'reports' || activeTab === 'overview') {
        const { data: reportsData } = await supabase
          .from('reports')
          .select('*, posts(title, author_name), replies(body, author_name)')
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (reportsData && reportsData.length > 0) {
          setReports(reportsData)
        }
      }

      if (activeTab === 'users' || activeTab === 'overview') {
        const { data: usersData } = await supabase
          .from('community_users')
          .select('*')
          .order('joined_at', { ascending: false })
          .limit(100)
        
        if (usersData && usersData.length > 0) {
          setUsers(usersData)
        }
      }
    } catch (error) {
      console.log('[v0] Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePostAction() {
    if (!selectedPost) return
    setIsActioning(true)

    try {
      switch (actionType) {
        case 'approve':
          await supabase.from('posts').update({ is_approved: true, is_reported: false }).eq('id', selectedPost.id)
          setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, is_approved: true, is_reported: false } : p))
          break
        case 'reject':
        case 'delete':
          await supabase.from('posts').delete().eq('id', selectedPost.id)
          setPosts(prev => prev.filter(p => p.id !== selectedPost.id))
          break
        case 'pin':
          await supabase.from('posts').update({ is_pinned: true }).eq('id', selectedPost.id)
          setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, is_pinned: true } : p))
          break
        case 'unpin':
          await supabase.from('posts').update({ is_pinned: false }).eq('id', selectedPost.id)
          setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, is_pinned: false } : p))
          break
      }
    } catch (error) {
      console.log('[v0] Error performing action:', error)
    } finally {
      setIsActioning(false)
      setActionDialogOpen(false)
      setSelectedPost(null)
      setActionNote('')
    }
  }

  async function handleResolveReport(report: Report) {
    try {
      await supabase.from('reports').update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq('id', report.id)
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, is_resolved: true } : r))
    } catch (error) {
      console.log('[v0] Error resolving report:', error)
    }
  }

  async function handleVerifyUser(userId: string, verify: boolean) {
    try {
      await supabase.from('community_users').update({ is_verified: verify }).eq('id', userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: verify } : u))
    } catch (error) {
      console.log('[v0] Error updating user:', error)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    return user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const pendingReports = reports.filter(r => !r.is_resolved)
  const reportedPosts = posts.filter(p => p.is_reported)
  const pendingApproval = posts.filter(p => !p.is_approved)

  // Stats
  const stats = {
    totalUsers: users.length,
    totalPosts: posts.length,
    pendingReports: pendingReports.length,
    reportedPosts: reportedPosts.length,
    pendingApproval: pendingApproval.length,
    postsToday: posts.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length,
    totalViews: posts.reduce((sum, p) => sum + p.view_count, 0),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/community" className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-lg">Admin Dashboard</span>
                  <p className="text-xs text-muted-foreground">Community Moderation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {pendingReports.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {pendingReports.length} pending reports
                </Badge>
              )}
              <Link href="/community">
                <Button variant="outline" size="sm">
                  View Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                  <p className="text-xs text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.pendingReports > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stats.pendingReports > 0 ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
                  <Flag className={`h-5 w-5 ${stats.pendingReports > 0 ? 'text-destructive' : 'text-orange-500'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReports}</p>
                  <p className="text-xs text-muted-foreground">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="posts" className="gap-1">
                Posts
                {pendingApproval.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {pendingApproval.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1">
                Reports
                {pendingReports.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                    {pendingReports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Urgent Items */}
            {(pendingReports.length > 0 || pendingApproval.length > 0) && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingReports.slice(0, 3).map(report => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {report.post ? `Post: ${report.post.title.slice(0, 50)}...` : 'Reply reported'}
                        </p>
                        <p className="text-xs text-muted-foreground">{report.reason.slice(0, 80)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleResolveReport(report)}>
                          Resolve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Remove Content
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {posts.slice(0, 5).map(post => (
                    <div key={post.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(post.author_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.author_name} • {formatTimeAgo(post.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.is_reported && <Badge variant="destructive">Reported</Badge>}
                        {!post.is_approved && <Badge variant="secondary">Pending</Badge>}
                        {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(user.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{user.display_name}</p>
                            {user.is_verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                          </div>
                          <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(user.joined_at)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No posts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPosts.map(post => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{getInitials(post.author_name)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{post.author_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              <div>{post.upvotes} upvotes</div>
                              <div>{post.reply_count} replies</div>
                              <div>{post.view_count} views</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {post.is_pinned && <Badge className="bg-primary">Pinned</Badge>}
                              {post.is_reported && <Badge variant="destructive">Reported</Badge>}
                              {!post.is_approved && <Badge variant="secondary">Pending</Badge>}
                              {post.is_approved && !post.is_reported && !post.is_pinned && (
                                <Badge variant="outline">Active</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!post.is_approved && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedPost(post)
                                    setActionType('approve')
                                    setActionDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPost(post)
                                  setActionType(post.is_pinned ? 'unpin' : 'pin')
                                  setActionDialogOpen(true)
                                }}
                              >
                                <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-primary' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPost(post)
                                  setActionType('delete')
                                  setActionDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No reports
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              {report.post ? (
                                <>
                                  <p className="font-medium text-sm line-clamp-1">{report.post.title}</p>
                                  <p className="text-xs text-muted-foreground">by {report.post.author_name}</p>
                                </>
                              ) : report.reply ? (
                                <>
                                  <p className="text-sm line-clamp-2">{report.reply.body}</p>
                                  <p className="text-xs text-muted-foreground">by {report.reply.author_name}</p>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Content not found</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm max-w-xs line-clamp-2">{report.reason}</p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{formatTimeAgo(report.created_at)}</span>
                          </TableCell>
                          <TableCell>
                            {report.is_resolved ? (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!report.is_resolved && (
                              <div className="flex items-center justify-end gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleResolveReport(report)}>
                                  Dismiss
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Remove
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {getInitials(user.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-sm">{user.display_name}</p>
                                {user.is_verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                                {user.is_admin && <Shield className="h-3 w-3 text-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{formatTimeAgo(user.joined_at)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            <div>{user.post_count} posts</div>
                            <div>{user.reputation_score} reputation</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_verified ? (
                            <Badge variant="outline" className="gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!user.is_verified ? (
                              <Button size="sm" variant="outline" onClick={() => handleVerifyUser(user.id, true)}>
                                Verify
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleVerifyUser(user.id, false)}>
                                Unverify
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Post'}
              {actionType === 'reject' && 'Reject Post'}
              {actionType === 'delete' && 'Delete Post'}
              {actionType === 'pin' && 'Pin Post'}
              {actionType === 'unpin' && 'Unpin Post'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedPost.title}</p>
                <p className="text-sm text-muted-foreground">by {selectedPost.author_name}</p>
              </div>
              
              {(actionType === 'delete' || actionType === 'reject') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason (optional)</label>
                  <Textarea
                    placeholder="Add a note about this action..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePostAction}
              disabled={isActioning}
              variant={actionType === 'delete' || actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isActioning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'delete' && 'Delete'}
              {actionType === 'pin' && 'Pin'}
              {actionType === 'unpin' && 'Unpin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
