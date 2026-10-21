import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { PremiumSiteHeader } from "@/components/premium-site-header"
import { PremiumSiteFooter } from "@/components/premium-site-footer"
import { JsonLd } from "@/components/json-ld"
import { ShareButtons } from "@/components/share-buttons"
import {
  AMAZON_PEAK_CTA,
  AMAZON_PEAK_PATH,
  AVG_PEAK_INCREASE,
  AVG_SURCHARGE_PER_UNIT,
  BAND_INDEX,
  CHECKED_ON,
  EXAMPLES,
  FORMULA_ROWS,
  NON_PEAK_RESUMES,
  PEAK_END,
  PEAK_START,
  PRICE_BANDS,
  PUBLISHED_ON,
  SOURCES,
  STANDARD_ROWS,
  STORAGE,
  SURCHARGE_BWP_MCF_START,
  SURCHARGE_FBA_START,
  SURCHARGE_PCT,
  exampleMath,
  faqs,
  formatDate,
  money,
  sourceById,
  storagePerUnit,
  withSurcharge,
} from "@/lib/amazon-holiday-peak-2026"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"
const canonical = `${SITE_URL}${AMAZON_PEAK_PATH}`

const title = "Amazon Holiday Peak Fulfillment Fees 2026 + 3.5% Surcharge, by Size Tier"
const description = `Amazon's FBA peak fees run Oct 15, 2026 to Jan 14, 2027, averaging $${AVG_PEAK_INCREASE.toFixed(2)} more per unit, with the ${SURCHARGE_PCT}% fuel and logistics surcharge on top. Full rate table and worked examples with referral fees.`

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

const th = "border-b border-border px-3 py-2"
const td = "px-3 py-2 tabular-nums"

