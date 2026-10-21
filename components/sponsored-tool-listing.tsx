'use client'
import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { isWithinSponsorWindow } from '@/lib/sponsor-window'
import type { SponsoredListingView } from '@/lib/sponsored-listing'

/** How often an open page re-evaluates a dated booking. */
export const RECHECK_MS = 60_000

/**
 * Paid tool listing, labelled "Sponsored". Pass the result of sponsoredListingFor()
 * from the server; renders nothing when it is null. When the booking has dates the
 * card is shown only after hydration and only inside the window, so a statically
 * built page switches it on and off on time without a redeploy.
 */
export function SponsoredToolListing({ listing, placement, className = '' }: { listing: SponsoredListingView | null; placement: string; className?: string }) {
  const dated = !!(listing?.window.start || listing?.window.end)
  const [active, setActive] = useState(!dated)
  useEffect(() => {
    if (!listing || !dated) return
    const check = () => setActive(isWithinSponsorWindow(listing.window))
    check()
    // Re-check while the tab stays open, so the card appears/disappears when the
    // Eastern date crosses the start or end boundary.
    const timer = setInterval(check, RECHECK_MS)
    return () => clearInterval(timer)
  }, [listing, dated])
  if (!listing || !active) return null
  return (
    <aside aria-label="Sponsored listing" data-testid="sponsored-tool-listing" className={`rounded-2xl border border-amber-300/70 bg-amber-50/60 p-5 dark:border-amber-400/30 dark:bg-amber-950/20 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-current px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.18em] text-amber-800 dark:text-amber-300">Sponsored</span>
        {listing.category ? <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{listing.category}</span> : null}
      </div>
      <p className="mt-2 text-lg font-semibold">{listing.name}</p>
      {listing.blurb ? <p className="mt-1 text-sm text-muted-foreground">{listing.blurb}</p> : null}
      <a
        href={listing.url}
        target="_blank"
        rel="sponsored nofollow noopener"
        onClick={() => { try { track('sponsored_listing_click', { resource: placement }) } catch { /* analytics must not block the click */ } }}
        className="mt-3 inline-block text-sm font-semibold text-primary underline"
      >
        {listing.ctaText} ↗
      </a>
      <p className="mt-3 text-xs text-muted-foreground">Paid placement. Sponsors don&apos;t influence our fee data or editorial coverage.</p>
    </aside>
  )
}
