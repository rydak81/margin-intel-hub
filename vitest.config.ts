import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['lib/affiliate-status.test.tsx', 'lib/repricer/**/*.test.ts', 'lib/revenue-plumbing.test.ts', 'lib/newsletter-source.test.ts', 'lib/sale-fee-pages.test.ts', 'lib/intelligence-keeps-score.test.ts'], environment: 'node' },
})
