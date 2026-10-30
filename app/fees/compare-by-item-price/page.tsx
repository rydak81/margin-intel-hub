import type { Metadata } from "next"
import Link from "next/link"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { BriefCta } from "@/components/brief-cta"
import { JsonLd } from "@/components/json-ld"
import { formatVerifiedDate, MARKETPLACES } from "@/lib/marketplace-fees"
import {
  COMPARE_PRICES,
  ETSY_FEES_POLICY_URL,
  FEE_BY_PRICE_SOURCE_KEY,
  FEE_BY_PRICE_DESCRIPTION,
  FEE_BY_PRICE_PATH,
  FEE_BY_PRICE_TITLE,
  OFFSITE_ADS,
  buildOffsiteRows,
  buildRows,
  feeByPriceFaq,
  feeByPriceShortAnswer,
  money,
  verifiedRange,
} from "@/lib/fee-by-price"
import { TIKTOK_FEE_CHANGE_PATH } from "@/lib/tiktok-fee-change-2026"
import { ORGANIZATION_REF } from "@/lib/site-jsonld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"
const PAGE_URL = `${SITE_URL}${FEE_BY_PRICE_PATH}`

export const metadata: Metadata = {
  title: FEE_BY_PRICE_TITLE,
  description: FEE_BY_PRICE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: FEE_BY_PRICE_TITLE, description: FEE_BY_PRICE_DESCRIPTION, url: PAGE_URL, type: "website" },
}

const th = "pb-3 text-sm font-medium text-slate-500 dark:text-slate-400"

