/**
 * "Questions sellers ask" at /answers.
 *
 * Every dollar figure is either computed here from a marketplace's own page
 * (constants below, checked on CHECKED_ON) or read from lib/marketplace-fees.ts
 * / lib/amazon-holiday-peak-2026.ts. The size-tier FBA dollars live only in the
 * holiday-peak module, which transcribes Amazon's 2026 rate card (read
 * 2026-10-21). This file does not invent a 2027 per-SKU rate.
 */
import { getAnalysis } from '@/lib/analysis'
import { PEAK_END, PEAK_START, STANDARD_ROWS, SURCHARGE_PCT, priceBand, withSurcharge, BAND_INDEX } from '@/lib/amazon-holiday-peak-2026'
import { getCategory, getMarketplace, orderFee, referralFee } from '@/lib/marketplace-fees'

export const ANSWERS_PATH = '/answers'
export const CHECKED_ON = '2026-11-19'
/** Seller Central rate card transcription date. The logged-out help page did not return the table on CHECKED_ON. */
export const FBA_TIER_READ_ON = '2026-10-21'

export const ETSY_OFFSITE_HELP = 'https://help.etsy.com/hc/en-us/articles/360000338367-How-Etsy-s-Offsite-Ads-Work'
export const ETSY_FEES_HELP = 'https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy'
export const ETSY_FEES_POLICY = 'https://www.etsy.com/legal/fees/'
export const ETSY_PROCESSING_HELP = 'https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy'
export const EBAY_FEES_HELP = 'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822'
export const AMAZON_PRICING = 'https://sell.amazon.com/pricing'
export const AMAZON_2027_UPDATE = 'https://sellingpartners.aboutamazon.com/update-to-us-referral-and-fulfillment-by-amazon-fees-for-2027'
export const AMAZON_FBA_RATE_CARD = 'https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW?locale=en-US'
export const AMAZON_PEAK_ANNOUNCEMENT = 'https://sellercentral.amazon.com/seller-forums/discussions/t/3e31fbb7-04e0-4ed4-873e-f74b1052e2ff'

/** Slugs that returned HTTP 200 on marketplacebeta.com on CHECKED_ON. */
export const LIVE_ANALYSIS_SLUGS = [
  'etsy-offsite-ads-fees-2026',
  'etsy-vs-ebay-fees-2026-20-50-100',
  'ebay-per-order-fee-2026-under-10',
  'ebay-watch-fees-2026-15-percent-to-1000',
  'amazon-holiday-peak-fees-2026-fba-surcharge',
  'q4-2026-parcel-surcharge-calendar',
] as const

export type AnswerMarketplace = 'etsy' | 'amazon' | 'ebay'
export type AnswerJob = 'fees' | 'storage' | 'ads'

export interface AnswerSource {
  name: string
  url: string
  /** ISO date this source was read for the figures it supports. */
  checkedOn: string
}

export interface WorkedLine {
  label: string
  value: string
  detail: string
}

export interface WorkedExample {
  heading: string
  caption: string
  lines: WorkedLine[]
}

export interface AnswerLink {
  href: string
  label: string
  note: string
}

export interface AnswerPage {
  slug: string
  question: string
  description: string
  directAnswer: string
  marketplace: AnswerMarketplace
  jobs: AnswerJob[]
  sources: AnswerSource[]
  examples: WorkedExample[]
  checks: string[]
  feeLinks: AnswerLink[]
  analysisSlugs: string[]
}

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
export const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const etsy = getMarketplace('etsy')!
const amazon = getMarketplace('amazon')!
const ebay = getMarketplace('ebay')!
const kitchen = getCategory('amazon', 'kitchen')!
const ebayMost = getCategory('ebay', 'most-categories')!

export const ETSY_TRANSACTION_PCT = etsy.categories[0].referralPct
export const ETSY_LISTING_FEE = etsy.listingFee!
export const ETSY_PROCESSING_PCT = etsy.paymentProcessingPct!
export const ETSY_PROCESSING_FLAT = etsy.paymentProcessingFlat!
export const AMAZON_REFERRAL_PCT = kitchen.referralPct
export const AMAZON_REFERRAL_MIN = kitchen.minFee!
export const AMAZON_PROFESSIONAL_MONTHLY = amazon.accountFee!.amount
/** sell.amazon.com/pricing, "$0.99 / item sold", read on CHECKED_ON. Not in the fee table. */
export const AMAZON_INDIVIDUAL_PER_ITEM = 0.99
export const EBAY_FVF_PCT = ebayMost.referralPct
export const EBAY_ORDER_FEE_SMALL = ebay.smallOrderFee!.amount
export const EBAY_ORDER_FEE_SMALL_UP_TO = ebay.smallOrderFee!.upTo
export const EBAY_ORDER_FEE_STANDARD = ebay.perOrderFee!

