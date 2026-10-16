import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { JsonLd } from '@/components/json-ld'
import { FORECASTS, FORECAST_EDITION, scoreForecasts, type ForecastStatus } from '@/lib/forecasts'

const URL_ = 'https://marketplacebeta.com/intelligence/forecasts'
const CTA = '/newsletter?source=campaign_forecasts#subscribe'

export const metadata: Metadata = {
  title: 'Ecommerce Forecast Scorecard: 12 Public, Graded Marketplace Forecasts | MarketplaceBeta',
  description: 'Every MarketplaceBeta forecast is published with a probability, the indicators that would confirm or invalidate it, and a resolve-by date, then graded in public. See the open ledger and our running accuracy.',
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'The MarketplaceBeta forecast scorecard',
    description: '12 probabilistic ecommerce forecasts, logged in public and graded as they resolve.',
    url: URL_, type: 'website',
    images: [{ url: '/api/og?title=' + encodeURIComponent('12 public ecommerce forecasts, graded as they resolve') + '&headline=' + encodeURIComponent('Scorecard'), width: 1200, height: 630 }],
  },
}

const STATUS_STYLE: Record<ForecastStatus, string> = {
  open: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  hit: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  miss: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
const pct = (x: number) => `${Math.round(x * 100)}%`

export default function ForecastScorecardPage() {
  const score = scoreForecasts()
  const nextResolve = FORECASTS.filter(f => f.status === 'open').map(f => f.resolveBy).sort()[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'MarketplaceBeta forecast ledger',
    description: 'Probabilistic ecommerce and marketplace forecasts with stated probabilities, confirming and invalidating indicators, resolve-by dates and outcomes.',
    url: URL_,
    creator: { '@type': 'Organization', name: 'MarketplaceBeta', url: 'https://marketplacebeta.com' },
    datePublished: FORECAST_EDITION.loggedOn,
    isAccessibleForFree: true,
    variableMeasured: ['probability', 'status', 'resolveBy'],
    hasPart: FORECASTS.map(f => ({ '@type': 'Claim', name: `${f.id}: ${f.statement}`, text: `${f.statement} (p=${f.probability.toFixed(2)}, resolve by ${f.resolveBy}, status: ${f.status})` })),
  }

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="forecasts" backHref="/intelligence" backLabel="Intelligence" ctaHref={CTA} />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-700 dark:text-blue-300">Forecast scorecard · {FORECAST_EDITION.label}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Forecasts we publish, then grade in public</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Each forecast is logged with a probability, the indicators that would confirm or invalidate it, and a resolve-by date.
            When it resolves we mark it hit or miss here, including the misses. That is how you can tell whether our intelligence is worth acting on.
          </p>
        </section>

        <dl className="my-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Forecasts logged</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{score.total}</dd></div>
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Open / hit / miss</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{score.open} / {score.hits} / {score.misses}</dd></div>
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Running accuracy</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{score.accuracy === null ? <span className="text-xl">First forecasts resolve January 2027</span> : pct(score.accuracy)}</dd>{score.expectedHitRate !== null ? <dd className="mt-1 text-xs text-muted-foreground">calibrated target {pct(score.expectedHitRate)} · Brier {score.brier}</dd> : null}</div>
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Next resolve-by date</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{nextResolve ? fmtDate(nextResolve) : '—'}</dd></div>
        </dl>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-4">#</th><th className="p-4">Horizon</th><th className="p-4">Forecast</th><th className="p-4">p</th><th className="p-4">Confirms / invalidates</th><th className="p-4">Resolve by</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {FORECASTS.map(f => (
                <tr key={f.id} id={f.id.toLowerCase()} className="border-b border-border last:border-0 align-top">
                  <td className="p-4 font-mono font-semibold">{f.id}</td>
                  <td className="p-4 whitespace-nowrap tabular-nums">{f.horizon}</td>
                  <td className="p-4 font-medium">{f.statement}{f.resolutionNote ? <p className="mt-2 text-xs text-muted-foreground">{f.resolutionNote}</p> : null}</td>
                  <td className="p-4 tabular-nums">{f.probability.toFixed(2)}</td>
                  <td className="p-4 text-muted-foreground">{f.indicators}</td>
                  <td className="p-4 whitespace-nowrap tabular-nums">{fmtDate(f.resolveBy)}{f.resolveByBasis === 'horizon' ? <span className="block text-xs text-muted-foreground">end of horizon</span> : null}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[f.status]}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">Methodology</h2>
            <ul className="mt-4 space-y-3 leading-7 text-muted-foreground">
              <li><strong className="text-foreground">Probabilities are calibrated judgments, not model outputs.</strong> They are set against the cited evidence in the <Link href="/intelligence/dossier" className="text-primary underline underline-offset-4">Intelligence Dossier</Link>. If we are well calibrated, about 70% of our p=0.70 forecasts should resolve true.</li>
              <li><strong className="text-foreground">Resolution is fixed in advance.</strong> Each forecast names the indicators that confirm or invalidate it. Where the forecast does not name a date, the resolve-by date is the end of its stated horizon from the October 2026 edition.</li>
              <li><strong className="text-foreground">Scoring.</strong> Running accuracy is hits divided by resolved forecasts, reported once the first forecasts resolve in January 2027. We also report the Brier score (0 is perfect, 0.25 is a coin flip) and the hit rate our stated probabilities imply, so you can see calibration as well as accuracy.</li>
              <li><strong className="text-foreground">Nothing is deleted.</strong> Misses stay on the ledger. New editions add forecasts; they do not rewrite old ones.</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">The first calibration read arrives when the holiday forecasts (F1–F4) resolve in January 2027.</p>
          </div>
          <aside className="rounded-2xl border border-blue-600/30 bg-blue-500/5 p-6">
            <h2 className="text-xl font-bold">Get each forecast as it resolves</h2>
            <p className="mt-3 text-muted-foreground">The free Daily Marketplace Brief carries scorecard updates, new forecasts and the evidence behind them.</p>
            <Link href={CTA} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Get the free brief<ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </section>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
