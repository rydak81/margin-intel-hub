"use client"

import { useState } from "react"
import { trackResourceEvent } from "@/lib/resource-analytics"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"
export const EMBED_SNIPPET = `<iframe src="${SITE_URL}/embed/fee-calculator" width="100%" height="460" style="border:0;max-width:480px" loading="lazy" title="Marketplace fee calculator by MarketplaceBeta"></iframe>
<p style="font-size:12px"><a href="${SITE_URL}/fees?source=embed">Marketplace seller fees</a> by MarketplaceBeta</p>`

export function EmbedSnippet() {
  const [copied, setCopied] = useState(false)
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/45">
      <h2 className="text-xl font-semibold">Embed this calculator</h2>
      <p className="mt-1 text-sm text-muted-foreground">Free for blogs, forums and agency sites. Paste this HTML where you want the Amazon, Walmart, TikTok Shop, eBay and Etsy fee calculator to appear. <a href="/embed/fee-calculator" target="_blank" className="underline">Preview</a></p>
      <textarea readOnly value={EMBED_SNIPPET} rows={4} className="mt-3 w-full rounded-lg border border-border bg-secondary p-3 font-mono text-xs" onFocus={e => e.currentTarget.select()} aria-label="Embed code" />
      <button type="button" className="mt-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        onClick={async () => { trackResourceEvent("embed_snippet_copy", "tools"); try { await navigator.clipboard.writeText(EMBED_SNIPPET); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ } }}>
        {copied ? "Copied" : "Copy embed code"}
      </button>
    </section>
  )
}
