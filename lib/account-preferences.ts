export const ACCOUNT_PLATFORM_OPTIONS = [
  "Amazon",
  "Walmart",
  "Target+",
  "Shopify",
  "TikTok Shop",
  "eBay",
  "Multi-Platform",
] as const

export const ACCOUNT_TOPIC_OPTIONS = [
  "Fees & reimbursement",
  "Platform policy",
  "Profitability",
  "Advertising",
  "Logistics",
  "Tools & SaaS",
  "M&A / partnerships",
  "Market trends",
] as const

export const DIGEST_MODE_OPTIONS = [
  { value: "operator_plus_personal", label: "Operator brief + personal picks" },
  { value: "operator_only", label: "Operator brief only" },
  { value: "personal_only", label: "Personalized picks only" },
] as const

export type DigestMode = (typeof DIGEST_MODE_OPTIONS)[number]["value"]
