"use client"

import { useState } from "react"
import { trackResourceEvent } from "@/lib/resource-analytics"

interface ShareButtonsProps {
  /** Absolute canonical URL of the page. */
  url: string
  text: string
  placement: string
  className?: string
}

function withSource(url: string, source: string): string {
  const u = new URL(url)
  u.searchParams.set("utm_source", source)
  return u.toString()
}

export function ShareButtons({ url, text, placement, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const links = [
    { id: "x", label: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(withSource(url, "x"))}` },
    { id: "linkedin", label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(withSource(url, "linkedin"))}` },
    { id: "reddit", label: "Share on Reddit", href: `https://www.reddit.com/submit?url=${encodeURIComponent(withSource(url, "reddit"))}&title=${encodeURIComponent(text)}` },
  ]
  const track = (network: string) => trackResourceEvent("share_click", `${placement}:${network}`)

  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className}`} aria-label="Share this page">
      <span className="text-muted-foreground">Share:</span>
      {links.map(l => (
        <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track(l.id)}
          className="rounded-full border border-border px-3 py-1.5 hover:border-sky-400">{l.label.replace("Share on ", "")}</a>
      ))}
      <button type="button" className="rounded-full border border-border px-3 py-1.5 hover:border-sky-400"
        onClick={async () => {
          track("copy")
          try { await navigator.clipboard.writeText(withSource(url, "share")); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ }
        }}>{copied ? "Link copied" : "Copy link"}</button>
    </div>
  )
}
