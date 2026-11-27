import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "ai-research-headline-origin-audit",
  "seoTitle": "AI Market Signals: Audit Beyond Headlines",
  "metaDescription": "Our advertising trend check passed, yet 24 of 26 matches came through one aggregator. A reproducible source audit for ecommerce AI research.",
  "headline": "Why our AI research desk held a passing trend check",
  "dek": "Advertising matches rose in our news archive, even after equal weighting by domain. Inspecting the source breakdown changed the decision: most matches arrived through one aggregator. Here is the audit and a reusable review worksheet.",
  "publishedOn": "2026-11-18",
  "updatedOn": "2026-11-18",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "7 min",
  "tags": [
    "AI agents",
    "original research",
    "research methods",
    "ecommerce strategy"
  ],
  "takeaway": "Before an AI research agent turns more headlines into a strategy recommendation, inspect originating publishers and repeated reporting. Equal weighting by URL domain does not establish independent evidence.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_research_methods",
  "sections": [
    {
      "id": "finding",
      "title": "A candidate passed the arithmetic and failed the editorial review",
      "paragraphs": [
        "Our [dated archive audit](/research/headline-origin-audit-2026-11-18.json) found 26 advertising-related headlines among 392 eligible records in the recent matched-source window, compared with 6 among 337 in the preceding window. The shares were 6.6% and 1.8%. Our existing screening code marked the comparison as a candidate for source review.",
        "The source breakdown supplied the reason to stop: 24 of those 26 recent matches had news.google.com as their stored URL domain, according to the same [evidence file](/research/headline-origin-audit-2026-11-18.json). That is 92.3% of the recent advertising matches, not 92.3% of all news or of the advertising market.",
        "The useful finding is about our research process. A domain-balanced calculation can pass while leaving the independence of its evidence unresolved. We held the directional advertising claim and retained the audit. Nothing in these counts establishes a change in ad spending, agent adoption, seller demand or return on advertising.",
        "This extends our [earlier headline-methods report](/intelligence/analysis/ai-commerce-headlines-are-not-adoption-data): the earlier AI comparison failed a thin-sample gate. Here, a different topic passed the declared numerical gates, and source inspection still changed the publication decision."
      ]
    },
    {
      "id": "sample",
      "title": "The sample and its boundaries",
      "paragraphs": [
        "The [complete export](/research/headline-origin-audit-2026-11-18.json) covered 857 stored records published from October 21 through November 17, 2026 UTC. Existing relevance rules excluded 87 records and deduplication removed 7, leaving 763 eligible records. Nine domains meeting the same minimum coverage rule in both periods supplied 729 matched records, or 95.5% of eligible records.",
        "The earlier window is October 21–November 3; the later window is November 4–17. Both are fourteen-day windows ending at midnight UTC, with the ending boundary excluded. We retrieved the snapshot on November 18. Retrieval is not the publication date or an observation of merchant behavior.",
        "The unit is an eligible, deduplicated headline. The code retains stored relevant=true records with a finite relevance score of at least 40 and applies the existing operator filter. Duplicate groups connect shared IDs, normalized headlines and canonicalized URLs. Exact matching does not identify every paraphrase or publisher-suffixed copy.",
        "No rows were reclassified to produce this result. The method and topic dictionary stayed unchanged. We read the candidate headlines to judge whether a publishable argument survived their context."
      ]
    },
    {
      "id": "counts",
      "title": "Where the apparent increase sits",
      "paragraphs": [
        "All counts in this table come from the [aggregate evidence](/research/headline-origin-audit-2026-11-18.json). The denominator is every eligible headline in each displayed group, not just advertising matches. The remaining domains are combined here for readability; the download preserves all nine individual domain rows."
      ],
      "table": {
        "caption": "Advertising-rule matches / eligible headlines · publication windows in UTC · MarketplaceBeta archive, retrieved November 18, 2026",
        "headings": [
          "Stored URL domains",
          "Oct 21–Nov 3",
          "Nov 4–17",
          "Earlier → later share"
        ],
        "rows": [
          [
            "All nine matched domains",
            "6 / 337",
            "26 / 392",
            "1.8% → 6.6%"
          ],
          [
            "news.google.com",
            "3 / 27",
            "24 / 43",
            "11.1% → 55.8%"
          ],
          [
            "Other eight matched domains",
            "3 / 310",
            "2 / 349",
            "1.0% → 0.6%"
          ]
        ]
      }
    },
    {
      "id": "origin",
      "title": "A URL domain is not necessarily an originating publisher",
      "paragraphs": [
        "The calculator groups by the stored URL hostname. That is reproducible, but a news-aggregator URL does not identify which newsroom produced the reporting. A list of different destination publications can also carry the same original reporting. These are separate problems: source identification and story duplication.",
        "Within the recent advertising matches, headline inspection found several close variants of a story about AI shopping agents and the advertising businesses of Amazon and Walmart. We did not complete an origin audit for every record, so we do not report a deduplicated story count or label every aggregator match a duplicate.",
        "We checked the November 4 [Reuters report as republished by Investing.com](https://www.investing.com/news/stock-market-news/analysisai-shopping-agents-could-threaten-amazon-and-walmarts-ad-business-4999246), which identifies Reuters and its authors. The original Reuters URL was unavailable to this reader on November 18. This check establishes an identifiable reporting origin for that story; it does not establish the origin of every related headline. We make no new factual claim about the retailers from that report.",
        "Equal weighting by domain addresses unequal domain output. It does not resolve the number of independent sources inside an aggregator domain, nor collapse shared reporting appearing across other domains. Calling a result source-balanced should describe the weighting operation, not imply that every source is independent."
      ]
    },
    {
      "id": "sensitivity",
      "title": "A diagnostic changes the sign, not our knowledge of the market",
      "paragraphs": [
        "In the unchanged calculation, the pooled advertising share rose by 4.85 percentage points and the equally weighted mean domain change rose by 4.72 points, according to the [evidence](/research/headline-origin-audit-2026-11-18.json). Both directions agree; that is why the routine did not hold this topic automatically.",
        "As a post hoc diagnostic, we excluded news.google.com from both windows and recomputed the same fractions over the other eight matched domains. The pooled change became −0.39 percentage points and the equally weighted change −0.28 points. Only 3 earlier and 2 later matches remained; both counts are below the original five-match minimum.",
        "This is not a corrected estimate of the industry and does not demonstrate a decline in advertising interest. We selected the exclusion after seeing the concentration. Its purpose is to show that the proposed direction depends on this source group. The full calculation remains visible beside the diagnostic.",
        "We did not alter the production calculator, silently discard inconvenient articles or choose a replacement trend. The editorial outcome is a hold on the market-direction claim. A better subsequent analysis would resolve originating publishers and shared stories under a declared rule, then rerun the comparison on that dated evidence."
      ]
    },
    {
      "id": "workflow",
      "title": "Give a research agent an origin check before it recommends action",
      "paragraphs": [
        "The downloadable [review worksheet](/research/headline-origin-audit-2026-11-18.json) turns this case into an operator workflow. These are proposed review steps, not a measured claim that the workflow saves time or improves revenue.",
        "Start by naming the decision. A merchant deciding whether to change ad budgets needs performance and attribution evidence from its own accounts. News can identify a question worth testing; it cannot replace the decision's outcome measure.",
        "Preserve the original candidate and attach its audit. Resolve the publisher behind an aggregator link, retain the original report URL where available, and group copies or close paraphrases by shared reporting. Keep uncertain relationships unresolved rather than letting the agent invent a confident cluster.",
        "Review the resulting groups before computing another direction. Several publications quoting one announcement are useful distribution evidence; they are not several independent observations that the announced feature works. If a classification rule changes, version it and apply it to both windows.",
        "Use the [MarketplaceBeta Intelligence dashboard](/intelligence) to inspect source-linked news. For an AI research or reporting implementation, bring a sanitized sample, the decisions the report must support and examples of false alarms. Those inputs define a concrete evaluation scope without promising a commercial outcome."
      ],
      "table": {
        "caption": "Proposed review record · blank until applied to an operator's own workflow",
        "headings": [
          "Keep this field",
          "Why it matters",
          "When to hold"
        ],
        "rows": [
          [
            "Original URL, publisher and story family",
            "Separates distribution from reporting origin",
            "The same claim's independence is unresolved"
          ],
          [
            "Hits, denominator and publication window",
            "Preserves what the fraction actually measures",
            "The report substitutes adoption or sales for mentions"
          ],
          [
            "Original result plus labeled sensitivity check",
            "Shows dependence without hiding the first result",
            "Direction changes or remaining support is too thin"
          ],
          [
            "Business decision and required outcome evidence",
            "Connects research to a practical next step",
            "A budget recommendation rests on headline counts alone"
          ]
        ]
      }
    },
    {
      "id": "methods",
      "title": "Methods, limitations and reuse",
      "paragraphs": [
        "Method: marketplacebeta-headline-coverage-v1, executed without modification; review: aggregator-sensitivity-review-v1. The [versioned calculator](https://github.com/rydak81/margin-intel-hub/blob/927da15f66cf8580b4383544e1baf5a4cce2ad3d/lib/research-desk.ts) and [dated aggregate output and worksheet](/research/headline-origin-audit-2026-11-18.json) allow readers to reproduce the displayed arithmetic. The private raw export is retained separately; the public file contains no article bodies, raw headline archive, customer data or credentials.",
        "The original screening requires at least five eligible headlines per domain per window, three matched domains, twenty matched articles per window, seventy percent retention, recent eligible coverage and five topic matches per period. These are editorial screening rules, not statistical-power guarantees. A candidate is an invitation to inspect sources.",
        "The snapshot is complete for the specified database query, not for all ecommerce news. Stored relevance decisions, collection coverage and publication metadata may be imperfect. The narrow dictionary can miss synonyms and match words in an unintended sense. Topics can overlap. Unknown originating publishers remain unknown; no full story-clustering result is claimed.",
        "Privacy and source-rights review limited the public evidence to our aggregate calculations, method and original worksheet. Source pages are linked rather than republished. The Reuters attribution check was read November 18, 2026; its displayed publication date is November 4. No external performance claims, merchant outcomes, significance tests, forecasts or causal conclusions are included.",
        "Suggested citation: MarketplaceBeta Research, “Why our AI research desk held a passing trend check,” November 18, 2026, with this canonical article URL and its evidence link. Reuse the aggregate counts with both windows, the headline unit and the diagnostic label. Do not reuse the sensitivity result as an industry trend."
      ]
    }
  ],
  "sources": [
    {
      "label": "Dated headline-origin audit and review worksheet",
      "href": "/research/headline-origin-audit-2026-11-18.json",
      "context": "Own aggregate calculations for publication windows October 21–November 3 and November 4–17, 2026 UTC; complete database read on November 18."
    },
    {
      "label": "Versioned MarketplaceBeta research calculator",
      "href": "https://github.com/rydak81/margin-intel-hub/blob/927da15f66cf8580b4383544e1baf5a4cce2ad3d/lib/research-desk.ts",
      "context": "Unmodified screening implementation; source balance uses stored URL domains."
    },
    {
      "label": "Reuters reporting republished by Investing.com",
      "href": "https://www.investing.com/news/stock-market-news/analysisai-shopping-agents-could-threaten-amazon-and-walmarts-ad-business-4999246",
      "context": "Published November 4; read November 18. Used only to verify the displayed reporting origin, not to infer merchant performance."
    }
  ]
} satisfies AnalysisArticle
