# Desktop manufacturing desk

Requested October 10, 2026 as an additional MarketplaceBeta section, complementary to MeshNomics. The ecommerce homepage, archive, and ingestion remain separate.

## Included

- /desktop-manufacturing, linked from the shared desktop/mobile header and footer, with canonical metadata and sitemap inclusion.
- Source-linked news headlines, publication dates, publisher type, automated topic/process tags, and labeled operator research prompts. Search plus topic, process, and 7/30/90-day filters; newest-first order and exact headline/URL deduplication.
- A separate public RSS/Atom pipeline, fetched concurrently and cached for 30 minutes on visits. Per-source 8-second timeout, 2 MB response limit, no redirects, unsupported XML entity declarations rejected, HTTPS publisher-host links only, independent failure states. No full article bodies or images republished. No new database, AI generation request, cron, or paid data service.
- Source window limited to 90 days and to the items publishers expose in their current feeds. Not a historical archive or exhaustive industry census. Broad AM reporting is marked Industry context.
- Curated Formnext 2026 and RAPID + TCT 2027 dates from organizers. Past events are automatically removed; new calendar entries require source verification. The news updates automatically, but the calendar is not an automated event scraper.
- Model/release/community research links and a MeshNomics referral link with fixed UTM values and a fixed-resource analytics event. Shared ownership is disclosed. No account or operational-data integration.

## Verified feeds

All five public endpoints returned 200 and parsed during the source checks (October 10 EDT / October 11 UTC):

| Publisher | Feed | Evidence class |
| --- | --- | --- |
| Prusa Research | https://blog.prusa3d.com/feed/ | Manufacturer announcement |
| Bambu Lab | https://blog.bambulab.com/rss/ | Manufacturer announcement |
| Carbide 3D | https://carbide3d.com/blog/feed.xml | Manufacturer announcement, advertised from its blog |
| xTool | https://www.xtool.com/blogs/news.atom | Manufacturer announcement |
| 3D Printing Industry | https://3dprintingindustry.com/feed/ | Trade publication; broader AM context |

The local live snapshot displayed 23 eligible reports across all five sources, with 12 in the default 30-day view. Counts can change; publication dates were preserved. A successfully retrieved feed with no eligible recent entries is distinct from an unavailable feed.

No bypass of blocked sources, model-library scraping, private forum access, or unverified full-content redistribution is included. News counts, downloads, and manufacturer announcements are not sales observations or forecasts.

## Primary references

- https://formnext.mesago.com/frankfurt/en.html — November 17–20, 2026, Frankfurt.
- https://www.rapid3devent.com/event/event-overview/ — April 12–15, 2027 conference; April 13–15 exhibits, Detroit.
- https://makerfaire.com/upcoming-faires/ — organizer discovery link; no dates inferred.
- https://www.printables.com/ and https://makerworld.com/ — direct discovery links, not ingestion sources.
- https://github.com/OrcaSlicer/OrcaSlicer/releases — canonical repository after following the former SoftFever repository redirect.
- https://community.carbide3d.com/ — operator community directory link.
- https://www.meshnomics.com/ — live title verified as MeshNomics — Desktop Manufacturing Intelligence. Link to public home only, with no claims of shared live data.

## Validation and limits

26 total automated tests passed, including RSS and Atom parsing, invalid/future dates, unsafe external URLs, combined filters, deduplication, event expiry, partial/full source failure, response size limits, and XML declaration rejection. TypeScript and production webpack build passed. Live local feed retrieval succeeded for all five feeds. Browser testing covered search, combined filters, empty/reset behavior, source attribution, and responsive layout.

Follow-up opportunities: source-specific licensing/rate-limit review before extending beyond headline linking; more independent desktop-specific reporting; manually verified maker events; optional approved release feeds; dated original operator analysis; source-to-MeshNomics conversion measurement. Operational data sharing, predictions, and automatic recommendation changes require a separate integration with provenance and permissions.
