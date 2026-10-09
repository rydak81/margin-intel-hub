export interface GuideSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  table?: { headings: string[]; rows: string[][] }
}
export interface OperatorGuide {
  slug: string
  title: string
  description: string
  category: string
  readTime: string
  takeaway: string
  download: { href: string; label: string }
  sources: { label: string; href: string; context: string }[]
  sections: GuideSection[]
}
export const GUIDE_UPDATED = '2026-10-09'
export const OPERATOR_GUIDES: OperatorGuide[] = [
  {
    slug: 'product-profitability', title: 'Is this product actually profitable?',
    description: 'A worked unit-economics example that includes fulfillment, advertising, returns, and overhead—plus a free profitability worksheet.',
    category: 'Profitability', readTime: '6 min',
    takeaway: 'Calculate contribution per order before deciding how many units to buy. Revenue and gross markup can hide a weak operating margin.',
    download: { href: '/downloads/product-profitability-worksheet.html', label: 'Download the profitability worksheet' },
    sources: [{ label: 'Amazon selling fees and Revenue Calculator', href: 'https://sell.amazon.com/pricing', context: 'Use the current official calculator and fee schedule for your category, dimensions, and fulfillment method. The numbers below are invented assumptions, not Amazon fee quotes.' }],
    sections: [
      { id: 'start-with-one-order', title: 'Start with one completed order', paragraphs: [
        'A product bought for $8 and sold for $30 appears to have a generous markup. That comparison leaves out the cost of getting it to a buyer. Start with a single unit, a single sales channel, and a consistent currency. Separate revenue you keep from sales tax you collect for someone else.',
        'Contribution is revenue minus the costs that vary with selling that order. It helps you decide whether another order improves the business. It is not your final business profit: subscriptions, salaries, financing, and income tax may still need to be covered.',
        'Build a base case from supplier quotes and your actual channel charges. Then create a downside case for discounts, more expensive acquisition, and returns. An attractive base case is not enough if a small change eliminates the margin.'
      ] },
      { id: 'worked-example', title: 'Worked example: the $30 product', paragraphs: [
        'Every amount in this example is hypothetical and expressed in USD per order. It assumes one unit per order, no shipping revenue, and a referral fee of 15% of the selling price. Replace every input with your own data; fees can use different calculation bases and vary by category.',
        'The expected returns allowance spreads an estimated loss across all orders. For example, a 5% return rate multiplied by a $20 average unrecovered loss produces a $1 allowance. Include only costs not already counted elsewhere; do not count the full product cost twice.'
      ], table: { headings: ['Input', 'Per order'], rows: [
        ['Selling price', '$30.00'], ['Product cost', '$8.00'], ['Inbound freight and duty', '$1.50'], ['Packaging and preparation', '$0.50'], ['Referral fee (assumed 15%)', '$4.50'], ['Fulfillment', '$5.00'], ['Storage allowance', '$0.20'], ['Expected returns loss', '$1.00'], ['Advertising allocated to this order', '$3.00'], ['Total variable cost', '$23.70'], ['Contribution after advertising', '$6.30 (21%)']
      ] } },
      { id: 'overhead-and-cash', title: 'Separate contribution, overhead, and cash', paragraphs: [
        'The example leaves $6.30 per order. At 100 orders a month, that is $630 before fixed costs. If the product carries $150 of monthly overhead, it leaves $480 before financing and income tax. At only 20 orders, the same $150 allocation would exceed its $126 contribution.',
        'Inventory also uses cash before it earns contribution. A positive per-order result does not tell you how much stock you can finance, how quickly it will sell, or when the marketplace will release funds. Record supplier deposits, lead time, settlement timing, and a reserve for returns separately from the margin calculation.'
      ] },
      { id: 'stress-test', title: 'Stress-test the decision before buying', paragraphs: [
        'Reduce the selling price by 10% to $27 while holding the other assumptions constant. The assumed referral fee falls to $4.05, but contribution falls to $3.75. That is a $2.55 reduction in contribution from a $3 discount. A promotion can increase sales while reducing the amount available to cover the business.',
        'Alternatively, keep the $30 price and increase advertising from $3 to $5 per order. Contribution becomes $4.30. If returns losses also rise by $1, it becomes $3.30. Write down the minimum contribution you need before deciding whether the product passes.'
      ], bullets: ['Use the actual packed dimensions and weight when estimating fulfillment.', 'Include freight, duty, storage, payment processing, and unrecoverable returns where applicable.', 'Compare expected contribution with the cash and time tied up in inventory.', 'Reconcile the model against settled orders after launch; revise estimates instead of treating them as permanent facts.'] },
      { id: 'use-the-tools', title: 'Use the worksheet and calculator together', paragraphs: [
        'Download the worksheet to record assumptions, evidence, and a downside case. The site’s profit calculator is a quick scenario aid; verify its fields and defaults before using it. If a cost such as returns or a channel-specific charge is not represented, include it separately in your worksheet.',
        'Do not interpret a calculator score as a buying recommendation. Your decision also depends on demand, competition, compliance, supplier reliability, and the amount you can afford to have tied up in stock.'
      ] }
    ]
  },
  {
    slug: 'break-even-advertising', title: 'How much can you afford to spend on advertising?',
    description: 'Work out an advertising ceiling from contribution margin, then translate it into ACoS, ROAS, and a cost-per-click planning limit.',
    category: 'Advertising', readTime: '6 min',
    takeaway: 'Start with the profit you need to retain. A campaign can meet a revenue target while spending more than the order can support.',
    download: { href: '/downloads/product-profitability-worksheet.html', label: 'Download the profitability worksheet' },
    sources: [{ label: 'Amazon Ads: advertising cost of sales', href: 'https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales', context: 'Definitions of ACoS and its relationship to ROAS. The planning examples and thresholds below are our hypothetical calculations, not recommended platform benchmarks.' }],
    sections: [
      { id: 'define-the-denominator', title: 'Use matching revenue and cost definitions', paragraphs: [
        'ACoS is advertising spend divided by advertising-attributed sales. ROAS reverses those terms: advertising-attributed sales divided by advertising spend. Neither metric subtracts product, fulfillment, returns, or overhead costs. A strong-looking revenue multiple can still be unprofitable.',
        'Use the same time window, currency, and attribution definition when comparing campaigns. Revenue attributed by an ad platform is not necessarily incremental revenue caused by the ad. Customers may have purchased anyway, and multiple platforms may claim credit for the same order.',
        'For planning, estimate how much one advertising-acquired order contributes before advertising. If the basket contains multiple products, use the actual basket margin rather than applying a single product’s percentage to the whole order.'
      ] },
      { id: 'calculate-the-ceiling', title: 'Calculate a ceiling from the $30 order', paragraphs: [
        'Assume a $30 order has $20.70 of variable costs before advertising. That leaves $9.30, or 31% of revenue, to cover advertising and whatever contribution you need to retain. All values here are hypothetical and assume one attributed sale corresponds to one completed order.',
        'Spending the entire $9.30 means zero contribution is left for fixed costs or profit. That gives a variable-cost break-even ACoS of 31% and ROAS of about 3.23. Calling it business break-even would be misleading because overhead remains unpaid.',
        'Suppose you want to retain $4.50 per order for overhead and profit. The advertising ceiling becomes $9.30 minus $4.50, or $4.80 per order. That translates into a 16% target ACoS and a 6.25 ROAS. If no feasible campaign can meet that target, revisit the economics or the acquisition strategy.'
      ], table: { headings: ['Planning measure', 'Hypothetical result'], rows: [
        ['Order revenue', '$30.00'], ['Contribution before advertising', '$9.30'], ['Contribution to retain', '$4.50'], ['Maximum advertising cost per acquired order', '$4.80'], ['Target ACoS: $4.80 ÷ $30', '16%'], ['Target ROAS: $30 ÷ $4.80', '6.25'], ['Variable-cost break-even ACoS', '31%']
      ] } },
      { id: 'translate-to-clicks', title: 'Translate the order limit into a click limit', paragraphs: [
        'A planning CPC ceiling is allowable advertising cost per order multiplied by expected orders per click. With a $4.80 order limit and a 10% conversion rate, the estimated ceiling is $0.48 per click. At a 5% conversion rate, it falls to $0.24.',
        'This is a sensitivity calculation, not an instruction to set every bid at that number. Conversion rates vary by query, placement, device, listing quality, and season. A small sample can produce an unstable rate. Returns, attribution delays, and changes in basket value also affect the result.'
      ] },
      { id: 'run-a-controlled-test', title: 'Make the test small enough to learn from', paragraphs: [
        'Write down a spend cap, a review date, and what would count as success before launching a test. Separate branded searches from discovery campaigns so existing demand does not disguise the cost of finding new customers.',
        'Review settled revenue and contribution alongside platform reporting. A campaign that appears expensive may support repeat purchases, but do not assume that benefit: use observed repeat contribution and the time required to recover the acquisition cost.',
        'When you discount a product or a fulfillment charge changes, recalculate the ceiling. A bid that worked last month may no longer fit the same product. The worksheet lets you compare a base case with a weaker conversion or margin scenario.'
      ], bullets: ['Confirm which sales the platform attributes to advertising.', 'Track contribution after advertising, not only impressions and sales.', 'Keep a record of assumptions and changes so a result can be reproduced.', 'Use verified customer economics before justifying losses with lifetime value.'] }
    ]
  },
  {
    slug: 'adding-a-marketplace', title: 'What changes when you add another marketplace?',
    description: 'A practical launch framework for channel economics, shared inventory, fulfillment, returns, and a controlled marketplace pilot.',
    category: 'Multichannel operations', readTime: '6 min',
    takeaway: 'A new channel adds operating obligations as well as revenue. Test incremental contribution and execution capacity before expanding the catalog.',
    download: { href: '/downloads/marketplace-launch-checklist.html', label: 'Download the marketplace launch checklist' },
    sources: [
      { label: 'Amazon selling fees', href: 'https://sell.amazon.com/pricing', context: 'Reference for the types of selling fees to verify. Hypothetical channel rates below are not quotes for named marketplaces.' },
      { label: 'Shopify: inventory and locations', href: 'https://help.shopify.com/en/manual/inventory-and-locations', context: 'Background on inventory tracking and locations. Confirm the capabilities of your actual channel integrations before relying on them.' }
    ],
    sections: [
      { id: 'define-the-pilot', title: 'Define a pilot instead of uploading everything', paragraphs: [
        'Choose a small set of products with reliable supply, known contribution, and few fulfillment exceptions. Document why the new marketplace fits the buyer and how it might create incremental demand. A large audience alone does not show that your products will convert profitably.',
        'Set a pilot period and an inventory exposure limit. Give one person responsibility for listing accuracy, order routing, inventory reconciliation, and returns—even if the same person fills every role. Unowned exceptions are a hidden cost of expansion.'
      ] },
      { id: 'compare-contribution', title: 'Compare contribution using the same assumptions', paragraphs: [
        'The following channels are hypothetical, not specific marketplace offers. Both sell an item for $30 and have $10.20 in product, inbound freight, preparation, and storage costs. Each line reflects the cost attributable to that channel’s orders.',
        'Channel B has a lower percentage fee but more expensive fulfillment, returns, and acquisition. Its contribution is $5.30 versus $6.30 for Channel A. Comparing referral fees alone would miss that difference.'
      ], table: { headings: ['Per-order input', 'Channel A', 'Channel B'], rows: [
        ['Revenue', '$30.00', '$30.00'], ['Product, inbound, preparation, storage', '$10.20', '$10.20'], ['Channel fee', '$4.50', '$3.00'], ['Fulfillment', '$5.00', '$6.00'], ['Expected returns loss', '$1.00', '$1.50'], ['Advertising', '$3.00', '$4.00'], ['Contribution', '$6.30', '$5.30']
      ] } },
      { id: 'account-for-incremental-cost', title: 'Include the work required to operate the channel', paragraphs: [
        'Suppose Channel B requires $60 a month in extra software and $120 in extra operating labor. At $5.30 contribution per order, it needs at least 34 incremental orders to cover that $180 monthly cost. At 100 incremental orders, it would leave $350 after these added costs, before other shared overhead and tax.',
        'The word incremental matters. If the 100 Channel B orders simply replace orders that would have earned $6.30 on Channel A, total profit may fall. Compare the whole business before and after the pilot rather than celebrating a new channel’s sales in isolation.',
        'Record cash requirements separately: inventory commitments, payout delays, refund timing, reserves, and any currency exposure can make a profitable channel difficult to fund.'
      ] },
      { id: 'test-the-operating-loop', title: 'Test the complete order and returns loop', paragraphs: [
        'Choose a source of truth for stock and confirm which system updates each marketplace. Test a sale, a cancellation, a partial shipment, a return, and an out-of-stock event before relying on synchronization. A connector being installed does not prove all those flows work.',
        'Verify packed dimensions, shipping promises, labeling, tracking uploads, and customer-service ownership. Check category restrictions, product identifiers, tax responsibilities, and return rules using each platform’s current documentation and appropriate professional advice where needed.'
      ], bullets: ['Map every channel listing to an internal SKU and sellable stock location.', 'Set a stock buffer appropriate to synchronization delay and demand.', 'Record who resolves oversells, delivery exceptions, refunds, and disputes.', 'Check settlement reports against orders, fees, and refunds rather than relying only on dashboard sales.'] },
      { id: 'decide-after-the-pilot', title: 'Decide using a written review', paragraphs: [
        'At the review date, compare contribution, incremental demand, return losses, fulfillment performance, cash tied up, and operating time against your original assumptions. Keep a record of failures as well as successes.',
        'Expand only the products and workflows that performed acceptably. If the economics or service level failed, identify a specific fix and run another bounded test. The downloadable checklist provides space for evidence, ownership, and a go, revise, or stop decision.'
      ] }
    ]
  }
]
