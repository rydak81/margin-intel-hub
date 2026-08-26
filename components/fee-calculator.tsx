"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FeeUnlockGate } from "@/components/fee-unlock-gate"
import {
  compareAcrossMarketplaces,
  computeFeeBreakdown,
  type FeeCategory,
  type Marketplace,
} from "@/lib/marketplace-fees"
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"

interface FeeCalculatorProps {
  marketplace: Marketplace
  category: FeeCategory
}

function money(value: number): string {
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toFixed(2)}`
}

export function FeeCalculator({ marketplace, category }: FeeCalculatorProps) {
  const [salePrice, setSalePrice] = useState(29.99)
  const [unitCost, setUnitCost] = useState(8)
  const [buyerShipping, setBuyerShipping] = useState(0)
  const [shippingCost, setShippingCost] = useState(0)

  const breakdown = useMemo(
    () => computeFeeBreakdown({ salePrice, unitCost, buyerShipping, shippingCost, marketplace, category }),
    [salePrice, unitCost, buyerShipping, shippingCost, marketplace, category],
  )

  const comparison = useMemo(
    () => compareAcrossMarketplaces(salePrice, unitCost, category.label, buyerShipping, shippingCost),
    [salePrice, unitCost, category.label, buyerShipping, shippingCost],
  )

  const profitable = breakdown.profit >= 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/45">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {category.label} margin calculator
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Enter your numbers to see what you actually keep after {marketplace.shortName}&apos;s{" "}
        {marketplace.feeName}.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="sale-price" className="text-sm font-medium">
            Sale price
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <Input
              id="sale-price"
              type="number"
              min={0}
              step="0.01"
              value={salePrice}
              onChange={(event) => setSalePrice(Math.max(0, Number(event.target.value) || 0))}
              className="h-11 rounded-xl pl-7"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="unit-cost" className="text-sm font-medium">
            Your cost per unit
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <Input
              id="unit-cost"
              type="number"
              min={0}
              step="0.01"
              value={unitCost}
              onChange={(event) => setUnitCost(Math.max(0, Number(event.target.value) || 0))}
              className="h-11 rounded-xl pl-7"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="buyer-shipping" className="text-sm font-medium">
            Shipping charged to buyer
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <Input
              id="buyer-shipping"
              type="number"
              min={0}
              step="0.01"
              value={buyerShipping}
              onChange={(event) => setBuyerShipping(Math.max(0, Number(event.target.value) || 0))}
              className="h-11 rounded-xl pl-7"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Fees apply to it too — leave $0 for free shipping.
          </p>
        </div>
        <div>
          <Label htmlFor="seller-shipping" className="text-sm font-medium">
            Your fulfillment cost
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <Input
              id="seller-shipping"
              type="number"
              min={0}
              step="0.01"
              value={shippingCost}
              onChange={(event) => setShippingCost(Math.max(0, Number(event.target.value) || 0))}
              className="h-11 rounded-xl pl-7"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            What you pay to ship or fulfill the order.
          </p>
        </div>
      </div>

      {/* Headline result — always free. This is what the search query asked for,
          so gating it would both fail the visitor and sink the page's rankings. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total fees
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {money(breakdown.totalFees)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {breakdown.takeRatePct.toFixed(1)}% take rate
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Net proceeds
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {money(breakdown.netProceeds)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">before your cost</p>
        </div>
        <div
          className={`rounded-xl p-4 ${
            profitable ? "bg-emerald-50 dark:bg-emerald-400/10" : "bg-rose-50 dark:bg-rose-400/10"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              profitable
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }`}
          >
            Profit per unit
          </p>
          <p
            className={`mt-1 flex items-center gap-1.5 text-2xl font-semibold ${
              profitable
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {profitable ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {money(breakdown.profit)}
          </p>
          <p
            className={`mt-0.5 text-xs ${
              profitable
                ? "text-emerald-700/80 dark:text-emerald-300/80"
                : "text-rose-700/80 dark:text-rose-300/80"
            }`}
          >
            {breakdown.marginPct.toFixed(1)}% margin
          </p>
        </div>
      </div>

      {/* Gated depth — the line-by-line breakdown, cross-marketplace comparison,
          and break-even price. */}
      <div className="mt-6">
        <FeeUnlockGate
          context={{
            source: `fees/${marketplace.slug}/${category.slug}`,
            marketplace: marketplace.slug,
            category: category.slug,
            salePrice,
            unitCost,
            marginPct: breakdown.marginPct,
          }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/45">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Fee breakdown, line by line
            </h3>
            <dl className="mt-3 divide-y divide-slate-100 dark:divide-white/5">
              {breakdown.lines.map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-slate-700 dark:text-slate-200">
                    {line.label}
                    {line.detail && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                        {line.detail}
                      </span>
                    )}
                  </dt>
                  <dd className="shrink-0 text-sm font-medium tabular-nums text-slate-900 dark:text-white">
                    {money(line.amount)}
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-sm font-semibold text-slate-900 dark:text-white">Total</dt>
                <dd className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                  {money(breakdown.totalFees)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl bg-sky-50 p-4 dark:bg-sky-400/10">
              <p className="text-sm text-sky-900 dark:text-sky-200">
                <span className="font-semibold">Break-even price:</span>{" "}
                {money(breakdown.breakEvenPrice)} — the lowest price at which a {money(unitCost)}{" "}
                unit is profitable on {marketplace.shortName} and stays profitable at every higher
                price (tiered fee jumps can make a narrow band above a threshold loss-making).
              </p>
              {marketplace.slug === "ebay" && (
                <p className="mt-2 text-xs text-sky-800/80 dark:text-sky-300/70">
                  eBay also applies its final value fee to collected sales tax, which varies by
                  buyer location and isn&apos;t modeled here — treat these figures as a lower bound
                  on fees.
                </p>
              )}
            </div>

            <h3 className="mt-7 text-base font-semibold text-slate-900 dark:text-white">
              Same product, every marketplace
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {money(salePrice)} sale price, {money(unitCost)} unit cost — ranked by profit.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-white/10">
                    <th className="pb-2 font-medium text-slate-500 dark:text-slate-400">
                      Marketplace
                    </th>
                    <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">
                      Rate
                    </th>
                    <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">
                      Fees
                    </th>
                    <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {comparison.map((row) => {
                    // The rate actually charged at THIS price — tiered
                    // categories can differ from the headline rate (Amazon
                    // Baby is 8% headline but 15% on a $29.99 sale).
                    const referralLine = row.breakdown.lines[0]?.amount ?? 0
                    const feeBase = salePrice + buyerShipping
                    const effectivePct = feeBase > 0 ? (referralLine / feeBase) * 100 : 0
                    return (
                    <tr key={row.marketplace.slug}>
                      <td className="py-2.5">
                        <Link
                          href={`/fees/${row.marketplace.slug}/${row.category.slug}`}
                          className="font-medium text-slate-900 hover:text-sky-600 dark:text-white dark:hover:text-sky-400"
                        >
                          {row.marketplace.shortName}
                        </Link>
                        <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                          {row.category.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {effectivePct.toFixed(1).replace(/\.0$/, "")}%
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {money(row.breakdown.totalFees)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-medium tabular-nums ${
                          row.breakdown.profit >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {money(row.breakdown.profit)}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Link
              href="/newsletter"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Get alerted when these fees change
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FeeUnlockGate>
      </div>
    </div>
  )
}
