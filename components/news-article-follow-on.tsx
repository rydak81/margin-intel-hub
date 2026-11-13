import Link from 'next/link'
import { BriefCta } from '@/components/brief-cta'
import { BRIEF_CTA_KEYS } from '@/lib/brief-cta'
import { newsMarketplaceSlugs, relatedAnalysisForNews } from '@/lib/news-article-seo'

/**
 * End-of-article conversion: marketplace-matched analysis, then the shared
 * Daily Brief signup. Renders the signup even when no analysis matches.
 */
export function NewsArticleFollowOn({ platforms }: { platforms?: readonly string[] | null }) {
  const related = relatedAnalysisForNews(platforms)
  const marketplaceLabel = newsMarketplaceSlugs(platforms).length > 1 ? 'these marketplaces' : 'this marketplace'
  return (
    <>
      {related.length > 0 ? (
        <section id="related-analysis" aria-labelledby="related-analysis-heading" className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <h2 id="related-analysis-heading" className="text-2xl font-bold">Related analysis</h2>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            MarketplaceBeta analysis for {marketplaceLabel}.
          </p>
          <ul className="mt-4 space-y-4">
            {related.map(article => (
              <li key={article.slug}>
                <Link href={`/intelligence/analysis/${article.slug}`} className="text-lg font-semibold text-primary hover:underline">
                  {article.headline}
                </Link>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{article.metaDescription}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <BriefCta source={BRIEF_CTA_KEYS.news} className="mt-8" />
    </>
  )
}
