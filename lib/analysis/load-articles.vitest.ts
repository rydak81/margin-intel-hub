// @ts-nocheck
// Vitest runs on Vite, which loads the registry with import.meta.glob.
// Next's webpack build uses load-articles.ts and require.context instead.
import { assembleArticles } from '@/lib/analysis/sort-articles'
import type { AnalysisArticle } from '@/lib/analysis/types'

const modules = import.meta.glob('./registry/*.ts', { eager: true }) as Record<string, { entry: AnalysisArticle }>

export const ANALYSIS_ARTICLES: AnalysisArticle[] = assembleArticles(Object.values(modules).map(mod => mod.entry))
