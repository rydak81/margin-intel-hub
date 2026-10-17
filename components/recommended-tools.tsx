'use client'
import { trackResourceEvent } from '@/lib/resource-analytics'
import type { AffiliateOffer } from '@/lib/affiliates'

type Offer = Pick<AffiliateOffer, 'id' | 'name' | 'category' | 'blurb' | 'url' | 'affiliateLinkConfigured'>

/** Affiliate tool recommendations. Pass offers from getRecommendedOffers() on the server. */
export function RecommendedTools({ offers, placement, title = 'Recommended tools', className = '' }: { offers: Offer[]; placement: string; title?: string; className?: string }) {
  if (!offers.length) return null
  const hasAffiliateLinks = offers.some(o => o.affiliateLinkConfigured)
  return (
    <section aria-labelledby={`rec-tools-${placement}`} className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
      <h2 id={`rec-tools-${placement}`} className="text-xl font-bold">{title}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {offers.map(o => (
          <li key={o.id} className="rounded-xl border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{o.category}</p>
            <p className="mt-1 font-semibold">{o.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{o.blurb}</p>
            <a
              href={o.url}
              target="_blank"
              rel={o.affiliateLinkConfigured ? "sponsored nofollow noopener" : "nofollow noopener"}
              onClick={() => trackResourceEvent(o.affiliateLinkConfigured ? 'affiliate_click' : 'vendor_link_click', `${o.id}:${placement}`)}
              className="mt-3 inline-block text-sm font-semibold text-primary underline"
            >
              Visit {o.name} ↗{o.affiliateLinkConfigured ? " (affiliate link)" : ""}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">{hasAffiliateLinks ? "Disclosure: links marked ‘affiliate link’ may earn MarketplaceBeta a commission if you sign up, at no extra cost to you. This does not change our fee data or editorial coverage." : "These are direct vendor links. No affiliate commission is expected from these links."}</p>
    </section>
  )
}
