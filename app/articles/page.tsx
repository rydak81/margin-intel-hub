import { Suspense } from "react"
import { JsonLd } from "@/components/json-ld"
import { loadInitialArticles } from "@/lib/articles-initial"
import { sectionPageJsonLd } from "@/lib/site-jsonld"
import { ArticlesBrowser } from "./articles-browser"
import { ArticlesStaticList } from "./articles-static-list"

// The archive's first page is rendered on the server (and refreshed every few
// minutes) so crawlers get real links and an H1 instead of a loading message.
export const revalidate = 300

export default async function ArticlesRoute() {
  const initial = await loadInitialArticles()
  const jsonLd = sectionPageJsonLd({
    name: "Marketplace news archive",
    description: "Search marketplace news by platform, topic, and date.",
    path: "/articles",
    items: (initial?.articles ?? []).map((article) => ({ name: article.title, path: `/news/${article.id}` })),
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Articles", path: "/articles" },
    ],
  })
  return (
    <>
      <JsonLd data={jsonLd} />
      <Suspense fallback={<ArticlesStaticList initial={initial} />}>
        <ArticlesBrowser initial={initial} />
      </Suspense>
    </>
  )
}
