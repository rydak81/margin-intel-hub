"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, Linkedin, Loader2, Sparkles, History } from "lucide-react"

type LinkedInStyle = "thought_leadership" | "quick_take" | "data_driven" | "story"
type LinkedInAudience = "agencies" | "brands" | "partners"

interface ArticlePayload {
  id: string
  title: string
  aiSummary?: string
  ourTake?: string
  keyTakeaways?: string[]
  bottomLine?: string
  keyStat?: string | null
  category: string
  platforms?: string[]
}

interface HistoryItem {
  articleId: string
  style: LinkedInStyle
  audience: LinkedInAudience
  post: string
  createdAt: string
}

interface LinkedInPostGeneratorProps {
  article: ArticlePayload
}

const STORAGE_KEY = "marketplacebeta-linkedin-history"

const STYLE_LABELS: Record<LinkedInStyle, string> = {
  thought_leadership: "Thought Leadership",
  quick_take: "Quick Take",
  data_driven: "Data Driven",
  story: "Story",
}

const AUDIENCE_LABELS: Record<LinkedInAudience, string> = {
  agencies: "Agencies",
  brands: "Brands",
  partners: "Partners",
}

export function LinkedInPostGenerator({ article }: LinkedInPostGeneratorProps) {
  const [style, setStyle] = useState<LinkedInStyle>("thought_leadership")
  const [audience, setAudience] = useState<LinkedInAudience>("agencies")
  const [post, setPost] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored) as HistoryItem[]
      setHistory(parsed.filter((item) => item.articleId === article.id).slice(0, 5))
    } catch {
      setHistory([])
    }
  }, [article.id])

  const latestHistory = useMemo(() => history[0], [history])

  async function handleGenerate() {
    setLoading(true)
    setCopied(false)
    try {
      const response = await fetch("/api/linkedin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          aiSummary: article.aiSummary,
          ourTake: article.ourTake,
          keyTakeaways: article.keyTakeaways,
          bottomLine: article.bottomLine,
          keyStat: article.keyStat,
          category: article.category,
          platforms: article.platforms,
          articleUrl: `${window.location.origin}/news/${article.id}`,
          style,
          audience,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate LinkedIn post")
      }

      setPost(data.post)

      const newItem: HistoryItem = {
        articleId: article.id,
        style,
        audience,
        post: data.post,
        createdAt: new Date().toISOString(),
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const parsed = stored ? (JSON.parse(stored) as HistoryItem[]) : []
        const next = [newItem, ...parsed].slice(0, 12)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setHistory(next.filter((item) => item.articleId === article.id).slice(0, 5))
      } catch {
        // ignore localStorage issues
      }
    } catch (error) {
      setPost(error instanceof Error ? error.message : "Failed to generate LinkedIn post")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(textToCopy: string) {
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-0 shadow-sm bg-primary/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Linkedin className="h-4 w-4 text-primary" />
          LinkedIn Post Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Style</p>
            <Select value={style} onValueChange={(value) => setStyle(value as LinkedInStyle)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thought_leadership">Thought Leadership</SelectItem>
                <SelectItem value="quick_take">Quick Take</SelectItem>
                <SelectItem value="data_driven">Data Driven</SelectItem>
                <SelectItem value="story">Story</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Audience</p>
            <Select value={audience} onValueChange={(value) => setAudience(value as LinkedInAudience)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agencies">Agencies</SelectItem>
                <SelectItem value="brands">Brands</SelectItem>
                <SelectItem value="partners">Partners</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Post
          </Button>
          <Button variant="outline" disabled={!post && !latestHistory?.post} onClick={() => handleCopy(post || latestHistory?.post || "")} className="gap-2">
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy Post"}
          </Button>
        </div>

        {post ? (
          <div className="rounded-xl border bg-background p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{STYLE_LABELS[style]}</Badge>
              <Badge variant="outline">{AUDIENCE_LABELS[audience]}</Badge>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground font-sans">{post}</pre>
          </div>
        ) : null}

        {history.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Recent Generations
            </div>
            <div className="space-y-2">
              {history.map((item, index) => (
                <button
                  key={`${item.createdAt}-${index}`}
                  type="button"
                  onClick={() => {
                    setStyle(item.style)
                    setAudience(item.audience)
                    setPost(item.post)
                  }}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{STYLE_LABELS[item.style]}</Badge>
                    <Badge variant="outline">{AUDIENCE_LABELS[item.audience]}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.post}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
