/** Conservative display gate. Retains stored records; does not claim factual verification. */
export type EditorialCandidate = {
  title: string
  category?: string
  summary?: string
  aiSummary?: string
  relevant?: boolean
}
export function editorialExclusionReason(article: EditorialCandidate): string | null {
  if (article.relevant === false || article.category === 'irrelevant') return 'classified_irrelevant'
  const title = article.title.toLowerCase()
  const summary = `${article.summary || ''} ${article.aiSummary || ''}`.toLowerCase()
  if (/\b(coupon|promo|discount) code\b|\bhoroscope\b/.test(title)) return 'promotion_only'
  if (/\b(prime video|romantic drama|movie trailer|tv series|celebrity|satellite production|project kuiper|amazon leo)\b/.test(title)) return 'outside_operator_scope'
  if (/\b(kids tablets?|alexa tablets?|amazon in the community|affordable housing|physical ai (machines|toolchain))\b/.test(title)) return 'outside_operator_scope'
  if (/\b(no substantive content|zero direct operational impact|not (relevant to|for) (marketplace|e-?commerce) (sellers|operators)|no direct (seller|operational) relevance)\b/.test(summary)) return 'summary_flags_irrelevance'
  if (/\b(best deals to shop|holiday kids gift book)\b/.test(title)) return 'promotion_only'
  if (/\b(amazon data cent(er|re)s?|data cent(er|re)s? communities|inside the aws lab|tablets designed just for kids|ring (introduces|ends|announces))\b/.test(title)) return 'outside_operator_scope'
  if (/\b(no seller[- ]facing policy, fee, or operational changes|no seller policy, fee, or operational changes)\b/.test(summary)) return 'summary_flags_irrelevance'
  return null
}
export function isOperatorRelevant(article: EditorialCandidate): boolean {
  return editorialExclusionReason(article) === null
}