const FBA_ROW = STANDARD_ROWS.find(r => r.tier === 'Small standard' && r.weight === '6+ to 8 oz')!

export function fbaPeakBeforeSurcharge(price: number): number {
  return FBA_ROW.peak[BAND_INDEX[priceBand(price)]]
}

export function offsiteFee(orderTotal: number, rate: number): { raw: number; charged: number; capped: boolean } {
  const raw = cents(orderTotal * rate)
  const charged = Math.min(raw, 100)
  return { raw, charged, capped: raw > 100 }
}

function line(label: string, value: string, detail: string): WorkedLine {
  return { label, value, detail }
}

function etsyOrder(item: number, shipping: number) {
  const total = cents(item + shipping)
  const at15 = offsiteFee(total, 0.15)
  const at12 = offsiteFee(total, 0.12)
  return { total, at15, at12 }
}

const etsyPlain = etsyOrder(48, 7)
const etsyCap = etsyOrder(680, 40)
const etsyOptOut = etsyOrder(36, 8)

function ebaySale(item: number, shipping: number, taxRate: number) {
  const tax = cents((item + shipping) * taxRate)
  const total = cents(item + shipping + tax)
  const percentage = referralFee(total, ebayMost).amount
  const perOrder = orderFee(ebay, total)
  return { tax, total, percentage, perOrder, fees: cents(percentage + perOrder) }
}

const ebayWithExtras = ebaySale(40, 6, 0.06)
const ebayItemOnly = ebaySale(40, 0, 0)
const ebayAt10 = { total: 10, percentage: referralFee(10, ebayMost).amount, perOrder: orderFee(ebay, 10) }
const ebayJustOver = { total: 10.01, percentage: referralFee(10.01, ebayMost).amount, perOrder: orderFee(ebay, 10.01) }
const ebaySplitA = { total: 6, percentage: referralFee(6, ebayMost).amount, perOrder: orderFee(ebay, 6) }
const ebayCombined = { total: 12, percentage: referralFee(12, ebayMost).amount, perOrder: orderFee(ebay, 12) }
const athleticAt150 = cents(150 * 0.08)

function amazonOrder(price: number) {
  const referral = referralFee(price, kitchen).amount
  const before = fbaPeakBeforeSurcharge(price)
  const withFuel = withSurcharge(before)
  const fuel = cents(withFuel - before)
  const individual = cents(referral + withFuel + AMAZON_INDIVIDUAL_PER_ITEM)
  const professionalOrder = cents(referral + withFuel)
  const planPerHundred = cents(AMAZON_PROFESSIONAL_MONTHLY / 100)
  return { referral, before, withFuel, fuel, individual, professionalOrder, planPerHundred, withPlanSpread: cents(professionalOrder + planPerHundred) }
}

const amazon50 = amazonOrder(50)
const amazon100 = amazonOrder(100)

const impliedAveragePrice = cents(0.19 / 0.008)

