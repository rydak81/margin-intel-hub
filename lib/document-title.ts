/** Limits used for the document title and the meta description. */
export const TITLE_LIMIT = 60
export const DESCRIPTION_LIMIT = 160
export const SITE_TITLE_SUFFIX = ' | MarketplaceBeta'

/**
 * Keep the site suffix when the combined title fits in 60 characters.
 * Drop it when the suffix is what pushes the title over that limit.
 * The lead itself is not rewritten here.
 */
export function documentTitle(lead: string): string {
  const bare = lead.endsWith(SITE_TITLE_SUFFIX) ? lead.slice(0, -SITE_TITLE_SUFFIX.length) : lead
  const withSuffix = `${bare}${SITE_TITLE_SUFFIX}`
  return withSuffix.length <= TITLE_LIMIT ? withSuffix : bare
}

/**
 * Cap a meta description at 160 characters without splitting the last token,
 * so a figure such as $10.50 or 8% is not cut in half.
 */
export function capMetaDescription(description: string, max = DESCRIPTION_LIMIT): string {
  const text = description.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const ellipsis = '...'
  const room = max - ellipsis.length
  const slice = text.slice(0, room + 1)
  const boundary = slice.search(/\s+\S*$/)
  const cut = (boundary > 40 ? slice.slice(0, boundary) : text.slice(0, room)).replace(/[.,;:]+$/, '')
  const out = `${cut}${ellipsis}`
  return out.length <= max ? out : `${text.slice(0, room)}${ellipsis}`
}
