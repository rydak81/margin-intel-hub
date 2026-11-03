# AI for Operators

Implemented November 3, 2026.

## Positioning and scope

MarketplaceBeta's former Desktop Manufacturing desk becomes an ecommerce AI resource and a starting point for consulting inquiries. The audience is sellers, agencies, and marketplace operations teams. Content leads with a repeatable operating problem, approved inputs, review requirements, and a measurable pilot. MeshNomics remains a separate brand.

The launch includes eight source-linked playbooks: product listings, weekly reporting, support drafting, advertising search-term review, inventory exceptions, product-feed publication, building internal tools, and agentic workflows. Each contains a copyable prompt, pitfalls, review checks, and pilot measurements. The searchable library, ungated worksheet, research example, and workflow inquiry form make the content actionable without paid AI calls at page load.

## Routes and migration

- `/ai`: hub, library, pilot plan, and inquiry form.
- `/ai/[slug]`: eight statically generated guides; unknown slugs return 404.
- `/desktop-manufacturing`: permanent 308 redirect to `/ai`.
- `/desktop-manufacturing/story/[slug]`: retired URLs return 404 with a useful AI-hub link, rather than redirecting unrelated stories to new articles.
- Navigation and sitemap point to the new hub and guides.
- Public MeshNomics promotion removed from the former desk, dashboard copy, and October HTML dossier.
- Private `/api/intel-feed` is retired at the owner's explicit request: every GET returns 410 Gone with no-store/noindex, without accepting keys, querying data, or fetching manufacturing sources. Stored historical data and ingestion are unchanged. MeshNomics itself remains intact and is not modified; this release does not regenerate old downloadable PDFs.

## Content integrity and maintenance

`lib/ai-playbooks.ts` holds the content and source-check dates. Official Amazon, Shopify, and Google documentation supports capability statements. The workflows and prompts are editorial recommendations, not vendor guarantees or validated customer case studies. No invented revenue, ROI, customers, or performance claims.

Check cited documentation when a vendor changes a feature and at least quarterly. The hub also includes Build/Grow/Operate exercises, a task-based approach selector, and an AI/ecommerce news watch drawn from the existing curated archive. News requires both AI and commerce terms, valid publication dates within 30 days, newest-first ordering, and deduplication; the page states the 500-record sampling limit and handles missing or unavailable coverage honestly. News uses the existing five-minute cache and no new AI-generation calls. The recovered "Assessing AI Expertise" and "Optimize Intelligence Prompt" chats support practical AI for business builders, task-based tools, research agents, growth work, and concise actionable guidance. The owner clarified that this is a useful public resource rather than a request for personal case studies. If case studies are added later, they should show a real input/output artifact, permissions, before/after measurement including review time, and limitations; await owner-confirmed evidence before publication.

## Inquiry delivery

The AI variant reuses the existing durable inquiry endpoint, storage, idempotent retry behavior, validation, and notification delivery. `sourcePage=ai` and `offer=other` distinguish AI requests. The form asks for the workflow, tools, bottleneck, and desired outcome. It offers a discussion about scope, not a booked service or payment commitment. Existing sponsorship variants retain their behavior. No new database migration or service required.

## Validation

- Full test command passed: 449 Vitest tests and 102 Node tests.
- Production build passed; final release also checked after structured-data updates.
- Desktop 1280px and mobile 390px browser checks: readable hub and guide, no horizontal overflow, no public MeshNomics link in the hub.
- Multiword search, category intersection, empty/reset behavior, prompt copying, navigation, sitemap and redirect contract covered.
- Inquiry tests cover successful storage/delivery, errors and retry behavior; no live test inquiry was sent.

## Initial growth work

Use the eight guide URLs in relevant one-to-one prospect conversations only when outreach is separately authorized. Track search impressions, guide visits, workflow selections and qualified inquiries before increasing the publishing cadence. Add demonstrated operator examples before broad claims about consulting outcomes. Do not publish bulk generated articles merely to increase page count.
