import { NextResponse } from 'next/server'
import { callAI } from '@/lib/ai-client'

export async function POST(request: Request) {
  const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!hasAIKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const {
    title,
    aiSummary,
    ourTake,
    keyTakeaways,
    bottomLine,
    keyStat,
    category,
    platforms,
    articleUrl,
    style = 'thought_leadership',
    audience = 'agencies',
  } = await request.json()

  const styleInstructions: Record<string, string> = {
    thought_leadership: 'Write like a confident marketplace operator sharing a strategic takeaway with peers.',
    quick_take: 'Write like a concise hot take with punchy lines and fast insight.',
    data_driven: 'Lead with metrics, evidence, and implications for operators and executives.',
    story: 'Frame the post like a short narrative with a practical lesson at the end.',
  }

  const audienceInstructions: Record<string, string> = {
    agencies: 'Aim the post at agency leaders and client-facing marketplace consultants.',
    brands: 'Aim the post at in-house brand operators, ecommerce managers, and seller teams.',
    partners: 'Aim the post at SaaS, service, and ecosystem partners looking for commercial insight and conversation starters.',
  }

  const prompt = `Generate a professional LinkedIn post about this marketplace/ecommerce article. The post should be engaging, insightful, and position the sharer as a knowledgeable industry professional.

Article Title: ${title}
AI Summary: ${aiSummary || 'Not available'}
Analysis: ${ourTake || 'Not available'}
Key Takeaways: ${keyTakeaways ? keyTakeaways.join('; ') : 'Not available'}
Bottom Line: ${bottomLine || 'Not available'}
Key Stat: ${keyStat || 'Not available'}
Category: ${category || 'ecommerce'}
Platforms: ${platforms ? platforms.join(', ') : 'general'}
Post Style: ${style}
Audience: ${audience}

Requirements:
- Start with a strong hook
- Follow this structure: hook -> context -> hot take -> action -> CTA/question -> hashtags
- 150-250 words, 3-5 short paragraphs
- Include 1-2 relevant insights or hot takes
- End with a question or CTA to drive engagement
- Include 3-5 relevant hashtags at the end (e.g., #AmazonFBA #Ecommerce #WalmartMarketplace #RetailMedia #MarketplaceStrategy)
- Include the article URL at the end: ${articleUrl}
- Professional tone suitable for ecommerce executives, marketplace sellers, and agency leaders
- Do NOT use emojis excessively (1-2 max)
- Write in first person ("I" / "my take")
${styleInstructions[style] || styleInstructions.thought_leadership}
${audienceInstructions[audience] || audienceInstructions.agencies}

Return ONLY the LinkedIn post text, nothing else.`

  try {
    const { text: post } = await callAI({
      prompt,
      maxTokens: 1024
    })

    return NextResponse.json({ post, style, audience })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
