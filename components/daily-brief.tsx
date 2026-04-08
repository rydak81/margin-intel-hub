"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  Loader2,
  BookOpen,
} from "lucide-react"

export function DailyBrief() {
  const [brief, setBrief] = useState<string | null>(null)
  const [briefDate, setBriefDate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchBrief() {
      try {
        const res = await fetch("/api/news/daily-brief/latest")
        const data = await res.json()
        if (data.success && data.brief) {
          setBrief(data.brief)
          setBriefDate(data.date)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBrief()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-6 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading today&apos;s brief...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !brief) {
    return null // Don't show the section if no brief available
  }

  // Parse markdown-like content into simple HTML
  const formatBrief = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h4 class="text-lg font-semibold mt-6 mb-2">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-1">$1</h3>')
      .replace(/^\*(.+)\*$/gm, '<p class="text-sm text-muted-foreground italic mb-4">$1</p>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>')
  }

  const previewLength = 600
  const isLong = brief.length > previewLength
  const displayText = expanded ? brief : brief.substring(0, previewLength)

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">The Seller&apos;s Daily Brief</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{briefDate ? new Date(briefDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Today'}</span>
                <Badge variant="secondary" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  AI-Powered Analysis
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Brief content */}
        <div className="px-6 py-4">
          <div
            className="prose prose-sm max-w-none text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_strong]:text-foreground [&_li]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formatBrief(displayText + (isLong && !expanded ? '...' : '')) }}
          />

          {isLong && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-primary"
            >
              {expanded ? (
                <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
              ) : (
                <>Read Full Brief <ChevronDown className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
