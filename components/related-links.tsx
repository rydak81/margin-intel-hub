import Link from 'next/link'
import type { AnalysisArticle } from '@/lib/analysis'
import type { Marketplace } from '@/lib/marketplace-fees'
import { RELATED_FEE_COMPARE, analysisMarketplaces, relatedAnalysisForMarketplace } from '@/lib/related-links'

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

/** Server-rendered "Related" links for /fees/[marketplace]. */
export function FeeRelatedLinks({ marketplace }: { marketplace: Marketplace }) {
  const articles = relatedAnalysisForMarketplace(marketplace.slug)
  return (
    <section id="related" aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="text-2xl font-bold text-slate-900 dark:text-white">Related</h2>
      <ul className="mt-4 space-y-3">
        <li>
          <Link href={RELATED_FEE_COMPARE.href} className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">
            {RELATED_FEE_COMPARE.label}
          </Link>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{marketplace.shortName} next to the other marketplaces at the same item price.</p>
        </li>
        {articles.map(a => (
          <li key={a.slug}>
            <Link href={`/intelligence/analysis/${a.slug}`} className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">
              {a.headline}
            </Link>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Analysis · <time dateTime={a.publishedOn}>{fmtDate(a.publishedOn)}</time></p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Server-rendered links from an analysis article back to the fee pages it covers. */
export function AnalysisFeeLinks({ article }: { article: AnalysisArticle }) {
  const marketplaces = analysisMarketplaces(article)
  if (marketplaces.length === 0) return null
  return (
    <section id="related-fees" aria-labelledby="related-fees-heading" className="mt-10 border-t border-border pt-8">
      <h2 id="related-fees-heading" className="text-2xl font-bold">Fee tables for the marketplaces in this piece</h2>
      <ul className="mt-5 space-y-3">
        {marketplaces.map(m => (
          <li key={m.slug}>
            <Link href={`/fees/${m.slug}`} className="font-semibold text-primary underline">{m.name} fees by category</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
