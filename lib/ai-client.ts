// Centralized AI client using Vercel AI Gateway
// Routes through gateway for automatic failover and monitoring
// Falls back to direct Anthropic if gateway key not configured
//
// Multi-model support:
//   - "fast"   → Haiku  (classification, tagging, quick tasks)
//   - "deep"   → Sonnet (editorial analysis, daily briefs, content generation)

type ModelTier = 'fast' | 'deep'

const MODEL_MAP: Record<ModelTier, { gateway: string; direct: string }> = {
  fast: {
    gateway: 'anthropic/claude-haiku-4-5-20251001',
    direct: 'claude-haiku-4-5-20251001',
  },
  deep: {
    gateway: 'anthropic/claude-sonnet-4-20250514',
    direct: 'claude-sonnet-4-20250514',
  },
}

interface AIRequestOptions {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  expectJSON?: boolean
  /** Model tier: "fast" (Haiku) or "deep" (Sonnet). Defaults to "fast". */
  tier?: ModelTier
}

interface AIResponse {
  text: string
  provider: string
  model: string
  tier: ModelTier
}

// Strip markdown code fences from AI responses (Claude sometimes wraps JSON in ```json blocks)
function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }
  return cleaned.trim()
}

export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const tier: ModelTier = options.tier || 'fast'

  // Determine which endpoint to use
  const useGateway = !!gatewayKey
  const baseUrl = useGateway
    ? 'https://ai-gateway.vercel.sh'
    : 'https://api.anthropic.com'
  const apiKey = useGateway ? gatewayKey : anthropicKey
  const model = useGateway
    ? MODEL_MAP[tier].gateway
    : MODEL_MAP[tier].direct

  if (!apiKey) {
    throw new Error('No AI API key configured. Set AI_GATEWAY_API_KEY or ANTHROPIC_API_KEY.')
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: options.maxTokens || 2048,
    messages: [{ role: 'user', content: options.prompt }]
  }

  if (options.systemPrompt) {
    body.system = options.systemPrompt
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': apiKey
  }

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`AI API ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  let text = data.content?.[0]?.text || ''

  if (options.expectJSON) {
    text = stripMarkdownFences(text)
  }

  return {
    text,
    provider: useGateway ? 'vercel-gateway' : 'anthropic-direct',
    model,
    tier,
  }
}

// Convenience: Call AI and parse the JSON response
export async function callAIForJSON<T = unknown>(
  options: Omit<AIRequestOptions, 'expectJSON'>
): Promise<{ data: T; provider: string; model: string; tier: ModelTier }> {
  const response = await callAI({ ...options, expectJSON: true })

  try {
    const data = JSON.parse(response.text) as T
    return { data, provider: response.provider, model: response.model, tier: response.tier }
  } catch (parseError) {
    throw new Error(
      `Failed to parse AI response as JSON (provider: ${response.provider}): ${response.text.substring(0, 300)}`
    )
  }
}
