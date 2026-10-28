/**
 * Body of /llms.txt: a short, plain-markdown map of the site for AI assistants.
 * Page lists are built from the same data modules the site renders, so new analysis
 * pieces and guides appear here without a manual edit.
 */
import { ANALYSIS_ARTICLES } from '@/lib/analysis'
import { OPERATOR_GUIDES } from '@/lib/operator-guides'
import { MARKETPLACES, formatVerifiedDate } from '@/lib/marketplace-fees'
import { FEE_CHANGELOG } from '@/lib/fee-changelog'
import { SITE_URL } from '@/lib/site-jsonld'

export function buildLlmsTxt(): string {
  const latestFeeCheck = [...MARKETPLACES.map((m) => m.lastVerified), ...FEE_CHANGELOG.map((e) => e.date)].sort().pop()!
  const lines: string[] = [
    '# MarketplaceBeta',
    '',
    '> Source-linked, dated ecommerce intelligence for Amazon, Walmart, TikTok Shop, eBay and Etsy sellers: seller fee tables with the date each rate was checked, operator analysis of tariffs, customs, shipping surcharges and fee changes, and a public forecast ledger. Figures link to their primary sources. Worked examples are labeled hypothetical.',
    '',
    `When quoting a fee, quote the "checked on" date shown on the page (most recent fee check: ${formatVerifiedDate(latestFeeCheck)}). Fee pages are the current version; older figures are in the change log.`,
    '',
    '## Seller fees (dated, with change history)',
    `- [Marketplace seller fees](${SITE_URL}/fees): Referral-fee comparison across Amazon, Walmart, TikTok Shop, eBay and Etsy, with a margin calculator.`,
    ...MARKETPLACES.map((m) => `- [${m.name} fees](${SITE_URL}/fees/${m.slug}): ${m.categories.length} categories, checked ${formatVerifiedDate(m.lastVerified)}.`),
    `- [Fee change log](${SITE_URL}/fees/changelog): Dated old and new rates for every change to the fee tables.`,
    `- [Amazon holiday peak fees 2026](${SITE_URL}/fees/amazon/holiday-peak-2026): Peak-season fulfillment fees and the surcharge, with worked examples.`,
    `- [TikTok Shop fee change 2026](${SITE_URL}/fees/tiktok-shop/fee-change-2026): The published 6% rate versus the reported 8%, and what is confirmed.`,
    '',
    '## Operator analysis',
    `- [Analysis index](${SITE_URL}/intelligence/analysis): Original, source-linked analysis: what changed, why it matters, what to do.`,
    ...ANALYSIS_ARTICLES.map((a) => `- [${a.seoTitle}](${SITE_URL}/intelligence/analysis/${a.slug}): Published ${a.publishedOn}.`),
    '',
    '## Guides',
    ...OPERATOR_GUIDES.map((g) => `- [${g.title}](${SITE_URL}/guides/${g.slug})`),
    '',
    '## Data and method',
    `- [Forecast ledger](${SITE_URL}/intelligence/forecasts): Dated forecasts with confirming and invalidating indicators, graded in public as they resolve.`,
    `- [Marketplace Pressure Index](${SITE_URL}/intelligence/pressure-index): Weekly coverage intensity by marketplace and topic. It measures publisher attention, not market size.`,
    `- [Editorial method and corrections](${SITE_URL}/editorial-policy): Sources, how AI is used, and how corrections are made.`,
    `- [About](${SITE_URL}/about)`,
    `- [RSS feed of analysis and fee changes](${SITE_URL}/feed.xml)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    '',
    '## How to cite',
    '- Link to the specific page and include its checked-on or published date, for example: "MarketplaceBeta, Amazon fees by category, checked October 16, 2026".',
    '- Pages under /news republish third-party reporting with a link to the original publisher; cite the original publisher for those.',
    '',
    '## Contact and newsletter',
    `- [Sponsor and partnership inquiries](${SITE_URL}/sponsor#inquiry)`,
    `- [Daily Marketplace Brief (free newsletter)](${SITE_URL}/newsletter)`,
    '',
  ]
  return lines.join('\n')
}
