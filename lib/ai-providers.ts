/**
 * Multi-Provider AI Abstraction Layer
 *
 * Supports multiple AI providers with automatic fallback:
 *   1. Google Gemini Flash  — cheapest ($0.10/$0.40 per MTok), great for dev/testing
 *   2. Anthropic Claude Haiku — best quality/cost ratio for classification
 *   3. OpenAI GPT-4o-mini   — solid fallback, widely available
 *
 * Configuration via environment variables:
 *   AI_PROVIDER=gemini|anthropic|openai|auto   (default: "auto")
 *   AI_STRATEGY=cheapest|best|balanced          (default: "cheapest")
 *   ANTHROPIC_API_KEY=...
 *   GOOGLE_AI_API_KEY=...
 *   OPENAI_API_KEY=...
 *
 * "auto" mode tries providers in order based on strategy and available API keys.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionRequest {
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
  /** What this request is for (used for logging) */
  purpose?: string
}

export interface AICompletionResponse {
  text: string
  provider: string
  model: string
  /** Time in ms for the API call */
  latencyMs: number
}

interface ProviderConfig {
  name: string
  model: string
  apiKeyEnv: string
  costPer1kInput: number
  costPer1kOutput: number
  qualityRank: number // 1 = best
}

// ============================================================================
// PROVIDER CONFIGURATIONS (ranked by cost, March 2026)
// ============================================================================

const PROVIDERS: Record<string, ProviderConfig> = {
  // Vercel AI Gateway - zero config, uses connected gateway
  vercel: {
    name: 'Vercel AI Gateway',
    model: 'anthropic/claude-opus-4.6',
    apiKeyEnv: 'VERCEL_AI_GATEWAY', // Special: always available in Vercel projects
    costPer1kInput: 0.0003,
    costPer1kOutput: 0.0015,
    qualityRank: 1,
  },
  gemini: {
    name: 'Google Gemini',
    model: 'gemini-2.0-flash',
    apiKeyEnv: 'GOOGLE_AI_API_KEY',
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    qualityRank: 4,
  },
  anthropic: {
    name: 'Anthropic Claude',
    model: 'claude-haiku-4-5-20251001',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
    qualityRank: 2,
  },
  openai: {
    name: 'OpenAI',
    model: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    qualityRank: 3,
  },
}

// ============================================================================
// PROVIDER RESOLUTION
// ============================================================================

type Strategy = 'cheapest' | 'best' | 'balanced'

function getAvailableProviders(): string[] {
  return Object.entries(PROVIDERS)
    .filter(([id, config]) => {
      // Vercel AI Gateway is always available in Vercel projects
      if (id === 'vercel') {
        return process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
      }
      return !!process.env[config.apiKeyEnv]
    })
    .map(([id]) => id)
}

function getProviderOrder(strategy: Strategy): string[] {
  const available = getAvailableProviders()

  switch (strategy) {
    case 'cheapest':
      return available.sort(
        (a, b) => PROVIDERS[a].costPer1kOutput - PROVIDERS[b].costPer1kOutput
      )
    case 'best':
      return available.sort(
        (a, b) => PROVIDERS[a].qualityRank - PROVIDERS[b].qualityRank
      )
    case 'balanced':
      // Anthropic first (best balance), then cheapest fallback
      return available.sort((a, b) => {
        if (a === 'anthropic') return -1
        if (b === 'anthropic') return 1
        return PROVIDERS[a].costPer1kOutput - PROVIDERS[b].costPer1kOutput
      })
    default:
      return available
  }
}

function resolveProviderChain(): string[] {
  const explicit = process.env.AI_PROVIDER?.toLowerCase()
  const strategy = (process.env.AI_STRATEGY?.toLowerCase() || 'cheapest') as Strategy

  // If a specific provider is requested, use it first with fallbacks
  if (explicit && explicit !== 'auto' && PROVIDERS[explicit]) {
    const apiKey = process.env[PROVIDERS[explicit].apiKeyEnv]
    if (apiKey) {
      const others = getProviderOrder(strategy).filter(p => p !== explicit)
      return [explicit, ...others]
    }
    console.warn(`[AI] Requested provider "${explicit}" but ${PROVIDERS[explicit].apiKeyEnv} not set`)
  }

  // Auto mode: order by strategy
  const chain = getProviderOrder(strategy)

  if (chain.length === 0) {
    console.warn('[AI] No AI provider API keys configured. Set ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, or OPENAI_API_KEY.')
  }

  return chain
}

