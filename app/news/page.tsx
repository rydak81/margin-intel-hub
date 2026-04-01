import type { Metadata } from "next"
import ArticlesPage from "../articles/page"

export const metadata: Metadata = {
  title: "News | MarketplaceBeta",
  description: "Browse MarketplaceBeta reporting with marketplace, category, and impact filters.",
  alternates: {
    canonical: "https://marketplacebeta.com/news",
  },
}

export default function NewsPage() {
  return <ArticlesPage mode="news" />
}
