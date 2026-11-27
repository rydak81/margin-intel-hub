import Link from 'next/link'
import type { MarketplaceSlug } from '@/lib/marketplace-fees'
import { saleFeeRelatedLinks } from '@/lib/sale-fee-related'

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

/**
 * Server-rendered analysis links for an on-a-$N-sale fee page.
 * Pass `now` in tests; the page uses the render time.
 */
export function SaleFeeRelatedAnalysis({ marketplace, now = new Date() }: { marketplace: MarketplaceSlug; now?: Date }) {
  const links = saleFeeRelatedLinks(marketplace, now)
  if (links.length === 0) return null
  return (
    <section id="related-analysis" aria-labelledby="related-analysis-heading" className="mt-10">
      <h2 id="related-analysis-heading" className="text-2xl font-bold">Related analysis</h2>
      <ul className="mt-4 space-y-4">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="font-semibold text-primary underline">{link.label}</Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {link.note}
              {link.date ? <> · <time dateTime={link.date}>{fmtDate(link.date)}</time></> : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
