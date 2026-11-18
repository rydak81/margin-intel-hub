import { assembleArticles } from '@/lib/analysis/sort-articles'
import type { AnalysisArticle } from '@/lib/analysis/types'

interface EntryModule {
  entry: AnalysisArticle
}

declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
  ): {
    keys(): string[]
    (id: string): EntryModule
  }
}

function loadEntries(): AnalysisArticle[] {
  // Webpack includes every registry module from this direct call. A new article
  // adds a file here and does not edit a shared import list.
  const context = require.context('./registry', false, /^\.\/[a-z0-9-]+\.ts$/)
  return context.keys().map(key => context(key).entry)
}

export const ANALYSIS_ARTICLES: AnalysisArticle[] = assembleArticles(loadEntries())
