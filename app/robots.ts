import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplacebeta.com'

// A named user-agent group REPLACES the "*" group for that crawler (RFC 9309), so every
// group repeats the same private-path disallows. Keep them in one list.
export const DISALLOW = ['/api/', '/admin/', '/preview/']

// Search and user-triggered retrieval bots: they fetch pages to answer a question and can cite us.
export const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'Googlebot']

// Training / data-use control tokens. Allowed on purpose: the content is public and sourced,
// and we want to be the reference for marketplace fees. Change here to opt out.
export const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_SEARCH_BOTS, allow: '/', disallow: DISALLOW },
      { userAgent: AI_TRAINING_BOTS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
