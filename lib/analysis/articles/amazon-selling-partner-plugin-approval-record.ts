import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "amazon-selling-partner-plugin-approval-record",
  "seoTitle": "Amazon AI Plugin: Build a Useful Approval Record",
  "metaDescription": "A practical approval record for Amazon seller AI workflows: exact SKU, before-and-after values, evidence age, execution status and read-back.",
  "headline": "An approval button needs a change record behind it",
  "dek": "Amazon’s plugin separates questions from account changes. Build the operator handoff around the exact change, not the agent’s summary.",
  "publishedOn": "2026-11-10",
  "updatedOn": "2026-11-10",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "Amazon",
    "AI agents",
    "seller operations"
  ],
  "takeaway": "Group the review by Parent ASIN, but approve and verify the exact child ASIN, seller SKU, marketplace and field. Keep proposed, approved, submitted and verified changes distinct.",
  "forecastIds": [],
  "newsletterSource": "campaign_amazon_approval_record",
  "sections": [
    {
      "id": "finding",
      "title": "The boundary is documented; the handoff is your design choice",
      "paragraphs": [
        "[Amazon’s current plugin FAQ](https://developer.amazonservices.com/amazon-selling-partner-plugin), read November 10, says read-only questions run freely and account-changing requests prompt for approval. It names listing edits, shipments and pricing updates as examples. The page also tells sellers to grant the data and action permissions they want the agent to access.",
        "The operational implication: an exception list and a change queue deserve different handling. Use the first to investigate; require a specific proposed change before treating the second as ready for approval. Our recommendation is a concise change record that an operator can compare with the business system.",
        "This is an original workflow proposal based on documentation, not a test of the plugin. Amazon’s stated approval requirement does not establish how every stale proposal, retry or partial failure behaves. Those details need account-specific verification."
      ]
    },
    {
      "id": "record",
      "title": "What should travel with the approval request?",
      "paragraphs": [
        "Use the [blank change record](/research/amazon-agent-approval-record-2026-11-10.json) for a bounded pilot. Parent ASIN is a useful grouping for a review meeting; the proposed operation still needs an exact target. Do not let a family-level summary stand in for a child or seller SKU.",
        "Record the current value and capture time before writing the desired value. Include the evidence that justifies the change and the expected result. If the needed field or identifier cannot be inspected, route the item for investigation rather than filling the gap with a guess."
      ],
      "table": {
        "caption": "Proposed operator record · blank until tested · November 10, 2026",
        "headings": [
          "Record",
          "What the reviewer checks",
          "If missing"
        ],
        "rows": [
          [
            "Target",
            "Marketplace, seller SKU, child ASIN and optional Parent ASIN grouping",
            "Resolve identity before approval"
          ],
          [
            "Before → after",
            "Exact field, observed value, proposed value and units",
            "Request the complete change"
          ],
          [
            "Evidence age",
            "When the current value was read and what supports the proposal",
            "Refresh or investigate"
          ],
          [
            "Approval scope",
            "The proposal version the operator accepted",
            "Do not reuse an ambiguous approval"
          ],
          [
            "Result",
            "Submission status plus an independent read-back",
            "Keep the task unresolved"
          ]
        ]
      }
    },
    {
      "id": "example",
      "title": "Hypothetical case: a price changes while approval is pending",
      "paragraphs": [
        "An agent proposes a price correction. Before the operator approves it, another authorized process changes that SKU’s price. The old recommendation may still sound sensible, but it no longer describes the current starting point.",
        "In the proposed workflow, the operator refreshes the relevant state, compares it with the recorded before-value and prepares a revised proposal if they differ. Approval attaches to that proposal version. This is a design criterion to test, not an assertion that Amazon’s plugin exposes version locking or performs this comparison.",
        "The same discipline helps with listings: verify the exact editable field and the seller contribution you intend to change. An accepted submission and the buyer-visible page are separate observations; record which one you actually inspected."
      ]
    },
    {
      "id": "recovery",
      "title": "Keep an uncertain result out of the retry queue",
      "paragraphs": [
        "After submission, classify the outcome as confirmed, rejected or unknown. A timeout alone cannot tell you whether a change reached its destination. Read the relevant state or available operation status before deciding whether a retry is appropriate.",
        "Retain the operation identifier if one is provided. If the workflow cannot expose enough evidence to distinguish an unapplied action from an applied action with a lost response, hold the retry for investigation. Do not assume that identical text means an operation will be deduplicated.",
        "A correction is another proposed change. Check the current state before trying to restore an older value; otherwise recovery could overwrite legitimate work completed in the meantime. Keep the original proposal, result and correction linked."
      ]
    },
    {
      "id": "pilot",
      "title": "Start with a decision queue you can inspect",
      "paragraphs": [
        "For a first pilot, choose one task type and a small set of previously resolved, non-sensitive cases. Replay them in a sandbox or draft-only environment. Include a stale proposal, a rejected approval and an uncertain execution result. Write the expected handling before running the cases.",
        "Report verified correct outcomes divided by all started cases, with unresolved cases separately counted and retained in the denominator. Record unintended changes, repeated actions and review minutes separately. These are proposed measures; no results or time savings are claimed.",
        "Use the [existing agent acceptance worksheet](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) for the broader evaluation. The change record here is the narrower operator handoff. Use the [Intelligence dashboard](/intelligence) to trace the platform developments that make a workflow worth investigating."
      ]
    },
    {
      "id": "methods",
      "title": "Source, scope and reuse",
      "paragraphs": [
        "Scope: one current Amazon plugin FAQ, reopened November 10, 2026; discovery came from the internal research brief with a November 10, 12:46:03 UTC cutoff. The FAQ’s publication date is unverified. Its retrieval date is not a release date. The [dated source map and worksheet](/research/amazon-agent-approval-record-2026-11-10.json) separate documented behavior from our proposed controls.",
        "No seller account, API operation or live transaction was tested. Permission availability, visible fields and execution status need verification in the intended account. The worksheet contains no private seller data; keep populated records private.",
        "Cite MarketplaceBeta Research, this title, November 10, 2026 and the canonical article URL. Reuse the original blank record with attribution and preserve its proposed-workflow label. Cite Amazon for platform behavior and recheck the current FAQ before implementation."
      ]
    }
  ],
  "sources": [
    {
      "label": "Amazon Selling Partner plugin FAQ",
      "href": "https://developer.amazonservices.com/amazon-selling-partner-plugin",
      "context": "Undated current documentation, read November 10, 2026. Read/write approval boundary and permissions."
    },
    {
      "label": "MarketplaceBeta change record and source map",
      "href": "/research/amazon-agent-approval-record-2026-11-10.json",
      "context": "Original blank worksheet; no merchant results."
    }
  ]
} satisfies AnalysisArticle
