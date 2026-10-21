import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['lib/newsletter-unsubscribe.test.ts', 'lib/repricer/**/*.test.ts', 'lib/revenue-plumbing.test.ts', 'lib/brief-schedule.test.ts', 'lib/newsletter-source.test.ts', 'lib/sale-fee-pages.test.ts', 'lib/intelligence-keeps-score.test.ts', 'lib/analyst.test.ts', 'lib/analysis.test.ts', 'lib/pressure-index.test.ts', 'lib/news-pipeline-helpers.test.ts', 'lib/news-backfill.test.ts', 'lib/news-backfill-route.test.ts', 'lib/news-classification-backfill.test.ts'], environment: 'node' },
})

