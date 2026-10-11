'use client'
import { useState } from 'react'
import { calculateGuideScenario, type GuideScenario } from '@/lib/guide-calculations'

const FIELDS: Record<GuideScenario, { key: string; label: string; initial: string }[]> = {
  'product-profitability': [
    { key: 'price', label: 'Revenue per order ($)', initial: '30' },
    { key: 'costs', label: 'All variable costs per order ($)', initial: '23.70' },
    { key: 'orders', label: 'Monthly orders', initial: '100' },
    { key: 'overhead', label: 'Monthly fixed costs ($)', initial: '150' },
  ],
  'break-even-advertising': [
    { key: 'price', label: 'Revenue per attributed order ($)', initial: '30' },
    { key: 'costs', label: 'Variable costs before ads ($/order)', initial: '20.70' },
    { key: 'retain', label: 'Contribution to retain ($/order)', initial: '4.50' },
    { key: 'conversion', label: 'Expected orders per click (%)', initial: '10' },
  ],
  'adding-a-marketplace': [
    { key: 'contribution', label: 'New channel contribution ($/order)', initial: '5.30' },
    { key: 'fixed', label: 'Added monthly fixed costs ($)', initial: '180' },
    { key: 'orders', label: 'New channel monthly orders', initial: '100' },
    { key: 'displaced', label: 'Orders displaced from existing channel', initial: '0' },
    { key: 'existing', label: 'Existing channel contribution ($/order)', initial: '6.30' },
  ],
}
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
export function GuideScenarioCalculator({ kind }: { kind: GuideScenario }) {
  const fields = FIELDS[kind]
  const defaults = () => Object.fromEntries(fields.map(f => [f.key, f.initial]))
  const [values, setValues] = useState<Record<string, string>>(defaults)
  const numbers = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() === '' ? NaN : Number(value)]))
  const result = calculateGuideScenario(kind, numbers)
  let outputs: { label: string; value: string }[] = []
  if (result && 'margin' in result) outputs = [
    { label: 'Contribution per order', value: money(result.contribution!) },
    { label: 'Contribution margin', value: `${result.margin!.toFixed(1)}%` },
    { label: 'Monthly result after entered fixed costs', value: money(result.monthly!) },
  ]
  else if (result && 'acos' in result) outputs = result.budget! >= 0 ? [
    { label: 'Allowable ad cost per order', value: money(result.budget!) },
    { label: 'Target ACoS ceiling', value: `${result.acos!.toFixed(1)}%` },
    { label: 'Target ROAS floor', value: result.roas === null ? 'No paid-ad budget' : `${result.roas!.toFixed(2)}×` },
    { label: 'Estimated CPC ceiling', value: money(result.cpc!) },
  ] : [{ label: 'Contribution shortfall before advertising', value: money(-result.budget!) }]
  else if (result && 'breakEvenOrders' in result) outputs = [
    { label: 'Orders to cover added fixed costs, with no displacement', value: result.breakEvenOrders === null ? 'Not achievable at zero contribution' : String(result.breakEvenOrders) },
    { label: 'Monthly change after fixed costs and displaced contribution', value: money(result.monthly!) },
  ]
  return <section id="scenario-calculator" aria-labelledby="scenario-title" className="mb-12 scroll-mt-48 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/20">
    <div className="border-b border-blue-200 p-5 sm:p-7 dark:border-blue-900"><p className="text-xs font-bold uppercase tracking-widest text-primary">Make the numbers yours</p><h2 id="scenario-title" className="mt-2 text-2xl font-bold">Try a scenario</h2><p id="scenario-note" className="mt-3 text-sm leading-6 text-muted-foreground">Hypothetical USD defaults match the worked example below. Replace them with your own costs. Calculations run in your browser; inputs are not submitted.</p></div>
    <div className="p-5 sm:p-7"><div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="block text-sm font-semibold" htmlFor={`scenario-${field.key}`}>{field.label}<input id={`scenario-${field.key}`} type="number" inputMode="decimal" min="0" max={field.key === 'conversion' ? 100 : undefined} step="any" value={values[field.key]} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} aria-describedby="scenario-note" className="mt-2 block w-full min-w-0 rounded-lg border border-border bg-background px-3 py-3 text-base tabular-nums focus-visible:outline-2 focus-visible:outline-primary" /></label>)}</div>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">{kind === 'product-profitability' ? 'Variable costs should include product, fees, shipping, fulfillment, returns, storage, and advertising. Results are before financing and income tax.' : kind === 'break-even-advertising' ? 'Set retained contribution to zero to see variable-cost break-even. Attribution is not proof of incremental sales. CPC is a planning estimate, not a bid recommendation.' : 'Contribution should already subtract channel fees, fulfillment, returns, and advertising. Displaced orders cannot exceed new channel orders. This model excludes shared overhead, financing, and tax.'}</p>
    <div aria-live="polite" aria-atomic="true" className="mt-6">{result ? <dl className="grid gap-3 sm:grid-cols-2">{outputs.map(output => <div key={output.label} className="rounded-xl border border-border bg-card p-4 shadow-sm"><dt className="text-sm text-muted-foreground">{output.label}</dt><dd className="mt-2 break-words text-2xl font-bold tabular-nums">{output.value}</dd></div>)}</dl> : <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{kind === "adding-a-marketplace" ? "Enter a nonnegative number in every field. Displaced orders cannot exceed new channel orders." : kind === "break-even-advertising" ? "Enter a nonnegative number in every field. Revenue must be above zero and conversion cannot exceed 100%." : "Enter a nonnegative number in every field, with revenue above zero."}</p>}</div>
    <button type="button" onClick={() => setValues(defaults())} className="mt-5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">Reset example</button></div>
  </section>
}
