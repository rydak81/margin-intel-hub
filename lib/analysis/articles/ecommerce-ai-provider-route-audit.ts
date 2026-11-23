import type { AnalysisArticle } from '@/lib/analysis/types'

export const article: AnalysisArticle = {
  "slug": "ecommerce-ai-provider-route-audit",
  "seoTitle": "AI Provider Routes: An Ecommerce Audit Worksheet",
  "metaDescription": "Trace the provider behind an AI model before using private ecommerce data. A practical routing audit grounded in November 2026 incident reports.",
  "headline": "The model name is not your AI data-processing map",
  "dek": "Recent provider disclosures expose a gap in ecommerce AI evaluation: an accepted answer does not tell you where a request went or what was retained.",
  "publishedOn": "2026-11-23",
  "updatedOn": "2026-11-23",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "5 min",
  "tags": [
    "AI agents",
    "ecommerce operations",
    "research methods"
  ],
  "takeaway": "Before approving an AI workflow for private operational data, record its actual provider, fallback path and applicable retention setting alongside task quality.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_research_methods",
  "sections": [
    {
      "id": "finding",
      "title": "Add a processing-path check to the acceptance test",
      "paragraphs": [
        "[OpenRouter's November 22 response](https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/) says it removed three providers and withdrew zero-data-retention eligibility from 125 endpoints. Some removals were precautionary; the findings did not show a breach of OpenRouter itself. Those endpoints are not a count of confirmed breaches.",
        "Our operator conclusion is narrower than a verdict on routers: approving a model for a business task is incomplete without knowing its processing path. A response can satisfy a listing-quality rubric while leaving the provider, fallback or retention behavior unresolved. Treat those as separate acceptance questions.",
        "Hypothetical ecommerce example: public product-description enrichment and a supplier negotiation assistant may use the same model. The latter could include confidential terms and cost sheets. Equal answer quality would not establish that both workflows should share the same routing configuration."
      ]
    },
    {
      "id": "mechanisms",
      "title": "Different mechanisms require different evidence",
      "paragraphs": [
        "[Together's November 21 report](https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026) describes stored prompt samples downloaded after a private-repository credential appeared in public code. It attributes that commit to an AI coding agent. The samples concerned June and July requests; November is the disclosure date, not the request period.",
        "[Novita's November 22 notice](https://novita.ai/blog/minimax-requests-privacy-notice/) describes a routing configuration that forwarded some MiniMax requests to MiniMax's official API instead of Novita infrastructure. Its stated affected-use window is May 28–November 11, 2026. Novita reports observed URL accesses but no use of AWS test-key markers; automated content review remained an interpretation under investigation.",
        "These accounts do not establish exposure in Ryan's systems or an ecommerce marketplace. They motivate a distinction between stored copies and forwarding paths. Neither mechanism can be diagnosed from a model identifier alone."
      ],
      "table": {
        "caption": "Evidence-to-decision map; provider accounts read November 23, 2026, not measurements of our systems",
        "headings": [
          "Reported mechanism",
          "Record to inspect",
          "Invalid shortcut"
        ],
        "rows": [
          [
            "Together: access to stored samples",
            "Account settings and applicable request period",
            "Assume a current default describes historical requests"
          ],
          [
            "Novita: unexpected forwarding",
            "Actual provider and downstream processing path",
            "Assume the requested endpoint was the final processor"
          ],
          [
            "OpenRouter: eligibility removals",
            "Current eligible routes and fallback configuration",
            "Count precautionary removals as confirmed breaches"
          ]
        ]
      }
    },
    {
      "id": "worksheet",
      "title": "Trace a bounded sample without copying its prompts",
      "paragraphs": [
        "Proposed protocol, not an audit we executed: select one existing workflow and up to ten recent request records. Choose a fixed time window before inspecting outcomes; use all requests if fewer than ten exist. If more exist, record the deterministic selection rule. Include failed attempts and retries in the inventory instead of sampling successful answers only.",
        "Work only from authorized metadata. In a private worksheet, record a local pseudonymous request label, UTC time, model/version, requested endpoint, actual provider where available, fallback policy, applicable retention setting and evidence for each field. Record only the data category—public catalog, internal commercial information or customer information—not prompt contents or customer identities.",
        "Keep unknowns visible. Report the numerator with a documented actual provider over all sampled requests, and separately the number with documented retention and fallback settings. Do not collapse these into a security score. If the logs omit a field, the result is unknown, not compliant or noncompliant.",
        "Compare the provider/model/time combination with the provider's incident notice. An overlap is a reason for a scoped investigation; it does not by itself prove that a particular request was accessed. Follow the applicable provider guidance if affected usage is established.",
        "Download the [blank route-audit worksheet](/research/provider-route-audit-2026-11-23.json). It contains no account data or executed results. Keep completed copies private; publish only reviewed aggregates if useful."
      ]
    },
    {
      "id": "decision",
      "title": "Use the result to decide what can run next",
      "paragraphs": [
        "Our proposed gate for adding a private-data workload is documented processing and retention for every permitted route, including fallback routes, plus a separate task-quality check. A small sample can identify missing evidence; it cannot certify all future requests or provider security.",
        "If a route is unknown, first establish what was configured and what the provider can substantiate. For a new workflow, use synthetic or public inputs while resolving that gap. Do not assume moving to a direct endpoint or local model automatically resolves access controls, logging or data retention.",
        "Changing routes can also affect output quality, latency and retry behavior. Before replacing a working route, rerun a small fixed task set with synthetic inputs and compare accepted outputs and total task cost. We have not measured those tradeoffs here.",
        "Use the [ecommerce agent evaluation guide](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) for task completion and cost checks. The route worksheet adds a separate evidence requirement; it is not a replacement for that evaluation."
      ]
    },
    {
      "id": "methods",
      "title": "Scope, limitations and reuse",
      "paragraphs": [
        "Candidate selection used today's private Signal evidence brief at a November 23, 2026, 12:06:55 UTC cutoff. All five claim-evidence links were read; this article uses three provider reports, reopened at their primary URLs. They are related disclosures, not a representative sample or independent estimates of incident prevalence.",
        "We did not reproduce the investigations, inspect merchant request logs, measure affected customers or test a routing configuration. There is no adoption trend, breach percentage, revenue claim or forecast. A later retrieval does not change an incident's request window.",
        "The workflow, decision map and blank worksheet are original proposed operator methods. When citing this article, link its canonical URL, identify the November 23 version and distinguish provider-reported facts from our unexecuted audit protocol. Cite the original notices for incident details; do not attribute an audit result to this worksheet."
      ]
    }
  ],
  "sources": [
    {
      "label": "Novita privacy notice",
      "href": "https://novita.ai/blog/minimax-requests-privacy-notice/",
      "context": "Published 2026-11-22; read November 23, 2026. Provider account, not independently reproduced."
    },
    {
      "label": "OpenRouter incident response",
      "href": "https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/",
      "context": "Published 2026-11-22; read November 23, 2026. Provider account, not independently reproduced."
    },
    {
      "label": "Together incident report",
      "href": "https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026",
      "context": "Published 2026-11-21; read November 23, 2026. Provider account, not independently reproduced."
    }
  ]
}
