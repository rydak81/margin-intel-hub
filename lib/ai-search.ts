import type { ClassifiedArticle } from './ai-classifier'
import { aiComplete, parseAIJson } from './ai-providers'

export interface SearchResult {
  answer: string
  relevant_article_indices: number[]
  suggested_queries: string[]
  confidence: 'high' | 'medium' | 'low'
}

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
3. Synthesize a helpful answer based on the available articles — be specific with numbers, dates, and platform names
4. Suggest related queries they might find useful
5. Connect findings to broader marketplace trends when possible

Be specific and actionable in your answers. If an article mentions specific numbers,
fees, or dates, include those in your answer. Write like a knowledgeable analyst, not
a generic chatbot.`

/**
 * Perform AI-powered search across classified articles.
 * Uses the best available AI provider with automatic fallback.
 */
export async function aiSearch(
  query: string,
  articles: ClassifiedArticle[]
): Promise<AISearchResponse> {
  // Keyword search fallback (used when no AI providers are available)
  function keywordFallback(): AISearchResponse {
    const lowerQuery = query.toLowerCase()
    const matchedArticles = articles
      .filter(a =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.aiSummary?.toLowerCase().includes(lowerQuery) ||
        a.summary?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10)

    return {
      answer: matchedArticles.length > 0
        ? `Found ${matchedArticles.length} articles matching "${query}".`
        : `No articles found matching "${query}". Try a different search term.`,
      articles: matchedArticles,
      suggestedQueries: ['Amazon FBA fee changes', 'Marketplace seller news', 'E-commerce trends'],
      confidence: matchedArticles.length > 0 ? 'medium' : 'low',
      query
    }
  }

  // Limit to top 100 articles to save tokens
  const searchableArticles = articles.slice(0, 100)

  // Build article context (titles and summaries to save tokens)
  const articleContext = searchableArticles.map((a, i) =>
    `[${i}] ${a.title} (${a.sourceName}, ${a.category}) - ${a.aiSummary || a.summary}`
  ).join('\n')

  try {
    const result = await aiComplete({
      messages: [
        { role: 'system', content: SEARCH_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `User search query: "${query}"

Available articles:
${articleContext}

Find the most relevant articles and synthesize an answer. Return ONLY valid JSON with:
{
  "answer": "A 2-3 sentence synthesis answering the user's question based on the articles. Be specific — include numbers, dates, and platform names.",
  "relevant_article_indices": [0, 1, 2],
  "suggested_queries": ["query1", "query2", "query3"],
  "confidence": "high" or "medium" or "low"
}

Return ONLY the JSON object, no other text.`
        }
      ],
      maxTokens: 2000,
      purpose: `search: "${query}"`,
    })

    const output = parseAIJson<SearchResult>(result.text, 'object')
    if (!output) {
      throw new Error('Could not parse AI search response as JSON')
    }

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
    const msg = error instanceof Error ? error.message : String(error)

    if (msg === 'NO_AI_PROVIDER') {
      console.log('[AI] No AI providers for search — using keyword fallback')
      return keywordFallback()
    }

    console.error('[AI] AI search failed:', msg)
    return keywordFallback()
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
