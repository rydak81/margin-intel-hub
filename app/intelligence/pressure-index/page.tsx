import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { JsonLd } from '@/components/json-ld'
import { computePressureIndex, loadPressureArticles, type PressureIndexResult } from '@/lib/pressure-index'

export const revalidate = 86400

const URL_ = 'https://marketplacebeta.com/intelligence/pressure-index'
const CTA = '/newsletter?source=campaign_pressure_index#subscribe'

// Shared by generateMetadata and the page so each daily rebuild reads the archive once.
const getIndex = cache(async (): Promise<PressureIndexResult> => computePressureIndex(await loadPressureArticles()))

export async function generateMetadata(): Promise<Metadata> {
  const index = await getIndex()
  const top = index.rows[0]
  const ogTitle = top ? `Marketplace Pressure Index top mover: ${top.label} coverage at ${top.index.toFixed(1)}x its usual level` : 'Weekly Marketplace Pressure Index'
  const ogImage = '/api/og?title=' + encodeURIComponent(ogTitle) + '&category=' + encodeURIComponent('Pressure Index') + (top ? '&headline=' + encodeURIComponent(`${top.index.toFixed(1)}x`) : '')
  return {
    title: 'Marketplace Pressure Index: Weekly Ecommerce Coverage Intensity | MarketplaceBeta',
    description: 'Which marketplaces and topics are drawing unusual attention this week? The Pressure Index compares the last 7 days of classified marketplace coverage with its weekly average since the archive began.',
    alternates: { canonical: URL_ },
    openGraph: { title: 'Marketplace Pressure Index', description: ogTitle, url: URL_, type: 'website', images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: 'Marketplace Pressure Index', description: ogTitle, images: [ogImage] },
  }
}

function Sparkline({ values }: { values: number[] }) {
  const w = 120, h = 28, max = Math.max(1, ...values)
  const step = values.length > 1 ? w / (values.length - 1) : w
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 2) - 1).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Weekly article counts: ${values.join(', ')}`}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function heat(index: number): string {
  if (index >= 2) return 'bg-rose-600 text-white'
  if (index >= 1.4) return 'bg-orange-500 text-white'
  if (index >= 1.1) return 'bg-amber-300 text-slate-900'
  if (index >= 0.9) return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
  return 'bg-sky-200 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100'
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default async function PressureIndexPage() {
  const index = await getIndex()
  const top = index.rows[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Marketplace Pressure Index',
    description: 'Weekly coverage intensity by marketplace and topic: last-7-day count of relevant classified articles divided by the trailing weekly average since the archive began. Measures publisher attention, not market size.',
    url: URL_,
    creator: { '@type': 'Organization', name: 'MarketplaceBeta', url: 'https://marketplacebeta.com' },
    isAccessibleForFree: true,
    dateModified: index.asOf,
    ...(index.archiveStart ? { temporalCoverage: `${index.archiveStart.slice(0, 10)}/${index.asOf.slice(0, 10)}` } : {}),
    variableMeasured: 'Coverage intensity index (current week / trailing weekly average)',
  }

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="pressure" backHref="/intelligence" backLabel="Intelligence" ctaHref={CTA} />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-700 dark:text-blue-300">Updated weekly</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Marketplace Pressure Index</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Where is attention building? Each row compares the last 7 days of relevant, AI-classified coverage for a marketplace or topic with its usual week.
            An index of 2.0x means twice the normal coverage.
          </p>
          <p className="mt-4 inline-block rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-900 dark:text-amber-200">Coverage intensity, not market size.</p>
        </section>

        {index.status === 'empty' ? (
          <section className="my-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-xl font-bold">This week&apos;s Marketplace Pressure Index is being compiled</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">The archive could not be read when this page was last built. It refreshes daily; check back tomorrow, or get the index in the free brief.</p>
            <Link href={CTA} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Get the free brief<ArrowRight className="h-4 w-4" /></Link>
          </section>
        ) : (
          <>
            {top ? (
              <section className="my-8 rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Top mover, week ending {fmt(index.asOf)}</p>
                <p className="mt-2 text-3xl font-bold">{top.label} <span className="tabular-nums text-rose-600">{top.index.toFixed(2)}x</span></p>
                <p className="mt-1 text-sm text-muted-foreground">{top.current} articles in the last 7 days vs a usual {top.baseline} per week.</p>
              </section>
            ) : null}
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="p-4">Rank</th><th className="p-4">Marketplace / topic</th><th className="p-4">Index</th><th className="p-4">Last 7 days</th><th className="p-4">Usual week</th><th className="p-4">Last 12 weeks</th></tr>
                </thead>
                <tbody>
                  {index.rows.map((row, i) => (
                    <tr key={row.key} className="border-b border-border last:border-0">
                      <td className="p-4 tabular-nums text-muted-foreground">{i + 1}</td>
                      <td className="p-4 font-medium">{row.label} <span className="ml-1 text-xs text-muted-foreground">{row.kind}</span></td>
                      <td className="p-4"><span className={`rounded-md px-2.5 py-1 font-semibold tabular-nums ${heat(row.index)}`}>{row.index.toFixed(2)}x</span></td>
                      <td className="p-4 tabular-nums">{row.current}</td>
                      <td className="p-4 tabular-nums">{row.baseline}</td>
                      <td className="p-4 text-blue-600 dark:text-blue-300"><Sparkline values={row.weekly} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">How the index works</h2>
            <ul className="mt-4 space-y-3 leading-7 text-muted-foreground">
              <li>The Marketplace Pressure Index extends the monthly coverage pressure analysis in our <Link href="/intelligence/dossier" className="text-primary underline underline-offset-4">Intelligence Dossier</Link> to a weekly cadence. It is a coverage-intensity measure.</li>
              <li>We count relevant, AI-classified articles from our fixed source panel, by platform tag and by topic, for the last 7 days.</li>
              <li>The baseline is that key&apos;s average weekly count from the start of the archive{index.archiveStart ? ` (${fmt(index.archiveStart)}, ${index.weeksOfHistory} full weeks)` : ''} up to, but not including, the current week.</li>
              <li>Index = last 7 days ÷ baseline. Keys averaging under one article a week are left out as too thin to rank.</li>
              <li><strong className="text-foreground">Limits:</strong> this measures publisher attention, not sales, demand or market size. A spike says &quot;investigate&quot;, not &quot;act&quot;. In our archive, a sustained rise in logistics coverage preceded mainstream holiday freight commentary by about two months; that pattern is logged in the <Link href="/intelligence/forecasts" className="text-primary underline underline-offset-4">forecast scorecard</Link> process rather than treated as proven.</li>
            </ul>
          </div>
          <aside className="rounded-2xl border border-blue-600/30 bg-blue-500/5 p-6">
            <h2 className="text-xl font-bold">Get the index every week</h2>
            <p className="mt-3 text-muted-foreground">The free Daily Marketplace Brief flags the week&apos;s top movers and what is behind them.</p>
            <Link href={CTA} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Get the free brief<ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </section>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
