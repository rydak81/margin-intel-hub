import { NextResponse } from 'next/server'
import { callAI } from '@/lib/ai-client'

export async function POST(request: Request) {
  const hasAIKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!hasAIKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { title, aiSummary, ourTake, keyTakeaways, bottomLine, keyStat, category, platforms, articleUrl } = await request.json()

  const prompt = `Generate a professional LinkedIn post about this marketplace/ecommerce article. The post should be engaging, insightful, and position the sharer as a knowledgeable industry professional.

Article Title: ${title}
AI Summary: ${aiSummary || 'Not available'}
Analysis: ${ourTake || 'Not available'}
Key Takeaways: ${keyTakeaways ? keyTakeaways.join('; ') : 'Not available'}
Bottom Line: ${bottomLine || 'Not available'}
Key Stat: ${keyStat || 'Not available'}
Category: ${category || 'ecommerce'}
Platforms: ${platforms ? platforms.join(', ') : 'general'}

Requirements:
- Start with a hook (question, bold statement, or surprising stat)
- 150-250 words, 3-5 short paragraphs
- Include 1-2 relevant insights or hot takes
- End with a question to drive engagement
- Include 3-5 relevant hashtags at the end (e.g., #AmazonFBA #Ecommerce #WalmartMarketplace #RetailMedia #MarketplaceStrategy)
- Include the article URL at the end: ${articleUrl}
- Professional tone suitable for ecommerce executives, marketplace sellers, and agency leaders
- Do NOT use emojis excessively (1-2 max)
- Write in first person ("I" / "my take")

Return ONLY the LinkedIn post text, nothing else.`

  try {
    const { text: post } = await callAI({
      prompt,
      maxTokens: 1024
    })

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
