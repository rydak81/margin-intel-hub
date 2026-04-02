import type { Metadata } from "next"
import { AccountPageClient } from "@/components/account-page-client"

export const metadata: Metadata = {
  title: "Account | MarketplaceBeta",
  description: "Manage your MarketplaceBeta profile, content preferences, and daily digest settings.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://marketplacebeta.com/account",
  },
}

export default function AccountPage() {
  return <AccountPageClient />
}
