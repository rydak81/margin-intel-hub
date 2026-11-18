/** Published order of ANALYSIS_ARTICLES at the per-file split. Relative order stays put. */
export const HISTORICAL_SLUGS = [
  'etsy-vs-ebay-fees-2026-20-50-100',
  'etsy-ddp-us-orders-2026-duty-paid-pricing',
  'ebay-watch-fees-2026-15-percent-to-1000',
  'ebay-per-order-fee-2026-under-10',
  'holiday-returns-2026-amazon-walmart-etsy-ebay',
  'walmart-new-seller-savings-2026-worth-it',
  'ai-commerce-headlines-are-not-adoption-data',
  'shopify-ai-channel-fees-chatgpt-checkout-2026',
  'amazon-holiday-peak-fees-2026-fba-surcharge',
  'ecommerce-ai-agent-evaluation-final-state-cost',
  'shopify-ai-knowledge-base-published-facts-audit',
  'amazon-selling-partner-plugin-approval-record',
  'chatgpt-discovery-metrics-order-ledger',
  'self-hosted-agent-migration-input-completion-check',
  'ecommerce-ai-forecast-backtest-cutoff-ledger',
  'holiday-shipping-cutoffs-2026-small-sellers',
  'tiktok-shop-referral-fee-6-or-8-percent',
  'ups-fedex-2027-rate-increase-small-sellers',
  'la-long-beach-rail-backlog-strike-holiday-inventory',
  'eu-3-euro-duty-2-euro-handling-fee-us-sellers',
  'etsy-offsite-ads-fees-2026',
  'usps-january-2027-price-change-fuel-surcharge',
  'usps-foreign-duty-billing-2026',
  'de-minimis-suspension-small-sellers-2026',
  'ieepa-tariff-refunds-marketplace-sellers',
  'q4-2026-holiday-forecasts-marketplace-sellers',
  'walmart-new-carriers-vs-ship-with-walmart',
  'q4-2026-parcel-surcharge-calendar',
] as const

type Dated = { slug: string; publishedOn: string }

/**
 * Published articles stay in HISTORICAL_SLUGS order so sitemap and feed output
 * do not move. An article that is not in that list is inserted by date, newest
 * first: ahead of the first article with an older date, and after articles with
 * the same date. Two new articles on the same date are ordered by slug.
 */
export function assembleArticles<T extends Dated>(articles: readonly T[]): T[] {
  const bySlug = new Map(articles.map(article => [article.slug, article]))
  const missing = HISTORICAL_SLUGS.filter(slug => !bySlug.has(slug))
  if (missing.length) throw new Error(`Missing published analysis article ${missing[0]}`)
  const historical = HISTORICAL_SLUGS.map(slug => bySlug.get(slug)!)
  const published = new Set<string>(HISTORICAL_SLUGS)
  const novel = articles.filter(article => !published.has(article.slug))
    .slice()
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug))
  const result = [...historical]
  for (const article of novel) {
    const index = result.findIndex(existing => existing.publishedOn < article.publishedOn)
    result.splice(index === -1 ? result.length : index, 0, article)
  }
  if (result.length !== articles.length) throw new Error('Analysis catalog has a duplicate slug')
  return result
}
