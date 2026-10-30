import { ORGANIZATION_REF } from '@/lib/site-jsonld'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { SponsorBriefLink } from '@/components/brief-cta'
import { JsonLd } from '@/components/json-ld'
import { UpgradeCta } from '@/components/upgrade-cta'
import { FORECAST_EDITION, loadForecasts, scoreForecasts, type ForecastStatus } from '@/lib/forecasts'
import { loadLatestAnalystRun } from '@/lib/analyst'

const URL_ = 'https://marketplacebeta.com/intelligence/forecasts'
const CTA = '/newsletter?source=campaign_forecasts#subscribe'

export const metadata: Metadata = {
  title: '2026 Holiday Forecast for Sellers, Graded | MarketplaceBeta',
  description: 'Our 2026 holiday forecast for sellers and other marketplace calls, each published with the indicators that would confirm or invalidate it and a resolve-by date, then graded in public: hit, partial, or miss.',
  alternates: { canonical: URL_ },
  openGraph: {
    title: 'The MarketplaceBeta forecast scorecard',
    description: '12 dated ecommerce forecasts, logged in public and graded as they resolve.',
    url: URL_, type: 'website',
    images: [{ url: '/api/og?title=' + encodeURIComponent('12 public ecommerce forecasts, graded as they resolve') + '&headline=' + encodeURIComponent('Scorecard'), width: 1200, height: 630 }],
  },
}

const STATUS_STYLE: Record<ForecastStatus, string> = {
  open: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  hit: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  partial: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  miss: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  unresolvable: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
}

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

const SIGNAL_STYLE: Record<string, string> = {
  confirming: 'text-emerald-700 dark:text-emerald-300',
  invalidating: 'text-rose-700 dark:text-rose-300',
  mixed: 'text-amber-700 dark:text-amber-300',
}

export const revalidate = 300

