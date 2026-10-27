import { Suspense } from "react"
import { loadInitialArticles } from "@/lib/articles-initial"
import { ArticlesBrowser } from "./articles-browser"
import { ArticlesStaticList } from "./articles-static-list"

// The archive's first page is rendered on the server (and refreshed every few
// minutes) so crawlers get real links and an H1 instead of a loading message.
export const revalidate = 300

export default async function ArticlesRoute() {
  const initial = await loadInitialArticles()
  return (
    <Suspense fallback={<ArticlesStaticList initial={initial} />}>
      <ArticlesBrowser initial={initial} />
    </Suspense>
  )
}
