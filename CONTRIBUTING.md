# Contributing

## Add an analysis article

Each article is its own module. A pull request adds that file and one registry line. It does not edit another article, and it does not insert a line into a shared array, so article pull requests do not conflict with each other.

1. Add `lib/analysis/articles/<slug>.ts`. Export `article` as an `AnalysisArticle` (`import type { AnalysisArticle } from '@/lib/analysis/types'`). The filename, without `.ts`, is the slug, and `article.slug` matches it. Follow the source rules at the top of `lib/analysis.ts`.
2. Add `lib/analysis/registry/<slug>.ts` containing only:

```ts
export { article as entry } from '../articles/<slug>'
```

The catalog loads every file in `lib/analysis/registry/`. Published articles stay in the order they already have, which keeps the sitemap and feed stable. A new article is inserted by `publishedOn`, newest first: ahead of the first published article with an older date, and after articles with the same date. Two new articles on the same date are ordered by slug. You do not choose a line in a shared list.

`lib/related-links.test.ts` builds eBay and Etsy related-reading expectations from the catalog, so a new article does not add a slug to that file. `lib/fee-by-price.test.ts` and `lib/aeo-citability.test.ts` already read `ANALYSIS_ARTICLES`, the sitemap, and the feed. They do not have a per-article pin list to edit.

Run `npm test` and `npm run build`.

A research report uses the same two files, and its slug is appended to `RESEARCH_ARTICLES` in `lib/research-articles.ts`. Append it. Do not insert it at the top. That array is what the research pages already import, and the first entry stays the article those tests address.
