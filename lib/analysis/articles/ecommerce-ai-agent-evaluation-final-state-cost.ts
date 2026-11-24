import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "ecommerce-ai-agent-evaluation-final-state-cost",
  "seoTitle": "Test an Ecommerce AI Agent Beyond Its Final Answer",
  "metaDescription": "An original evaluation worksheet for ecommerce AI agents: test final state, stale data, retries and cost per accepted task before expanding automation.",
  "headline": "Your AI agent’s final answer is only half the acceptance test",
  "dek": "A correct-looking summary can coexist with an incorrect inventory or catalog state. A practical evaluation worksheet separates output quality, business-state accuracy and the full cost of accepted work.",
  "publishedOn": "2026-11-07",
  "updatedOn": "2026-11-24",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "7 min",
  "tags": [
    "AI agents",
    "ecommerce operations",
    "evaluation",
    "original research"
  ],
  "takeaway": "Before changing models or expanding permissions, test the whole workflow against an authoritative expected state. Report accepted tasks, consistent scenarios, correction time and complete operating costs separately.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_agent_evaluation",
  "sections": [
    {
      "id": "child-variant-pilot",
      "title": "November 24 field exercise: when a family photo disagrees with a child listing",
      "paragraphs": [
        "Imagine a seller whose travel cups come singly and in pairs. A family photo shows two cups. An agent reads that photo correctly and proposes changing the single-cup listing to a pair. The error happens after recognition, when the agent assigns a family-level observation to a specific sellable unit.",
        "We constructed a [six-listing exercise](/research/child-variant-acceptance-2026-11-24.json) to expose that failure. Each row has a fictional family, a child, a listed pack count and the count visible in the shared photo. Five rows also have a verified child specification. Decide whether to keep the listing, correct it or send it to review. A missing specification requires review even when the image and listing agree.",
        "We ran two explicit rules. The image rule agreed with the expected decision on 2 of six rows. It would change correct listings, accept an incorrect count or clear an unresolved case depending on the row. Looking up the child specification and flagging missing evidence matched all six by construction. This exercise demonstrates the failure modes deliberately built into the fixture. Its scores cannot estimate a model’s accuracy on merchant traffic.",
        "For a merchant pilot, freeze the active child listings and dated specifications before testing. Group siblings by Parent ASIN or equivalent family ID and reserve whole families for the holdout. Give the agent the evidence it could actually access during deployment. Keep reviewer decisions hidden until scoring. Count unnecessary changes, missed errors and unsupported approvals separately. Include unresolved rows in the total and time the work required to clear them.",
        "A proposed release decision follows directly: a recommendation to change pack count must identify the sellable child and locate its supporting specification. Route missing or conflicting references to a person. If an agent passes only by referring every item, its unresolved share and review minutes will reveal that cost.",
        "Method note: MarketplaceBeta reviewed all seven evidence links in its November 24 brief, cut off at 12:05:58 UTC. [METR’s November 20 research](https://metr.org/blog/2026-11-20-q4-2026-capability-update/) reports weaker judgment on its AI research tasks when clear feedback was unavailable. That motivated our choice of a catalog task with an explicit answer key. The ecommerce exercise and its rules are our own. Cite this update with the dated fixture and preserve its synthetic scope."
      ],
      "table": {
        "caption": "Worked cases from the fictional November 24 fixture. Counts are units per offer.",
        "headings": [
          "Child",
          "Listed",
          "Family photo",
          "Child specification",
          "Decision"
        ],
        "rows": [
          [
            "A-small",
            "1",
            "2",
            "1",
            "keep"
          ],
          [
            "A-large",
            "1",
            "2",
            "2",
            "correct"
          ],
          [
            "B-single",
            "1",
            "1",
            "1",
            "keep"
          ],
          [
            "B-pair",
            "2",
            "1",
            "2",
            "keep"
          ],
          [
            "C-blue",
            "1",
            "1",
            "Missing",
            "review"
          ],
          [
            "D-red",
            "2",
            "2",
            "4",
            "correct"
          ]
        ]
      }
    },
    {
      "id": "finding",
      "title": "The useful question: did the work finish correctly?",
      "paragraphs": [
        "An ecommerce agent can write a convincing completion message while leaving the wrong variant, stock quantity or product claim in the underlying system. Our proposed acceptance test therefore has separate checks for the visible answer and the resulting business state. A polished answer cannot compensate for an incorrect state.",
        "That is an editorial recommendation derived from a review of primary research, not a finding from merchant accounts. MarketplaceBeta’s current AI evidence library led us to agent-completion research, a state-tracking benchmark and a measurement-method change. We reopened the original sources and used them to design a concrete operator worksheet. No seller-account experiment was run.",
        "Download the [evaluation worksheet and dated evidence notes](/research/ecommerce-agent-evaluation-2026-11-07.json). It includes original synthetic cases, expected outcomes, a run-record template and scoring definitions. All example inventory values are hypothetical. It contains no customer records, private research rows or source-text archive."
      ]
    },
    {
      "id": "research",
      "title": "What the research establishes—and where it stops",
      "paragraphs": [
        "In [IBM’s developer-run comparison](https://huggingface.co/blog/ibm-research/cuga-harness), published November 3, 2026, the same GLM-5.3-flash model completed 73 of 90 AppWorld tasks with CUGA, 42 with Hermes and 27 with Deep Agents. All variants passed in 20 of 30 scenarios for CUGA, 8 for Hermes and 2 for Deep Agents. Each task received one attempt. These are reported benchmark results, not our reproduction.",
        "IBM disclosed different configurations and said policy enforcement was not evaluated. The comparison supports testing the surrounding software alongside the model; it does not isolate a single feature’s effect or establish which agent will work best for a merchant.",
        "[Ai2’s StateBench explainer](https://huggingface.co/blog/allenai/statebench), also published November 3, describes deteriorating accuracy on harder state-update sequences as inputs grow. Its synthetic tasks use fixed variables and controlled operations. That makes it a useful source of test ideas, not an estimate of inventory mistakes in real stores. We reviewed the explainer, not a full-paper reproduction.",
        "Our synthesis is a testable question: when the model stays fixed, does a revised workflow produce more correct, affordable outcomes on the operator’s own bounded tasks? Testing that question is more informative than treating a general benchmark score as an ecommerce service guarantee."
      ]
    },
    {
      "id": "cases",
      "title": "Design cases around the failure you need to detect",
      "paragraphs": [
        "The following are original hypothetical cases from the [downloadable worksheet](/research/ecommerce-agent-evaluation-2026-11-07.json), not observed incidents. Run them against an isolated copy or a simulation. Define the expected state before exposing the case to the agent, and keep the answer key outside its tools."
      ],
      "table": {
        "caption": "Proposed ecommerce acceptance cases · hypothetical fixtures, not merchant results · worksheet dated November 7, 2026",
        "headings": [
          "Case",
          "Controlled challenge",
          "What passes"
        ],
        "rows": [
          [
            "Variant boundary",
            "An unavailable red variant sits beside an available blue variant",
            "The answer preserves variant identity and does not offer unavailable red stock"
          ],
          [
            "Stale snapshot",
            "An older stock snapshot arrives after the current version",
            "The current version wins under the declared ordering rule; the stale input cannot overwrite it"
          ],
          [
            "Duplicate event",
            "An inventory decrement is delivered again with the same event ID",
            "The decrement is applied once and the retry is recorded without a second stock change"
          ],
          [
            "Unsupported claim",
            "A source description contains an unverified durability assertion",
            "The draft omits the unsupported assertion and identifies the evidence gap"
          ]
        ]
      }
    },
    {
      "id": "protocol",
      "title": "Freeze a small protocol before comparing configurations",
      "paragraphs": [
        "The [proposed protocol](/research/ecommerce-agent-evaluation-2026-11-07.json) uses 12 de-identified historical cases selected before testing: 4 catalog tasks, 4 inventory or promotion tasks and 4 constrained-content tasks. Give each case 3 variants: normal input, stale evidence and a retry or duplicate. Repeat each variant 3 times. That is 108 attempts per configuration and 216 for a two-configuration comparison. These are design choices, not completed trials or a statistical-power calculation.",
        "Keep the model version, case set, available tools, tool versions and call/token budget fixed. Record sampling settings where supported. Randomize execution order and restore the same starting state between attempts. Record every timeout and aborted attempt; silently discarding them would overstate completion.",
        "Hold the reference answer and state-transition rules separately from the agent. A stale snapshot should not be treated like a late-arriving additive event: specify whether the input replaces state or applies a change. A retry needs a stable event identifier; identical text alone does not establish that two legitimate transactions are duplicates.",
        "Capture the uncorrected result first. If a person repairs it, retain both the original failure and the eventual assisted outcome with correction time. Otherwise the revised workflow can appear more reliable merely because it received more invisible help."
      ]
    },
    {
      "id": "scorecard",
      "title": "Separate accepted work from generated output",
      "paragraphs": [
        "An attempted task passes only if its predeclared output checks and final-state checks both pass and it stays within its authorization boundary. An answer-only score can still be useful diagnostically, but it must not be relabeled completion.",
        "Use the [worksheet definitions](/research/ecommerce-agent-evaluation-2026-11-07.json) consistently. The acceptance share is accepted attempts divided by all started attempts, including timeouts. Scenario consistency requires every variant and repeat of a selected case to pass; report the numerator and denominator rather than mixing that stricter measure with the attempt-level rate.",
        "Separate before-correction acceptance from assisted acceptance. List unsupported claims, duplicate actions and variant-boundary errors as distinct failure counts. Do not collapse those problems into a single quality score that could hide an unacceptable action behind fluent prose."
      ],
      "table": {
        "caption": "Run-record fields for the proposed pilot · blank until measured",
        "headings": [
          "Measure",
          "Record",
          "Interpretation"
        ],
        "rows": [
          [
            "Acceptance",
            "Accepted attempts / all started attempts",
            "Did the predeclared output and state checks pass before correction?"
          ],
          [
            "Consistency",
            "Cases passing every variant and repeat / selected cases",
            "Did the same case remain reliable under the planned perturbations?"
          ],
          [
            "Correction work",
            "Review minutes and correction minutes, separately",
            "How much human work accompanied the result?"
          ],
          [
            "Elapsed time",
            "Seconds from start through final verification",
            "Include tool execution, retries and waiting"
          ],
          [
            "Operating cost",
            "Actual inference, tools, hosting allocation and labor",
            "Keep missing costs unknown; include failed attempts"
          ]
        ]
      }
    },
    {
      "id": "cost",
      "title": "Make the denominator an accepted task",
      "paragraphs": [
        "Compute cost per accepted task as all actual inference and tool charges, allocated hosting and valued review/correction labor divided by accepted tasks. Include the cost of failures in the numerator. If no task is accepted, the ratio is undefined. If a labor rate is unknown, report measured minutes and known charges separately rather than entering zero.",
        "State whether the denominator is before-correction acceptance or assisted acceptance. For the latter, include the associated correction labor. Keep the manual baseline’s scope comparable: a quick draft and a fully reconciled update are different deliverables.",
        "Latency needs its own scope. [Artificial Analysis’s methodology](https://artificialanalysis.ai/methodology/performance-benchmarking), read November 7, documents a November 3, 2026 version change that alters headline aggregation and includes first-token delay. Its multi-turn duration excludes tool execution time. That is a legitimate endpoint measure, but an operator’s completion timer should include the tools and verification the job actually requires.",
        "No cost reduction is claimed here. The worksheet does not authorize API purchases or production writes. Predeclare a spend limit and a narrow operating boundary for any later pilot."
      ]
    },
    {
      "id": "decision",
      "title": "Use failures to choose the next intervention",
      "paragraphs": [
        "If output is wrong while stored facts and final state are correct, inspect generation instructions and claim checking. If the answer is correct but stored state is wrong, inspect the read/write path, identity checks and retry handling. If both pass but review effort remains high, measure where the correction queue accumulates before choosing another model.",
        "A small passing pilot justifies a bounded next test. It cannot establish production safety, seasonal resilience or revenue lift. Set task-specific acceptance requirements before execution and make unauthorized changes or unsupported product claims explicit stop conditions. Do not choose a pass threshold after inspecting the results.",
        "Use the [MarketplaceBeta Intelligence dashboard](/intelligence) to investigate source-linked platform changes, then use this worksheet to translate a relevant change into a testable operational question. For an implementation discussion, bring the task boundary, sanitized cases, expected states and measured failure log; those inputs make a project scope concrete without claiming an outcome in advance."
      ]
    },
    {
      "id": "methods",
      "title": "Methods, scope and reuse",
      "paragraphs": [
        "Evidence cutoff: November 7, 2026, 12:35:50 UTC for the underlying private research brief; the three selected primary pages were reopened on November 7. Publication dates are distinguished from retrieval dates in the downloadable evidence. The method is ecommerce-agent-evaluation-v1.",
        "We selected three primary documents from nine claim-linked documents in the current research brief because they address completion, changing state and measurement scope. This is a purposive methods synthesis, not a survey of agents or an independent benchmark. Ai2 and IBM publish their own research; Artificial Analysis documents its own measurements. These sources are not replications of the same experiment.",
        "The database supplied discovery and dated provenance. Only verified public-source facts, original analysis and original synthetic fixtures are released. There are no merchant outcomes, adoption estimates, forecasts or measured savings. The proposed pilot remains unexecuted; small related case variants are not independent observations for population inference.",
        "Suggested citation: MarketplaceBeta Research, “Your AI agent’s final answer is only half the acceptance test,” November 7, 2026, with this canonical article and the [dated worksheet](/research/ecommerce-agent-evaluation-2026-11-07.json). Reuse the original worksheet with attribution and retain its hypothetical/unexecuted labels. Attribute benchmark findings to their original researchers; their text and datasets remain subject to their own terms.",
        "Prepared and reviewed through an automated research and editorial process. No individual human-review attestation is made."
      ]
    }
  ],
  "sources": [
    {"label":"METR Q4 capability update","href":"https://metr.org/blog/2026-11-20-q4-2026-capability-update/","context":"November 20, 2026. Research-task feedback and judgment. Read November 24."},
    {
      "label": "IBM Research: same model, different harness",
      "href": "https://huggingface.co/blog/ibm-research/cuga-harness",
      "context": "Published November 3, 2026; reopened November 7. Developer-run AppWorld comparison with differing configurations and no policy-enforcement test."
    },
    {
      "label": "Ai2: StateBench explainer",
      "href": "https://huggingface.co/blog/allenai/statebench",
      "context": "Published November 3, 2026; reopened November 7. Synthetic state-tracking research; not a merchant error-rate study."
    },
    {
      "label": "Artificial Analysis: API performance methodology",
      "href": "https://artificialanalysis.ai/methodology/performance-benchmarking",
      "context": "Read November 7, 2026. Method version 3.0.0 dated November 3; page-wide publication date not established. Tool execution excluded from multi-turn duration."
    },
    {
      "label": "MarketplaceBeta: dated evaluation worksheet",
      "href": "/research/ecommerce-agent-evaluation-2026-11-07.json",
      "context": "Original hypothetical fixtures, blank run record and proposed protocol. No merchant data, paid test or operating result."
    }
  ]
} satisfies AnalysisArticle
