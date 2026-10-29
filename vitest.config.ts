import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['lib/newsletter-unsubscribe.test.ts', 'lib/repricer/**/*.test.ts', 'lib/revenue-plumbing.test.ts', 'lib/brief-schedule.test.ts', 'lib/brief-sponsor-schedule.test.ts', 'lib/dossier-sponsor.test.ts', 'lib/newsletter-source.test.ts', 'lib/sponsor-inquiry.test.ts', 'lib/email.test.ts', 'components/sponsor-inquiry-form.test.tsx', 'lib/sale-fee-pages.test.ts', 'lib/seo-indexing.test.ts', 'lib/aeo-citability.test.ts', 'lib/seo-pages.test.ts', 'lib/sitemap.test.ts', 'lib/paid-offer.test.ts', 'lib/affiliate-status.test.tsx', 'components/sponsored-tool-listing.test.tsx', 'lib/intelligence-keeps-score.test.ts', 'lib/analyst.test.ts', 'lib/analysis.test.ts', 'lib/analysis-faq.test.ts', 'lib/pressure-index.test.ts', 'lib/news-pipeline-helpers.test.ts', 'lib/news-backfill.test.ts', 'lib/news-backfill-route.test.ts', 'lib/news-classification-backfill.test.ts'], environment: 'node' },
})

