import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { BriefCta } from '@/components/brief-cta'
import { briefSignupHref } from '@/lib/brief-cta'
import { latestAnalysis } from '@/lib/analysis'
import { JsonLd } from '@/components/json-ld'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
// Existing key for the analysis hub; kept so attribution history stays continuous.
const ANALYSIS_HUB_SOURCE = 'campaign_analysis'
const INDEX_PATH = '/intelligence/analysis'
const INDEX_TITLE = 'Operator Analysis: Original Marketplace Intelligence | MarketplaceBeta'
const INDEX_DESCRIPTION = 'Original, source-linked analysis for e-commerce operators: what changed, why it matters, what to do this week, and which public forecasts it tracks.'
const INDEX_IMAGE = '/api/og?title=' + encodeURIComponent('Original analysis for operators') + '&category=' + encodeURIComponent('Analysis')

export const metadata: Metadata = {
  title: INDEX_TITLE,
  description: INDEX_DESCRIPTION,
  alternates: { canonical: INDEX_PATH },
  openGraph: { title: INDEX_TITLE, description: INDEX_DESCRIPTION, url: INDEX_PATH, type: 'website', images: [{ url: INDEX_IMAGE, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: INDEX_TITLE, description: INDEX_DESCRIPTION, images: [INDEX_IMAGE] },
}
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export default function AnalysisIndexPage() {
  const items = latestAnalysis()
  const pageUrl = `${SITE_URL}${INDEX_PATH}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Original analysis for operators',
      url: pageUrl,
      isPartOf: { '@type': 'WebSite', name: 'MarketplaceBeta', url: SITE_URL },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/intelligence/analysis/${a.slug}`, name: a.headline })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Intelligence', item: `${SITE_URL}/intelligence` },
        { '@type': 'ListItem', position: 3, name: 'Analysis', item: pageUrl },
      ],
    },
  ]
  return <div className="min-h-screen bg-background"><JsonLd data={jsonLd} /><PremiumSiteHeader active="analysis" backHref="/intelligence" backLabel="Intelligence" ctaHref={briefSignupHref(ANALYSIS_HUB_SOURCE)} />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground"><Link href="/" className="font-semibold text-primary">Home</Link><span aria-hidden="true"> / </span><Link href="/intelligence" className="font-semibold text-primary">Intelligence</Link><span aria-hidden="true"> / </span><span className="text-foreground">Analysis</span></nav>
      <section className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-700 dark:text-blue-300">MarketplaceBeta Intelligence · Analysis</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Original analysis for operators</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">What changed, why it matters, what to do this week, and what we are watching next. Every figure is linked to its source, and every forecast we reference is graded in public on the <Link href="/intelligence/forecasts" className="font-semibold text-primary underline">scorecard</Link>.</p>
      </section>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">{items.map(a => <li key={a.slug}><Link href={`/intelligence/analysis/${a.slug}`} className="editorial-elevated editorial-lift block h-full rounded-xl border border-border bg-card p-6"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground"><time dateTime={a.publishedOn}>{fmtDate(a.publishedOn)}</time> · {a.readTime}</p><p className="mt-3 text-xl font-bold leading-snug">{a.headline}</p><p className="mt-3 text-sm text-muted-foreground">{a.dek}</p></Link></li>)}</ul>
      <BriefCta source={ANALYSIS_HUB_SOURCE} heading="Get the next analysis in your inbox" body="The free Daily Marketplace Brief: fee changes, forecast grades and operator analysis like this." />
    </main><PremiumSiteFooter /></div>
}
