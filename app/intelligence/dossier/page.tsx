import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Download, LineChart, ShieldCheck } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { DossierSponsorCredit } from '@/components/dossier-sponsor-credit'
import { getDossierSponsor } from '@/lib/sponsorship'

export const metadata: Metadata = {
  title: 'Intelligence Dossier: The 2026 Margin Squeeze | MarketplaceBeta',
  description:
    'Edition 1 of the MarketplaceBeta Intelligence Dossier: proprietary pattern analysis across 8,500+ classified articles, sourced market evidence, a scored opportunity ranking, and a logged 12-forecast ledger.',
  alternates: { canonical: 'https://marketplacebeta.com/intelligence/dossier' },
  openGraph: {
    title: 'The 2026 Margin Squeeze — MarketplaceBeta Intelligence Dossier',
    description: 'What the data says is happening in e-commerce, what is likely next, and what operators should do before it becomes obvious.',
    url: 'https://marketplacebeta.com/intelligence/dossier',
    type: 'article',
  },
}

const FINDINGS = [
  { title: 'The margin squeeze is structural', text: 'Record 49.5% gross margins against 10.6% net. Platforms, carriers, and ad systems are capturing the spread — only 23% of marketplace sellers are both growing and improving margins.' },
  { title: 'Freight is the under-priced Q4 risk', text: 'Record diesel, trans-Pacific container rates at 3–4x last year, and carrier surcharges decoupled from headline rate increases. Our coverage data flagged the shift two months before it was mainstream news.' },
  { title: 'Policy whiplash replaced policy direction', text: 'A Supreme Court tariff reversal, an 8-point effective-rate swing, and the permanent end of de minimis. COGS certainty now decays in weeks — but US-inventory sellers gained a durable structural edge.' },
  { title: 'Agentic commerce: small, premium, rail-unstable', text: 'AI-referred traffic is still a low-single-digit share of sessions but converts 42–54% better. The protocols churned within six months; the durable investment is structured product data.' },
  { title: 'The multichannel operating-system war began', text: 'Amazon opened Seller Central to rival-channel orders in September while Walmart cut fees to buy seller supply. Fee arbitrage and cross-channel pricing discipline are now core operator skills.' },
  { title: 'Recommerce is a structural winner — in specific places', text: 'Monthly secondhand buying jumped from 35% to 47% of consumers in a year. Our 77-SKU analysis shows the profit pool concentrates in high-ticket, low-density listings.' },
]

export default function DossierPage() {
  const sponsor = getDossierSponsor()
  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="intelligence" deskLabel="Intelligence Dossier" backHref="/intelligence" backLabel="Intelligence" />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <section className="editorial-elevated relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-7 text-white sm:p-10 lg:p-14">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-300">MarketplaceBeta Intelligence · Edition 1 · October 2026</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">The 2026 margin squeeze, and where the next edge is</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              An evidence-first dossier for e-commerce operators: proprietary pattern analysis across 8,500+ classified
              articles and a live market snapshot, 80+ dated external sources, a scored opportunity ranking, and twelve
              dated forecasts logged in a ledger we will score publicly as hits or misses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/intelligence/dossier-2026-10.html" className="inline-flex items-center gap-2 rounded-lg bg-blue-400 px-5 py-3 font-bold text-slate-950 hover:bg-blue-300">
                Read the full dossier<ArrowRight className="h-4 w-4" />
              </a>
              <a href="/intelligence/MarketplaceBeta-Intelligence-Dossier-2026-10.pdf" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 font-semibold hover:bg-white/10">
                <Download className="h-4 w-4" />Download the PDF (29 pages)
              </a>
            </div>
            <DossierSponsorCredit sponsor={sponsor} />
          </div>
        </section>

        <dl className="my-8 grid gap-4 sm:grid-cols-4">
          <div className="editorial-elevated rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">US e-commerce growth, Q2 2026</dt><dd className="mt-2 text-3xl font-bold tabular-nums">+12.2%</dd><dd className="mt-1 text-xs text-muted-foreground">vs +6.7% total retail · Census</dd></div>
          <div className="editorial-elevated rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Median net margin at record gross</dt><dd className="mt-2 text-3xl font-bold tabular-nums">10.6%</dd><dd className="mt-1 text-xs text-muted-foreground">gross 49.5% · eCommerceFuel</dd></div>
          <div className="editorial-elevated rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Marketplace sellers thriving</dt><dd className="mt-2 text-3xl font-bold tabular-nums">23%</dd><dd className="mt-1 text-xs text-muted-foreground">38% distressed · Marketplace Pulse</dd></div>
          <div className="editorial-elevated rounded-2xl border border-border bg-card p-5"><dt className="text-sm text-muted-foreground">Forecasts logged for scoring</dt><dd className="mt-2 text-3xl font-bold tabular-nums">12</dd><dd className="mt-1 text-xs text-muted-foreground">first four resolve Jan 2027</dd></div>
        </dl>

        <section className="my-10" aria-labelledby="findings-title">
          <p className="editorial-eyebrow">Executive brief</p>
          <h2 id="findings-title" className="mt-2 text-3xl font-bold">Six findings that organize the report.</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {FINDINGS.map((finding, index) => (
              <article key={finding.title} className="editorial-elevated rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Finding {index + 1}</p>
                <h3 className="mt-3 text-xl font-bold leading-snug">{finding.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{finding.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="my-12 grid gap-6 lg:grid-cols-3" aria-label="What makes this dossier different">
          {[
            { icon: LineChart, title: 'Proprietary analysis', text: 'Pattern discovery runs on our own archive and market data — coverage-attention indicators, keyword acceleration, and competitive-density structure — with reproducible queries published in the appendix.' },
            { icon: ShieldCheck, title: 'Labeled confidence', text: 'Every claim is tagged Observed, Reported, Hypothesis, or Forecast. Conflicting sources are disclosed, and a could-not-verify list is published rather than papered over.' },
            { icon: BookOpen, title: 'A scored forecast ledger', text: 'Twelve dated forecasts with confirming and invalidating indicators and resolve-by dates are stored in a database ledger. Future editions must score them — hits and misses alike.' },
          ].map((item) => (
            <div key={item.title} className="editorial-elevated rounded-2xl border border-border bg-card p-7">
              <item.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="editorial-elevated my-12 rounded-2xl border border-blue-700 bg-gradient-to-br from-blue-700 to-slate-950 p-8 text-white sm:p-10">
          <h2 className="text-3xl font-bold">Get the next edition in your inbox.</h2>
          <p className="mt-3 max-w-2xl leading-8 text-blue-100">Follow marketplace developments in the free Daily Marketplace Brief. Dossier editions and forecast scorecards are part of the coverage as they are published.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/newsletter?source=dossier_2026_10#subscribe" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-bold text-blue-800 hover:bg-blue-50">Subscribe free<ArrowRight className="h-4 w-4" /></Link>
            <a href="/intelligence/dossier-2026-10.html" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 font-semibold hover:bg-white/10">Read Edition 1</a>
          </div>
        </section>
        <p className="mb-6 text-xs leading-6 text-muted-foreground">This dossier is market intelligence, not investment, legal, or tax advice. Third-party figures belong to their cited publishers; verify fee rates against each platform&rsquo;s current schedule before acting.</p>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}

