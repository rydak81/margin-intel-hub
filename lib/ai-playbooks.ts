export type AiPlaybook = {
  slug: string
  title: string
  summary: string
  category: string
  readTime: string
  updatedOn: string
  outcome: string
  inputs: string[]
  steps: { title: string; body: string }[]
  prompt: string
  review: string[]
  metrics: string[]
  pitfalls: string[]
  sources: { label: string; href: string; note: string }[]
}

export const AI_PLAYBOOKS: AiPlaybook[] = [
  {
    slug: "ai-product-listing-workflow",
    title: "Build an AI listing workflow from verified product facts",
    summary: "Turn a product fact sheet into reviewable marketplace copy, with a clear boundary between supplied evidence and a model's suggestions.",
    category: "Listings",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A repeatable drafting and review process for a small batch of listings. This is a recommended workflow, not a claim that generated copy will increase conversion.",
    inputs: [
      "A product record for each SKU: measurements, materials, included items, compatibility, variant differences and source references.",
      "Approved benefits, claims that require evidence, brand vocabulary and the target marketplace's current content requirements.",
      "A copy of the current listing and a representative pilot batch, including products with incomplete or conflicting information.",
    ],
    steps: [
      { title: "Create a fact sheet before asking for copy", body: "Separate verified facts from unanswered questions. A photo may suggest a material or dimension without proving it. Attach a source identifier to specifications and approved claims so a reviewer can trace the draft back to the product record." },
      { title: "Generate a bounded first draft", body: "Ask for a title, concise benefits and description using only the supplied record. Require a separate list of missing information. Amazon offers AI-assisted listing creation; Shopify documents product-description generation with Sidekick. Availability and review controls vary by platform." },
      { title: "Review the differences", body: "Compare the proposed copy with both the fact sheet and the existing listing. Check quantities, units, compatibility, certifications and variant names individually. Replace unsupported promises with accurate descriptions; keep missing fields unresolved rather than accepting a plausible answer." },
      { title: "Publish a controlled pilot", body: "Have the listing owner approve the final text and save the original version. Start with a manageable group of products. Record the date and other changes, including prices and advertising, before evaluating subsequent sales performance." },
    ],
    prompt: "Using only the attached SKU fact sheet, draft a title, five concise bullets and a description. Preserve units and variant names. For each factual claim, include its source ID in a separate review table. Mark missing facts UNKNOWN. Do not invent certifications, compatibility, performance or customer results. Return draft copy and unresolved questions; do not publish.",
    review: ["Every factual claim matches a supplied source.", "The draft describes the correct variant and included quantity.", "A person checks marketplace requirements and approves the final copy."],
    metrics: ["Minutes spent drafting and reviewing each SKU.", "Factual corrections per draft and publishing rejection rate.", "Conversion monitored separately, with traffic, pricing and seasonality recorded."],
    pitfalls: ["A polished sentence can conceal an invented specification.", "Copying a competitor's claim does not establish that it applies to your product.", "Fewer drafting minutes are not a saving if review and correction work increase."],
    sources: [
      { label: "Amazon: AI-assisted product listings", href: "https://sell.amazon.com/blog/amazon-listing-ai", note: "Official description of listing drafts from product images, webpages and spreadsheets; it does not validate results for your catalog." },
      { label: "Shopify: generating product descriptions", href: "https://help.shopify.com/en/manual/products/details/product-descriptions/generate", note: "Documents Sidekick drafting and the merchant's responsibility to review generated facts before publication." },
    ],
  },
  {
    slug: "ai-weekly-operating-brief",
    title: "Turn weekly ecommerce data into a decision brief",
    summary: "Use AI to explain a reconciled report and organize the next questions, while keeping arithmetic and evidence visible.",
    category: "Reporting",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A weekly brief with traceable observations, hypotheses and assigned follow-up checks. The process helps structure a review; it does not establish why sales changed.",
    inputs: [
      "Comparable reporting periods with channel, SKU, units, sales, discounts, refunds and advertising spend where available.",
      "Known product and fulfillment costs, plus explicit labels for costs that are missing or estimated.",
      "A reporting definition sheet covering timezone, currency, order date versus payout date, tax treatment and excluded records.",
    ],
    steps: [
      { title: "Agree on the numbers first", body: "Choose the business question and reporting period before generating a narrative. Reconcile totals to the original platform reports. Keep cancellations, refunds and currency conversions consistent. Revenue is not profit, and an incomplete cost export cannot support a complete margin claim." },
      { title: "Calculate in a reproducible layer", body: "Use spreadsheet formulas or a saved query for totals, differences and rates. Shopify Sidekick can help with store-data questions and ShopifyQL reports; inspect the resulting definitions and filters. Retain the export or query so another operator can reproduce the figures." },
      { title: "Ask for explanations as hypotheses", body: "Give AI the verified result table and a short log of promotions, stockouts and operational changes. Require each observation to cite a row or metric. Ask it to separate what the data shows from possible causes and to name the additional evidence needed." },
      { title: "Close the loop next week", body: "Limit the final brief to the decisions the team can act on. Assign an owner and due date to each investigation. At the following review, record whether the concern was confirmed, dismissed or remains unresolved rather than recycling the same narrative." },
    ],
    prompt: "Create a weekly operating brief from the supplied verified tables. Do not recalculate unsupported metrics or fill missing costs. For each item return: observation with row IDs, business question, possible explanation labeled HYPOTHESIS, next check, owner needed and uncertainty. Distinguish percentage changes from percentage-point changes. Finish with unresolved data-quality issues.",
    review: ["Totals and comparison periods reconcile to the platform reports.", "Every observation references evidence and every causal explanation is appropriately qualified.", "The decision owner agrees on the next check before action."],
    metrics: ["Preparation plus review time, compared with the previous process.", "Corrections needed before the brief is shared.", "Follow-up checks completed and decisions documented."],
    pitfalls: ["A promotion or stockout can distort a week-to-week comparison.", "An AI-generated chart can use the wrong denominator while looking convincing.", "News volume and platform coverage are not evidence of your store's demand."],
    sources: [
      { label: "Shopify: Sidekick help and analytics", href: "https://help.shopify.com/en/manual/ai-powered-tools/sidekick/help-and-guidance", note: "Documents store-data questions, ShopifyQL queries and report visualizations. The reconciliation and decision process here is our recommended workflow." },
    ],
  },
  {
    slug: "ai-customer-support-drafts",
    title: "Draft customer replies without inventing store policies",
    summary: "Start with a narrow set of support questions, reliable source material and human approval before expanding an AI-assisted workflow.",
    category: "Support",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A measured pilot for support drafting that preserves accurate answers and clear escalation. Faster replies matter only if they resolve the customer's actual question.",
    inputs: [
      "Current, approved shipping and return policies, product facts and answers to recurring questions, each with an owner and review date.",
      "A redacted sample of inquiries representing ordinary questions and difficult exceptions; use only an approved tool for customer information.",
      "An escalation map for missing information, policy exceptions, damaged items, refunds and order changes.",
    ],
    steps: [
      { title: "Fix the source before the prompt", body: "Choose one narrow topic, such as product care or standard delivery information. Resolve contradictory FAQs and identify facts the system cannot access. A better-written prompt cannot make an outdated return policy accurate." },
      { title: "Build drafts with evidence", body: "Ask AI to identify the question and produce a reply supported by an approved source passage. Shopify Inbox's suggested replies are a staff composing aid, distinct from its automated Inbox agent. Do not assume a drafting feature has verified an order or performed an action." },
      { title: "Review before sending", body: "Check tone, dates, amounts and the exact promise being made. If the record does not support an answer, ask a clarifying question or escalate. Refunds, address changes and delivery guarantees need the appropriate operational check and approval, not a confident sentence." },
      { title: "Improve the knowledge base", body: "Log corrections and unanswered questions. Update the underlying policy or product information when it is wrong, then retest the affected examples. Keep a small set of difficult cases to check after changing prompts, sources or tools." },
    ],
    prompt: "Draft a customer reply using only the supplied approved sources and verified order facts. First identify the question and source IDs that answer it. If information is missing or contradictory, return NEEDS REVIEW and a clarifying question. Do not promise refunds, delivery dates or order changes unless explicitly authorized in the record. Produce a draft for staff approval, not an automatic send.",
    review: ["The source policy is current and applies to this customer and product.", "The draft does not imply an action has already occurred.", "A staff member approves the answer and handles exceptions."],
    metrics: ["Time to a reviewed reply and factual correction rate.", "Repeat contacts for the same issue and reopened conversations.", "Escalation quality and customer feedback, alongside handling time."],
    pitfalls: ["A low escalation rate can hide incorrect answers.", "Editing a reply does not necessarily update the underlying knowledge source.", "Customer details should not be copied into unapproved tools just to test a prompt."],
    sources: [
      { label: "Shopify Inbox: suggested replies", href: "https://help.shopify.com/en/manual/inbox/chat-settings-and-appearance/suggested-replies", note: "Explains eligibility, source information and the requirement to review generated replies." },
      { label: "Shopify: managing conversations", href: "https://help.shopify.com/en/manual/inbox/conversations", note: "Distinguishes editing suggested wording from updating the store information used for answers." },
    ],
  },
  {
    slug: "ai-ad-search-term-review",
    title: "Review ad search terms before changing bids or negatives",
    summary: "Let AI organize query intent and flag questions for investigation. Keep performance calculations and account changes under an operator's control.",
    category: "Advertising",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A prioritized, reviewable search-term queue. This workflow proposes investigations; it does not guarantee better return on ad spend or recommend automatic bid changes.",
    inputs: [
      "A search-term export with stable row IDs, campaign, query, clicks, spend, conversions and value for one defined time window.",
      "The products actually sold, approved use cases, landing pages and known contribution-margin assumptions.",
      "Conversion-window definitions, recent campaign changes and sufficient historical context to identify incomplete attribution.",
    ],
    steps: [
      { title: "Define the decision and window", body: "Choose whether you are looking for irrelevant traffic, a landing-page gap or a promising product-use case. Export consistent fields and retain the original file. Google notes that some low-volume queries are omitted and conversion lag can produce differences across reporting surfaces." },
      { title: "Group intent without changing the account", body: "Ask AI to classify each visible query against your actual catalog: relevant, possibly relevant, irrelevant or uncertain. Require the row ID and reason. Treat the classification as a hypothesis; ambiguous words and accessory searches often need product knowledge." },
      { title: "Add deterministic performance context", body: "Calculate spend and conversion metrics in a spreadsheet or query. Review the largest relevant costs first, with conversion lag and sample size visible. A query with no recorded orders is not automatically a negative keyword; it may be too new or too sparsely observed." },
      { title: "Approve and log a small change", body: "Have the account owner inspect proposed negatives and their match behavior before applying them. Record the reason, date and affected campaigns. Review later results alongside budget, promotion and landing-page changes so you do not attribute every movement to the AI-assisted review." },
    ],
    prompt: "Classify the supplied search terms against this catalog. Return row ID, intent, relevant/possibly relevant/irrelevant/uncertain, evidence from the catalog, and next check. Do not invent search volume or profitability. Flag incomplete conversion windows and small samples. Suggest candidates for human review only; do not create negatives, change bids or assume zero conversions proves poor intent.",
    review: ["The proposed action matches the product and customer use case.", "The owner checks negative-keyword scope and match behavior.", "Reporting omissions, conversion lag and concurrent changes are documented."],
    metrics: ["Review time and the share of AI classifications corrected.", "Spend associated with clearly irrelevant queries in the available report.", "Subsequent conversion and margin measures interpreted with a change log."],
    pitfalls: ["A report may omit queries; its rows are not the complete search market.", "Semantic similarity does not prove commercial relevance.", "Aggressive negatives can remove valuable demand as well as wasted clicks."],
    sources: [
      { label: "Google Ads: search terms report", href: "https://support.google.com/google-ads/answer/2472708?hl=en", note: "Official explanation of queries, relevance, report limitations and negative keywords. The AI classification layer here is a recommended process, not a claimed native feature." },
    ],
  },
  {
    slug: "ai-inventory-exception-brief",
    title: "Build an inventory exception brief before automating purchasing",
    summary: "Combine explicit inventory rules with AI explanations to give the team a short list of exceptions, evidence and follow-up actions.",
    category: "Inventory",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A daily review queue for stock and fulfillment issues. Rules identify the exceptions; AI helps explain them. Purchase orders and customer promises remain separate approved actions.",
    inputs: [
      "SKU-level on-hand and committed quantities, open purchase orders, expected receipts and location information with timestamps.",
      "Recent unit sales, stockout days, promotion plans, supplier lead times and known minimum-order quantities.",
      "Explicit alert thresholds, a responsible owner and the system of record used to verify each exception.",
    ],
    steps: [
      { title: "Make the definitions explicit", body: "Decide whether available stock excludes commitments and which locations can fulfill an order. Separate confirmed inbound dates from estimates. Do not ask a model to infer missing inventory or lead times from a product description." },
      { title: "Use rules to identify exceptions", body: "Apply documented thresholds in a spreadsheet, query or workflow tool. Shopify Flow supports inventory and scheduled triggers. These are deterministic automations, not inherently AI. Deduplicate alerts so the same unresolved low-stock condition does not generate an unmanageable queue." },
      { title: "Generate a brief with uncertainty", body: "Give AI only the flagged rows and relevant context. Ask it to explain the trigger, identify missing data and propose the next operational check. If sales history includes stockouts, flag the distortion rather than treating observed sales as unconstrained demand." },
      { title: "Route, resolve and learn", body: "Assign each exception to an owner who verifies it in the source system. Start with notifications only. Record whether the alert was useful, what action was approved and when it closed. Revise thresholds using reviewed cases before considering any purchasing integration." },
    ],
    prompt: "Explain these inventory exceptions using the supplied rule definitions and row IDs. For each, return the triggering condition, known facts, missing information, next verification step and owner needed. Separate confirmed from estimated receipts. Flag stockout-distorted sales history. Do not invent demand, create purchase orders or promise delivery dates. Produce an internal review brief only.",
    review: ["Quantities, locations and timestamps reconcile to the inventory system.", "The owner checks inbound dates and supplier constraints before ordering.", "Repeated alerts are consolidated and resolved cases are recorded."],
    metrics: ["Useful alerts divided by reviewed alerts, with reasons for false alarms.", "Known exceptions missed by the workflow and time to owner review.", "Operator effort and resolution time, not a promised reduction in stockouts."],
    pitfalls: ["A low-stock threshold is not a demand forecast.", "Unreliable inbound dates can make a precise-looking recommendation unusable.", "Automating a purchase from incomplete data can multiply the cost of an error."],
    sources: [
      { label: "Shopify Flow: workflow examples", href: "https://help.shopify.com/en/manual/shopify-flow/getting-started/workflow-examples", note: "Documents inventory notifications and workflow patterns. The AI explanation and review layers are recommendations." },
      { label: "Shopify Flow: triggers", href: "https://help.shopify.com/en/manual/shopify-flow/getting-started/understanding-triggers", note: "Explains event-based and scheduled workflow triggers, including inventory checks." },
    ],
  },
  {
    slug: "ai-product-feed-publication-checklist",
    title: "Check AI product content before sending it to Google Shopping",
    summary: "Review product facts, feed fields and AI-content provenance together so an attractive draft does not become an inaccurate or incomplete product submission.",
    category: "Product feeds",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A publication checklist for generated product text and images. It supports feed quality and traceability; it does not guarantee approval, visibility or rankings.",
    inputs: [
      "An authoritative product record, the proposed landing page and the exact feed or integration used to send product data.",
      "A record of which titles, descriptions and images were AI-generated, including original image files and metadata.",
      "Access to Merchant Center diagnostics and an owner who can correct both the website and the feed integration.",
    ],
    steps: [
      { title: "Audit facts before formatting", body: "Check the product identity, variant, materials, included quantity and claims against the source record. Compare the proposed page with the submitted feed. Generated content should not introduce a different product promise from the one the customer can actually buy." },
      { title: "Check the generated-text fields", body: "Google Merchant Center specifies structured_title and structured_description for AI-generated titles and descriptions, with the appropriate digital_source_type value. Inspect how your feed integration supports these fields instead of assuming a normal text export preserves provenance." },
      { title: "Preserve image provenance", body: "Google requires metadata identifying generated images and says relevant embedded source-type tags should not be removed. Check the actual delivered file after editing, resizing or compression. Separately inspect whether the picture accurately represents the product and what is included." },
      { title: "Validate a small submission", body: "Review the current official requirements, test a limited product set and inspect Merchant Center diagnostics. Fix mappings and mismatches before extending the process across the catalog. Keep the approved copy, file provenance and reviewer so later edits can be traced." },
    ],
    prompt: "Compare the supplied product record, landing-page copy and feed fields. Return discrepancies with field names and evidence IDs. Identify unsupported claims and missing values. List which assets are marked as AI-generated and which provenance checks a human must perform. Do not claim metadata exists unless it is supplied, and do not promise Merchant Center approval or search rankings.",
    review: ["A person approves facts and verifies the feed-to-page mapping.", "The integration sends the required generated-text attributes and values.", "Delivered image metadata and Merchant Center diagnostics are inspected."],
    metrics: ["Product-data mismatches and rejected items in the pilot.", "Missing provenance fields found during review.", "Time to correct feed issues and the number that recur."],
    pitfalls: ["A generated-content note on a webpage is not a substitute for required feed attributes.", "An image editor or delivery pipeline can strip metadata.", "Passing a technical check does not establish that the content is useful or that a ranking will improve."],
    sources: [
      { label: "Google Merchant Center: AI-generated content", href: "https://support.google.com/merchants/answer/14743464?hl=en", note: "Official requirements for generated text attributes, trained_algorithmic_media values and image source metadata. Check for changes before submission." },
      { label: "Google Search: generative content guidance", href: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content", note: "Recommends accuracy, fact-checking and useful context; warns against generating pages at scale without value." },
    ],
  },
  {
    slug: "build-internal-ecommerce-tool-with-ai",
    title: "Build a small ecommerce tool with AI, from brief to tested prototype",
    summary: "Turn one repetitive operating task into a useful internal tool by defining the inputs, expected outputs and failure cases before asking AI to write code.",
    category: "Building tools",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A testable prototype for a bounded job, such as checking a supplier price file against your catalog. This is a recommended development process, not a promise that generated software is production-ready.",
    inputs: [
      "A plain-language problem statement: who uses the tool, what triggers the task, the current steps and the desired output.",
      "Synthetic or approved sample files with field definitions, plus examples of correct results and errors the tool should catch.",
      "An owner, an existing project or isolated prototype folder, and clear limits on data access, integrations and deployment.",
    ],
    steps: [
      { title: "Write the acceptance examples", body: "For a price-file checker, specify how SKUs match, how currency is handled and what counts as a change. Include duplicate SKUs, missing prices and unknown products. Manually calculate a few expected outputs so the prototype has a target independent of the generated code." },
      { title: "Ask for the smallest useful design", body: "Describe the required import, comparison, review and export screens. Ask which parts can use ordinary rules rather than an AI call. A fixed price difference should be calculated deterministically; AI can help build the interface or explain flagged records." },
      { title: "Build and inspect one complete path", body: "Have the coding assistant implement the sample-file workflow first. Review the code changes, run the provided checks and inspect the interface. Claude Code's official documentation covers code exploration, small changes and testing; the same acceptance-driven approach can guide other coding tools." },
      { title: "Test failure cases before real operations", body: "Verify malformed files, duplicates, empty input, rounding and export accuracy. Have an operator use the prototype with an approved sample. Before wider access, assign someone to review authentication, data handling, dependencies and recovery. Document setup and maintenance so the tool does not depend on one chat." },
    ],
    prompt: "Build a local prototype for the supplied operating task. First restate the inputs, output schema and acceptance examples. Use sample data only and deterministic calculations for numbers. Implement one complete import-review-export path with clear error messages. Test the supplied normal and failure cases, report actual results and unresolved limits, and do not connect production accounts or deploy.",
    review: ["An operator checks the output against independently calculated examples.", "A technical reviewer examines data access and errors before production use.", "The owner can run, maintain and recover the tool from written instructions."],
    metrics: ["Correct outputs across normal, boundary and malformed inputs.", "Time to complete the real task, including review and corrections.", "Maintenance effort and recurring errors after a controlled pilot."],
    pitfalls: ["A working demo can still mishandle real files and permissions.", "Tests that merely repeat the generated logic can share its mistakes.", "Adding a model to arithmetic creates complexity without necessarily adding value."],
    sources: [
      { label: "Claude Code: common workflows", href: "https://code.claude.com/docs/en/common-workflows", note: "Current official guidance for exploring code, making small changes, testing behavior and reviewing proposed changes. The ecommerce prototype is an illustrative recommended application." },
    ],
  },
  {
    slug: "design-agentic-ecommerce-workflow",
    title: "Design an AI workflow around an ecommerce bottleneck",
    summary: "Choose the right level of automation for a real operating problem, then connect research, drafting, review and action with visible evidence and ownership.",
    category: "Agentic workflows",
    readTime: "5 min",
    updatedOn: "2026-11-03",
    outcome: "A pilot specification defining what the system can read, propose and execute. Expand autonomy only after reviewing results.",
    inputs: [
      "A recurring bottleneck, frequency, handling time and examples of straightforward cases and exceptions.",
      "The approved source systems, required output, permitted actions and a named person responsible for decisions.",
      "A small evaluation set, acceptable-error definitions, a budget limit and the expected behavior when a source or tool fails.",
    ],
    steps: [
      { title: "Choose a job before choosing a tool", body: "For example, a weekly listing-change review may need research and a draft recommendation, but no autonomous publishing. Check whether an existing platform feature, spreadsheet rule or simple automation already handles the task. Compare options on data access, review controls, cost and maintainability." },
      { title: "Separate predictable steps from judgment", body: "Map research, draft, review and action as distinct stages. Use rules for known checks and AI where language or ambiguous evidence needs interpretation. Anthropic distinguishes predefined workflows from agents that choose their own process; flexible agent behavior is not required for every useful automation." },
      { title: "Make approval concrete", body: "Show the reviewer the proposed tool, exact record, before-and-after values and supporting evidence. Configure enforcement in the workflow, not just a prompt asking the model to behave. n8n documents pausing selected AI tool calls for approval or denial. Define what happens when approval is denied or never arrives." },
      { title: "Pilot, measure and contain failures", body: "Run historical examples and then a small live draft-only trial. Record source IDs, tool results, corrections, time and cost. Test missing data, duplicate events and tool failures; cap retries and prevent repeated actions. Expand permissions only after the owner reviews results and can pause the workflow." },
    ],
    prompt: "Design a pilot for this ecommerce bottleneck. Compare an existing feature, a deterministic workflow and an agent. Map research, draft, review and action; specify inputs, outputs and source IDs at each stage. List read permissions separately from write permissions. Require approval for publishing, sending or changing records. Define evaluation cases, retry limits, duplicate prevention, cost tracking and human fallback. Do not execute actions.",
    review: ["The chosen approach addresses the bottleneck without unnecessary tools or access.", "Approval displays the exact action and is enforced before execution.", "The owner verifies failure handling and can stop the pilot."],
    metrics: ["Task success and human correction rates on representative cases.", "End-to-end time and cost per accepted result, including review.", "Failed, duplicated or unapproved actions, with reasons and recovery outcomes."],
    pitfalls: ["A long chain can amplify an early retrieval or classification mistake.", "A model's confidence is not a substitute for a successful tool result.", "Human review is ineffective when the reviewer cannot see what will change."],
    sources: [
      { label: "Anthropic: building effective agents", href: "https://www.anthropic.com/research/building-effective-agents", note: "Published in 2024: foundational workflow and agent design principles, not current product setup instructions." },
      { label: "n8n: human review for tools", href: "https://docs.n8n.io/build/integrate-ai/ai-examples/human-in-the-loop-for-tools.md", note: "Current official documentation for pausing selected AI tool calls, showing parameters and approving or denying execution." },
    ],
  },
]

export function getAiPlaybook(slug: string): AiPlaybook | undefined {
  return AI_PLAYBOOKS.find((playbook) => playbook.slug === slug)
}

export function filterAiPlaybooks(query: string, category: string): AiPlaybook[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const selectedCategory = category.trim().toLocaleLowerCase()

  return AI_PLAYBOOKS.filter((playbook) => {
    if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "all topics" && playbook.category.toLocaleLowerCase() !== selectedCategory) {
      return false
    }

    const searchable = [playbook.title, playbook.summary, playbook.category, playbook.outcome, ...playbook.inputs, ...playbook.steps.flatMap((step) => [step.title, step.body])].join(" ").toLocaleLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}
