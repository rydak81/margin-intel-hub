/**
 * Holiday 2026 seller hub at /holiday-2026.
 *
 * The hub list is computed, not hand-written:
 * - Analysis: every article in lib/analysis.ts with a holiday tag (a tag containing
 *   "holiday" or "peak season" as a whole word, case-insensitive) published inside
 *   HOLIDAY_2026_WINDOW. A new holiday piece joins the hub, the sitemap date and the
 *   back-link automatically once it is added to ANALYSIS_ARTICLES with such a tag.
 * - Fee pages: fee explainers are not analysis articles, so they are listed in
 *   HOLIDAY_FEE_PAGES. To add a future holiday fee page, export its path, title and
 *   meta description from its lib/ data file (as lib/amazon-holiday-peak-2026.ts does),
 *   use those constants in the page's metadata, and add one entry here.
 *
 * Every one-line description is the linked page's own meta description, so the hub
 * makes no claim the page itself does not make.
 */
import { latestAnalysis, type AnalysisArticle } from '@/lib/analysis'
import { AMAZON_PEAK_DESCRIPTION, AMAZON_PEAK_PATH, AMAZON_PEAK_TITLE, CHECKED_ON as AMAZON_PEAK_CHECKED } from '@/lib/amazon-holiday-peak-2026'
import { briefSignupHref } from '@/lib/brief-cta'

export const HOLIDAY_HUB_PATH = '/holiday-2026'
export const HOLIDAY_HUB_TITLE = 'Holiday 2026 Seller Hub: Shipping, Returns, Fees'
export const HOLIDAY_HUB_HEADING = 'Holiday 2026 seller hub'
export const HOLIDAY_HUB_DESCRIPTION = 'Our 2026 holiday analysis and fee pages for marketplace sellers in one place: shipping cutoffs, returns, parcel surcharges, port backlogs and peak fees.'
export const HOLIDAY_HUB_LINK_LABEL = 'Holiday 2026 seller hub'

/** Newsletter attribution key for the hub. Passes the campaign_ rule in lib/newsletter-source.ts. */
export const HOLIDAY_HUB_SOURCE = 'campaign_holiday_hub' as const
export const holidayHubBriefHref = () => briefSignupHref(HOLIDAY_HUB_SOURCE)

/** Publish dates (inclusive) that count as the 2026 holiday season. */
export const HOLIDAY_2026_WINDOW = { from: '2026-07-01', to: '2027-01-31' } as const

const HOLIDAY_TAG_RE = /(?<![A-Za-z0-9])(?:holiday|peak season)(?![A-Za-z0-9])/i

type HolidayFraming = Pick<AnalysisArticle, 'tags' | 'publishedOn'>

/** True when an analysis article belongs on the Holiday 2026 hub. */
export function isHolidayAnalysis(a: HolidayFraming): boolean {
  return a.publishedOn >= HOLIDAY_2026_WINDOW.from
    && a.publishedOn <= HOLIDAY_2026_WINDOW.to
    && a.tags.some(t => HOLIDAY_TAG_RE.test(t))
}

/** Holiday analysis, newest first. */
export function holidayAnalysis(articles: AnalysisArticle[] = latestAnalysis()): AnalysisArticle[] {
  return articles.filter(isHolidayAnalysis)
}

export interface HolidayHubEntry {
  href: string
  title: string
  /** The linked page's own meta description. */
  description: string
  /** ISO date shown next to the link (publish date, or the fee page's checked date). */
  date: string
  kind: 'Analysis' | 'Fees'
}

/** Holiday fee pages that are not analysis articles. See the header comment to add one. */
export const HOLIDAY_FEE_PAGES: HolidayHubEntry[] = [
  { href: AMAZON_PEAK_PATH, title: AMAZON_PEAK_TITLE, description: AMAZON_PEAK_DESCRIPTION, date: AMAZON_PEAK_CHECKED, kind: 'Fees' },
]

export function holidayAnalysisEntries(articles?: AnalysisArticle[]): HolidayHubEntry[] {
  return holidayAnalysis(articles).map(a => ({
    href: `/intelligence/analysis/${a.slug}`,
    title: a.headline,
    description: a.metaDescription,
    date: a.publishedOn,
    kind: 'Analysis' as const,
  }))
}

/** Every page the hub links, analysis first (newest first), then fee pages. */
export function holidayHubEntries(articles?: AnalysisArticle[]): HolidayHubEntry[] {
  return [...holidayAnalysisEntries(articles), ...HOLIDAY_FEE_PAGES]
}

/** True when a path is listed on the hub, so it should link back to it. */
export function isOnHolidayHub(path: string, articles?: AnalysisArticle[]): boolean {
  return holidayHubEntries(articles).some(e => e.href === path)
}

/** Sitemap lastModified for the hub: the newest date among its entries. */
export function holidayHubUpdatedOn(articles?: AnalysisArticle[]): string {
  return holidayHubEntries(articles).reduce<string>((d, e) => (e.date > d ? e.date : d), HOLIDAY_2026_WINDOW.from)
}
