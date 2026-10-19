import type { Metadata } from 'next'
import Link from 'next/link'
import { ShareButtons } from '@/components/share-buttons'
import { ogImageUrl } from '@/lib/sale-fee-pages'
import { notFound, permanentRedirect } from 'next/navigation'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { JsonLd } from '@/components/json-ld'
import { RecommendedTools } from '@/components/recommended-tools'
import { getRecommendedOffers } from '@/lib/affiliates'
import { EXAMPLE_PRICE, comparisonDescription, getAllPairs, matchedCategories, money, overviewRows, rateRange, resolvePair } from '@/lib/fee-compare'
import { formatVerifiedDate } from '@/lib/marketplace-fees'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

interface PageProps { params: Promise<{ pair: string }> }

export function generateStaticParams() {
  return getAllPairs().map(p => ({ pair: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair: slug } = await params
  const resolved = resolvePair(slug)
  if (!resolved) return { title: 'Fee comparison not found | MarketplaceBeta' }
  const { a, b } = resolved.pair
  const title = `${a.shortName} vs ${b.shortName} Fees: Side-by-Side Seller Fee Comparison`
  const description = comparisonDescription(a, b)
  const canonical = `${SITE_URL}/fees/compare/${resolved.pair.slug}`
  const ra = rateRange(a), rb = rateRange(b)
  const fmt = (r: { min: number; max: number }) => r.min === r.max ? `${r.min}%` : `${r.min}–${r.max}%`
  const image = ogImageUrl(`${a.shortName} vs ${b.shortName} seller fees`, `${fmt(ra)} vs ${fmt(rb)}`, 'Fee comparison')
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', title, description, images: [image] } }
}

export default async function ComparePage({ params }: PageProps) {
  const { pair: slug } = await params
  const resolved = resolvePair(slug)
  if (!resolved) notFound()
  if (resolved.reversed) permanentRedirect(`/fees/compare/${resolved.pair.slug}`)
  const { a, b } = resolved.pair
  const canonical = `${SITE_URL}/fees/compare/${resolved.pair.slug}`
  const overview = overviewRows(a, b)
  const matched = matchedCategories(a, b)
  const ra = rateRange(a)
  const rb = rateRange(b)
  const cheaperA = matched.filter(r => r.aFees < r.bFees).length
  const cheaperB = matched.filter(r => r.bFees < r.aFees).length

  const faqs = [
    {
      question: `Which has lower commission rates, ${a.shortName} or ${b.shortName}?`,
      answer: `${a.name}'s ${a.feeName} ranges from ${ra.min}% to ${ra.max}% across the ${a.categories.length} categories we track; ${b.name}'s ${b.feeName} ranges from ${rb.min}% to ${rb.max}% across ${b.categories.length}.${matched.length ? ` Of the ${matched.length} explicitly mapped category rows, total fees on a $${EXAMPLE_PRICE} sale are lower on ${a.shortName} in ${cheaperA} and lower on ${b.shortName} in ${cheaperB}.` : ''}`,
    },
    {
      question: `Do ${a.shortName} and ${b.shortName} charge a monthly fee?`,
      answer: `${a.shortName}: ${overview[3].a}. ${b.shortName}: ${overview[3].b}.`,
    },
    {
      question: 'Do these totals include fulfillment?',
      answer: `No. The totals cover commission plus any per-order, listing and payment-processing fees in each schedule. Fulfillment (${a.fulfillmentName ?? 'none for ' + a.shortName}, ${b.fulfillmentName ?? 'none for ' + b.shortName}), shipping, storage and advertising are extra.`,
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fees', item: `${SITE_URL}/fees` },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/fees/compare` },
        { '@type': 'ListItem', position: 3, name: `${a.shortName} vs ${b.shortName}`, item: canonical },
      ] },
      { '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
    ],
  }

  const offers = getRecommendedOffers({ marketplace: a.slug, topic: 'profitability' })

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="fees" />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/fees" className="hover:text-sky-600">Fees</Link><span className="mx-2">/</span>
          <Link href="/fees/compare" className="hover:text-sky-600">Compare</Link><span className="mx-2">/</span>
          <span className="text-foreground">{a.shortName} vs {b.shortName}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{a.shortName} vs {b.shortName} seller fees</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {a.name} charges a {ra.min === ra.max ? `${ra.min}%` : `${ra.min}% to ${ra.max}%`} {a.feeName}; {b.name} charges a {rb.min === rb.max ? `${rb.min}%` : `${rb.min}% to ${rb.max}%`} {b.feeName}. Here is how the modeled schedules line up, using the same data as our fee calculators.
        </p>
        <ShareButtons className="mt-5" url={canonical} placement={`compare-${resolved.pair.slug}`} text={`${a.shortName} vs ${b.shortName} seller fees, side by side:`} />

        <section className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <caption className="bg-secondary px-4 py-3 text-left font-semibold">Fee schedule overview</caption>
            <thead><tr><th scope="col" className="border-b border-border px-4 py-3">Fee</th><th scope="col" className="border-b border-border px-4 py-3">{a.shortName}</th><th scope="col" className="border-b border-border px-4 py-3">{b.shortName}</th></tr></thead>
            <tbody>
              {overview.map(row => (
                <tr key={row.label} className="border-b border-border last:border-0 even:bg-secondary/40">
                  <th scope="row" className="px-4 py-3 font-medium">{row.label}</th>
                  <td className="px-4 py-3">{row.label === 'Schedule last verified' ? formatVerifiedDate(row.a) : row.a}</td>
                  <td className="px-4 py-3">{row.label === 'Schedule last verified' ? formatVerifiedDate(row.b) : row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {matched.length === 0 && <p className="mt-8 rounded-xl border p-5">No verified category mapping is available for this pair. Schedule information is shown for reference; no same-product fee winner is inferred.</p>}
        {matched.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">Verified comparison scope</h2>
            <p className="mt-2 text-sm text-muted-foreground">Illustrative headline rate and modeled marketplace fees on a {money(EXAMPLE_PRICE)} sale, before product cost and fulfillment, assuming one item per order, no buyer shipping, handling or collected tax. Account subscriptions are not allocated per sale. Confirm SKU classification in each marketplace; these mappings are not a listing eligibility guarantee. Tiered categories note their brackets on each fee page.</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead><tr>
                  <th scope="col" className="border-b border-border px-4 py-3">Category</th>
                  <th scope="col" className="border-b border-border px-4 py-3">{a.shortName} rate</th>
                  <th scope="col" className="border-b border-border px-4 py-3">{b.shortName} rate</th>
                  <th scope="col" className="border-b border-border px-4 py-3">{a.shortName} fees on {money(EXAMPLE_PRICE)}</th>
                  <th scope="col" className="border-b border-border px-4 py-3">{b.shortName} fees on {money(EXAMPLE_PRICE)}</th>
                </tr></thead>
                <tbody>
                  {matched.map(r => (
                    <tr key={r.aCategory.slug} className="border-b border-border last:border-0 even:bg-secondary/40">
                      <th scope="row" className="px-4 py-3 font-medium">{r.label}</th>
                      <td className="px-4 py-3"><Link href={`/fees/${a.slug}/${r.aCategory.slug}`} className="text-primary underline">{r.aCategory.referralPct}%{r.aCategory.tiers ? '*' : ''}</Link></td>
                      <td className="px-4 py-3"><Link href={`/fees/${b.slug}/${r.bCategory.slug}`} className="text-primary underline">{r.bCategory.referralPct}%{r.bCategory.tiers ? '*' : ''}</Link></td>
                      <td className={`px-4 py-3 tabular-nums ${r.aFees < r.bFees ? 'font-semibold text-emerald-600' : ''}`}>{money(r.aFees)}</td>
                      <td className={`px-4 py-3 tabular-nums ${r.bFees < r.aFees ? 'font-semibold text-emerald-600' : ''}`}>{money(r.bFees)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">* Tiered by price; the fee total uses the bracket that applies at {money(EXAMPLE_PRICE)}.</p>
          </section>
        )}

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {[a, b].map(m => (
            <div key={m.slug} className="rounded-xl border border-border p-5">
              <h2 className="text-lg font-bold">{m.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <Link href={`/fees/${m.slug}`} className="font-semibold text-primary">Full {m.shortName} fee table →</Link>
                <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-muted-foreground underline">Official schedule ↗</a>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Common questions</h2>
          <dl className="mt-4 space-y-5">
            {faqs.map(f => <div key={f.question}><dt className="font-medium">{f.question}</dt><dd className="mt-1.5 text-muted-foreground">{f.answer}</dd></div>)}
          </dl>
        </section>

        <RecommendedTools offers={offers} placement={`compare-${resolved.pair.slug}`} className="mt-10" />

        <section className="mt-10">
          <h2 className="text-xl font-bold">More fee comparisons</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {getAllPairs().filter(p => p.slug !== resolved.pair.slug).map(p => (
              <Link key={p.slug} href={`/fees/compare/${p.slug}`} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-sky-400">{p.a.shortName} vs {p.b.shortName}</Link>
            ))}
          </div>
        </section>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
