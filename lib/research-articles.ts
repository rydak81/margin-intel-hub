import type { AnalysisArticle } from '@/lib/analysis'

const evidence = '/research/headline-coverage-2026-11-02.json'
const source = `[dated evidence summary](${evidence})`

export const RESEARCH_ARTICLES: AnalysisArticle[] = [{
  slug: 'ai-commerce-headlines-are-not-adoption-data',
  seoTitle: 'AI Commerce Headlines Are Not Adoption Data',
  metaDescription: 'Original analysis of a matched news sample: what AI-agent headline counts measure, where comparisons fail, and how to build a useful research workflow.',
  headline: 'Why more AI headlines do not prove more AI adoption',
  dek: 'A comparison of MarketplaceBeta’s news archive shows how source mix, denominators and small samples can change a story. Here is the evidence, the method, and a practical framework for evaluating an AI research agent.',
  publishedOn: '2026-11-02', updatedOn: '2026-11-02',
  author: 'MarketplaceBeta Research', reviewMode: 'automated', readTime: '7 min',
  tags: ['AI agents', 'original research', 'ecommerce strategy', 'research methods'],
  takeaway: 'Use news coverage to find questions and primary sources. Require merchant usage, transactions or another directly relevant measure before making an adoption claim. A useful AI analyst should preserve the denominator and be able to hold an unsupported conclusion.',
  forecastIds: [], newsletterSource: 'campaign_ai_research_methods',
  sections: [
    { id: 'finding', title: 'The finding: this sample cannot support an AI adoption claim', paragraphs: [
      `Our narrow AI-agent headline rule matched 5 of 209 comparable articles in the earlier period and 4 of 280 in the later period, according to the ${source}. The publication windows were October 6–19 and October 20–November 2, 2026 UTC. These are counts of matching news headlines, not merchants, shoppers or transactions.`,
      'Those fractions could be turned into a dramatic claim about falling interest. We did not do that. The later match count was below the checker’s declared editorial screening threshold, and the underlying measure would not establish adoption even with a larger sample.',
      'The result is useful for another reason: it demonstrates the questions an operator should ask before relying on an AI-generated market report. What was counted? What was left out? Did the sources change? Does the language describe the measured quantity, or quietly substitute a more commercially exciting one?',
    ] },
    { id: 'sample', title: 'What went into the comparison', paragraphs: [
      `The ${source} starts with 717 stored news records in the combined publication window. Relevance filtering and deduplication left 520 eligible records. Nine matched source domains contributed 489 comparable records, retaining 94.0% of the eligible sample. These totals describe this export, not the size of the ecommerce news market.`,
      'We used publication timestamps rather than ingestion timestamps. A late import of an old article should not make an old event look like a new surge. Future-dated and invalid records are excluded. Eligibility also uses stored relevance labels and the existing operator relevance filter; those decisions can change over time.',
      'The comparison retains source domains that contribute enough eligible coverage to both periods. That reduces the effect of adding a new publisher halfway through the analysis. It does not make the sample representative: publisher output, story selection and repeated coverage can still influence the result.',
    ] },
    { id: 'results', title: 'The denominator changes the reading', paragraphs: [
      `The following table is calculated from the ${source}. Shares are rounded to one decimal place. Topic rules are headline-only and deliberately narrow; topics can overlap. A hold means the proposed directional comparison needs more evidence, not that the topic is unimportant.`,
    ], table: {
      caption: 'MarketplaceBeta matched-source news sample · earlier: Oct 6–19; later: Oct 20–Nov 2, 2026 UTC · source: downloadable evidence summary',
      headings: ['Headline topic', 'Earlier matches / articles', 'Later matches / articles', 'Earlier → later share', 'Screening result'],
      rows: [
        ['AI agents / agentic commerce', '5 / 209', '4 / 280', '2.4% → 1.4%', 'Hold: thin match count'],
        ['Fees / margins', '4 / 209', '5 / 280', '1.9% → 1.8%', 'Hold: thin match count'],
        ['Fulfillment / returns', '24 / 209', '23 / 280', '11.5% → 8.2%', 'Candidate for source review'],
        ['Advertising / acquisition', '5 / 209', '5 / 280', '2.4% → 1.8%', 'Candidate for source review'],
      ],
    } },
    { id: 'interpretation', title: 'More mentions and a lower share can coexist', paragraphs: [
      'The fees row is a useful example. Its matching headline count increased, while its share of the larger later sample decreased. Neither statement describes a change in seller fees themselves. The advertising row has the same match count in both periods, but a lower share in the later period because the denominator grew.',
      'A report that displays only a percentage or only a raw count can therefore leave out the information needed to interpret it. The practical correction is simple: keep the numerator, denominator, dates and scope beside every comparison.',
      'The fulfillment result is eligible for primary-source review under this method. That is a place to start reading the underlying announcements, not a finding that logistics risk has fallen. The screening label does not certify significance, causation, market coverage or business impact.',
    ] },
    { id: 'source-balance', title: 'Check whether a prolific publisher controls the result', paragraphs: [
      'Alongside the pooled share, the calculator compares each matched source’s topic share and weights those source changes equally. This asks whether the direction survives when a high-volume publisher stops dominating the total. A disagreement holds the proposed directional finding for review.',
      `For fulfillment and returns, the pooled change was approximately −3.3 percentage points and the equally weighted source change approximately −3.2 percentage points in the ${source}. Agreement is a useful robustness check within this sample. It does not remove selection bias or establish a market-wide trend.`,
      'The evidence file includes the source-level counts so another analyst can inspect the calculation. Different weighting choices answer different questions; the method should be stated before choosing the most attention-grabbing result.',
    ] },
    { id: 'workflow', title: 'A practical contract for an AI research agent', paragraphs: [
      'Separate measurement from interpretation. The research step should retrieve authorized records and compute the figures in code. The writing step should explain those figures, inspect their sources and connect them to a decision. A fluent paragraph is not a substitute for a reproducible calculation.',
      'For an ecommerce team, the workflow can support competitor briefings, platform-change monitoring or a product-research queue. Its value comes from helping a person decide what to inspect or do next, with the limits visible. Any claim about saved hours or improved revenue needs a measured baseline and an operational trial.',
    ], bullets: [
      'Define the decision: the question must specify whose behavior or which operational condition matters.',
      'Bind each figure to its unit, source, observation window, sample and denominator.',
      'Check duplicates and changes in source coverage before comparing periods.',
      'Keep a counter-explanation: seasonality, source mix, design age or reporting changes may explain an apparent pattern.',
      'Hold weak evidence and record why; do not generate a new trend merely to fill a publishing slot.',
      'After publication, preserve the dated evidence and make material corrections traceable.',
    ] },
    { id: 'methods', title: 'Method, reproducibility and limits', paragraphs: [
      `The method is marketplacebeta-headline-coverage-v1. The ${source} records the cutoff at November 3, 2026 00:00 UTC, both half-open windows, exclusions, source-level counts, original source links and screening outcomes. The research code is available in [the MarketplaceBeta repository](https://github.com/rydak81/margin-intel-hub/blob/791170fe1817d49c48c9e97c98d3aa712917e0dd/lib/research-desk.ts).`,
      'The fixed eligibility rules require a stored relevant classification and a finite relevance score of at least forty. Matched domains must contribute at least five eligible headlines per period. A directional candidate also requires at least three matched domains, twenty comparable articles per period, seventy percent retention, recent eligible coverage and five matches per topic per period. These are editorial screening rules, not a statistical-power calculation.',
      'Duplicate groups connect records sharing an ID, canonicalized URL or normalized headline. The earliest deterministic representative is retained. This can remove exact syndicated copies, but paraphrased repetitions can remain. Headline-only matching misses synonyms and information appearing only in article bodies; the dictionary is not a comprehensive topic classifier.',
      'The source sample is purposive. No population estimate, statistical significance test, causal conclusion or adoption rate is claimed. Source-level weighting reduces one kind of sensitivity without removing all others. A later run may use changed records or source coverage, so reproduce this dated snapshot before comparing editions.',
    ] },
    { id: 'cite', title: 'How to cite and reuse the finding', paragraphs: [
      'Suggested attribution: MarketplaceBeta Research, “Why more AI headlines do not prove more AI adoption,” published November 2, 2026, with the article URL and the evidence-summary link. When reusing a figure, include its topic definition, publication windows and matched-source sample. Cite the original publisher when making a claim about the event described by an underlying news story.',
      'For a broader research workflow, use the [Intelligence dashboard](/intelligence) to find source-linked context and the [forecast ledger](/intelligence/forecasts) to distinguish a dated forecast from a current observation. This report is a descriptive methods example, not a forecast.',
    ] },
  ],
  sources: [
    { label: 'MarketplaceBeta: dated headline evidence summary (JSON)', href: evidence, context: 'Own archive metadata, fixed UTC cutoff, matched-source counts and calculations. Includes observation scope, exclusions and original source URLs; no article bodies or private customer data.' },
    { label: 'MarketplaceBeta research calculator', href: 'https://github.com/rydak81/margin-intel-hub/blob/791170fe1817d49c48c9e97c98d3aa712917e0dd/lib/research-desk.ts', context: 'Versioned measurement implementation. Editorial screening thresholds do not establish statistical significance.' },
  ],
}]
