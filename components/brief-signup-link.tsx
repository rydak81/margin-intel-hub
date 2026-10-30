"use client"

import { useEffect, useState, type ComponentProps } from "react"
import Link from "next/link"
import { BRIEF_SOURCE_STORAGE_KEY, incomingBriefSource, resolveBriefSource, withBriefSource } from "@/lib/brief-cta"

function readStored(): string | null {
  try { return window.sessionStorage.getItem(BRIEF_SOURCE_STORAGE_KEY) } catch { return null }
}

/**
 * Attribution key for a Brief signup CTA. Renders the page default on the
 * server and on first client render (no hydration mismatch, crawl-safe), then
 * switches to a valid incoming ?source (remembered for the visit in
 * sessionStorage) after mount.
 */
export function useBriefSource(pageDefault: string): string {
  const [source, setSource] = useState(pageDefault)
  useEffect(() => {
    const search = window.location.search
    const incoming = incomingBriefSource(search)
    if (incoming) {
      try { window.sessionStorage.setItem(BRIEF_SOURCE_STORAGE_KEY, incoming) } catch { /* storage blocked */ }
    }
    setSource(resolveBriefSource(pageDefault, search, readStored()))
  }, [pageDefault])
  return source
}

/** Same as useBriefSource, for a full /newsletter href (e.g. a header ctaHref). */
export function useBriefHref(href: string): string {
  const match = /^\/newsletter\?source=([^#&]+)/.exec(href)
  const source = useBriefSource(match ? match[1] : "")
  return match && source ? withBriefSource(href, source) : href
}

type BriefSignupLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { source: string }

/** Brief signup link that honours a valid incoming ?source (see useBriefSource). */
export function BriefSignupLink({ source, ...props }: BriefSignupLinkProps) {
  const key = useBriefSource(source)
  return <Link data-cta="brief_signup" {...props} href={`/newsletter?source=${key}#subscribe`} />
}