// ============================================================================
// PROVIDER-SPECIFIC API CALLS
// ============================================================================

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  maxTokens: number
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const userMsgs = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemMsg?.content || '',
      messages: userMsgs.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (response.status === 429) throw new Error('RATE_LIMITED')
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (response.status === 429) throw new Error('RATE_LIMITED')
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenAI ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  maxTokens: number
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const userMsgs = messages.filter(m => m.role !== 'system')

  const contents = userMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMsg
          ? { parts: [{ text: systemMsg.content }] }
          : undefined,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3,
        },
      }),
    }
  )

  if (response.status === 429) throw new Error('RATE_LIMITED')
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/**
 * Vercel AI Gateway - uses the AI SDK under the hood
 * Zero config in Vercel projects, automatically available
 */
async function callVercelAIGateway(
  _apiKey: string,
  model: string,
  messages: AIMessage[],
  maxTokens: number
): Promise<string> {
  // Vercel AI Gateway uses OpenAI-compatible API format
  // It's available at the standard endpoint in Vercel deployments
  const response = await fetch('https://api.vercel.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // No API key needed - uses Vercel project auth
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (response.status === 429) throw new Error('RATE_LIMITED')
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Vercel AI Gateway ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

const CALLERS: Record<string, (apiKey: string, model: string, messages: AIMessage[], maxTokens: number) => Promise<string>> = {
  vercel: callVercelAIGateway,
  anthropic: callAnthropic,
  openai: callOpenAI,
  gemini: callGemini,
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Send a completion request to the best available AI provider.
 * Automatically falls through the provider chain on failure.
 */
export async function aiComplete(req: AICompletionRequest): Promise<AICompletionResponse> {
  const chain = resolveProviderChain()
  const maxTokens = req.maxTokens || 4000

  if (chain.length === 0) {
    throw new Error('NO_AI_PROVIDER')
  }

  let lastError: Error | null = null

  for (const providerId of chain) {
    const config = PROVIDERS[providerId]
    const apiKey = process.env[config.apiKeyEnv]
    if (!apiKey) continue

    const caller = CALLERS[providerId]
    if (!caller) continue

    const start = Date.now()

    try {
      const text = await caller(apiKey, config.model, req.messages, maxTokens)
      const latencyMs = Date.now() - start

      console.log(
        `[AI] ${config.name} (${config.model}) — ${req.purpose || 'request'} — ${latencyMs}ms`
      )

      return { text, provider: providerId, model: config.model, latencyMs }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const latencyMs = Date.now() - start
      console.warn(
        `[AI] ${config.name} failed (${latencyMs}ms): ${lastError.message}${
          chain.indexOf(providerId) < chain.length - 1 ? ' — trying next provider...' : ''
        }`
      )

      // For rate limits, add a small delay before trying next provider
      if (lastError.message === 'RATE_LIMITED') {
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  }

  throw lastError || new Error('All AI providers failed')
}

/**
 * Check which AI providers are currently available.
 */
export function getAvailableProviderInfo(): Array<{
  id: string
  name: string
  model: string
  available: boolean
  costTier: 'low' | 'medium' | 'high'
}> {
  return Object.entries(PROVIDERS).map(([id, config]) => ({
    id,
    name: config.name,
    model: config.model,
    available: !!process.env[config.apiKeyEnv],
    costTier: config.costPer1kOutput < 0.0005 ? 'low' : config.costPer1kOutput < 0.001 ? 'medium' : 'high',
  }))
}

/**
 * Parse JSON from AI response text, handling markdown fences and partial output.
 */
export function parseAIJson<T = unknown>(text: string, type: 'array' | 'object' = 'object'): T | null {
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
  const pattern = type === 'array' ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/
  const match = cleaned.match(pattern)
  if (!match) return null

  try {
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}

/**
 * Get the current AI strategy description for logging/display.
 */
export function getAIStrategyDescription(): string {
  const strategy = process.env.AI_STRATEGY || 'cheapest'
  const chain = resolveProviderChain()
  const names = chain.map(id => `${PROVIDERS[id].name} (${PROVIDERS[id].model})`)
  return `Strategy: ${strategy} | Chain: ${names.join(' → ') || 'none (keyword fallback)'}`
}