export default function AmazonHolidayPeak2026Page() {
  const examples = EXAMPLES.map(exampleMath)
  const kitchen = examples.find((m) => m.example.id === "kitchen")!
  const storage = storagePerUnit(0.1)
  const faqList = faqs()
  const checked = formatDate(CHECKED_ON)
  const mid = BAND_INDEX.from10to50

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
      publisher: { "@type": "Organization", name: "MarketplaceBeta", logo: { "@type": "ImageObject", url: `${SITE_URL}/brand-icon.png` } },
      citation: SOURCES.map((s) => s.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Fees", item: `${SITE_URL}/fees` },
        { "@type": "ListItem", position: 2, name: "Amazon", item: `${SITE_URL}/fees/amazon` },
        { "@type": "ListItem", position: 3, name: "Holiday peak fees 2026", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqList.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <PremiumSiteHeader active="fees" ctaHref={AMAZON_PEAK_CTA} />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/fees" className="hover:text-sky-600 dark:hover:text-sky-400">Fees</Link>
          <span className="mx-2">/</span>
          <Link href="/fees/amazon" className="hover:text-sky-600 dark:hover:text-sky-400">Amazon</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Holiday peak fees 2026</span>
        </nav>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Amazon&apos;s 2026 holiday peak fulfillment fees, plus the 3.5% surcharge
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          From <strong className="text-slate-900 dark:text-white">{formatDate(PEAK_START)} to {formatDate(PEAK_END)}</strong>,
          Amazon charges higher FBA fulfillment fees. It says they average{" "}
          <strong className="text-slate-900 dark:text-white">${AVG_PEAK_INCREASE.toFixed(2)} more per unit</strong> than
          non-peak, the same increase as last year. The{" "}
          <strong className="text-slate-900 dark:text-white">{SURCHARGE_PCT}% fuel and logistics-related surcharge</strong> it
          added in April applies on top. On a $20 small standard kitchen item weighing 6 to 8 oz, that takes fulfillment from{" "}
          {money(kitchen.nonPeakWithSurcharge)} to {money(kitchen.peakWithSurcharge)} per unit.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Verified {checked}</span>
          <a href={sourceById("sc-2026-fee-changes").url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400">
            Amazon&apos;s official 2026 FBA rate card
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link href="/fees/amazon" className="hover:text-sky-600 dark:hover:text-sky-400">Amazon referral fees by category</Link>
        </div>

        <ShareButtons
          className="mt-4"
          url={canonical}
          placement="fee-amazon-holiday-peak-2026"
          text={`Amazon's FBA holiday peak fees run ${formatDate(PEAK_START)} to ${formatDate(PEAK_END)}, with the ${SURCHARGE_PCT}% surcharge on top. Rate table + worked examples:`}
        />

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">The facts, from Amazon</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-600 dark:text-slate-300">
            <li>
              <strong>Dates:</strong> {formatDate(PEAK_START)} to {formatDate(PEAK_END)}, for FBA, Remote Fulfillment with FBA, Multi-Channel
              Fulfillment and Buy with Prime. Non-peak rates return {formatDate(NON_PEAK_RESUMES)}. <Cite id="sc-holiday-2026" />
            </li>
            <li>
              <strong>When it&apos;s charged:</strong> per unit, when the buyer&apos;s order ships, so the ship date decides
              which rate applies. <Cite id="sc-fba-fee" />
            </li>
            <li>
              <strong>How much:</strong> the same per-unit increase over non-peak as last year, averaging ${AVG_PEAK_INCREASE.toFixed(2)}.
              The exact rate depends on size tier, shipping weight and price band. <Cite id="sc-2026-fee-changes" />
            </li>
            <li>
              <strong>The surcharge:</strong> {SURCHARGE_PCT}% on fulfillment fees (not the sale price) since {formatDate(SURCHARGE_FBA_START)} for FBA
              in the US and Canada, and since {formatDate(SURCHARGE_BWP_MCF_START)} for Buy with Prime and MCF. Amazon put the average at{" "}
              {money(AVG_SURCHARGE_PER_UNIT)} per US FBA unit and says it applies on top of peak fees. <Cite id="sc-surcharge" />
            </li>
          </ul>
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <strong>Is the 3.5% surcharge still on?</strong> Yes, as of {checked}. Amazon&apos;s FBA fee pages still carry it and Amazon
            hasn&apos;t announced an end date. <Cite id="supply-chain-dive" /> reports that an Amazon representative told sellers it stays
            &ldquo;until further notice&rdquo;. We&apos;ll update this line when that changes.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Peak vs non-peak FBA fees, by size tier</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
            Non-apparel rates for items priced $10 to $50, the band most sellers model. The last column adds the {SURCHARGE_PCT}% surcharge to
            the peak rate. Amazon publishes the rates before the surcharge and doesn&apos;t say how it rounds, so we round to the cent.
            Apparel and dangerous goods have separate tables on Amazon&apos;s page.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[620px] text-left text-sm">
              <caption className="bg-secondary px-3 py-3 text-left font-semibold">Amazon FBA fulfillment fee per unit, $10 to $50 price band</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>Size tier</th>
                  <th scope="col" className={th}>Shipping weight</th>
                  <th scope="col" className={th}>Non-peak 2026</th>
                  <th scope="col" className={th}>Peak 2026</th>
                  <th scope="col" className={th}>Increase</th>
                  <th scope="col" className={th}>Peak + {SURCHARGE_PCT}%</th>
                </tr>
              </thead>
              <tbody>
                {STANDARD_ROWS.map((r) => (
                  <tr key={r.tier + r.weight} className="border-b border-border last:border-0 even:bg-secondary/40">
                    <th scope="row" className="px-3 py-2 font-medium">{r.tier}</th>
                    <td className="px-3 py-2">{r.weight}</td>
                    <td className={td}>{money(r.nonPeak[mid])}</td>
                    <td className={td}>{money(r.peak[mid])}</td>
                    <td className={td}>+{money(r.peak[mid] - r.nonPeak[mid])}</td>
                    <td className={td}>{money(withSurcharge(r.peak[mid]))}</td>
                  </tr>
                ))}
                {FORMULA_ROWS.map((r) => (
                  <tr key={r.tier + r.weight} className="border-b border-border last:border-0 even:bg-secondary/40">
                    <th scope="row" className="px-3 py-2 font-medium">{r.tier}</th>
                    <td className="px-3 py-2">{r.weight}</td>
                    <td className={td}>{money(r.nonPeakBase[mid])} + {money(r.perInterval)} {r.interval}</td>
                    <td className={td}>{money(r.peakBase[mid])} + {money(r.perInterval)} {r.interval}</td>
                    <td className={td}>+{money(r.peakBase[mid] - r.nonPeakBase[mid])} on the base</td>
                    <td className={td}>{SURCHARGE_PCT}% on the total</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 text-lg font-bold text-slate-900 dark:text-white">Other price bands, small and large standard</h3>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            Amazon prices standard-size items in three bands. Items under $10 get lower Low-Price FBA rates, and items over $50 pay more.
            The peak increase is similar in every band.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[620px] text-left text-sm">
              <caption className="bg-secondary px-3 py-3 text-left font-semibold">Peak 2026 fulfillment fee per unit, before the surcharge (non-peak in brackets)</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>Size tier</th>
                  <th scope="col" className={th}>Shipping weight</th>
                  {PRICE_BANDS.map((b) => <th key={b.band} scope="col" className={th}>{b.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {STANDARD_ROWS.map((r) => (
                  <tr key={r.tier + r.weight} className="border-b border-border last:border-0 even:bg-secondary/40">
                    <th scope="row" className="px-3 py-2 font-medium">{r.tier}</th>
                    <td className="px-3 py-2">{r.weight}</td>
                    {PRICE_BANDS.map((b) => (
                      <td key={b.band} className={td}>
                        {money(r.peak[BAND_INDEX[b.band]])} <span className="text-slate-400">({money(r.nonPeak[BAND_INDEX[b.band]])})</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Worked examples: referral fee + FBA fee + surcharge</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
            Each example is one unit with no buyer-paid shipping. The referral fee comes from our{" "}
            <Link href="/fees/amazon" className="text-primary underline underline-offset-2">Amazon fee table</Link>, which is checked against{" "}
            <Cite id="sell-pricing" />. The surcharge applies to the fulfillment fee only, not the referral fee.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="bg-secondary px-3 py-3 text-left font-semibold">Amazon fees per unit, non-peak vs holiday peak 2026</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>Item</th>
                  <th scope="col" className={th}>Referral fee</th>
                  <th scope="col" className={th}>FBA non-peak + 3.5%</th>
                  <th scope="col" className={th}>FBA peak + 3.5%</th>
                  <th scope="col" className={th}>Total non-peak</th>
                  <th scope="col" className={th}>Total peak</th>
                  <th scope="col" className={th}>Extra per unit</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((m) => (
                  <tr key={m.example.id} className="border-b border-border last:border-0 even:bg-secondary/40">
                    <th scope="row" className="px-3 py-2 font-medium">
                      {money(m.example.price)} {m.example.label.toLowerCase()}
                      <span className="block text-xs font-normal text-slate-500">{m.categoryLabel} · {m.example.sizeNote}</span>
                    </th>
                    <td className={td}>{money(m.referral)}</td>
                    <td className={td}>{money(m.nonPeakWithSurcharge)}</td>
                    <td className={td}>{money(m.peakWithSurcharge)}</td>
                    <td className={td}>{money(m.totalNonPeak)} ({m.takeRateNonPeak}%)</td>
                    <td className={td}>{money(m.totalPeak)} ({m.takeRatePeak}%)</td>
                    <td className={td}>+{money(m.extraPerUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 space-y-3 leading-relaxed text-slate-600 dark:text-slate-300">
            {examples.map((m) => (
              <p key={m.example.id}>
                <strong>{money(m.example.price)} {m.example.label.toLowerCase()}</strong> ({m.example.sizeNote.toLowerCase()}): referral fee{" "}
                {money(m.referral)}. Peak FBA fee {money(m.example.peakFee)} ({money(m.peakIncrease)} above non-peak) × 1.035 ={" "}
                {money(m.peakWithSurcharge)}, of which {money(m.surchargeOnPeak)} is surcharge. Amazon keeps {money(m.totalPeak)} and you keep{" "}
                {money(m.keptPeak)} before product cost, against {money(m.keptNonPeak)} outside peak.
              </p>
            ))}
            <p>
              For the small bulky example, shipping weight is 10 lb, so the fee is the base rate plus 9 × $0.38 for each pound above the first.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How it stacks with the rest of your FBA costs</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-slate-600 dark:text-slate-300">
            <li><strong>Referral fee:</strong> set by category, as a percentage of the sale price. It doesn&apos;t change for peak.</li>
            <li><strong>FBA fulfillment fee:</strong> the peak rate card above, for units shipped {formatDate(PEAK_START)} to {formatDate(PEAK_END)}.</li>
            <li><strong>{SURCHARGE_PCT}% surcharge:</strong> on the fulfillment fee, peak or not.</li>
            <li>
              <strong>Monthly storage:</strong> base storage for standard-size, non-dangerous goods is {money(STORAGE.standardOctDec)} per cubic foot a month from October to
              December, against {money(STORAGE.standardJanSep)} from January to September. Oversize is {money(STORAGE.oversizeOctDec)} against{" "}
              {money(STORAGE.oversizeJanSep)}. A 0.1 cubic foot unit costs about {money(storage.octDec)} a month to store in Q4, against{" "}
              {money(storage.janSep)} the rest of the year, before any storage utilization surcharge. <Cite id="sc-storage" />
            </li>
            <li>
              <strong>Everything else:</strong> the Professional plan ($39.99 a month), inbound placement, low-inventory-level, aged-inventory
              and returns fees are separate, and the examples above leave them out.
            </li>
          </ol>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
            To see your own per-ASIN peak fee, use Amazon&apos;s Revenue Calculator, Profit Analytics dashboard or Fee and Economics Preview
            report. Amazon says all three show peak rates and the surcharge. <Cite id="sc-fba-fee" />
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
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {SOURCES.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">{s.publisher}: {s.title}</a>
                {s.official ? "" : " (secondary)"}. {s.says}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/40">
          <h2 className="text-xl font-bold">Know when the surcharge ends, or the fees move again</h2>
          <p className="mt-2 text-muted-foreground">
            The Daily Marketplace Brief flags fee and policy changes across Amazon, Walmart, TikTok Shop, eBay and Etsy, with the source
            document. Free.
          </p>
          <Link href={AMAZON_PEAK_CTA} className="mt-4 inline-block rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700">
            Get the free Brief
          </Link>
        </section>
      </main>

      <PremiumSiteFooter />
    </div>
  )
}
