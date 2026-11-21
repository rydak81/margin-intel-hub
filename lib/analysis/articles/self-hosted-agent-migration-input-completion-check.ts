import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "self-hosted-agent-migration-input-completion-check",
  "seoTitle": "Self-Hosted Agents: Test Inputs and Completion",
  "metaDescription": "A practical migration worksheet for ecommerce AI agents: verify image inputs, worker execution and scheduled outputs before trusting a successful request.",
  "headline": "Your agent accepted the request. Did it receive the product image?",
  "dek": "Self-hosted agent compatibility needs checks for inputs, execution and completed work. A successful request can leave those questions unanswered.",
  "publishedOn": "2026-11-15",
  "updatedOn": "2026-11-15",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "AI agents",
    "ecommerce operations",
    "research methods"
  ],
  "takeaway": "Before moving a listing-review workflow, verify that the model sees its inputs, tools actually run and the expected output exists. Keep those checks separate from API availability.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_research_methods",
  "sections": [
    {
      "id": "finding",
      "title": "The missing-input problem",
      "paragraphs": [
        "Anthropic\u2019s [self-hosted compatibility documentation](https://platform.claude.com/docs/en/managed-agents/self-hosted/differences), read November 15, 2026, says URL-sourced image or document blocks can be accepted without reaching the model or raising an error. It specifies base64 inputs, or text for documents, as alternatives. That is documented behavior, not a deployment we tested.",
        "For an ecommerce image-review workflow, this creates a specific blind spot: a fluent answer may come from the surrounding product text. It cannot establish that the agent inspected the image. Our proposed correction is an image-only check whose expected answer is deliberately absent from the prompt and filename."
      ]
    },
    {
      "id": "boundaries",
      "title": "Separate acceptance, execution and completion",
      "paragraphs": [
        "The [same documentation](https://platform.claude.com/docs/en/managed-agents/self-hosted/differences) describes tool calls waiting without an error when no worker is polling. It also says self-hosted servers do not provide hosted scheduled deployments or webhooks; operators must supply scheduling and track sessions through events. These are separate migration requirements, not evidence that self-hosting is unreliable."
      ],
      "table": {
        "caption": "Original proposed checks derived from vendor documentation read November 15, 2026; no trial results",
        "headings": [
          "Boundary",
          "Test evidence",
          "What it does not establish"
        ],
        "rows": [
          [
            "Input visibility",
            "Correct answer to an image-only fact",
            "General vision accuracy"
          ],
          [
            "Tool execution",
            "Observed tool result from the intended worker",
            "Completion of the business task"
          ],
          [
            "Task completion",
            "Expected artifact plus terminal session result",
            "Production reliability or commercial value"
          ]
        ]
      }
    },
    {
      "id": "protocol",
      "title": "Build a check that text alone cannot pass",
      "paragraphs": [
        "Use a synthetic product image with a distinctive visible feature and a neutral filename. Write the expected answer before running the task. Ask about the visible feature without describing it in the prompt. Compare the intended input route with a documented supported route, holding the model, question and permissions constant.",
        "Include a text-only control with the image removed. If the control supplies the same apparently correct answer, investigate leakage or guessing before calling the image test successful. A failed visual answer also has several possible causes: input delivery, image quality, ambiguous instructions or model behavior. Retain the exact input and session evidence to distinguish them.",
        "Use the [blank migration worksheet](/research/agent-migration-check-2026-11-15.json) to record expected and actual results. It is a proposed protocol, not an executable integration or a completed benchmark. Keep populated logs in an authorized private system."
      ]
    },
    {
      "id": "recovery",
      "title": "Prove the output arrived before replacing the workflow",
      "paragraphs": [
        "Run a draft-only task with the test worker stopped. Check whether monitoring identifies the missing progress within a limit selected before the test. Restore the worker and inspect the completed artifact and any duplicate output. Keep prices, inventory and live marketplace listings outside this test.",
        "Then run through the intended scheduler and check the output itself, its timestamp and terminal status. A scheduler firing and an API accepting a request are intermediate events. The migration record needs to show which boundary passed and which remains unresolved.",
        "Compare the baseline and candidate using the same synthetic cases. Retain all started cases in the denominator, with rejected and unknown outcomes separately counted. Record correction time and total operating cost. Choose a larger representative trial only after compatibility checks pass; this worksheet alone cannot establish savings."
      ]
    },
    {
      "id": "decision",
      "title": "Choose the smallest change that addresses the observed gap",
      "paragraphs": [
        "Anthropic\u2019s [hosting overview](https://platform.claude.com/docs/en/managed-agents/self-hosted), read November 15, distinguishes hosting tool sandboxes from also hosting the agent service. Model inference remains with Anthropic or the selected provider. Self-hosting the service adds responsibility for its database, workers and releases.",
        "If the actual requirement concerns access to local product files, first determine which component must move. If storage or inference routing is the requirement, document it explicitly. A migration should solve a named constraint, with an accepted output test and a rollback path, rather than assume lower operating cost.",
        "Use our [agent evaluation guide](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) for the broader acceptance and cost record, and the [Intelligence dashboard](/intelligence) for source-linked platform context."
      ]
    },
    {
      "id": "methods",
      "title": "Method and reuse",
      "paragraphs": [
        "The question came from MarketplaceBeta\u2019s November 15 research brief, cut off at 12:16:51 UTC. We read its complete seven claim-evidence links and reopened the hosting overview and compatibility page. The public worksheet contains only original blank fields and source URLs; private provenance is retained separately.",
        "The factual scope is the documented self-hosted Managed Agents behavior at retrieval. Publication dates are unknown; November 15 is a reading date, not a launch date. No server was deployed, merchant account inspected, API behavior reproduced or task performance measured. Documentation can change; verify the target release before implementation.",
        "Cite MarketplaceBeta Research, this title, November 15, 2026 and the canonical article URL when reusing the protocol. Preserve its unexecuted status and cite the vendor for documented behavior. This article makes no adoption, causation, significance or revenue claim."
      ]
    }
  ],
  "sources": [
    {
      "label": "Anthropic: self-hosted compatibility differences",
      "href": "https://platform.claude.com/docs/en/managed-agents/self-hosted/differences",
      "context": "Read November 15, 2026; publication date unknown. Input, worker and scheduling exceptions."
    },
    {
      "label": "Anthropic: self-hosted overview",
      "href": "https://platform.claude.com/docs/en/managed-agents/self-hosted",
      "context": "Read November 15, 2026; deployment responsibilities."
    },
    {
      "label": "Original migration worksheet",
      "href": "/research/agent-migration-check-2026-11-15.json",
      "context": "Blank, unexecuted protocol and dated source map."
    }
  ]
} satisfies AnalysisArticle
