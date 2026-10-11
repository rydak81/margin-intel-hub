import { loadArticlesFromDB } from '@/lib/article-store'
import { buildOperatorBriefing } from '@/lib/operator-briefing'

export async function getDailyOperatorBriefing() {
  // Build the digest from the same dated snapshot we display. No generated urgency
  // or cached narrative paired with a different set of supporting articles.
  const articles = await loadArticlesFromDB({ limit: 120, newestFirst: true })
  return buildOperatorBriefing(articles)
}
