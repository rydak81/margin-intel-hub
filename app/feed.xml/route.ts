import { buildRssFeed } from '@/lib/rss-feed'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildRssFeed(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
