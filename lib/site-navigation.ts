export const SITE_NAVIGATION = [
  { key: "home", href: "/", label: "Latest" },
  { key: "intelligence", href: "/intelligence", label: "Dashboard" },
  { key: "news", href: "/news", label: "The briefing" },
  { key: "articles", href: "/articles", label: "Archive" },
  { key: "tools", href: "/tools", label: "Tools" },
  { key: "fees", href: "/fees", label: "Fees" },
  { key: "guides", href: "/guides", label: "Guides" },
  { key: "events", href: "/events", label: "Events" },
] as const

export const RESEARCH_DESKS = [
  { title: "Protect your margin", category: "profitability", description: "Investigate fees, pricing changes, and the costs behind your contribution margin.", question: "Which costs should I revisit?" },
  { title: "Plan fulfillment", category: "logistics", description: "Follow shipping, inventory, and fulfillment developments before changing your operating plan.", question: "Where is my operational exposure?" },
  { title: "Allocate ad spend", category: "advertising", description: "Research retail media, attribution, and platform changes that affect acquisition.", question: "What changes my next test?" },
  { title: "Track platform changes", category: "platform_updates", description: "Find the announcements that affect listings, policies, and channel operations.", question: "What needs attention on my channels?" },
  { title: "Evaluate technology", category: "tools_technology", description: "Explore commerce software and AI updates with a specific workflow in mind.", question: "What is worth evaluating?" },
  { title: "Understand the market", category: "market_metrics", description: "Compare reported market signals and trends with your own business performance.", question: "What should I investigate next?" },
] as const
