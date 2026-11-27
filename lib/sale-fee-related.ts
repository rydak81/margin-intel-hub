/**
 * Related analysis for the programmatic "on a $N sale" fee pages.
 *
 * Articles come from relatedAnalysisForMarketplace (newest published pieces
 * that cover that marketplace). The holiday hub link uses holidayHubLinkVisible
 * and is omitted after 2026-12-31 America/New_York.
 */
import type { AnalysisArticle } from '@/lib/analysis'
import { holidayHubLinkVisible, HOLIDAY_HUB_LINK_THROUGH } from '@/lib/holiday-hub'
import type { MarketplaceSlug } from '@/lib/marketplace-fees'
import {
  holidayHubReadingLink,
  RELATED_ANALYSIS_LIMIT,
  relatedAnalysisForMarketplace,
  type AnalysisReadingLink,
} from '@/lib/related-links'

/** Same cap the marketplace fee pages use. Inside the 2–4 links these pages show. */
export const SALE_FEE_RELATED_ANALYSIS_LIMIT = RELATED_ANALYSIS_LIMIT

export { HOLIDAY_HUB_LINK_THROUGH }

function analysisLink(article: AnalysisArticle): AnalysisReadingLink {
  return {
    href: `/intelligence/analysis/${article.slug}`,
    label: article.headline,
    note: 'Analysis',
    date: article.publishedOn,
  }
}

/** Up to SALE_FEE_RELATED_ANALYSIS_LIMIT published analyses for this marketplace, newest first. */
export function saleFeeRelatedAnalysis(
  slug: MarketplaceSlug,
  articles?: AnalysisArticle[],
): AnalysisArticle[] {
  return relatedAnalysisForMarketplace(slug, SALE_FEE_RELATED_ANALYSIS_LIMIT, articles)
}

/**
 * Analysis links, then the holiday hub while holidayHubLinkVisible(now).
 * The hub entry is not an analysis article.
 */
export function saleFeeRelatedLinks(
  slug: MarketplaceSlug,
  now: Date = new Date(),
  articles?: AnalysisArticle[],
): AnalysisReadingLink[] {
  const links = saleFeeRelatedAnalysis(slug, articles).map(analysisLink)
  if (!holidayHubLinkVisible(now) || links.some(link => link.href === holidayHubReadingLink().href)) return links
  return [...links, holidayHubReadingLink()]
}
