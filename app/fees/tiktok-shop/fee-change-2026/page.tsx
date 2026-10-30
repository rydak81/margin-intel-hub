import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { BriefCta } from "@/components/brief-cta"
import { ORGANIZATION_REF } from "@/lib/site-jsonld"
import { JsonLd } from "@/components/json-ld"
import { ShareButtons } from "@/components/share-buttons"
import { salePath, SALE_PRICES } from "@/lib/sale-fee-pages"
import {
  CHECKED_ON,
  PUBLISHED_ON,
  PUBLISHED_RATE_PCT,
  REPORTED_RATE_PCT,
  SOURCES,
  TIKTOK_FEE_CHANGE_CTA,
  TIKTOK_FEE_CHANGE_SOURCE_KEY,
  TIKTOK_FEE_CHANGE_PATH,
  faqs,
  formatDate,
  money,
  monthlyRows,
  priceComparisonRows,
  profitSqueeze,
  refundAdminFee,
  referralFee,
  sourceById,
  wholeMoney,
  workedOrderFees,
} from "@/lib/tiktok-fee-change-2026"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"
const canonical = `${SITE_URL}${TIKTOK_FEE_CHANGE_PATH}`

// The answer sits in the title: searchers asking "did it go up to 8%?" want
// the status before they click.
const title = "TikTok Shop 8% Fee Increase (2026): What's Confirmed, What Isn't"
const description = `TikTok's own US fee table (dated Oct 8, 2026) still says ${PUBLISHED_RATE_PCT}%. Trade blogs report ${REPORTED_RATE_PCT}% from Aug 4, 2026. See the dollar difference on real orders and how to check your rate on your settlement statement.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "article", publishedTime: PUBLISHED_ON, modifiedTime: CHECKED_ON },
  twitter: { card: "summary_large_image", title, description },
}

function Cite({ id }: { id: string }) {
  const s = sourceById(id)
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-2">
      {s.official ? `“${s.title}”` : s.publisher}
    </a>
  )
}

export default function TikTokFeeChange2026Page() {
  const rows = priceComparisonRows()
  const worked = workedOrderFees()
  const monthly = monthlyRows()
  const squeeze = profitSqueeze()
  const refund25At6 = refundAdminFee(referralFee(PUBLISHED_RATE_PCT, { customerPayment: 25 }))
  const refund25At8 = refundAdminFee(referralFee(REPORTED_RATE_PCT, { customerPayment: 25 }))
  const faqList = faqs()
  const checked = formatDate(CHECKED_ON)

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      datePublished: PUBLISHED_ON,
      dateModified: CHECKED_ON,
      mainEntityOfPage: canonical,
      author: { "@type": "Organization", name: "MarketplaceBeta", url: `${SITE_URL}/about` },
      publisher: ORGANIZATION_REF,
      citation: SOURCES.map((s) => s.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Fees", item: `${SITE_URL}/fees` },
        { "@type": "ListItem", position: 2, name: "TikTok Shop", item: `${SITE_URL}/fees/tiktok-shop` },
        { "@type": "ListItem", position: 3, name: "2026 fee change", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqList.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    },
  ]

  const official = SOURCES.filter((s) => s.official)
  const reported = SOURCES.filter((s) => !s.official)

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="fees" ctaHref={TIKTOK_FEE_CHANGE_CTA} />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/fees" className="hover:text-sky-600 dark:hover:text-sky-400">Fees</Link>
          <span className="mx-2">/</span>
          <Link href="/fees/tiktok-shop" className="hover:text-sky-600 dark:hover:text-sky-400">TikTok Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">2026 fee change</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Did TikTok Shop raise its fee to 8% in 2026? What&apos;s confirmed, and how to check yours
        </h1>

        {/* Answer first. */}
        <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          <strong className="text-slate-900 dark:text-white">Not officially.</strong> TikTok&apos;s US referral fee table, dated
          October 8, 2026, still lists <strong className="text-slate-900 dark:text-white">{PUBLISHED_RATE_PCT}%</strong> for most
          categories. Several trade blogs report that most non-food categories moved to{" "}
          <strong className="text-slate-900 dark:text-white">{REPORTED_RATE_PCT}%</strong> on August 4, 2026, but none of them
          cites a TikTok notice, and we couldn&apos;t find one. The one place that settles it for your shop is the referral fee
          line on your own settlement report. The steps are below.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Sources checked {checked}</span>
          <a
            href={sourceById("tt-category-table").url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400"
          >
            TikTok&apos;s official referral fee table
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link href="/fees/changelog" className="hover:text-sky-600 dark:hover:text-sky-400">Fee change log</Link>
        </div>

        <ShareButtons
          className="mt-4"
          url={canonical}
          placement="fee-tiktok-shop-fee-change-2026"
          text={`TikTok Shop's own table still says ${PUBLISHED_RATE_PCT}%. Trade blogs say ${REPORTED_RATE_PCT}%. Here's how to check your settlement statement:`}
        />

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What TikTok publishes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-600 dark:text-slate-300">
            <li>
              <strong>{PUBLISHED_RATE_PCT}% for almost every US category</strong>, per TikTok&apos;s &ldquo;Referral Fees by
              Category&rdquo; table (page dated 10/08/2026). Five fine-jewelry sub-categories (Diamond, Gold, Jade, Platinum &amp;
              Carat Gold, and Ruby, Sapphire &amp; Emerald) and the Pre-Owned categories are 5%. On Collectibles and Pre-Owned
              sales, the portion above $10,000 is charged 3%. <Cite id="tt-category-table" />
            </li>
            <li>
              <strong>The formula:</strong> Referral Fee Rate × (Customer Payment + Platform Discount − Tax). TikTok notes that
              the base includes shipping the customer paid. <Cite id="tt-category-table" />
            </li>
            <li>
              <strong>The 6% dates from April 1, 2024</strong>, and TikTok says it will use &ldquo;reasonable efforts&rdquo; to
              notify sellers by email or in their account about 30 days before material changes. <Cite id="tt-fee-updates" />
            </li>
            <li>
              <strong>Refunds:</strong> TikTok returns the referral fee minus a Refund Administration Fee of 20% of that fee,
              capped at $5 per SKU since May 15, 2025. <Cite id="tt-fee-updates" />
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Where the 8% comes from</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
            The 8% figure comes from independent seller blogs, not from TikTok. Here is what each one says, with its date:
          </p>
          <ul className="mt-4 space-y-3">
            {reported.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-slate-900 underline underline-offset-2 hover:text-sky-600 dark:text-white">
                  {s.publisher}: {s.title}
                </a>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.says}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>Our read as of {checked}:</strong> TikTok has published no 8% rate that we can find. Its category table is
            dated October 8, 2026, two months after the reported change, and it still shows {PUBLISHED_RATE_PCT}%. The
            reports don&apos;t agree on the date either. That doesn&apos;t prove nobody is being charged 8%, since individual
            accounts, promotions and category moves can differ from the public table. So we use {PUBLISHED_RATE_PCT}% in our{" "}
            <Link href="/fees/tiktok-shop" className="text-primary underline underline-offset-2">TikTok Shop fee tables</Link> and
            show the 8% case next to it. We&apos;ll update this page and the{" "}
            <Link href="/fees/changelog" className="text-primary underline underline-offset-2">change log</Link> if TikTok
            publishes a new rate.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What 6% vs 8% means in dollars</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
            These are single-item orders with no shipping, discount or tax, so the fee base equals the sale price. Moving from 6% to
            8% raises the referral fee by a third on every order.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <caption className="bg-secondary px-4 py-3 text-left font-semibold">TikTok Shop referral fee per order</caption>
              <thead>
                <tr>
                  <th scope="col" className="border-b border-border px-4 py-3">Order</th>
                  <th scope="col" className="border-b border-border px-4 py-3">At {PUBLISHED_RATE_PCT}% (published)</th>
                  <th scope="col" className="border-b border-border px-4 py-3">At {REPORTED_RATE_PCT}% (reported)</th>
                  <th scope="col" className="border-b border-border px-4 py-3">Difference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-border last:border-0 even:bg-secondary/40">
                    <th scope="row" className="px-4 py-3 font-medium">{r.label}</th>
                    <td className="px-4 py-3 tabular-nums">{money(r.at6)}</td>
                    <td className="px-4 py-3 tabular-nums">{money(r.at8)}</td>
                    <td className="px-4 py-3 tabular-nums">+{money(r.diff)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 text-lg font-bold text-slate-900 dark:text-white">A realistic order, using TikTok&apos;s formula</h3>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            A $25 product, $4 shipping paid by the customer, a $3 TikTok-funded discount and $2 sales tax. The customer pays{" "}
            {money(worked.customerPayment)}. The fee base is {money(worked.customerPayment)} + {money(worked.platformDiscount)} −{" "}
            {money(worked.tax)} = <strong>{money(worked.base)}</strong>, which is the product plus shipping. The referral fee is{" "}
            <strong>{money(worked.at6)}</strong> at 6% or <strong>{money(worked.at8)}</strong> at 8%, a difference of{" "}
            {money(worked.diff)}. TikTok adds its own discounts back into the base, so a TikTok-funded discount doesn&apos;t
            lower your fee. A discount you fund yourself does, because the customer pays less.
          </p>

          <h3 className="mt-8 text-lg font-bold text-slate-900 dark:text-white">Per month</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-300">
            {monthly.map((m) => (
              <li key={m.base}>
                {wholeMoney(m.base)} in fee base: {wholeMoney(m.at6)} at 6% vs {wholeMoney(m.at8)} at 8%, so{" "}
                <strong>{wholeMoney(m.diff)} more a month</strong>.
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-lg font-bold text-slate-900 dark:text-white">Against your margin</h3>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            Hypothetically, take a {money(squeeze.price)} item that leaves {money(squeeze.profitAt6)} profit after every cost at 6%.
            At 8% it pays {money(squeeze.extra)} more in fees and keeps {money(squeeze.profitAt8)}, so profit falls{" "}
            {squeeze.cutPct.toFixed(0)}% even though the rate only rose two points. Refunds cost a little more too: on a fully
            refunded $25 item the Refund Administration Fee is {money(refund25At6)} at 6% and {money(refund25At8)} at 8%.
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Price-point detail at the published rate:{" "}
            {SALE_PRICES.map((p, i) => (
              <span key={p}>
                {i ? " · " : ""}
                <Link href={salePath("tiktok-shop", p)} className="underline hover:text-sky-600">${p} sale</Link>
              </span>
            ))}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How to check the rate on your settlement report</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
            These steps follow TikTok&apos;s help article <Cite id="tt-settlement-report" /> (dated 09/11/2025). Menu names and
            column labels are TikTok&apos;s, but TikTok updates Seller Center often, so yours may look slightly different.
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed text-slate-600 dark:text-slate-300">
            <li>
              <strong>Export the report.</strong> In Seller Center, go to <em>Finances &gt; Statements</em> (or <em>Payouts</em>),
              click <em>Export</em>, and choose a date range. Pick one that covers orders from before and after August 4, 2026 so
              you can compare. The file appears under <em>Export History</em>, where you click <em>Download</em>.
            </li>
            <li>
              <strong>Open the Order details sheet.</strong> TikTok says this sheet breaks settlement down by SKU, fees included.
            </li>
            <li>
              <strong>Pick clean orders.</strong> Use completed orders with no refund, no adjustment, and an empty{" "}
              <em>Ads referral fee discount</em> column. That column lowers the referral fee on orders from the Shop Ads incentive.
            </li>
            <li>
              <strong>Rebuild the fee base.</strong> Add <em>Customer payment</em> and <em>Platform discounts</em>, then subtract{" "}
              <em>Sales tax payment</em> (and <em>Retail delivery fee payment</em> on Colorado orders, which TikTok&apos;s own
              example treats the same way as tax).
            </li>
            <li>
              <strong>Divide.</strong> Divide the <em>Referral fee</em> amount, ignoring any minus sign, by that base. About{" "}
              <strong>0.06</strong> means you&apos;re paying the published 6%, about <strong>0.08</strong> means 8%, and{" "}
              <strong>0.05</strong> fits the jewelry and Pre-Owned rate. Rounding to the cent can shift the result slightly on
              small orders.
            </li>
            <li>
              <strong>Compare dates.</strong> If orders created after August 4, 2026 come out at 0.08 and earlier ones at 0.06, your
              rate changed. Look for the notice in your Seller Center messages and email, since TikTok says it notifies sellers of
              material changes.
            </li>
          </ol>
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Worked check: an order with Customer payment {money(worked.customerPayment)}, Platform discounts{" "}
            {money(worked.platformDiscount)} and Sales tax payment {money(worked.tax)} has a base of {money(worked.base)}. A Referral
            fee of {money(worked.at6)} divided by {money(worked.base)} is 0.06, or 6%. A fee of {money(worked.at8)} would be 0.08,
            or 8%.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Common questions</h2>
          <dl className="mt-4 space-y-5">
            {faqList.map((f) => (
              <div key={f.question}>
                <dt className="font-medium text-slate-900 dark:text-white">{f.question}</dt>
                <dd className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sources</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">All checked {checked}.</p>
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">Official (TikTok Shop)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {official.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">{s.title}</a>. {s.says}
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">Third-party reports (not confirmed by TikTok)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {reported.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">{s.publisher}: {s.title}</a>
              </li>
            ))}
          </ul>
        </section>

        <BriefCta
          source={TIKTOK_FEE_CHANGE_SOURCE_KEY}
          heading="Know when TikTok Shop changes its rate"
          body="The Daily Marketplace Brief flags fee and policy changes across TikTok Shop, Amazon, Walmart, eBay and Etsy, with the source document. Free."
        />
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