export const ANSWER_PAGES: AnswerPage[] = [
  {
    slug: 'etsy-offsite-ads-fee',
    question: 'What is the Etsy Offsite Ads fee?',
    description: 'Etsy charges 15% or 12% of the order total, shipping included, when a buyer orders within 30 days of an offsite-ad click. The fee never exceeds $100.',
    directAnswer: 'Etsy charges 15% of the order total when a shop has always made less than $10,000 in any consecutive 365-day period, and 12% once it has reached $10,000. The fee applies when a buyer orders within 30 days of an offsite-ad click, includes shipping, and never exceeds $100 on one order.',
    marketplace: 'etsy',
    jobs: ['ads'],
    sources: [
      { name: "Etsy's Offsite Ads help page", url: ETSY_OFFSITE_HELP, checkedOn: CHECKED_ON },
      { name: "Etsy's fees and taxes help page", url: ETSY_FEES_HELP, checkedOn: CHECKED_ON },
      { name: "Etsy's Fees & Payments Policy", url: ETSY_FEES_POLICY, checkedOn: CHECKED_ON },
    ],
    examples: [
      {
        heading: 'A $48 item with $7 shipping',
        caption: 'Hypothetical US order. Gift wrap is $0. The Offsite Ads base is the item price plus the shipping you charge.',
        lines: [
          line('Item price', usd(48), 'Hypothetical listing price.'),
          line('Shipping charged to the buyer', usd(7), 'Included in the Offsite Ads base. US sales tax is not.'),
          line('Fee base', usd(etsyPlain.total), '$48.00 + $7.00.'),
          line('Fee at 15%', usd(etsyPlain.at15.charged), 'Shop has always stayed under $10,000 in any consecutive 365-day period.'),
          line('Fee at 12%', usd(etsyPlain.at12.charged), 'Shop has reached $10,000 in any consecutive 365-day period. Participation is then required for the life of the shop.'),
        ],
      },
      {
        heading: 'Where the $100 cap binds',
        caption: 'Hypothetical US order, gift wrap $0. The help page says the fee on one order never exceeds $100, whatever the order total.',
        lines: [
          line('Item price', usd(680), 'Hypothetical listing price.'),
          line('Shipping charged to the buyer', usd(40), 'Included in the base.'),
          line('Fee base', usd(etsyCap.total), '$680.00 + $40.00.'),
          line('15% before the cap', usd(etsyCap.at15.raw), '15% of $720.00.'),
          line('15% fee charged', usd(etsyCap.at15.charged), 'The help page caps one order at $100, so the charge is $100 rather than $108.00.'),
          line('12% fee charged', usd(etsyCap.at12.charged), '12% of $720.00 is $86.40, which is under the cap, so the cap does not change it.'),
        ],
      },
    ],
    checks: [
      'Shop Manager → Marketing → Offsite Ads. Open each order from the last seven days that Etsy marks as attributed and read the fee on that order.',
      'Payment account → the same order. Confirm the fee base is the item price plus shipping and gift wrap, and that US sales tax was left out.',
      'Divide the fee by that base. It should be 15% or 12%, and the fee on that one order should be $100 or less.',
      'Settings → Offsite Ads. If Opt out is still there, the shop is still on the under-$10,000 side of the rule.',
      'On the first of the month, compare item sales (not shipping) over the prior 365 days with $10,000. The policy counts item price times quantity, after discounts and cancelled orders, and leaves shipping, gift wrap, tax, and Etsy fees out of that total.',
    ],
    feeLinks: [
      { href: '/fees/etsy', label: 'Etsy fees by category', note: 'Transaction fee, listing fee, and US payment processing, beside the Offsite Ads line.' },
    ],
    analysisSlugs: ['etsy-offsite-ads-fees-2026', 'etsy-vs-ebay-fees-2026-20-50-100'],
  },
  {
    slug: 'can-i-turn-off-etsy-offsite-ads',
    question: 'Can I turn off Etsy Offsite Ads?',
    description: 'Opt out of Etsy Offsite Ads only while the shop has always made less than $10,000 in a 365-day period. After that, Etsy requires it for the life of the shop.',
    directAnswer: 'You can turn Offsite Ads off while your shop has always made less than $10,000 in any consecutive 365-day period. In Shop Manager, open Settings, then Offsite Ads, and choose Opt out. After the shop reaches $10,000, Etsy requires participation for the life of the shop.',
    marketplace: 'etsy',
    jobs: ['ads'],
    sources: [
      { name: "Etsy's Offsite Ads help page", url: ETSY_OFFSITE_HELP, checkedOn: CHECKED_ON },
      { name: "Etsy's Fees & Payments Policy", url: ETSY_FEES_POLICY, checkedOn: CHECKED_ON },
    ],
    examples: [
      {
        heading: 'The fee an opt-out removes on one order',
        caption: 'Hypothetical US order: $36 item, $8 shipping, no gift wrap. Opting out removes the Offsite Ads fee on a click that would have been attributed. The transaction fee, the listing fee, and payment processing still apply.',
        lines: [
          line('Fee base', usd(etsyOptOut.total), 'Item price plus shipping charged to the buyer.'),
          line('Offsite Ads fee at 15%', usd(etsyOptOut.at15.charged), 'Charged if the shop is still enrolled and the buyer orders within 30 days of the click.'),
          line('Offsite Ads fee after you opt out', usd(0), 'Available only while the shop has always stayed under $10,000 in any consecutive 365-day period.'),
          line('Offsite Ads fee at 12%', usd(etsyOptOut.at12.charged), 'The rate once the shop has reached $10,000. Opt-out is no longer available, including if sales later fall back under $10,000.'),
          line('Other Etsy fees, still charged', `${ETSY_TRANSACTION_PCT}% + ${usd(ETSY_LISTING_FEE)} + ${ETSY_PROCESSING_PCT}% + ${usd(ETSY_PROCESSING_FLAT)}`, 'US transaction, listing, and payment-processing fees from the fee table. They do not turn off with Offsite Ads.'),
        ],
      },
    ],
    checks: [
      'Shop Manager → Settings → Offsite Ads. If the page offers Opt out of Offsite Ads, the shop can still leave.',
      'After you confirm Opt out, reload that settings page and confirm the shop stays opted out.',
      'Payment account: filter recent activity for an Offsite Ads fee dated after the opt-out. A new fee means the order was attributed while the shop was still enrolled, or the opt-out did not stick.',
      'On the first of the month, add up item sales for the prior 365 days the way the Fees & Payments Policy describes. Shipping you charged is in the ad-fee base and is not in this $10,000 total.',
      'If the shop has already reached $10,000, stop looking for an off switch. The help page says participation is required for the life of the shop.',
    ],
    feeLinks: [
      { href: '/fees/etsy', label: 'Etsy fees by category', note: 'The fees that remain after an Offsite Ads opt-out.' },
    ],
    analysisSlugs: ['etsy-offsite-ads-fees-2026', 'etsy-vs-ebay-fees-2026-20-50-100'],
  },
  {
    slug: 'amazon-fba-fees-2027',
    question: 'What changes in Amazon FBA fees in 2027?',
    description: 'Fulfillment fees change January 15, 2027, by an average of $0.19 a unit. Storage and the low-inventory rule change February 1.',
    directAnswer: "Amazon's 2027 fee update puts most fulfillment-fee changes on January 15, 2027, including an average FBA fulfillment increase of $0.19 per unit. On February 1, 2027 it drops the storage-utilization surcharge, folds aged inventory into one age-based storage rate, and limits the low-inventory fee to SKUs under 28 days of supply on both four-week checks.",
    marketplace: 'amazon',
    jobs: ['fees', 'storage'],
    sources: [
      { name: "Amazon's 2027 US referral and FBA fee update", url: AMAZON_2027_UPDATE, checkedOn: CHECKED_ON },
    ],
    examples: [
      {
        heading: "Amazon's average, turned into a selling price",
        caption: 'Arithmetic on the two figures in the November 5, 2026 letter: an average increase of $0.19 per unit, about 0.8% of the average item’s selling price. This is the average Amazon published. It is not the change for any one SKU. Amazon says some products go up and some go down.',
        lines: [
          line('Average fulfillment increase', usd(0.19), 'Per unit sold, effective with the January 15, 2027 fulfillment changes.'),
          line('Share of the average selling price', '0.8%', 'Amazon’s figure for that average item.'),
          line('Implied average selling price', usd(impliedAveragePrice), '$0.19 ÷ 0.008. Our arithmetic from those two published figures.'),
          line('Your SKU', 'Open the dashboard', 'Amazon points sellers to the Fee Change Comparison dashboard in Profit Analytics and to the Revenue Calculator. This page does not print a 2027 size-tier rate.'),
        ],
      },
      {
        heading: 'The February 1 low-inventory test',
        caption: 'Hypothetical FNSKU. Amazon’s letter says the fee applies only when days of supply are below 28 on actual shipments in both the four weeks before the assessment date and the four weeks after. No dollar amount is attached, because the letter does not publish one.',
        lines: [
          line('Units on the assessment date', '56', 'The quantity Amazon records that day.'),
          line('Prior 28 days shipped', '112 units', '4 per day. Days of supply = 56 ÷ 4 = 14. Below 28.'),
          line('Following 28 days shipped', '56 units', '2 per day. Days of supply = 56 ÷ 2 = 28. The test is below 28, so 28 does not qualify.'),
          line('Does the fee test pass?', 'No', 'Both windows have to be below 28. One window at 28 keeps this check out.'),
          line('Same units, following window also at 4 per day', 'Yes', '56 ÷ 4 = 14 on both windows. Both are below 28, so this check meets the test Amazon described. The letter does not give the dollar fee.'),
        ],
      },
      {
        heading: 'Storage on February 1, by age',
        caption: 'Hypothetical units already in FBA on February 1, 2027. Amazon says inventory that turns in under six months will be flat or lower, and aged inventory will cost more, after the storage-utilization surcharge is removed and aged inventory is combined into one age-based monthly rate. No cubic-foot rate is stated in the letter.',
        lines: [
          line('Unit aged 5 months', 'Under six months', 'In the group Amazon says will be flat or lower.'),
          line('Unit aged 7 months', 'Aged inventory', 'In the group Amazon says will cost more under the combined age-based rate.'),
          line('Storage-utilization surcharge', 'Removed February 1, 2027', 'Amazon’s stated reason is to make it easier to stock up ahead of high-demand events.'),
        ],
      },
    ],
    checks: [
      'Seller Central → Profit Analytics → Fee Change Comparison. Read the account and the SKU, and ignore any average as a substitute for that SKU.',
      'Revenue Calculator on one fast seller. Compare the current fulfillment fee with the 2027 scenario the calculator shows. Write down that SKU’s number from the tool.',
      'Inventory age. List FNSKUs that will be past six months old on February 1, 2027. Those are the units Amazon says move to the higher age-based storage rate.',
      'Days of supply. For each FNSKU under 28 days of cover, note shipments in the last four weeks. The February 1 rule also waits for the four weeks after the assessment date, and charges only when both windows are below 28.',
      'Leave the fuel and logistics surcharge as its own line. Amazon’s letter says it remains unchanged and does not restate a new percent.',
    ],
    feeLinks: [
      { href: '/fees/amazon', label: 'Amazon referral fees by category', note: 'Current referral rates. The 2027 letter describes fulfillment, storage, and low-inventory changes and does not restate these category rates.' },
      { href: '/fees/amazon/holiday-peak-2026', label: 'Amazon holiday peak fulfillment fees', note: 'The 2026 peak schedule in force through January 14, 2027, with size-tier rates and the surcharge.' },
    ],
    analysisSlugs: ['amazon-holiday-peak-fees-2026-fba-surcharge', 'q4-2026-parcel-surcharge-calendar'],
  },
  {
    slug: 'how-much-does-amazon-take-from-a-sale',
    question: 'How much does Amazon take from a sale?',
    description: 'On a hypothetical $50 or $100 Home and Kitchen order, Amazon’s referral fee is 15%. FBA fulfillment and the $0.99 or $39.99 selling plan are separate lines.',
    directAnswer: "Amazon's take on one sale is three different charges. On a hypothetical $50 or $100 Home and Kitchen order with no shipping or gift wrap, the referral fee is 15%. Fulfillment is a separate FBA fee for the unit's size tier. The selling plan is either $0.99 per item or $39.99 a month.",
    marketplace: 'amazon',
    jobs: ['fees'],
    sources: [
      { name: "Amazon's selling fees page", url: AMAZON_PRICING, checkedOn: CHECKED_ON },
      { name: "Amazon's holiday peak fulfillment announcement", url: AMAZON_PEAK_ANNOUNCEMENT, checkedOn: CHECKED_ON },
      { name: "Amazon's 2026 US FBA fulfillment fee changes", url: AMAZON_FBA_RATE_CARD, checkedOn: FBA_TIER_READ_ON },
    ],
    examples: [
      {
        heading: 'Hypothetical $50 Home and Kitchen unit',
        caption: `One unit, small standard, shipping weight 6+ to 8 oz, no buyer shipping, no gift wrap. Referral is 15% of the item price because that base is empty of shipping and gift wrap (Amazon's selling fees page includes both when you charge them). Fulfillment is the 2026 peak rate for the $10 to $50 band, for a ship date from ${formatAnswerDate(PEAK_START)} through ${formatAnswerDate(PEAK_END)}. The ${SURCHARGE_PCT}% fuel and logistics surcharge is applied to the fulfillment fee. This is not a January 15, 2027 rate.`,
        lines: [
          line('Item price', usd(50), 'Home and Kitchen on the selling fees page. Our Kitchen row is the same 15% with a $0.30 minimum.'),
          line('Referral fee', usd(amazon50.referral), `15% of $50.00. The $0.30 minimum does not set this fee.`),
          line('FBA fulfillment, before the surcharge', usd(amazon50.before), `Peak 2026, small standard, 6+ to 8 oz, $10 to $50. Read ${FBA_TIER_READ_ON} from Amazon's rate card.`),
          line(`Fuel and logistics surcharge (${SURCHARGE_PCT}%)`, usd(amazon50.fuel), `${SURCHARGE_PCT}% of ${usd(amazon50.before)}, rounded to the cent. Amazon's holiday announcement, re-read ${CHECKED_ON}, still states ${SURCHARGE_PCT}% on top of peak fees.`),
          line('FBA fulfillment, with the surcharge', usd(amazon50.withFuel), `${usd(amazon50.before)} + ${usd(amazon50.fuel)}.`),
          line('Individual plan', usd(AMAZON_INDIVIDUAL_PER_ITEM), '$0.99 per item sold, from the selling fees page.'),
          line('Amazon on this order, Individual plan', usd(amazon50.individual), 'Referral + FBA with surcharge + the per-item plan fee.'),
          line('Professional plan', `${usd(AMAZON_PROFESSIONAL_MONTHLY)} / month`, 'Not a per-order fee. Called out on its own.'),
          line('Amazon on this order, Professional plan', usd(amazon50.professionalOrder), 'Referral + FBA with surcharge. The monthly plan is extra.'),
          line('Professional plan spread across 100 orders', usd(amazon50.planPerHundred), `Hypothetical: ${usd(AMAZON_PROFESSIONAL_MONTHLY)} ÷ 100. This order's share of the plan, plus referral and FBA, is ${usd(amazon50.withPlanSpread)}.`),
        ],
      },
      {
        heading: 'Hypothetical $100 Home and Kitchen unit',
        caption: 'Same size tier and the same zero shipping and gift wrap. $100 is in Amazon’s over-$50 fulfillment band, so the fulfillment dollar changes. The referral rate stays 15%.',
        lines: [
          line('Item price', usd(100), 'Home and Kitchen, 15%.'),
          line('Referral fee', usd(amazon100.referral), '15% of $100.00.'),
          line('FBA fulfillment, before the surcharge', usd(amazon100.before), `Peak 2026, small standard, 6+ to 8 oz, over $50. Read ${FBA_TIER_READ_ON}.`),
          line(`Fuel and logistics surcharge (${SURCHARGE_PCT}%)`, usd(amazon100.fuel), `${SURCHARGE_PCT}% of ${usd(amazon100.before)}.`),
          line('FBA fulfillment, with the surcharge', usd(amazon100.withFuel), `${usd(amazon100.before)} + ${usd(amazon100.fuel)}.`),
          line('Individual plan', usd(AMAZON_INDIVIDUAL_PER_ITEM), 'Per item sold.'),
          line('Amazon on this order, Individual plan', usd(amazon100.individual), 'Referral + FBA with surcharge + $0.99.'),
          line('Professional plan', `${usd(AMAZON_PROFESSIONAL_MONTHLY)} / month`, 'Same monthly fee as on the $50 order. It does not scale with the item price.'),
          line('Amazon on this order, Professional plan', usd(amazon100.professionalOrder), 'Referral + FBA with surcharge.'),
          line('Professional plan spread across 100 orders', usd(amazon100.planPerHundred), `Plus referral and FBA, ${usd(amazon100.withPlanSpread)} on this order.`),
        ],
      },
    ],
    checks: [
      'Payments report on a recent Home and Kitchen order. The referral line should be 15% of the item price plus any shipping and gift wrap you charged, or $0.30 if that is greater.',
      'Account settings → selling plan. Individual is $0.99 per item sold. Professional is $39.99 per month.',
      `Revenue Calculator for this SKU’s size tier. A unit that ships through ${PEAK_END} is on the peak column. A unit that ships on January 15, 2027 is on the 2027 schedule, which is a different page.`,
      'Fee preview: the fuel and logistics surcharge should be a percent of the fulfillment fee, not of the sale price.',
      'If the category on the fee report is not Home and Kitchen, use that category’s rate. The 15% above is this category only.',
    ],
    feeLinks: [
      { href: '/fees/amazon', label: 'Amazon referral fees by category', note: 'Every category rate, including the ones that are not 15%.' },
      { href: '/fees/amazon/kitchen', label: 'Amazon Kitchen referral fee', note: 'The 15% category used in the examples.' },
      { href: '/fees/amazon/holiday-peak-2026', label: 'Amazon holiday peak fulfillment fees', note: 'The full size-tier table behind the fulfillment lines above.' },
    ],
    analysisSlugs: ['amazon-holiday-peak-fees-2026-fba-surcharge'],
  },
  {
    slug: 'ebay-fees-include-shipping-and-tax',
    question: 'Do eBay fees include shipping and tax?',
    description: "eBay's final value fee uses the total amount of the sale: item price, handling, shipping collected from the buyer, and sales tax.",
    directAnswer: "eBay calculates the final value fee on the total amount of the sale. That total includes the item price, any handling charge, shipping collected from the buyer, and sales tax. A per-order fee of $0.30 or $0.40 is added on top. When a listing offers 1-day or international shipping plus a cheaper domestic option, eBay uses the cheaper domestic amount.",
    marketplace: 'ebay',
    jobs: ['fees'],
    sources: [
      { name: "eBay's selling fees page", url: EBAY_FEES_HELP, checkedOn: CHECKED_ON },
    ],
    examples: [
      {
        heading: 'A $40 item, $6 shipping, 6% sales tax',
        caption: 'Hypothetical US basic (non-Store) order in most categories, one item, standard seller performance, no handling charge. Sales tax is 6% of the item plus shipping, which is an assumption for the arithmetic, not an eBay rate. The final value percentage is 13.6% of the total amount of the sale.',
        lines: [
          line('Item price', usd(40), 'Hypothetical.'),
          line('Shipping collected from the buyer', usd(6), 'Included in the total amount of the sale.'),
          line('Sales tax', usd(ebayWithExtras.tax), '6% of $46.00, included in the total amount of the sale.'),
          line('Total amount of the sale', usd(ebayWithExtras.total), '$40.00 + $6.00 + $2.76.'),
          line('Final value fee', usd(ebayWithExtras.percentage), `13.6% of ${usd(ebayWithExtras.total)}, the most-categories rate on the first $7,500.`),
          line('Per-order fee', usd(ebayWithExtras.perOrder), 'The order is over $10.00, so the fee is $0.40.'),
          line('eBay fees on this order', usd(ebayWithExtras.fees), 'Final value fee plus the per-order fee.'),
          line('Same item with no shipping and no tax', usd(ebayItemOnly.fees), `13.6% of $40.00 is ${usd(ebayItemOnly.percentage)}, plus $0.40. The ${usd(cents(ebayWithExtras.fees - ebayItemOnly.fees))} gap is the final value fee on the $8.76 of shipping and tax.`),
        ],
      },
    ],
    checks: [
      'Open one recent order and add the item price, handling, shipping collected, and sales tax. That sum is the total amount of the sale the final value fee uses.',
      'On the fee breakdown, divide the final value fee by that sum. For most categories, under $7,500 per item, the rate on eBay’s page is 13.6%.',
      'If the listing offers 1-day or international shipping and a cheaper domestic option, confirm eBay calculated shipping from the cheaper domestic service.',
      'If you ship with eBay International Shipping and offered free domestic shipping, eBay’s page says there is no final value fee on shipping.',
      'Read the per-order fee as its own line. It is $0.30 at $10.00 or less and $0.40 over $10.00, on top of the percentage.',
    ],
    feeLinks: [
      { href: '/fees/ebay', label: 'eBay fees by category', note: 'Basic non-Store final value rates. The calculator assumes zero tax, so add tax the way the example above does when you model a real order.' },
      { href: '/fees/ebay/most-categories', label: 'eBay most-categories final value fee', note: 'The 13.6% rate used in the example, on the first $7,500 per item.' },
    ],
    analysisSlugs: ['etsy-vs-ebay-fees-2026-20-50-100', 'ebay-per-order-fee-2026-under-10', 'q4-2026-parcel-surcharge-calendar'],
  },
  {
    slug: 'ebay-per-order-fee',
    question: 'What is the eBay per-order fee?',
    description: 'eBay charges $0.30 per order at $10.00 or less and $0.40 above that, once per checkout. Athletic shoes at a $150 sale total do not pay it.',
    directAnswer: 'eBay adds one per-order fee on top of the final value percentage: $0.30 when the order is $10.00 or less, and $0.40 when it is over $10.00. The fee is once per checkout, not once per item. It is not charged on athletic shoes when the total amount of the sale is $150 or more.',
    marketplace: 'ebay',
    jobs: ['fees'],
    sources: [
      { name: "eBay's selling fees page", url: EBAY_FEES_HELP, checkedOn: CHECKED_ON },
    ],
    examples: [
      {
        heading: 'The $10.00 line',
        caption: 'Hypothetical single-item orders, most categories, no shipping, no tax, basic non-Store rate. The percentage is 13.6%. The per-order fee steps from $0.30 to $0.40 as the order crosses $10.00.',
        lines: [
          line('Order of $10.00', usd(cents(ebayAt10.percentage + ebayAt10.perOrder)), `13.6% is ${usd(ebayAt10.percentage)}. Per-order fee is ${usd(ebayAt10.perOrder)} because the order is $10.00 or less.`),
          line('Order of $10.01', usd(cents(ebayJustOver.percentage + ebayJustOver.perOrder)), `13.6% still rounds to ${usd(ebayJustOver.percentage)}. Per-order fee is ${usd(ebayJustOver.perOrder)}. The extra penny of price adds $0.10 of fee.`),
        ],
      },
      {
        heading: 'Two items, one checkout',
        caption: 'Hypothetical: two $6 items bought by the same buyer at one checkout with the same shipping method. eBay defines that as one order. Two separate checkouts would be two orders.',
        lines: [
          line('One combined order of $12.00', usd(cents(ebayCombined.percentage + ebayCombined.perOrder)), `13.6% of $12.00 is ${usd(ebayCombined.percentage)}. One per-order fee of ${usd(ebayCombined.perOrder)}.`),
          line('Two separate $6.00 orders', usd(cents(2 * (ebaySplitA.percentage + ebaySplitA.perOrder))), `Each order is $6.00, so each pays ${usd(ebaySplitA.percentage)} plus ${usd(ebaySplitA.perOrder)}. Two orders pay ${usd(cents(2 * (ebaySplitA.percentage + ebaySplitA.perOrder)))}.`),
          line('Difference', usd(cents(2 * (ebaySplitA.percentage + ebaySplitA.perOrder) - (ebayCombined.percentage + ebayCombined.perOrder))), 'Combining the checkout removes one per-order fee and calculates 13.6% once on $12.00.'),
        ],
      },
      {
        heading: 'Athletic shoes at $150',
        caption: 'Hypothetical athletic-shoe order. eBay’s selling fees page gives this category its own row: 8% when the total amount of the sale is $150 or more, and the per-order fee is not charged. Under $150 the same row is 13.6% and the per-order fee applies.',
        lines: [
          line('Total amount of the sale', usd(150), 'At the threshold on eBay’s athletic-shoe row.'),
          line('Final value fee', usd(athleticAt150), '8% of $150.00.'),
          line('Per-order fee', usd(0), 'eBay’s page says it is not charged on this row when the total amount of the sale is $150 or more.'),
          line('eBay fees on this order', usd(athleticAt150), 'The percentage only.'),
        ],
      },
    ],
    checks: [
      'On an order of $10.00 or less, the fee breakdown should show one $0.30 per-order fee, including when the order has more than one unit.',
      'On an order over $10.00, that line should be $0.40, still once.',
      'On a multi-item checkout with one shipping method, count per-order fees. eBay’s definition is one order, so there should be one fee.',
      'Athletic shoes: if the total amount of the sale is $150 or more, the per-order fee should be absent and the percentage should be 8%. Under $150, expect 13.6% plus the per-order fee.',
      'An eBay Store, a vehicle listing, and eBay Live use other fee pages. This $0.30 / $0.40 schedule is the basic page for sellers without a Store.',
    ],
    feeLinks: [
      { href: '/fees/ebay', label: 'eBay fees by category', note: 'The per-order fee sits on top of the category percentage. Our table uses $0.30 through $10 and $0.40 above.' },
      { href: '/fees/ebay/most-categories', label: 'eBay most-categories final value fee', note: '13.6% on the first $7,500 per item, the percentage in the $10 examples.' },
    ],
    analysisSlugs: ['ebay-per-order-fee-2026-under-10', 'etsy-vs-ebay-fees-2026-20-50-100', 'ebay-watch-fees-2026-15-percent-to-1000'],
  },
]

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function getAnswer(slug: string): AnswerPage | undefined {
  return ANSWER_PAGES.find(p => p.slug === slug)
}

