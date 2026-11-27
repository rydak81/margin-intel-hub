import Link from "next/link"
import { MARKETPLACES } from "@/lib/marketplace-fees"
import { DEFAULT_STRATEGY } from "@/lib/repricer/decision"
import { DEFAULT_COST_RATIOS } from "@/lib/repricer/costs"
import { MARKETPLACE_LABELS, MARKETPLACES as REPRICER_MARKETS } from "@/lib/repricer/fees"
import type { Category } from "@/lib/repricer/types"

/** Signup URL for the repricer pages. Allowlisted in lib/newsletter-source.ts. */
export const REPRICER_BRIEF_HREF = "/newsletter?source=tools_repricer#subscribe"

const money = (n: number) => `$${n.toFixed(2)}`

const SHIPPING_DEFAULTS = (Object.keys(DEFAULT_COST_RATIOS) as Category[])
  .map((category) => `${category} ${money(DEFAULT_COST_RATIOS[category].shipping)}`)
  .join(", ")

function RelatedLinks() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="repricer-related-title">
      <h2 id="repricer-related-title" className="text-lg font-bold">Related pages</h2>
      <ul className="mt-3 space-y-2 text-sm">
        <li><Link href="/tools/repricer" className="font-semibold text-primary underline">Repricer dashboard</Link> — price floor, target, and ceiling for each SKU.</li>
        <li><Link href="/tools/repricer/history" className="font-semibold text-primary underline">Price history</Link> — monthly series with your floor drawn on the chart.</li>
        <li><Link href="/tools/repricer/sourcing" className="font-semibold text-primary underline">Sourcing calculator</Link> — maximum you can pay and still hit a target margin.</li>
        <li>
          Fee schedules, with each marketplace&apos;s source and the date it was last checked:{" "}
          {MARKETPLACES.map((marketplace, index) => (
            <span key={marketplace.slug}>
              {index > 0 ? ", " : null}
              <Link href={`/fees/${marketplace.slug}`} className="font-semibold text-primary underline">{marketplace.name}</Link>
            </span>
          ))}
          . The <Link href="/fees" className="font-semibold text-primary underline">fee index</Link> and the <Link href="/fees/changelog" className="font-semibold text-primary underline">dated fee change log</Link> sit with them.
        </li>
        <li><Link href="/intelligence" className="font-semibold text-primary underline">Intelligence</Link> — original analysis, the Marketplace Pressure Index, the forecast scorecard, and the dossier.</li>
      </ul>
      <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
        <h3 className="font-bold">Daily Marketplace Brief</h3>
        <p className="mt-2 text-sm text-muted-foreground">The free Daily Marketplace Brief flags fee and policy changes across Amazon, Walmart, TikTok Shop, eBay and Etsy, with the source document.</p>
        <Link href={REPRICER_BRIEF_HREF} className="mt-3 inline-block rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">Get the free Brief</Link>
      </div>
    </section>
  )
}

function HistoryGuide() {
  return (
    <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
      <section aria-labelledby="history-how-title">
        <h2 id="history-how-title" className="text-xl font-bold text-foreground">What the price history chart shows</h2>
        <p className="mt-3">The chart is a monthly series for one SKU, covering the last 18 months. A point can include your price, the Buy Box price, the lowest offer, the seller count, and an Amazon purchase-count range.</p>
        <p className="mt-3">The dashed line is your profitability floor: the lowest price the repricer will consider for that SKU. It uses the landed cost, strategy, and fee overrides saved in this browser, the same inputs as the dashboard. If this browser has no landed cost for the SKU, the floor is not drawn. The dashboard leaves that SKU out of repricing until a landed cost is entered, rather than guessing one.</p>
        <p className="mt-3">When the market sits below the floor, the chart makes that month visible. The repricer&apos;s rule in that case is to hold at the floor. Closing the gap would mean pricing below the margin you set.</p>
      </section>
      <section aria-labelledby="history-use-title">
        <h2 id="history-use-title" className="text-xl font-bold text-foreground">How to use it</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Filter the catalog by product title or ASIN, then choose a SKU.</li>
          <li>Read the price chart. Expand opens a larger view of the same series. Clicking the chart opens that ASIN&apos;s history page.</li>
          <li>Compare the Buy Box and the lowest offer with your floor. Months under the floor are months the market price was below the price your margin settings allow.</li>
          <li>Change landed cost, target margin, floor margin, or fee overrides on the <Link href="/tools/repricer" className="font-semibold text-primary underline">dashboard</Link>. Those settings stay in this browser.</li>
        </ol>
      </section>
      <section aria-labelledby="history-inputs-title">
        <h2 id="history-inputs-title" className="text-xl font-bold text-foreground">What the series mean</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><span className="font-semibold text-foreground">Your price.</span> On a sample chart this is part of the generated series. When a live market series is available, your price is the current catalog price drawn as a reference line. That series does not include a history of your own offers.</li>
          <li><span className="font-semibold text-foreground">Buy Box and lowest offer.</span> The Buy Box price and the lowest offer recorded for that month.</li>
          <li><span className="font-semibold text-foreground">Seller count.</span> How many offers were counted that month.</li>
          <li><span className="font-semibold text-foreground">Amazon purchase range.</span> When a purchase figure is shown, it is the lower bound of a reported range, not an exact unit count.</li>
          <li><span className="font-semibold text-foreground">Floor.</span> Your computed profitability floor for the cost and fee settings in this browser.</li>
        </ul>
      </section>
      <section aria-labelledby="history-limits-title">
        <h2 id="history-limits-title" className="text-xl font-bold text-foreground">Limits</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>If a live market series is unavailable, the chart uses a sample series built from that SKU&apos;s current snapshot. The page labels it &ldquo;Sample data — illustrative, not observed market history.&rdquo; A sample chart is not a record of past prices.</li>
          <li>The example catalog is an anonymized snapshot, dated August 5, 2026, of 77 refurbished-Apple Amazon Renewed SKUs. You can import your own catalog. It is stored only in this browser. The loaded example is historical data, not live inventory.</li>
          <li>A live series is New-condition offers. The example catalog is Renewed. Compare a price only with the same product condition and fulfillment method.</li>
          <li>Fee rates in the tool are editable assumptions, not a quote of your account&apos;s charges. Check the fee pages before you use a floor in a pricing decision. Each fee page shows its source and the date the schedule was last checked.</li>
          <li>The tool is dry-run only. It never submits a price change. A buy-or-hold decision also depends on demand, supplier terms, and cash you can leave in inventory. The chart does not measure those.</li>
        </ul>
      </section>
    </div>
  )
}

