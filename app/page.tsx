import HomePageClient from "@/components/home-page-client"
import { loadHomepageData } from "@/lib/homepage-data"

export const revalidate = 300

export default async function HomePage() {
  const { initialArticles, initialBreakingNews } = await loadHomepageData()

  return (
    <HomePageClient
      initialArticles={initialArticles}
      initialBreakingNews={initialBreakingNews}
    />
  )
}
