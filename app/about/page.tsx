import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { EditorialIntro } from '@/components/editorial-intro'
import { MARKETPLACES } from '@/lib/marketplace-fees'

export const metadata: Metadata = {
  title: 'About MarketplaceBeta',
  description: 'What MarketplaceBeta covers, how fee schedules are checked against their sources, and where the guides, tools, and intelligence sections live.',
  alternates: { canonical: '/about' },
}

const SECTIONS = [
  { href: '/fees', label: 'Seller fee tables', detail: 'Referral and commission schedules for Amazon, Walmart, TikTok Shop, eBay, and Etsy.' },
  { href: '/fees/changelog', label: 'Fee change log', detail: 'Dated record of changes to those tables, with the old figure, the new figure, and the source.' },
  { href: '/fees/compare-by-item-price', label: 'Compare by item price', detail: 'Hypothetical fee totals at set prices, computed from the fee tables.' },
  { href: '/guides', label: 'Operator guides', detail: 'Hypothetical worked examples for profitability, advertising limits, and adding a channel, plus printable worksheets.' },
  { href: '/tools', label: 'Scenario tools', detail: 'Calculators for trying assumptions. Modeled signals are labeled as modeled.' },
  { href: '/tools/repricer', label: 'ProfitTygr', detail: 'A dry-run repricer. It does not submit price changes. Costs and settings stay in your browser.' },
  { href: '/news', label: 'News desk', detail: 'The daily operator briefing, with dates and links to the underlying reports.' },
  { href: '/articles', label: 'Article archive', detail: 'Search the reporting behind the headlines and follow it back to the original source.' },
  { href: '/intelligence', label: 'Intelligence', detail: 'Original analysis, the Marketplace Pressure Index, the public forecast scorecard, and the Intelligence Dossier.' },
  { href: '/editorial-policy', label: 'Editorial method', detail: 'How sources, automation, examples, and corrections are handled.' },
  { href: '/newsletter', label: 'Daily Marketplace Brief', detail: 'The free email covering fee and policy changes across the marketplaces above.' },
  { href: '/sponsor#inquiry', label: 'Sponsorships', detail: 'Inquiry form for a labelled placement. Sponsors do not change fee data or editorial coverage.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PremiumSiteHeader />
      <main className="mx-auto site-width px-4 py-10 sm:px-6">
        <EditorialIntro
          eyebrow="About MarketplaceBeta"
          title="Commerce, with operating context."
          description="MarketplaceBeta helps ecommerce operators discover developments, investigate costs, and work through business decisions."
        />
        <div className="mx-auto mt-8 max-w-4xl space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated">
            <h2 className="text-2xl font-bold">Built around the next decision</h2>
            <p className="mt-4 leading-8 text-muted-foreground">Our focus is marketplace selling, fulfillment, advertising, profitability, and the systems that connect channels. The site brings together source-linked news, a research archive, educational guides, and scenario tools.</p>
            <p className="mt-4 leading-8 text-muted-foreground">News aggregation and AI-assisted summaries help organize a large volume of information. They do not replace original reporting, current platform documentation, or your own operating data. MarketplaceBeta is not affiliated with or endorsed by the marketplaces it covers.</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated" aria-labelledby="covers-title">
            <h2 id="covers-title" className="text-2xl font-bold">What the site covers</h2>
            <ul className="mt-4 space-y-3">
              {SECTIONS.map((section) => (
                <li key={section.href} className="leading-7">
                  <Link className="font-semibold text-primary underline" href={section.href}>{section.label}</Link>
                  <span className="text-muted-foreground"> — {section.detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated" aria-labelledby="fees-method-title">
            <h2 id="fees-method-title" className="text-2xl font-bold">How fee schedules are checked</h2>
            <p className="mt-4 leading-8 text-muted-foreground">Each marketplace fee schedule has a source URL and a last-checked date, and both are shown on the fee pages. The date is when that schedule was checked against its source. It does not move on its own when a marketplace changes a rate, and a marketplace-level date is not a claim that every category was re-audited that day. Re-check the linked source before you treat a rate as current.</p>
            <p className="mt-4 leading-8 text-muted-foreground">When a figure in the tables changes, the <Link className="text-primary underline" href="/fees/changelog">fee change log</Link> records the old figure, the new figure, and the source it was checked against. The schedules currently published are {MARKETPLACES.map((marketplace) => marketplace.name).join(', ')}.</p>
            <p className="mt-4 leading-8 text-muted-foreground">Operator guides are separate from those tables. A guide is a hypothetical worked example with its assumptions written down. It is not a fee quote and not a case study of a real seller. The <Link className="text-primary underline" href="/editorial-policy">editorial method</Link> is the longer account of sources, automation, examples, and corrections.</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated" aria-labelledby="index-method-title">
            <h2 id="index-method-title" className="text-2xl font-bold">Marketplace Pressure Index</h2>
            <p className="mt-4 leading-8 text-muted-foreground">The <Link className="text-primary underline" href="/intelligence/pressure-index">Marketplace Pressure Index</Link> compares a marketplace or topic&apos;s share of the last 7 days of relevant classified coverage with its usual weekly share over the trailing 12 weeks. An index of 2.0x means that topic is taking twice its usual share of the coverage. The index uses shares, so a change in how many articles are collected overall does not move it. It measures coverage intensity, not market size.</p>
            <p className="mt-4 leading-8 text-muted-foreground">Original analysis, the public forecast scorecard, and the Intelligence Dossier are linked from <Link className="text-primary underline" href="/intelligence">Intelligence</Link>. The scorecard records forecasts so later editions can mark them hit or miss.</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-9 editorial-elevated">
            <h2 className="text-2xl font-bold">Questions and corrections</h2>
            <p className="mt-4 leading-8 text-muted-foreground">Send the page URL, the disputed statement, and supporting evidence to <Link className="text-primary underline" href="/sponsor#inquiry">our contact form</Link> (choose &ldquo;Something else&rdquo;). Please do not include private customer information.</p>
            <Link className="mt-4 inline-block font-semibold text-primary" href="/editorial-policy">Read our editorial method →</Link>
          </section>
        </div>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
