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

export const SPONSOR_PAYMENT_NOTE = 'Payment is by invoice or payment link after your inquiry. PayPal is also possible.'
