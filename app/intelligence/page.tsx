import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { IntelligenceDashboard } from '@/components/intelligence-dashboard'
import { viewFromSearch } from '@/lib/intelligence-view'
import { loadIntelligenceSnapshot } from '@/lib/intelligence-data'
import { latestAnalysis } from '@/lib/analysis'

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
export const revalidate = 300
export const metadata: Metadata = {
  title: 'Ecommerce intelligence dashboard | MarketplaceBeta',
  description: 'Explore recent marketplace news by platform, audience, and operating topic. Source-linked context for sellers, agencies, technology companies, and logistics operators.',
  alternates: { canonical: '/intelligence' },
}
export default async function IntelligencePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [snapshot, query] = await Promise.all([loadIntelligenceSnapshot(), searchParams])
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (typeof value === 'string') params.set(key, value)
  const initialView = viewFromSearch(params.toString())
  const analysis = latestAnalysis(3)
  return <div className="min-h-screen bg-background"><PremiumSiteHeader active="intelligence" /><main className="mx-auto site-width px-4 py-10 sm:px-6">
    <Link href="/intelligence/dossier" className="editorial-elevated mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-700 bg-gradient-to-r from-blue-700 to-slate-950 p-6 text-white hover:border-blue-500 sm:p-7">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-200">New · Intelligence Dossier · Edition 1</p>
        <p className="mt-2 text-2xl font-bold leading-snug">The 2026 margin squeeze, and where the next edge is</p>
        <p className="mt-1 text-sm text-blue-100">Pattern discovery, a scored opportunity ranking, and 12 logged forecasts — read online or download the 29-page PDF.</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-800">Read the dossier<ArrowRight className="h-4 w-4" /></span>
    </Link>
    {analysis.length > 0 && <section aria-labelledby="latest-analysis" className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="editorial-eyebrow">Original analysis</p><h2 id="latest-analysis" className="mt-2 text-2xl font-bold">Latest analysis</h2></div>
        <Link href="/intelligence/analysis" className="text-sm font-bold text-primary">All analysis →</Link>
      </div>
      <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{analysis.map(a => <li key={a.slug}><Link href={`/intelligence/analysis/${a.slug}`} className="editorial-elevated editorial-lift block h-full rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground"><time dateTime={a.publishedOn}>{fmtDate(a.publishedOn)}</time> · {a.readTime}</p>
        <p className="mt-3 text-lg font-bold leading-snug">{a.headline}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{a.dek}</p>
        <p className="mt-4 text-sm font-bold text-primary">Read the analysis →</p>
      </Link></li>)}</ul>
    </section>}
    <IntelligenceDashboard snapshot={snapshot} initialView={initialView} /></main><PremiumSiteFooter /></div>
}
