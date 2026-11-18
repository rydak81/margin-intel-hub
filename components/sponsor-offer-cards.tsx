import { SPONSOR_OFFER_DEFS, SPONSOR_PAYMENT_NOTE } from '@/lib/sponsor-offers'

/** Sponsorship prices. Rendered on /sponsor and /pricing from lib/sponsor-offers.ts so they never drift. */
export function SponsorOfferCards() {
  return (
    <div>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {SPONSOR_OFFER_DEFS.map(o => (
          <li key={o.value} className="flex flex-col rounded-xl border border-border bg-card p-5">
            <p className="font-semibold">{o.name}</p>
            <p className="mt-2 text-3xl font-bold">{o.price}{o.unit ? <span className="ml-1 text-base font-medium text-muted-foreground">{o.unit}</span> : null}</p>
            <p className="mt-3 text-sm text-muted-foreground">{o.detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">{SPONSOR_PAYMENT_NOTE}</p>
    </div>
  )
}
