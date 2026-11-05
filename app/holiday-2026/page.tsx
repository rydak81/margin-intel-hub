import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { BriefCta } from '@/components/brief-cta'
import { JsonLd } from '@/components/json-ld'
import { ORGANIZATION_REF } from '@/lib/site-jsonld'
import { RELATED_FEE_COMPARE } from '@/lib/related-links'
import {
  HOLIDAY_FEE_PAGES, HOLIDAY_HUB_DESCRIPTION, HOLIDAY_HUB_HEADING, HOLIDAY_HUB_PATH, HOLIDAY_HUB_SOURCE, HOLIDAY_HUB_TITLE,
  holidayAnalysisEntries, holidayHubBriefHref, holidayHubEntries, holidayHubUpdatedOn, type HolidayHubEntry,
} from '@/lib/holiday-hub'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export const metadata: Metadata = {
  title: `${HOLIDAY_HUB_TITLE} | MarketplaceBeta`,
  description: HOLIDAY_HUB_DESCRIPTION,
  alternates: { canonical: HOLIDAY_HUB_PATH },
  openGraph: { title: HOLIDAY_HUB_TITLE, description: HOLIDAY_HUB_DESCRIPTION, url: HOLIDAY_HUB_PATH, type: 'website' },
  twitter: { card: 'summary_large_image', title: HOLIDAY_HUB_TITLE, description: HOLIDAY_HUB_DESCRIPTION },
}

function EntryList({ entries, dateLabel }: { entries: HolidayHubEntry[]; dateLabel: string }) {
  return (
    <ul className="mt-6 space-y-5">
      {entries.map(e => (
        <li key={e.href} className="rounded-xl border border-border bg-card p-5">
          <Link href={e.href} className="text-lg font-semibold text-primary underline underline-offset-4">{e.title}</Link>
          <p className="mt-2 text-muted-foreground">{e.description}</p>
          <p className="mt-2 text-sm text-muted-foreground">{e.kind} · {dateLabel} <time dateTime={e.date}>{fmtDate(e.date)}</time></p>
        </li>
      ))}
    </ul>
  )
}

export default function Holiday2026HubPage() {
  const analysis = holidayAnalysisEntries()
  const all = holidayHubEntries()
  const url = `${siteUrl}${HOLIDAY_HUB_PATH}`
  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: HOLIDAY_HUB_TITLE, description: HOLIDAY_HUB_DESCRIPTION, url,
      dateModified: holidayHubUpdatedOn(), publisher: ORGANIZATION_REF,
      mainEntity: { '@type': 'ItemList', itemListElement: all.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.title, url: `${siteUrl}${e.href}` })) },
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: HOLIDAY_HUB_HEADING, item: url },
    ] },
  ]
  return <div className="min-h-screen bg-background">
    <JsonLd data={schema} />
    <PremiumSiteHeader ctaHref={holidayHubBriefHref()} />
    <main className="mx-auto site-width px-4 py-10 sm:px-6">
      <header className="editorial-intro rounded-2xl border border-border p-6 sm:p-10">
        <p className="editorial-eyebrow">Q4 2026 · Marketplace sellers</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">{HOLIDAY_HUB_HEADING}</h1>
        <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{HOLIDAY_HUB_DESCRIPTION} Each page cites its own sources; new holiday pieces are added here as they publish.</p>
      </header>
      <section id="analysis" aria-labelledby="holiday-analysis-heading" className="mt-12">
        <h2 id="holiday-analysis-heading" className="text-2xl font-bold sm:text-3xl">Holiday analysis</h2>
        <p className="mt-2 text-sm text-muted-foreground">Newest first.</p>
        <EntryList entries={analysis} dateLabel="Published" />
      </section>
      <section id="fees" aria-labelledby="holiday-fees-heading" className="mt-12">
        <h2 id="holiday-fees-heading" className="text-2xl font-bold sm:text-3xl">Holiday fee pages</h2>
        <EntryList entries={HOLIDAY_FEE_PAGES} dateLabel="Checked" />
      </section>
      <section id="related" aria-labelledby="related-heading" className="mt-12">
        <h2 id="related-heading" className="text-2xl font-bold">Related</h2>
        <ul className="mt-4 space-y-3">
          <li><Link href={RELATED_FEE_COMPARE.href} className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">{RELATED_FEE_COMPARE.label}</Link></li>
          <li><Link href="/fees" className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">Marketplace fees by category</Link></li>
          <li><Link href="/intelligence/analysis" className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400">All operator analysis</Link></li>
        </ul>
      </section>
      <BriefCta
        source={HOLIDAY_HUB_SOURCE}
        heading="Get holiday fee and policy changes as they land"
        body="The free Daily Marketplace Brief flags fee and policy changes across Amazon, Walmart, TikTok Shop, eBay and Etsy, with the source document."
        className="mt-12"
      />
    </main>
    <PremiumSiteFooter />
  </div>
}
