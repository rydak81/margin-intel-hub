import type { Metadata } from 'next'
import Link from 'next/link'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { JsonLd } from '@/components/json-ld'
import { SPONSOR_CONTACT_EMAIL, sponsorMailto } from '@/lib/sponsorship'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'
const title = 'Sponsor the Daily Marketplace Brief | MarketplaceBeta'
const description = 'Reach marketplace sellers, operators, agencies and ecommerce SaaS teams through the Daily Marketplace Brief, sponsored tool listings and the MarketplaceBeta dossier.'

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${SITE_URL}/sponsor` },
  openGraph: { title, description, url: `${SITE_URL}/sponsor`, type: 'website' },
}

const AUDIENCE = [
  { name: 'Marketplace sellers', detail: 'Brands and resellers on Amazon, Walmart, TikTok Shop, eBay and Etsy who read for fee changes, policy updates and margin pressure.' },
  { name: 'Operators and finance leads', detail: 'People responsible for contribution margin, inventory and channel mix, who use our fee calculators and guides to make decisions.' },
  { name: 'Agencies and service providers', detail: 'Teams that manage marketplace accounts for clients and need to stay ahead of platform changes.' },
  { name: 'Ecommerce SaaS and investors', detail: 'Product, partnership and investment teams tracking where the marketplace ecosystem is heading.' },
]

const PLACEMENTS = [
  { name: 'Newsletter sponsor slot', detail: 'A single clearly labelled sponsor block in the Daily Marketplace Brief, sent each weekday. One sponsor per issue, written to read like a useful recommendation.' },
  { name: 'Sponsored tool listing', detail: 'A labelled listing alongside our recommended tools on fee pages, fee comparisons, operator guides and the tools hub, targeted by marketplace or topic.' },
  { name: 'Dossier sponsor', detail: 'Presenting sponsorship of the MarketplaceBeta Intelligence Dossier, our downloadable research report delivered to readers who request it.' },
]

export default function SponsorPage() {
  const mailto = sponsorMailto()
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Sponsor', item: `${SITE_URL}/sponsor` },
  ] }
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="editorial-eyebrow">Media kit</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Sponsor the Daily Marketplace Brief</h1>
        <p className="mt-4 text-lg text-muted-foreground">MarketplaceBeta covers the fees, policies and market moves that change marketplace sellers&apos; margins. Sponsors reach readers at the moment they are deciding what to change in their business.</p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Who reads MarketplaceBeta</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {AUDIENCE.map(a => <li key={a.name} className="rounded-xl border border-border p-5"><p className="font-semibold">{a.name}</p><p className="mt-2 text-sm text-muted-foreground">{a.detail}</p></li>)}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Placements</h2>
          <ul className="mt-4 space-y-4">
            {PLACEMENTS.map(p => <li key={p.name} className="rounded-xl border border-border p-5"><p className="font-semibold">{p.name}</p><p className="mt-2 text-sm text-muted-foreground">{p.detail}</p></li>)}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Our standards</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Every sponsored placement is labelled as sponsored.</li>
            <li>Sponsors never influence fee data, comparisons or editorial coverage. See our <Link href="/editorial-policy" className="underline">editorial policy</Link>.</li>
            <li>We only accept sponsors that are relevant to marketplace sellers and operators.</li>
          </ul>
        </section>

        <section id="request-rates" className="mt-10 rounded-2xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-bold">Request rates and availability</h2>
          <p className="mt-3 text-slate-300">Tell us about your product, the audience you want to reach and your timing. We&apos;ll reply with current audience details, available dates and rates.</p>
          <a href={mailto} className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">Request rates →</a>
          <p className="mt-3 text-sm text-slate-400">Or email <a href={mailto} className="underline">{SPONSOR_CONTACT_EMAIL}</a></p>
        </section>

        <p className="mt-8 text-sm text-muted-foreground">Looking for a partner introduction instead? Visit the <Link href="/partners" className="underline">partner marketplace</Link>.</p>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
