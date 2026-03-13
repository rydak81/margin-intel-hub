import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { ClassifiedArticle } from './ai-classifier'

// Search result schema
const SearchResultSchema = z.object({
  answer: z.string(),
  relevant_article_indices: z.array(z.number()),
  suggested_queries: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low'])
})

export type SearchResult = z.infer<typeof SearchResultSchema>

export interface AISearchResponse {
  answer: string
  articles: ClassifiedArticle[]
  suggestedQueries: string[]
  confidence: 'high' | 'medium' | 'low'
  query: string
}

const SEARCH_SYSTEM_PROMPT = `You are the search engine for Ecom Intel Hub, a marketplace 
seller intelligence platform. When a user searches, find the most relevant 
articles from the provided article list AND synthesize a brief answer.

Your audience is: Amazon/Walmart/eBay sellers, e-commerce brand operators, marketplace 
agencies, SaaS tool providers, and e-commerce investors.

When analyzing the query:
1. Understand the user's intent - are they looking for news, tactics, fees, policies, tools?
2. Find articles that directly address their question
3. Synthesize a helpful answer based on the available articles
4. Suggest related queries they might find useful

Be specific and actionable in your answers. If an article mentions specific numbers, 
fees, or dates, include those in your answer.`

/**
 * Perform AI-powered search across classified articles
 */
export async function aiSearch(
  query: string, 
  articles: ClassifiedArticle[]
): Promise<AISearchResponse> {
  // Limit to top 100 articles to save tokens
  const searchableArticles = articles.slice(0, 100)
  
  // Build article context (titles and summaries to save tokens)
  const articleContext = searchableArticles.map((a, i) => 
    `[${i}] ${a.title} (${a.sourceName}, ${a.category}) - ${a.aiSummary || a.summary}`
  ).join('\n')

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-haiku-4-5-20251001',
      system: SEARCH_SYSTEM_PROMPT,
      prompt: `User search query: "${query}"

Available articles:
${articleContext}

Find the most relevant articles and synthesize an answer. Return JSON with:
- answer: A 2-3 sentence synthesis answering the user's question based on the articles
- relevant_article_indices: Array of article indices (numbers) that are genuinely relevant
- suggested_queries: 2-3 related queries the user might find useful
- confidence: "high" if strong matches found, "medium" if partial matches, "low" if no good matches`,
      output: Output.object({ schema: SearchResultSchema }),
      maxOutputTokens: 2000,
    })

    if (!output) {
      return {
        answer: "I couldn't process your search. Please try a different query.",
        articles: [],
        suggestedQueries: ['Amazon FBA fee changes', 'Marketplace seller news', 'E-commerce trends'],
        confidence: 'low',
        query
      }
    }

    // Map indices back to full article objects
    const relevantArticles = (output.relevant_article_indices || [])
      .map(i => searchableArticles[i])
      .filter(Boolean)

    return {
      answer: output.answer || '',
      articles: relevantArticles,
      suggestedQueries: output.suggested_queries || [],
      confidence: output.confidence || 'low',
      query
    }
  } catch (error) {
    console.error('[v0] AI search failed:', error)
    return {
      answer: "Search is temporarily unavailable. Please try again.",
      articles: [],
      suggestedQueries: ['Amazon seller news', 'Marketplace updates', 'E-commerce trends'],
      confidence: 'low',
      query
    }
  }
}

// Example queries for the search UI
export const EXAMPLE_SEARCH_QUERIES = [
  "Latest Amazon fee changes",
  "TikTok Shop seller growth",
  "E-commerce M&A this month",
  "Best practices for Walmart sellers",
  "Retail media network trends",
  "Supply chain disruptions affecting sellers"
]