export function answerPath(slug: string): string {
  return `${ANSWERS_PATH}/${slug}`
}

export function answerTrackingSource(slug: string): `answers_${string}` {
  return `answers_${slug}`
}

export const ANSWER_PATHS: string[] = [ANSWERS_PATH, ...ANSWER_PAGES.map(p => answerPath(p.slug))]

export const MARKETPLACE_GROUPS: { key: AnswerMarketplace; label: string }[] = [
  { key: 'etsy', label: 'Etsy' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'ebay', label: 'eBay' },
]

export const JOB_GROUPS: { key: AnswerJob; label: string; blurb: string }[] = [
  { key: 'fees', label: 'Fees', blurb: 'What a marketplace deducts from the sale price, shipping, and tax.' },
  { key: 'storage', label: 'Storage & inventory', blurb: 'Fulfillment dates, storage age, and the low-inventory test.' },
  { key: 'ads', label: 'Ads', blurb: 'Offsite Ads rates, the fee base, and when you can opt out.' },
]

export function answersIn(group: { marketplace?: AnswerMarketplace; job?: AnswerJob }): AnswerPage[] {
  return ANSWER_PAGES.filter(p => (group.marketplace ? p.marketplace === group.marketplace : true) && (group.job ? p.jobs.includes(group.job) : true))
}

