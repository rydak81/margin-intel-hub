import { NextResponse } from 'next/server'

const anthropicKey = process.env.ANTHROPIC_API_KEY

export async function POST(request: Request) {
  if (!anthropicKey) {
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return NextResponse.json({ error: `AI generation failed: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const post = data.content?.[0]?.text || ''

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
