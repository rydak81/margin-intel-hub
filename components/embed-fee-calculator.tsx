"use client"

import { useMemo, useState } from "react"
import { MARKETPLACES, computeFeeBreakdown } from "@/lib/marketplace-fees"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

export function EmbedFeeCalculator() {
  const [mSlug, setMSlug] = useState(MARKETPLACES[0].slug)
  const marketplace = MARKETPLACES.find(m => m.slug === mSlug) ?? MARKETPLACES[0]
  const [cSlug, setCSlug] = useState(marketplace.categories[0].slug)
  const category = marketplace.categories.find(c => c.slug === cSlug) ?? marketplace.categories[0]
  const [price, setPrice] = useState(30)

  const b = useMemo(() => computeFeeBreakdown({ salePrice: price, unitCost: 0, marketplace, category }), [price, marketplace, category])
  const field = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"

  return (
    <div className="mx-auto max-w-md p-4 font-sans text-slate-900">
      <h1 className="text-lg font-bold">Marketplace fee calculator</h1>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs font-medium">Marketplace
          <select className={field} value={marketplace.slug} onChange={e => { const m = MARKETPLACES.find(x => x.slug === e.target.value)!; setMSlug(m.slug); setCSlug(m.categories[0].slug) }}>
            {MARKETPLACES.map(m => <option key={m.slug} value={m.slug}>{m.shortName}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium">Sale price ($)
          <input className={field} type="number" min={0} step="0.01" value={price} onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} />
        </label>
        <label className="col-span-2 text-xs font-medium">Category
          <select className={field} value={category.slug} onChange={e => setCSlug(e.target.value)}>
            {marketplace.categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-xl bg-slate-100 p-3">
        <ul className="space-y-1 text-sm">
          {b.lines.map(l => <li key={l.label} className="flex justify-between"><span>{l.label}</span><span className="tabular-nums">${l.amount.toFixed(2)}</span></li>)}
        </ul>
        <div className="mt-2 flex justify-between border-t border-slate-300 pt-2 font-semibold">
          <span>Total fees ({b.takeRatePct}%)</span><span className="tabular-nums">${b.totalFees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm"><span>You keep (before costs)</span><span className="tabular-nums">${b.netProceeds.toFixed(2)}</span></div>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Excludes fulfillment, shipping and ads. Schedule verified {marketplace.lastVerified}.</p>
      <p className="mt-2 text-xs">
        <a href={`${SITE_URL}/fees/${marketplace.slug}/${category.slug}?source=embed`} target="_blank" rel="noopener" className="font-semibold text-sky-700 underline">Full breakdown</a>
        {" · "}
        <a href={`${SITE_URL}/newsletter?source=embed`} target="_blank" rel="noopener" className="font-semibold text-sky-700 underline">Powered by MarketplaceBeta</a>
      </p>
    </div>
  )
}
