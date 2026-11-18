import Link from 'next/link'
import type { AnalysisArticle } from '@/lib/analysis'
import type { Marketplace } from '@/lib/marketplace-fees'
import { BriefCta } from '@/components/brief-cta'
import { RELATED_FEE_COMPARE, analysisMarketplaces, ebayAnalysisBriefSource, ebayAnalysisRelated, relatedAnalysisForMarketplace } from '@/lib/related-links'
import { workflowForAnalysis, type AiRelatedLink } from '@/lib/ai-related'

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

/** Server-rendered "Related" links for /fees/[marketplace] and every /fees/[marketplace]/[category] page. */
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

/**
 * Related reading and a Daily Brief signup for eBay analysis pages, placed at the
 * decision (the answer the visitor came for). Other articles render nothing.
 * The signup key is distinct from the sidebar's campaign_kw_* link.
 */
export function AnalysisEbayReading({ article }: { article: AnalysisArticle }) {
  const links = ebayAnalysisRelated(article)
  const source = ebayAnalysisBriefSource(article)
  if (!links || !source) return null
  return (
    <>
      <section id="related-reading" aria-labelledby="related-reading-heading" className="mb-8 scroll-mt-48">
        <h2 id="related-reading-heading" className="text-2xl font-bold">Related reading</h2>
        <ul className="mt-5 space-y-4">
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
      <BriefCta source={source} className="mb-10" />
    </>
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

/** Server-rendered "Related" links for /ai and every /ai/[slug] workflow page (see lib/ai-related.ts). */
export function AiRelatedLinks({ links, className = 'mt-12' }: { links: AiRelatedLink[]; className?: string }) {
  if (links.length === 0) return null
  return (
    <section id="related" aria-labelledby="related-heading" className={`scroll-mt-44 ${className}`}>
      <h2 id="related-heading" className="text-2xl font-bold">Related</h2>
      <ul className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">{l.label}</Link>
            <p className="mt-0.5 text-sm text-muted-foreground">{l.note}{l.date && <> · <time dateTime={l.date}>{fmtDate(l.date)}</time></>}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** "Try the workflow" link from an analysis article to its matching /ai playbook, when one is mapped. */
export function AnalysisWorkflowLink({ article }: { article: Pick<AnalysisArticle, 'slug'> }) {
  const playbook = workflowForAnalysis(article.slug)
  if (!playbook) return null
  return (
    <section id="try-the-workflow" aria-labelledby="try-the-workflow-heading" className="mt-10 rounded-xl border border-border bg-secondary/40 p-5">
      <h2 id="try-the-workflow-heading" className="text-lg font-bold">Try the workflow</h2>
      <p className="mt-2 text-sm text-muted-foreground">A step-by-step playbook with a prompt to adapt and a human review checklist.</p>
      <Link href={`/ai/${playbook.slug}`} className="mt-3 inline-block font-semibold text-primary underline">{playbook.title}</Link>
    </section>
  )
}