export function relatedAnswers(slug: string): AnswerPage[] {
  const page = getAnswer(slug)
  if (!page) return []
  const rest = ANSWER_PAGES.filter(p => p.slug !== slug)
  const same = rest.filter(p => p.marketplace === page.marketplace)
  const other = rest.filter(p => p.marketplace !== page.marketplace)
  return [...same, ...other].slice(0, 5)
}

export function analysisLinksFor(page: AnswerPage): AnswerLink[] {
  return page.analysisSlugs.flatMap(slug => {
    if (!(LIVE_ANALYSIS_SLUGS as readonly string[]).includes(slug)) return []
    const article = getAnalysis(slug)
    if (!article) return []
    return [{ href: `/intelligence/analysis/${slug}`, label: article.seoTitle, note: `Analysis · ${article.publishedOn}` }]
  })
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export function checkedLine(page: AnswerPage): string {
  const byDate = new Map<string, AnswerSource[]>()
  for (const source of page.sources) {
    const list = byDate.get(source.checkedOn) ?? []
    list.push(source)
    byDate.set(source.checkedOn, list)
  }
  return [...byDate.entries()].map(([date, sources]) => `Checked ${formatAnswerDate(date)} against ${joinNames(sources.map(s => s.name))}`).join('. ') + '.'
}

export function formatAnswerDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export const AMAZON_EXAMPLE_50 = amazon50
export const AMAZON_EXAMPLE_100 = amazon100
export const EBAY_SHIPPING_EXAMPLE = { withExtras: ebayWithExtras, itemOnly: ebayItemOnly }
export const EBAY_ORDER_EXAMPLES = { at10: ebayAt10, justOver: ebayJustOver, split: ebaySplitA, combined: ebayCombined, athleticAt150 }
export const ETSY_EXAMPLES = { plain: etsyPlain, cap: etsyCap, optOut: etsyOptOut }
export const AMAZON_2027_IMPLIED_PRICE = impliedAveragePrice