export default function FeeComparisonByPricePage() {
  const rows = buildRows()
  const offsite = buildOffsiteRows(rows)
  const shortAnswer = feeByPriceShortAnswer(rows)
  const faq = feeByPriceFaq(rows)
  const { oldest, newest } = verifiedRange()
  const thousand = OFFSITE_ADS.thresholdUsd.toLocaleString("en-US")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Fees", item: `${SITE_URL}/fees` },
        { "@type": "ListItem", position: 3, name: "Fees by item price", item: PAGE_URL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Marketplace seller fees at $10, $25, $50 and $100 item prices (hypothetical examples)",
      description: `Estimated total marketplace fees and net after fees for a hypothetical item at ${COMPARE_PRICES.map((p) => `$${p}`).join(", ")} on Amazon, Walmart, TikTok Shop, eBay and Etsy, computed from the published fee schedules checked between ${formatVerifiedDate(oldest)} and ${formatVerifiedDate(newest)}. Shipping, fulfillment, ads, taxes and returns are excluded.`,
      url: PAGE_URL,
      dateModified: newest,
      creator: ORGANIZATION_REF,
      isAccessibleForFree: true,
      keywords: ["marketplace seller fees", "Amazon fees", "Etsy fees", "eBay fees", "Walmart Marketplace fees", "TikTok Shop fees", "fee comparison by price"],
      variableMeasured: ["Estimated total marketplace fees (USD)", "Net after marketplace fees (USD)"],
      isBasedOn: MARKETPLACES.map((m) => m.sourceUrl),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="fees" backHref="/fees" backLabel="Fees" />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/fees" className="hover:text-sky-600 dark:hover:text-sky-400">Fees</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Fees by item price</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Marketplace fees by item price: $10, $25, $50 and $100
        </h1>

        <p id="short-answer" className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          {shortAnswer}
        </p>

        <p id="hypothetical" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100">
          <strong>HYPOTHETICAL EXAMPLES.</strong> Every figure on this page is an illustrative calculation for a hypothetical item at the stated price. It is not a result for any real listing, shop or order. Fee schedules checked {formatVerifiedDate(oldest)}
          {oldest === newest ? "" : ` to ${formatVerifiedDate(newest)}`}; see the <Link href="/fees/changelog" className="font-medium underline underline-offset-4">fee change log</Link> for updates.
        </p>

        <section id="total-fees" className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Estimated total marketplace fees (hypothetical)</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <caption className="sr-only">Hypothetical total marketplace fees by item price</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th scope="col" className={th}>Marketplace</th>
                  {COMPARE_PRICES.map((p) => <th key={p} scope="col" className={`${th} text-right`}>${p} item</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((r) => (
                  <tr key={r.marketplace.slug}>
                    <th scope="row" className="py-3 font-medium text-slate-900 dark:text-white">
                      <Link href={`/fees/${r.marketplace.slug}`} className="hover:text-sky-600 dark:hover:text-sky-400">{r.marketplace.name}</Link>
                    </th>
                    {r.cells.map((c) => <td key={c.price} className="py-3 text-right text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{money(c.totalFees)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="net-after-fees" className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Net after marketplace fees (hypothetical)</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The item price minus the total fees above, before product cost, shipping, ads, taxes and returns.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <caption className="sr-only">Hypothetical net after marketplace fees by item price</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th scope="col" className={th}>Marketplace</th>
                  {COMPARE_PRICES.map((p) => <th key={p} scope="col" className={`${th} text-right`}>${p} item</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((r) => (
                  <tr key={r.marketplace.slug}>
                    <th scope="row" className="py-3 font-medium text-slate-900 dark:text-white">{r.marketplace.name}</th>
                    {r.cells.map((c) => <td key={c.price} className="py-3 text-right text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{money(c.netProceeds)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="etsy-offsite-ads" className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Etsy Offsite Ads: a separate line, not in the Etsy total above</h2>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            Offsite Ads are optional only for shops that earned less than ${thousand} in the past 365 days. The fee is {OFFSITE_ADS.standardPct}% of the order total, or {OFFSITE_ADS.discountedPct}% once a shop is past ${thousand}, capped at ${OFFSITE_ADS.capUsd} per order. It is charged only when a buyer orders after clicking an ad, and the fee base includes shipping and gift wrap (this page assumes none). Source:{" "}
            <a href={ETSY_FEES_POLICY_URL} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-sky-600 underline underline-offset-4 dark:text-sky-400">Etsy Fees &amp; Payments Policy</a>.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <caption className="sr-only">Hypothetical Etsy Offsite Ads fee on an attributed order, by item price</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th scope="col" className={th}>Item price</th>
                  <th scope="col" className={`${th} text-right`}>Etsy baseline fees</th>
                  <th scope="col" className={`${th} text-right`}>Offsite Ads fee at {OFFSITE_ADS.standardPct}%</th>
                  <th scope="col" className={`${th} text-right`}>Offsite Ads fee at {OFFSITE_ADS.discountedPct}%</th>
                  <th scope="col" className={`${th} text-right`}>Net after baseline + {OFFSITE_ADS.standardPct}%</th>
                  <th scope="col" className={`${th} text-right`}>Net after baseline + {OFFSITE_ADS.discountedPct}%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {offsite.map((o) => (
                  <tr key={o.price}>
                    <th scope="row" className="py-3 font-medium text-slate-900 dark:text-white">${o.price} item</th>
                    <td className="py-3 text-right tabular-nums">{money(o.baselineFees)}</td>
                    <td className="py-3 text-right tabular-nums">{money(o.fee15)}</td>
                    <td className="py-3 text-right tabular-nums">{money(o.fee12)}</td>
                    <td className="py-3 text-right tabular-nums">{money(o.netAfter15)}</td>
                    <td className="py-3 text-right tabular-nums">{money(o.netAfter12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="assumptions" className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assumptions behind each marketplace</h2>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {rows.map((r) => (
              <li key={r.marketplace.slug}>
                <p className="font-semibold text-slate-900 dark:text-white">{r.marketplace.name}: {r.category.label}, {r.category.referralPct}%</p>
                <p>
                  Why this category: {r.why}. Category rates in the fee table: {r.rateRange}. Included: {r.cells[0].lines.map((l) => l.label).join(", ")}. Fee schedule checked {formatVerifiedDate(r.marketplace.lastVerified)}.{" "}
                  <Link href={`/fees/${r.marketplace.slug}`} className="font-medium text-sky-600 underline underline-offset-4 dark:text-sky-400">All {r.marketplace.shortName} categories</Link>.
                  {r.marketplace.slug === "tiktok-shop" && (
                    <>{" "}TikTok Shop bundles payment processing into its commission.{" "}
                    <Link href={TIKTOK_FEE_CHANGE_PATH} className="font-medium text-sky-600 underline underline-offset-4 dark:text-sky-400">What is and is not confirmed about the 2026 fee change</Link>.</>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>Not included anywhere on this page:</strong> shipping and fulfillment (FBA, Walmart Fulfillment Services), advertising, sales tax, returns and refunds, and Amazon&apos;s $39.99 per month Professional plan fee. Each example is one item in one order. Etsy&apos;s $0.20 listing fee is counted once per example sale.
          </p>
        </section>

        <section id="faq" className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Marketplace fees by item price: frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {faq.map((f) => (
              <div key={f.question}>
                <dt className="font-semibold text-slate-900 dark:text-white">{f.question}</dt>
                <dd className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <BriefCta
          source={FEE_BY_PRICE_SOURCE_KEY}
          tone="dark"
          className="mt-12"
          heading="Get fee changes in your inbox"
          body="The free Daily Marketplace Brief tracks fee changes with the old and new figures, dated."
          buttonLabel="Subscribe free"
        />

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fee tables by marketplace</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {MARKETPLACES.map((m) => (
              <Link key={m.slug} href={`/fees/${m.slug}`} className="editorial-elevated editorial-lift bg-card rounded-xl border border-slate-200 p-4 transition hover:border-sky-400 dark:border-white/10">
                <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{m.categories.length} categories, checked {formatVerifiedDate(m.lastVerified)}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
