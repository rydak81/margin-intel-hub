# MarketplaceBeta

The Intelligence Hub for Marketplace Commerce — breaking news, platform updates, M&A activity, and actionable insights for Amazon sellers, agencies, SaaS providers, and e-commerce operators, all in one place.

**Live site:** [v0-vercel-ecom-intelpro.vercel.app](https://v0-vercel-ecom-intelpro.vercel.app)

## Features

### AI-Powered News Aggregation
- Aggregates articles from **18 RSS feeds** (13 industry + 5 Google News)
- **Claude Haiku 4.5** classifies every article with relevance scoring, category tagging, platform detection, impact level, and analyst-grade summaries
- Automatic deduplication, breaking news detection, and irrelevant content filtering
- Runs on a 2-hour cron cycle with 30-minute in-memory caching

### AI Search
- Natural language search powered by Claude — ask questions like *"What are the latest Amazon fee changes?"*
- Returns AI-generated answers with source articles and suggested follow-up queries
- Falls back to PostgreSQL full-text search when AI is unavailable

### Newsletter
- Daily briefing delivered at 7am ET
- Subscriber management with role-based segmentation (sellers, agencies, SaaS, investors, service providers)
- Stored in Supabase with duplicate prevention

### Community Forum
- Discussion categories: Amazon, other marketplaces, profitability, advertising, logistics, tools, deals, and more
- Post types: questions, discussions, deals, case studies, resources
- Voting system, bookmarks, content reporting, and user reputation scoring

### Seller Tools
- **Profit Calculator** — FBA cost, fees, and margin analysis
- **Listing Optimizer** — Amazon listing SEO scoring and recommendations
- **Keyword Research** — Keyword tracking and trend analysis
- **Trending Products** — Hot products across multiple marketplaces

### Events Calendar
- Major industry events (Shoptalk, Amazon Accelerate, Prosper Show, and more)
- Countdown timers, registration links, and platform/type filtering

### Solutions Directory
- B2B partner and agency directory
- Lead capture with company info, revenue, marketplace, and service needs

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | TailwindCSS 4.2 |
| UI Components | Shadcn/UI (Radix primitives) |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude Haiku 4.5 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| News Feeds | RSS Parser |
| Deployment | Vercel |
| Analytics | Vercel Analytics |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Classification
ANTHROPIC_API_KEY=your-anthropic-api-key
AI_STRATEGY=cheapest

# Cron Jobs
CRON_SECRET=your-secret-for-vercel-cron
```

### Database Setup

Run the SQL scripts in the `scripts/` directory against your Supabase project:

```bash
# In the Supabase SQL Editor, run in order:
scripts/001_create_subscribers_table.sql
scripts/002_create_community_tables.sql
scripts/003_create_articles_table.sql
```

### Installation

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the environment variables above in the Vercel dashboard
4. Vercel will automatically set up the cron job defined in `vercel.json` (news aggregation every 2 hours)

## Project Structure

```
app/
  api/
    articles/         # AI-classified article endpoints
    news/             # Aggregation, AI search, cron trigger
    subscribe/        # Newsletter subscription
    search/           # Product search
    trends/           # Google Trends data
  community/          # Forum pages
  events/             # Events calendar
  newsletter/         # Newsletter signup page
  news/[id]/          # Article detail pages
  solutions/          # B2B solutions directory
  tools/              # Seller tools suite
components/           # Shadcn/UI + custom components
lib/
  ai-classifier.ts    # Batch AI classification engine
  ai-providers.ts     # Multi-provider AI abstraction
  ai-search.ts        # Natural language search
  article-images.ts   # Image selection with fallbacks
  article-store.ts    # Supabase + in-memory cache layer
  supabase/           # Database clients
scripts/              # SQL migration scripts
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles` | GET | Fetch AI-classified articles with filtering by category, platform, audience, impact |
| `/api/articles/[id]` | GET | Get a single article by ID |
| `/api/news/aggregate` | POST | Trigger news aggregation (used by Vercel cron) |
| `/api/news/ai-search` | POST | AI-powered natural language search |
| `/api/subscribe` | POST | Subscribe to the newsletter |

## News Categories

| Category | Description |
|----------|-------------|
| Breaking | Urgent industry news |
| Market Metrics | Sales data, market trends, benchmarks |
| Platform Updates | Amazon, Walmart, TikTok Shop policy and feature changes |
| Seller Profitability | Margins, fees, cost optimization |
| M&A & Deal Flow | Acquisitions, funding, aggregator activity |
| Tools & Technology | Software, AI tools, automation |
| Advertising | PPC, retail media, sponsored ads |
| Logistics | Shipping, FBA, supply chain |

## License

Private repository. All rights reserved.
