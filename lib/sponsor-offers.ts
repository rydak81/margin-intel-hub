// Single source of truth for sponsorship offers and prices. Used by /sponsor, /pricing,
// the inquiry form's offer select and the API route allowlist (lib/sponsor-inquiry.ts).
// Prices were approved by the owner. Do not add audience or traffic numbers here.

export interface SponsorOfferDef {
  /** Stored in the database and checked by the API route. */
  value: string
  /** Short name used in headings. */
  name: string
  /** Display price, e.g. "$149". */
  price: string
  /** What the price covers, e.g. "per week". Empty for a flat price. */
  unit: string
  detail: string
  /** Option text in the form select and the notification email. */
  label: string
}

export const SPONSOR_OFFER_DEFS: readonly SponsorOfferDef[] = [
  {
    value: 'founding_sponsor',
    name: 'Founding Sponsor',
    price: '$149',
    unit: 'per week',
    detail: '5 Daily Marketplace Brief slots plus a 30-day sponsored tool listing.',
    label: 'Founding Sponsor \u2014 $149/week',
  },
  {
    value: 'single_slot',
    name: 'Single Brief slot',
    price: '$39',
    unit: '',
    detail: 'One clearly labelled sponsor slot in a single Daily Marketplace Brief.',
    label: 'Single Brief slot \u2014 $39',
  },
  {
    value: 'dossier_sponsor',
    name: 'Dossier presenting sponsor',
    price: '$299',
    unit: '',
    detail: 'Presenting sponsorship of the MarketplaceBeta Intelligence Dossier, our downloadable research report.',
    label: 'Dossier presenting sponsor \u2014 $299',
  },
]

/** Always last in the select: questions and anything not priced above. */
export const SPONSOR_OTHER_OFFER = { value: 'other', label: 'Something else / question' } as const

/** Founding rate lock: booked on or before this date (America/New_York, inclusive). */
export const FOUNDING_LOCK_DEADLINE = { year: 2026, month: 11, day: 15, label: 'November 15, 2026' } as const
export const FOUNDING_LOCK_TEXT = 'Rate locked for 6 months if booked by November 15, 2026.'

/** True while the founding rate lock can still be offered. */
export function foundingLockOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const { year, month, day } = FOUNDING_LOCK_DEADLINE
  return parts <= `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export const SPONSOR_PAYMENT_NOTE = 'Payment is by invoice or payment link after your inquiry. PayPal is also possible.'
