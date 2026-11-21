import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
    slug: 'walmart-new-carriers-vs-ship-with-walmart',
    seoTitle: 'Walmart\'s 8 New Carriers vs Ship with Walmart',
    metaDescription: 'Walmart approved eight more parcel carriers on Oct 13. What leaving Ship with Walmart labels costs you in protection, and what to test before peak.',
    headline: 'Walmart approved eight more carriers. Using them means giving up Ship with Walmart\'s cover',
    dek: 'UniUni, SpeedX, GOFO and five others are now approved for seller-fulfilled Walmart orders. They are not in Ship with Walmart, so a cheaper label also means no lost-package refund cover and no on-time protection. Here is how to price that trade before the peak surcharges start.',
    publishedOn: '2026-10-21',
    updatedOn: '2026-10-21',
    author: 'MarketplaceBeta Intelligence',
    readTime: '6 min',
    tags: ['Walmart', 'logistics', 'parcel', 'seller-fulfilled', 'Q4 2026'],
    takeaway: 'A new carrier is only cheaper if its label savings beat what you now carry yourself: lost-package refunds and late deliveries that count against your On-Time Delivery rate. Test new carriers on a slice of low-value, light orders. Keep Ship with Walmart labels on anything where one lost package wipes out a month of savings.',
    forecastIds: ['F6', 'F2'],
    newsletterSource: 'campaign_kw_walmart_carriers',
    sections: [
      {
        id: 'what-changed',
        title: 'What changed',
        paragraphs: [
          'On October 13, Walmart added eight parcel carriers to its approved list for seller-fulfilled Marketplace orders: UniUni, SpeedX, Exelot, SwiftX, TForce Final Mile, GOFO, OSM Worldwide and DoorDash, per the Marketplace Learn release notes. Metropolitan Warehouse & Delivery was added for freight. Walmart\'s parcel carrier guide, updated the same day, still names USPS, FedEx and UPS as its "top preferred carriers".',
          'The change is to the approved carrier list. It does not touch Ship with Walmart, Walmart\'s discounted label program, which covers USPS, FedEx and UPS for domestic shipments, per Walmart\'s Ship with Walmart overview. The only carrier change inside Ship with Walmart this month went the other way: on October 20 Walmart added UPS Ground Saver rates for eligible lightweight domestic packages, and said those shipments can benefit from Ship with Walmart seller protections.',
          'So sellers now have two separate routes on Walmart. One is a Ship with Walmart label with Walmart-negotiated rates and Walmart\'s protections. The other is a label from any approved carrier, now a longer list, where you keep whatever rate you negotiated and you carry the risk.',
        ],
      },
      {
        id: 'what-you-give-up',
        title: 'What you give up when the label is not Ship with Walmart',
        paragraphs: [
          'Walmart\'s seller protections policy (last updated August 26, 2026) is explicit. If you ship on or before the Ship By date with a Ship with Walmart label, your account is in good standing, it is set up for seamless returns, and you are not disputing the return, late or lost packages do not count against your On-Time Delivery metric. For orders reported lost in transit or after delivery, Walmart will not seek reimbursement from you for up to $100 per qualifying order and handles the carrier claim itself. The same policy lists "orders not shipped with a Ship with Walmart label" and labels made with Bring Your Own Account as ineligible. Damaged-in-transit packages are not covered even on Ship with Walmart labels. Walmart also calls the protections discretionary, not insurance, and says they can be withdrawn.',
          'The rate side: Walmart says eligible Pro, Rising and Advanced sellers get up to 15% off 3-day and up to 35% off 2-day Ship with Walmart labels when the delivery promise matches the shipping speed. On its program page, Walmart also claims its negotiated rates average 60% more cost-effective than standard market rates, citing its own data from June 2025. That is Walmart\'s figure and we have not checked it. Your comparison should use your own quotes, not the market rate.',
          'The metric side matters more than the refund. Walmart\'s Seller Performance Standards require an On-Time Delivery rate of 90% or above, valid tracking on 99% or more of orders, and an Item Not Received rate of 2% or below. Carrier delays are listed as seller-accountable for on-time delivery, and "non-integrated carrier" is listed as a valid-tracking driver. Missing those standards can mean suppression, suspension or termination. With a non-Ship with Walmart label, a regional carrier\'s bad week in December is your metric.',
        ],
        table: {
          caption: 'Ship with Walmart label vs an approved-carrier label you buy yourself · Sources: Walmart Marketplace Learn (Ship with Walmart overview, seller protections policy, Seller Performance Standards, release notes Oct 13 and Oct 20, 2026)',
          headings: ['', 'Ship with Walmart label', 'Approved carrier, your own label'],
          rows: [
            ['Carriers (domestic)', 'USPS, FedEx, UPS (UPS Ground Saver added Oct 20)', 'Approved list, including the eight added Oct 13'],
            ['Rate', 'Walmart-negotiated; Pro/Rising/Advanced up to 15% off 3-day and 35% off 2-day', 'Whatever you negotiate with the carrier'],
            ['Lost in transit or after delivery', 'Walmart doesn\'t seek reimbursement for up to $100 per qualifying order; Walmart files the claim', 'Not covered by Walmart; you file with the carrier'],
            ['Late delivery and On-Time Delivery rate', 'Excluded from the metric when eligibility rules are met', 'Counts against the 90% standard'],
            ['Damaged in transit', 'Not covered', 'Not covered'],
          ],
        },
      },
      {
        id: 'why-it-matters',
        title: 'Why it matters now: the peak calendar',
        paragraphs: [
          'The timing is the point. As our [Q4 parcel surcharge calendar](/intelligence/analysis/q4-2026-parcel-surcharge-calendar) laid out, UPS residential ground peak surcharges start at $0.50 per package on October 25 and rise to $0.75 from November 22 to December 26, and FedEx\'s start at $0.50 on October 26 and rise to $0.80 from November 23 to December 27, per the carriers\' published schedules. Those surcharges apply to UPS and FedEx. The newly approved carriers set their own terms, and only two of them publish anything current on their official pages:',
        ],
        bullets: [
          'GOFO says it is not imposing any peak surcharges in 2026, but it starts a 4% emergency fuel surcharge on base delivery rates across all US regions on October 26. GOFO says it stays in place while US on-highway diesel remains above its August 2026 baseline of $5.46 a gallon, per GOFO\'s October 7 partner notice.',
          'OSM Worldwide charges a monthly indexed fuel surcharge. It is 13.50% from October 5 to November 1, 2026, per OSM\'s fuel surcharge policy page, and it resets on the first Monday of each month. OSM\'s peak-season schedule is not on that public page, so ask your rep for it in writing.',
          'UniUni, SpeedX, Exelot, SwiftX, TForce Final Mile and DoorDash: we did not find current peak or fuel terms on their official public pages. Terms vary by contract and lane. Ask each one for its peak, fuel, residential, oversize and address-correction terms in writing before you route Walmart volume to it.',
        ],
      },
      {
        id: 'the-math',
        title: 'The break-even, in one line',
        paragraphs: [
          'Hypothetical example, not a measurement: a $40 order where a new carrier quotes $1.00 less than the Ship with Walmart label for the same package. Without Walmart\'s cover, one lost package costs you roughly the $40 refund, so the switch pays only if fewer than 1 in 40 packages (2.5%) go missing, before counting any hit to your metrics. At a $15 order the same $1.00 saving allows a loss rate of up to about 6.7%. At $100 it is 1%. Cheap, light, low-value parcels are where a new carrier has room to prove itself. High-value orders are where Walmart\'s up-to-$100 cover does the most work.',
          'Hypothesis, not yet tested: the new carriers will make the most sense for sellers who already use them on other channels and can blend volume across Walmart, their own site and other marketplaces. They will make the least sense for a Walmart-heavy seller close to the 90% on-time line going into December.',
        ],
      },
      {
        id: 'what-to-do-this-week',
        title: 'What to do this week',
        paragraphs: [
          'All of this can be done before the October 25–26 surcharge start dates.',
        ],
        bullets: [
          'Pull your actual Ship with Walmart label prices for your three most common package profiles from Walmart\'s shipping calculator, then get written quotes from any new carrier for the same weights and zones, with fuel and peak included. Compare landed cost, not base rate.',
          'Check your On-Time Delivery and Item Not Received rates in Seller Center. If you are within a couple of points of the 90% or 2% standards, keep Walmart volume on Ship with Walmart labels through the peak.',
          'If you test a new carrier, limit it to low-value, lightweight orders on lanes the carrier actually serves, and confirm its tracking reaches Walmart cleanly. Valid tracking must hold at 99% or above.',
          'Price the declared-value gap on anything over $100. Walmart\'s protection stops at $100 per order, and depending on the carrier, optional declared value protection may be available on Ship with Walmart shipments over $100, per Walmart\'s protections policy.',
          'Re-run your Walmart contribution margin with October fee tables. Walmart\'s referral rates became tiered in several categories, including Apparel at 5% for items $15 or less (see our [Walmart fee page](/fees/walmart) and the [fee change log](/fees/changelog)). If you sell on both, the [Amazon vs Walmart comparison](/fees/compare/amazon-vs-walmart) shows the referral gap before shipping.',
        ],
      },
      {
        id: 'what-we-are-watching',
        title: 'What we are watching next',
        paragraphs: [
          'Forecast F6 on our [forecast scorecard](/intelligence/forecasts) says Walmart extends its fee-cut or WFS-incentive playbook to more categories to sustain marketplace growth above 40%. It resolves by April 30, 2027 and is graded hit or miss on Seller Center policy updates and Walmart\'s Q3/Q4 FY27 results. A longer carrier list is not a fee cut, so on its own it does not count toward F6. We read it as the same strategy, though: making Walmart cheaper and easier to sell on, which the [October Intelligence Dossier](/intelligence/dossier) tied to roughly 14 June referral-fee cuts and marketplace growth above 50%. A fee increase would make F6 a miss.',
          'Whether any of the eight carriers is added to Ship with Walmart itself. That would remove most of the trade-off described here. UPS Ground Saver\'s addition on October 20 shows Walmart is still widening the program.',
          'Forecast F2: effective Q4 residential parcel cost inflation for DTC sellers of 8% or more despite 5.9% GRIs, resolving January 31, 2027. Emergency fuel surcharges like GOFO\'s are part of what we will grade. Logistics coverage is tracked weekly on the [intelligence dashboard](/intelligence) and the [Marketplace Pressure Index](/intelligence/pressure-index).',
        ],
      },
    ],
    sources: [
      { label: 'Walmart Marketplace Learn: Release notes', href: 'https://marketplacelearn.walmart.com/releasenotes', context: 'Oct 13, 2026: eight parcel carriers added to the approved list for seller-fulfilled orders, plus Metropolitan Warehouse & Delivery for freight. Oct 20, 2026: UPS Ground Saver rates added to Ship with Walmart for eligible lightweight packages.' },
      { label: 'Walmart Marketplace Learn: Shipping methods, parcel shipping carriers (updated Oct 13, 2026)', href: 'https://marketplacelearn.walmart.com/guides/Shipping%20&%20fulfillment/Shipping%20methods/Shipping-methods:-parcel-shipping-carriers?locale=en-US', context: 'Full approved parcel carrier list; USPS, FedEx and UPS named as top preferred carriers; valid tracking required on more than 99% of orders.' },
      { label: 'Walmart Marketplace Learn: Ship with Walmart overview', href: 'https://marketplacelearn.walmart.com/guides/Seller%20Fulfillment%20Services/Ship%20with%20Walmart/Ship-with-Walmart-Overview', context: 'Domestic carriers (USPS, FedEx, UPS); up to 15% off 3-day and 35% off 2-day labels for eligible Pro, Rising and Advanced sellers; up to $100 protection for lost orders shipped on time.' },
      { label: 'Walmart Marketplace Learn: Ship with Walmart program page', href: 'https://marketplacelearn.walmart.com/programs/ship/ship-with-walmart', context: 'Walmart\'s claim that negotiated rates average 60% more cost-effective than standard market rates (Walmart first-party data, June 20, 2025); On-Time Delivery rate protection.' },
      { label: 'Walmart Marketplace Learn: Ship with Walmart seller protections policy (updated Aug 26, 2026)', href: 'https://marketplacelearn.walmart.com/guides/ship-with-walmart-seller-protections-policy', context: 'Eligibility rules, $100 per-order limit, Walmart-managed carrier claims, exclusions (non-Ship with Walmart labels, Bring Your Own Account, damage in transit), discretionary nature, optional declared value over $100.' },
      { label: 'Walmart Marketplace Learn: Seller Performance Standards', href: 'https://marketplacelearn.walmart.com/guides/Policies&standards/Performance/Seller-performance-standards', context: 'On-Time Delivery 90% or above, Valid Tracking 99% or above, Item Not Received 2% or below; carrier delays seller-accountable; consequences of missing standards.' },
      { label: 'GOFO: Notice to Partners, Emergency Fuel Surcharge Effective October 26, 2026 (Oct 7, 2026)', href: 'https://www.gofo.com/us/resources/news/Notice+to+Partners:+Emergency+Fuel+Surcharge+Effective+October+26,+2026', context: 'No GOFO peak surcharges in 2026; 4% emergency fuel surcharge on base delivery rates from Oct 26 while diesel stays above the $5.46/gal August 2026 baseline.' },
      { label: 'OSM Worldwide: Fuel surcharge policy', href: 'https://www.osmworldwide.com/fuel-surcharge-policy/', context: 'Monthly indexed fuel surcharge; 13.50% for October 5 to November 1, 2026; adjusted the first Monday of each month.' },
      { label: 'UPS Demand Surcharges, August 26, 2026 update (PDF)', href: 'https://assets.ups.com/adobe/assets/urn:aaid:aem:2c542692-de10-4fa3-b507-3b4f181e0953/original/as/demand-surcharges-us-en.pdf', context: 'UPS Ground Residential and Ground Saver peak amounts and dates.' },
      { label: 'FedEx Demand Surcharges (updated July 22, 2026)', href: 'https://www.fedex.com/en-us/shipping/rate-changes/demand-surcharges.html', context: 'FedEx Ground Residential and Home Delivery peak amounts and dates.' },
      { label: 'MarketplaceBeta: Walmart fee schedule and fee change log (verified Oct 16, 2026)', href: '/fees/changelog', context: 'Walmart tiered referral rates, including Apparel at 5% for items $15 or less, sourced from marketplace.walmart.com/pricing.' },
      { label: 'MarketplaceBeta Intelligence Dossier, Edition 1 (Oct 14, 2026)', href: '/intelligence/dossier', context: 'Walmart\'s June referral-fee cuts in about 14 categories and 50%+ marketplace growth (Q2 FY27), with the dossier\'s own cited sources; forecast F6.' },
    ],
  } satisfies AnalysisArticle
