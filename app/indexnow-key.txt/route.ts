import { validIndexNowKey } from '@/lib/indexnow'

// Serves the IndexNow ownership key from the INDEXNOW_KEY environment variable. No key is
// stored in the repo. Submit URLs with keyLocation=https://marketplacebeta.com/indexnow-key.txt.
// Returns 404 until the variable is set to a valid key.
export const dynamic = 'force-dynamic'

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!validIndexNowKey(key)) return new Response('Not found', { status: 404 })
  return new Response(key, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
}