function SourcingGuide() {
  const adPct = (DEFAULT_STRATEGY.acosRate * 100).toFixed(0)
  const reservePct = (DEFAULT_STRATEGY.returnReserveRate * 100).toFixed(0)
  const channels = REPRICER_MARKETS.map((market) => MARKETPLACE_LABELS[market]).join(", ")
  return (
    <div className="space-y-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
      <section aria-labelledby="sourcing-how-title">
        <h2 id="sourcing-how-title" className="text-xl font-bold text-foreground">What the sourcing calculator does</h2>
        <p className="mt-3">It runs the repricer&apos;s price formula backwards. You supply the price a buyer would pay and a target margin. For each channel it returns the maximum landed cost that still leaves that margin, then a maximum purchase price after the refurb and inbound amount you enter.</p>
        <p className="mt-3">Landed cost here means purchase price plus inbound freight, refurb parts, and refurb labor. Maximum purchase price is maximum landed cost minus your refurb and inbound estimate. If the result is zero or below, that margin is not achievable at that selling price: the fees and other costs already use the whole price. The calculator leaves that result as not achievable. It does not raise it to zero.</p>
      </section>
      <section aria-labelledby="sourcing-use-title">
        <h2 id="sourcing-use-title" className="text-xl font-bold text-foreground">How to use it</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Look up a product by ASIN, barcode, or name, or scan a barcode when this browser can use the camera. An ASIN starts with B0 and has eight more letters or digits. A barcode is 8 to 14 digits; spaces and hyphens are ignored. Anything else is searched as a product name.</li>
          <li>If more than one product comes back, pick the row. The selling price used is the Buy Box price when one is present, otherwise the lowest offer.</li>
          <li>If a lookup is unavailable, type an observed selling price. A product name is optional and is only a label on the result.</li>
          <li>Choose the fee category, a target margin, and an estimated refurb plus inbound cost per unit. The margin field accepts a number from 0 up to, but not including, 90.</li>
          <li>Read the Amazon result first, then the table. The table lists {channels}.</li>
        </ol>
      </section>
      <section aria-labelledby="sourcing-inputs-title">
        <h2 id="sourcing-inputs-title" className="text-xl font-bold text-foreground">What the inputs mean</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><span className="font-semibold text-foreground">Observed selling price.</span> A price you have seen for this product. Use a price for the same condition and fulfillment method you would sell.</li>
          <li><span className="font-semibold text-foreground">Fee category.</span> One of iPad, iPhone, MacBook Air, MacBook Pro, or Apple Watch. It selects the fee schedule and the outbound-shipping default. Outbound shipping is shown from that default and is not edited on this page. The defaults are {SHIPPING_DEFAULTS}.</li>
          <li><span className="font-semibold text-foreground">Target margin.</span> The net margin, as a percent of the selling price, that the maximum landed cost is solved to leave.</li>
          <li><span className="font-semibold text-foreground">Refurb and inbound.</span> Subtracted from maximum landed cost to show a maximum purchase price. Leave it blank to treat it as zero.</li>
          <li><span className="font-semibold text-foreground">Advertising rate and return reserve.</span> Taken from the strategy settings on the dashboard, along with any fee edits saved there. Until you change them, the dashboard starts at an advertising rate of {adPct}% and a return reserve of {reservePct}% of the selling price.</li>
        </ul>
      </section>
      <section aria-labelledby="sourcing-limits-title">
        <h2 id="sourcing-limits-title" className="text-xl font-bold text-foreground">Limits</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>The table assumes the same selling price on every channel. It does not look up a separate price per marketplace.</li>
          <li>Fee rates in the tool are editable assumptions, not a quote of your account. The fee pages cover Amazon, Walmart, TikTok Shop, eBay, and Etsy, and each one shows its source and the date the schedule was last checked. Back Market, Newegg, and the direct-site row exist only inside this calculator.</li>
          <li>A live lookup, when one is available, returns New-condition offers. The example catalog is Renewed.</li>
          <li>Barcode scanning needs a browser that can detect barcodes and permission to use the camera. Otherwise type the digits.</li>
          <li>Nothing on this page submits a price or places an order. Strategy and fee edits stay in this browser. A maximum purchase price is not a recommendation to buy: demand, condition, and how long cash stays in the unit are outside the formula.</li>
        </ul>
      </section>
    </div>
  )
}

export function RepricerReference({ page }: { page: "history" | "sourcing" }) {
  return (
    <div className="mt-10 space-y-8">
      {page === "history" ? <HistoryGuide /> : <SourcingGuide />}
      <RelatedLinks />
    </div>
  )
}
