import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, FileText, Lock } from 'lucide-react'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { UpgradeLink } from '@/components/upgrade-link'
import { DOSSIER_OPERATOR_FEATURES, FREE_FEATURES, PRO_FEATURES, resolveOffers } from '@/lib/paid-offer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
const title = 'Pricing: Free Brief and MarketplaceBeta Pro | MarketplaceBeta'
// Under ~160 characters so it is not truncated in results; every item is on the page (lib/paid-offer.ts).
const description = 'Free: the Daily Marketplace Brief, forecast scorecard, Marketplace Pressure Index and fee tools. Pro adds a weekly memo, forecast tracker and Dossier data.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: { title, description, url: `${SITE_URL}/pricing`, type: 'website' },
}

const FAQ = [
  ['Will the free Brief and public pages stay free?', 'Yes. The Daily Marketplace Brief, the dashboard, the forecast scorecard, the Pressure Index and the fee tools stay free. Pro is for operators who want the analysis turned into decisions.'],
  ['How is Pro different from the free Brief?', 'The Brief tells you what happened. Pro tells you what it means for your margins, which forecast indicators moved, and what we would do about it, with the underlying data.'],
  ['Can I cancel?', 'Yes, any time. Email hello@marketplacebeta.com and we cancel the same day. You keep access until the end of the period you paid for.'],
  ['Do you publish odds or probabilities?', 'No. Forecasts are dated calls graded hit or miss in public. Pro adds the indicator tracking behind them.'],
] as const

export default function PricingPage() {
  const { pro, dossier } = resolveOffers()
  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader active="pricing" backHref="/intelligence" backLabel="Intelligence" />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-700 dark:text-blue-300">Pricing</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Intelligence that pays for itself in one decision</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            We classify thousands of marketplace stories, track dated forecasts in public, and measure where industry attention is shifting each week.
            The headlines are free. Pro turns that archive into the calls that protect your margin.
          </p>
        </section>

        <section className="my-10 grid gap-6 lg:grid-cols-3" aria-label="Plans">
          <div className="rounded-2xl border border-border bg-card p-7">
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Free</p>
            <p className="mt-3 text-3xl font-bold">$0</p>
            <ul className="mt-6 space-y-3 text-sm leading-6">
              {FREE_FEATURES.map(f => <li key={f} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-blue-600" />{f}</li>)}
            </ul>
            <Link href="/newsletter?source=campaign_pricing#subscribe" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 font-semibold hover:bg-muted">Get the free Brief</Link>
          </div>

          <div id="pro" className="relative rounded-2xl border-2 border-amber-500 bg-slate-950 p-7 text-white shadow-xl">
            <span className="absolute -top-3 left-7 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950">Founding members</span>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-300"><Lock className="h-4 w-4" />Pro</p>
            <p className="mt-3 text-3xl font-bold">{pro.priceLabel ?? 'Founding rate'}</p>
            {!pro.live ? <p className="mt-1 text-sm text-slate-300">Checkout opens to the founding list first.</p> : null}
            <p className="mt-4 text-sm text-slate-300">Everything in Free, plus:</p>
            <ul className="mt-3 space-y-3 text-sm leading-6">
              {PRO_FEATURES.map(f => <li key={f.title} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-amber-300" /><span><strong>{f.title}.</strong> <span className="text-slate-300">{f.text}</span></span></li>)}
            </ul>
            <UpgradeLink placement="pricing_pro" href={pro.href} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950 hover:bg-amber-300">{pro.ctaLabel}<ArrowRight className="h-4 w-4" /></UpgradeLink>
          </div>

          <div id="operator-edition" className="rounded-2xl border border-border bg-card p-7">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground"><FileText className="h-4 w-4" />Dossier Operator Edition</p>
            <p className="mt-3 text-3xl font-bold">{dossier.priceLabel ?? 'One-time'}</p>
            <p className="mt-1 text-sm text-muted-foreground">No subscription. The working files behind Edition 1.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6">
              {DOSSIER_OPERATOR_FEATURES.map(f => <li key={f} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-blue-600" />{f}</li>)}
            </ul>
            <UpgradeLink placement="pricing_dossier" href={dossier.href} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">{dossier.ctaLabel}<ArrowRight className="h-4 w-4" /></UpgradeLink>
          </div>
        </section>

        <section className="my-12 max-w-3xl" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-bold">Questions</h2>
          <dl className="mt-5 space-y-5">
            {FAQ.map(([q, a]) => <div key={q}><dt className="font-semibold">{q}</dt><dd className="mt-1 leading-7 text-muted-foreground">{a}</dd></div>)}
          </dl>
          <p className="mt-6 text-sm text-muted-foreground">Payments are processed by Stripe. Questions before you join? <a href="mailto:hello@marketplacebeta.com" className="text-primary underline underline-offset-4">hello@marketplacebeta.com</a>. Market intelligence, not investment, legal or tax advice.</p>
        </section>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
