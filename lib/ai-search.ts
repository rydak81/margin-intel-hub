import type { ClassifiedArticle } from './ai-classifier'

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
3. Synthesize a helpful answer based on the available articles
4. Suggest related queries they might find useful

Be specific and actionable in your answers. If an article mentions specific numbers, 
fees, or dates, include those in your answer.`

/**
 * Perform AI-powered search across classified articles using direct Anthropic API
 */
export async function aiSearch(
  query: string, 
  articles: ClassifiedArticle[]
): Promise<AISearchResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // If no API key, return basic keyword search fallback
  if (!apiKey) {
    console.log('[v0] ANTHROPIC_API_KEY not set — using keyword search fallback')
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: SEARCH_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `User search query: "${query}"

Available articles:
${articleContext}

Find the most relevant articles and synthesize an answer. Return ONLY valid JSON with:
{
  "answer": "A 2-3 sentence synthesis answering the user's question based on the articles",
  "relevant_article_indices": [0, 1, 2],
  "suggested_queries": ["query1", "query2", "query3"],
  "confidence": "high" or "medium" or "low"
}

Return ONLY the JSON object, no other text.`
        }]
      })
    })

    if (!response.ok) {
      console.error(`[v0] Anthropic API error ${response.status}`)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || '{}'

    // Strip markdown fences and parse the JSON response
    const text = rawText.replace(/```json\n?|```\n?/g, '').trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON')
    }

    const output = JSON.parse(jsonMatch[0]) as SearchResult

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
