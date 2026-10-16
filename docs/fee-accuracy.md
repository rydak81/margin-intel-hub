# Fee correction verification — October 16, 2026

Scope: US dollar, US marketplace schedules. These are estimates for one item per order, zero collected sales tax/handling, domestic buyer shipping as entered, no advertising, promotional discounts, account-fee allocation or seller-performance surcharges. Confirm product classification and account terms before a selling decision. eBay Store, Live, international and vehicle schedules are outside this model. A zero-tax model is not an invoice or a guaranteed lower bound where whole-price tiers change.

## Sources and changes

- [eBay basic selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822): separate guitars/basses from other instruments, encode applicable marginal tiers, distinguish jewelry from watches, and apply the small-order charge. Broad labels explicitly exclude unsupported special categories. The existing jewelry URL is retained with a narrower label; watches have their own URL. Shipping enters both the percentage base and order threshold. Tax is explicitly assumed zero, not silently treated as exempt.
- [Amazon US pricing](https://sell.amazon.com/pricing) and [Walmart US pricing](https://marketplace.walmart.com/pricing/): verified consumer electronics, electronics accessories, baby, beauty/personal care, grocery and kitchen comparison scope. Verified Amazon minimums are included for the mapped non-grocery rows. Amazon Professional subscription is shown separately, not amortized into examples.

## Comparison policy

`CATEGORY_COMPARISONS` is an explicit allowlist with a reason for each mapping. Electronics accessories remain separate from consumer electronics; Amazon Device Accessories has no verified counterpart. Beauty and health/personal-care source rows share Walmart’s combined beauty/health/personal-care fee group and remain distinct. Kitchen maps to Walmart’s home/kitchen/decor/garden group; broad garden and powered-equipment mappings are omitted. These are schedule-category illustrations, not evidence that every SKU is classified identically. Only mapped rows contribute to totals, counts and FAQ statements. No verified mapping means no inferred fee winner or assertion that the marketplace cannot carry the product.

## Additional discrepancies / limits (not silently expanded)

The source check found Amazon media closing fees absent from this dataset; media is excluded from approved comparisons. Amazon pet veterinary-diet exceptions, Walmart office printer-cartridge and outdoor optical-equipment exceptions, and the unsupported Walmart Cell Phones label require a separate category audit; none is in the allowlist. Existing TikTok rates were not established as current by this correction and no TikTok comparisons are approved. Other unreviewed category pages retain their prior data and require independent validation. The marketplace-level historical verification date is not proof that this patch audited every category.

Unsupported eBay exceptions (including bullion, handbags, athletic shoes, NFTs and heavy equipment) are excluded through category labels rather than forced into a generic rate. No production deployment is authorized by this change.

## Validation

- `npm test`: 70 Vitest tests + 41 Node tests pass (including six fee-accuracy tests with boundary matrices).
- `tsc --noEmit`: passes. `next build`: passes, including fee category and comparison routes. `git diff --check`: passes.
- User's Chrome, local production build: eBay most-category totals $1.66 at $10 and $1.76 at $10.01; $10,000 guitar total $561.65. Amazon/Walmart renders seven supported rows, distinct beauty/personal-care rows, correct electronics totals, and FAQ counts of zero lower-fee rows on either side at $29.99. Amazon/eBay renders the unsupported-mapping state. No newsletter signup or gate bypass was performed.
- Existing tooling limitations: `npm ci` fails because the npm lockfile lacks declared `@next/third-parties` dependencies. Validation used `npm install --package-lock=false --ignore-scripts` without changing manifests/locks. `npm run lint` cannot run: ESLint is not declared/installed. Type checking, tests and build are not substitutes for that missing lint gate.
- This records local preview evidence, not production verification. Merge/deployment require review.
