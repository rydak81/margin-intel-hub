import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "shopify-ai-knowledge-base-published-facts-audit",
  "seoTitle": "Shopify AI Knowledge Base: Fact Audit",
  "metaDescription": "A practical Shopify knowledge-base audit: distinguish unpublished scans, published admin facts and manual references before testing AI answers.",
  "headline": "Audit what Shopify’s AI knowledge base publishes—not just what it knows",
  "dek": "Fact origin changes the review queue. Check published policy answers and their references before adding more store content.",
  "publishedOn": "2026-11-08",
  "updatedOn": "2026-11-08",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "Shopify",
    "AI agents",
    "store operations",
    "research methods"
  ],
  "takeaway": "Audit publication status, answer accuracy and supporting references as separate checks. A fact being present in the admin does not establish that an agent can retrieve it—or that its answer is current.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_knowledge_audit",
  "sections": [
    {
      "id": "finding",
      "title": "The finding: fact origin changes the starting status",
      "paragraphs": [
        "[Shopify’s knowledge-base documentation](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/knowledge-base), read November 8, 2026, says scanned storefront facts start unpublished, while facts linked to the Shopify admin publish when created. Published knowledge-base information is publicly available through Storefront MCP. This is documented behavior, not a test of a merchant account.",
        "The practical implication is to inspect the published queue as well as the unpublished queue. Reviewing only newly scanned suggestions can miss an existing policy answer that already needs correction. This audit concerns store information; it complements the separate checkout-path test."
      ],
      "table": {
        "caption": "Documented initial status · Shopify Help Center, retrieved November 8, 2026 · inspect actual current status before acting",
        "headings": [
          "Fact origin",
          "Documented starting status",
          "Audit question"
        ],
        "rows": [
          [
            "Storefront scan",
            "Unpublished",
            "Is the answer correct and ready to publish?"
          ],
          [
            "Linked Shopify admin information",
            "Published when created",
            "Does the published answer still match the authoritative policy?"
          ]
        ]
      }
    },
    {
      "id": "references",
      "title": "A manual override creates a maintenance job",
      "paragraphs": [
        "The [same documentation](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/knowledge-base) says changing a field to Manual removes references supplied by its former source; references added by the merchant remain. New scans can suggest updates, but those suggestions need approval. Scans can miss changes. A requested rescan can take up to 48 hours.",
        "Treat a manual override as a maintained record. Give it an owner, a review date and a customer-facing source that supports the complete answer. A reference that supports the return window but omits an exception is not enough to validate the exception.",
        "Do not assume that correcting a policy page closes the issue. Verify the knowledge-base answer, publication status and references after the correction, then inspect the answer actually returned in the intended channel. Those are separate checkpoints."
      ]
    },
    {
      "id": "worksheet",
      "title": "A short audit record for each policy answer",
      "paragraphs": [
        "Use the [downloadable worksheet](/research/shopify-knowledge-base-audit-2026-11-08.json) to record the question, source, published answer and verification result. Start with questions whose incorrect answers would change a buyer’s decision: returns, delivery coverage, contact options and warranty conditions. Keep credentials and customer messages out of a shared worksheet."
      ],
      "table": {
        "caption": "Original proposed audit worksheet · not a completed store assessment",
        "headings": [
          "Checkpoint",
          "Evidence to retain",
          "Next action if it fails"
        ],
        "rows": [
          [
            "Authoritative answer",
            "Dated policy and applicable exceptions",
            "Resolve the policy ambiguity"
          ],
          [
            "Publication status",
            "Observed field status and source type",
            "Review before publishing or unpublishing"
          ],
          [
            "References",
            "Public links supporting the full answer",
            "Repair stale or incomplete support"
          ],
          [
            "Retrieved answer",
            "Exact test question, channel and observed response",
            "Investigate the mismatch without assuming its cause"
          ],
          [
            "Maintenance",
            "Named owner and next review trigger",
            "Assign responsibility for later changes"
          ]
        ]
      }
    },
    {
      "id": "example",
      "title": "Example: correct words, incomplete scope",
      "paragraphs": [
        "Hypothetical example: a store’s policy permits returns for ordinary stock but excludes personalized items. A saved answer says only that returns are accepted. The broad answer can look accurate while losing the exception that matters to the buyer.",
        "The audit should preserve the relevant exception in the authoritative answer and check whether the retrieved response keeps it. If the response omits it, log the mismatch. Do not infer from that single observation whether the cause is a source field, retrieval selection or the responding model.",
        "Repeat the same question after correction and retain both results. An unavailable response is untested, not a pass. If a test has no applicable exception, mark that field not applicable rather than inventing one."
      ]
    },
    {
      "id": "measure",
      "title": "Measure answer quality separately from visibility",
      "paragraphs": [
        "Report correct answers divided by completed checks, alongside the number of planned checks that could not be completed. Break failures down into wrong answer, missing exception, stale reference and unavailable retrieval. Do not let a smaller denominator make an incomplete audit look better.",
        "This worksheet tests answer consistency. It does not measure search visibility, orders or contribution margin. Keep any later traffic or sales assessment separate and use actual attribution rather than treating a corrected answer as revenue.",
        "After policy facts are checked, use our [Shopify checkout audit](/intelligence/analysis/shopify-ai-channel-fees-chatgpt-checkout-2026) to inspect the purchase path. The [Intelligence dashboard](/intelligence) provides source-linked context for choosing which operational change to investigate next."
      ]
    },
    {
      "id": "methods",
      "title": "Sources, scope and reuse",
      "paragraphs": [
        "This is an original operator workflow based on one current Shopify Help Center page, reopened November 8, 2026. Discovery came from today’s internal AI research brief, whose cutoff was November 8, 2026 at 12:01:12 UTC. The page has no verified publication date; retrieval is not a launch date. Source details and a blank record are in the [dated evidence file](/research/shopify-knowledge-base-audit-2026-11-08.json).",
        "The documented distinction is narrower than a performance claim: it describes publication behavior, not how reliably any AI channel answers a question. No merchant account, live transaction or customer outcome was tested. Account configuration and future documentation changes may affect applicability.",
        "Cite MarketplaceBeta Research, this article’s title, November 8, 2026 and its canonical URL. Reuse the original worksheet with attribution, preserving its proposed-workflow label. Cite Shopify for platform behavior and recheck the current documentation before applying it."
      ]
    }
  ],
  "sources": [
    {
      "label": "Shopify: answering customer questions with your knowledge base",
      "href": "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/knowledge-base",
      "context": "Current undated documentation; read November 8, 2026. Publication status, manual references, suggestions and rescan behavior."
    },
    {
      "label": "MarketplaceBeta: dated audit worksheet",
      "href": "/research/shopify-knowledge-base-audit-2026-11-08.json",
      "context": "Original blank worksheet and source map. No merchant records or measured outcomes."
    }
  ]
} satisfies AnalysisArticle
