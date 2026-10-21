import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PremiumSiteHeader } from '@/components/premium-site-header'
import { PremiumSiteFooter } from '@/components/premium-site-footer'
import { JsonLd } from '@/components/json-ld'
import { ShareButtons } from '@/components/share-buttons'
import { formatVerifiedDate } from '@/lib/marketplace-fees'
import { SALE_PRICES, feeRangeLabel, getAllSaleRoutes, money, ogImageUrl, parseSalePrice, saleFeeSummary, salePath } from '@/lib/sale-fee-pages'
import { getPairsFor } from '@/lib/fee-compare'
import { TIKTOK_FEE_CHANGE_PATH } from '@/lib/tiktok-fee-change-2026'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

interface PageProps { params: Promise<{ marketplace: string; price: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return getAllSaleRoutes()
}

async function load(params: PageProps['params']) {
  const { marketplace, price: raw } = await params
  const price = parseSalePrice(raw)
  return price === null ? null : saleFeeSummary(marketplace, price)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const s = await load(params)
  if (!s) return { title: 'Fee page not found | MarketplaceBeta' }
  const m = s.marketplace
  const range = feeRangeLabel(s)
  const title = `How much does ${m.shortName} take from a $${s.price} sale? ${range} in fees`
  const description = `On a $${s.price} sale, ${m.name} fees total ${range} depending on category (${s.min.takeRatePct}%–${s.max.takeRatePct}% of the sale), before product cost and fulfillment. Category-by-category breakdown, verified ${formatVerifiedDate(m.lastVerified)}.`
  const canonical = `${SITE_URL}${salePath(m.slug, s.price)}`
  const image = ogImageUrl(`${m.shortName} fees on a $${s.price} sale`, range)
  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article', images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function SaleFeePage({ params }: PageProps) {
  const s = await load(params)
  if (!s) notFound()
  const m = s.marketplace
  const range = feeRangeLabel(s)
  const canonical = `${SITE_URL}${salePath(m.slug, s.price)}`
  const flat = s.min.totalFees === s.max.totalFees
  const extras = [m.perOrderFee ? 'a per-order fee' : '', m.listingFee ? 'a listing fee' : '', m.paymentProcessingPct ? 'payment processing' : ''].filter(Boolean)

  const faqs = [
    {
      question: `How much does ${m.shortName} take from a $${s.price} sale?`,
      answer: flat
        ? `${m.name} fees on a $${s.price} sale total ${money(s.min.totalFees)} (${s.min.takeRatePct}% of the sale): ${s.min.detail}. You keep ${money(s.min.netProceeds)} before product cost and fulfillment.`
        : `${m.name} fees on a $${s.price} sale range from ${money(s.min.totalFees)} (${s.min.category.label}) to ${money(s.max.totalFees)} (${s.max.category.label}), or ${s.min.takeRatePct}%–${s.max.takeRatePct}% of the sale, before product cost and fulfillment.`,
    },
    {
      question: `What fees are included in this ${m.shortName} total?`,
      answer: `The ${m.feeName}${extras.length ? ` plus ${extras.join(', ')}` : ''}, as published in ${m.name}'s fee schedule (last verified ${formatVerifiedDate(m.lastVerified)}). Assumes one item, no buyer-paid shipping and no collected tax.${m.accountFee ? ` The ${m.accountFee.note ?? 'account'} fee ($${m.accountFee.amount}/${m.accountFee.period}) is not allocated per sale.` : ''}`,
    },
    {
      question: 'Does this include fulfillment, shipping or ads?',
      answer: `No. ${m.fulfillmentName ? `${m.fulfillmentName} fulfillment, ` : ''}shipping labels, storage and advertising are extra. Use the calculator on each category page to add your own costs.`,
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fees', item: `${SITE_URL}/fees` },
        { '@type': 'ListItem', position: 2, name: m.shortName, item: `${SITE_URL}/fees/${m.slug}` },
        { '@type': 'ListItem', position: 3, name: `$${s.price} sale`, item: canonical },
      ] },
      { '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
    ],
  }
  const rows = [...s.rows].sort((a, b) => a.totalFees - b.totalFees || a.category.label.localeCompare(b.category.label))

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="fees" />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/fees" className="hover:text-sky-600">Fees</Link><span className="mx-2">/</span>
          <Link href={`/fees/${m.slug}`} className="hover:text-sky-600">{m.shortName}</Link><span className="mx-2">/</span>
          <span className="text-foreground">${s.price} sale</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">How much does {m.shortName} take from a ${s.price} sale?</h1>
        <p className="mt-4 text-5xl font-bold text-sky-600 tabular-nums">{range}</p>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{faqs[0].answer}</p>
        {m.slug === 'tiktok-shop' && <p className="mt-2 text-sm"><Link href={TIKTOK_FEE_CHANGE_PATH} className="font-medium text-primary underline underline-offset-4">Seeing 8% on your statement? What&apos;s confirmed about the 2026 TikTok Shop fee change</Link></p>}
        <ShareButtons className="mt-5" url={canonical} placement={`sale-${m.slug}-${s.price}`} text={`${m.shortName} takes ${range} from a $${s.price} sale. Category-by-category breakdown:`} />

        <section className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="bg-secondary px-4 py-3 text-left font-semibold">{m.shortName} fees on a {money(s.price)} sale, by category</caption>
            <thead><tr>
              <th scope="col" className="border-b border-border px-4 py-3">Category</th>
              <th scope="col" className="border-b border-border px-4 py-3">Total fees</th>
              <th scope="col" className="border-b border-border px-4 py-3">% of sale</th>
              <th scope="col" className="border-b border-border px-4 py-3">You keep*</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.category.slug} className="border-b border-border last:border-0 even:bg-secondary/40">
                  <th scope="row" className="px-4 py-3 font-medium"><Link href={`/fees/${m.slug}/${r.category.slug}`} className="text-primary underline">{r.category.label}</Link></th>
                  <td className="px-4 py-3 tabular-nums" title={r.detail}>{money(r.totalFees)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.takeRatePct}%</td>
                  <td className="px-4 py-3 tabular-nums">{money(r.netProceeds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="mt-2 text-xs text-muted-foreground">* Before product cost, fulfillment, shipping and ads. Computed with the same engine as our fee calculators from <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline">{m.name}&apos;s official schedule</a>, verified {formatVerifiedDate(m.lastVerified)}.</p>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Other sale prices</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SALE_PRICES.filter(p => p !== s.price).map(p => (
              <Link key={p} href={salePath(m.slug, p)} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-sky-400">{m.shortName} on a ${p} sale</Link>
            ))}
            {getPairsFor(m.slug).map(p => (
              <Link key={p.slug} href={`/fees/compare/${p.slug}`} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-sky-400">{p.a.shortName} vs {p.b.shortName}</Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Common questions</h2>
          <dl className="mt-4 space-y-5">
            {faqs.map(f => <div key={f.question}><dt className="font-medium">{f.question}</dt><dd className="mt-1.5 text-muted-foreground">{f.answer}</dd></div>)}
          </dl>
        </section>

        <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/40">
          <h2 className="text-xl font-bold">Get fee changes before they hit your margin</h2>
          <p className="mt-2 text-muted-foreground">The Daily Marketplace Brief flags fee and policy changes across Amazon, Walmart, TikTok Shop, eBay and Etsy. Free.</p>
          <Link href="/newsletter?source=fee_compare" className="mt-4 inline-block rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700">Subscribe to the Daily Brief</Link>
        </section>
      </main>
      <PremiumSiteFooter />
    </div>
  )
}
