import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { latestAnalysis } from '@/lib/analysis'
import { JsonLd } from '@/components/json-ld'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

export const metadata: Metadata = {
  title: 'Operator Analysis: Original Marketplace Intelligence | MarketplaceBeta',
  description: 'Original, source-linked analysis for e-commerce operators: what changed, why it matters, what to do this week, and which public forecasts it tracks.',
  alternates: { canonical: '/intelligence/analysis' },
}
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export default function AnalysisIndexPage() {
  const items = latestAnalysis()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Original analysis for operators',
    url: `${SITE_URL}/intelligence/analysis`,
    isPartOf: { '@type': 'WebSite', name: 'MarketplaceBeta', url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/intelligence/analysis/${a.slug}`, name: a.headline })),
    },
  }
  return <div className="min-h-screen bg-background"><JsonLd data={jsonLd} /><PremiumSiteHeader active="analysis" backHref="/intelligence" backLabel="Intelligence" ctaHref="/newsletter?source=campaign_analysis#subscribe" />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <section className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-700 dark:text-blue-300">MarketplaceBeta Intelligence · Analysis</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Original analysis for operators</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">What changed, why it matters, what to do this week, and what we are watching next. Every figure is linked to its source, and every forecast we reference is graded in public on the <Link href="/intelligence/forecasts" className="font-semibold text-primary underline">scorecard</Link>.</p>
      </section>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">{items.map(a => <li key={a.slug}><Link href={`/intelligence/analysis/${a.slug}`} className="editorial-elevated editorial-lift block h-full rounded-xl border border-border bg-card p-6"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground"><time dateTime={a.publishedOn}>{fmtDate(a.publishedOn)}</time> · {a.readTime}</p><p className="mt-3 text-xl font-bold leading-snug">{a.headline}</p><p className="mt-3 text-sm text-muted-foreground">{a.dek}</p></Link></li>)}</ul>
    </main><PremiumSiteFooter /></div>
}