export default async function ForecastScorecardPage() {
  const [forecasts, analystRun] = await Promise.all([loadForecasts(), loadLatestAnalystRun()])
  const score = scoreForecasts(forecasts)
  const nextResolve = forecasts.filter(f => f.status === 'open').map(f => f.resolveBy).sort()[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'MarketplaceBeta forecast ledger',
    description: 'Dated ecommerce and marketplace forecasts with confirming and invalidating indicators, resolve-by dates and hit/miss outcomes.',
    url: URL_,
    creator: ORGANIZATION_REF,
    datePublished: FORECAST_EDITION.loggedOn,
    isAccessibleForFree: true,
    variableMeasured: ['status', 'resolveBy'],
    hasPart: forecasts.map(f => ({ '@type': 'Claim', name: `${f.id}: ${f.statement}`, text: `${f.statement} (resolve by ${f.resolveBy}, status: ${f.status})` })),
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
            Each forecast is logged with the indicators that would confirm or invalidate it and a resolve-by date.
            When it resolves we grade it here — hit, partial, or miss — including the misses. That is how you can tell whether our intelligence is worth acting on.
          </p>
        </section>

        <dl className="my-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Forecasts logged</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{score.total}</dd></div>
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Open / hit / miss</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{score.open} / {score.hits} / {score.misses}</dd>{score.partial > 0 || score.unresolvable > 0 ? <dd className="mt-1 text-xs text-muted-foreground">{[score.partial > 0 ? `+ ${score.partial} partial` : null, score.unresolvable > 0 ? `+ ${score.unresolvable} unresolvable` : null].filter(Boolean).join(' · ')}</dd> : null}</div>
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Graded so far</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{score.resolved === 0 ? <span className="text-xl">First forecasts resolve January 2027</span> : <span className="text-xl">{[`${score.hits} hit${score.hits === 1 ? '' : 's'}`, `${score.misses} miss${score.misses === 1 ? '' : 'es'}`, score.partial > 0 ? `${score.partial} partial` : null, score.unresolvable > 0 ? `${score.unresolvable} unresolvable` : null].filter(Boolean).join(', ')}</span>}</dd></div>
          <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Next resolve-by date</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{nextResolve ? fmtDate(nextResolve) : '—'}</dd></div>
        </dl>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-4">#</th><th className="p-4">Horizon</th><th className="p-4">Forecast</th><th className="p-4">Confirms / invalidates</th><th className="p-4">Resolve by</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {forecasts.map(f => (
                <tr key={f.id} id={f.id.toLowerCase()} className="border-b border-border last:border-0 align-top">
                  <td className="p-4 font-mono font-semibold">{f.id}</td>
                  <td className="p-4 whitespace-nowrap tabular-nums">{f.horizon}</td>
                  <td className="p-4 font-medium">{f.statement}{f.resolutionNote ? <p className="mt-2 text-xs text-muted-foreground">{f.resolutionNote}</p> : null}</td>
                  <td className="p-4 text-muted-foreground">{f.indicators}{f.indicatorSignal && f.indicatorSignal !== 'none' && f.indicatorNote ? <p className="mt-2 text-xs"><span className={`font-bold capitalize ${SIGNAL_STYLE[f.indicatorSignal] ?? ''}`}>{f.indicatorSignal}</span>{f.indicatorsCheckedAt ? <span> · checked {fmtDate(f.indicatorsCheckedAt.slice(0, 10))}</span> : null} — {f.indicatorNote}</p> : null}</td>
                  <td className="p-4 whitespace-nowrap tabular-nums">{fmtDate(f.resolveBy)}{f.resolveByBasis === 'horizon' ? <span className="block text-xs text-muted-foreground">end of horizon</span> : null}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[f.status]}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {analystRun ? (
          <section className="mt-10 rounded-2xl border border-border bg-card p-7" aria-labelledby="analyst-log-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="analyst-log-title" className="text-2xl font-bold">From the analyst&rsquo;s desk</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily agent run · {fmtDate(analystRun.runDate)} · {analystRun.articlesConsidered} articles reviewed</p>
            </div>
            <p className="mt-4 leading-8 text-muted-foreground">{analystRun.assessment}</p>
            {analystRun.watchlist.length > 0 ? (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {analystRun.watchlist.map((w) => (
                  <li key={w.item} className="rounded-xl border border-border bg-background p-4">
                    <p className="text-sm font-bold">{w.item}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{w.why}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-5 text-xs leading-6 text-muted-foreground">Written by our analyst agent, which runs daily over the newly classified coverage with its own persistent memory, checks every open forecast&rsquo;s indicators against the evidence, and corrects its earlier conclusions when the data turns. Its indicator reads appear on the ledger above.</p>
          </section>
        ) : null}

        <UpgradeCta placement="forecasts_table" headline="Track every indicator behind these forecasts, monthly" className="mt-10" />

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">Methodology</h2>
            <ul className="mt-4 space-y-3 leading-7 text-muted-foreground">
              <li><strong className="text-foreground">Forecasts are evidence-based judgments, not model outputs.</strong> Each one is grounded in the cited evidence in the <Link href="/intelligence/dossier" className="text-primary underline underline-offset-4">Intelligence Dossier</Link>.</li>
              <li><strong className="text-foreground">Resolution is fixed in advance.</strong> Each forecast names the indicators that confirm or invalidate it. Where the forecast does not name a date, the resolve-by date is the end of its stated horizon from the October 2026 edition.</li>
              <li><strong className="text-foreground">Scoring.</strong> Each resolved forecast receives one of four grades — hit, partial, miss, or unresolvable — and the scorecard shows the running count of each. Only a fully correct call is a hit: a partially correct call is marked partial, and a forecast whose measuring source stops publishing is marked unresolvable rather than quietly dropped. The first forecasts resolve in January 2027.</li>
              <li><strong className="text-foreground">Indicators are checked by an agent, daily.</strong> An analyst agent reviews each open forecast&rsquo;s confirming and invalidating indicators against the day&rsquo;s classified coverage and posts its read on the ledger. When a forecast resolves, it writes a post-mortem to its memory, and future runs — and future forecasts — are made with those post-mortems in context.</li>
              <li><strong className="text-foreground">Nothing is deleted.</strong> Misses stay on the ledger. New editions add forecasts; they do not rewrite old ones.</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">The first grades arrive when the holiday forecasts (F1–F4) resolve in January 2027.</p>
          </div>
          <aside className="rounded-2xl border border-blue-600/30 bg-blue-500/5 p-6">
            <h2 className="text-xl font-bold">Get each forecast as it resolves</h2>
            <p className="mt-3 text-muted-foreground">The free Daily Marketplace Brief carries scorecard updates, new forecasts and the evidence behind them.</p>
            <Link href={CTA} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Get the free brief<ArrowRight className="h-4 w-4" /></Link>
            <SponsorBriefLink className="mt-4" />
          </aside>
        </section>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
