import { unstable_cache } from 'next/cache'
import { buildManufacturingSnapshot } from '@/lib/manufacturing-feeds'
// Isolated public-feed cache. Does not mix manufacturing into the commerce archive
// or spend AI/database credits. Each source has an independent timeout/error state.
// Bump the cache key on every ManufacturingStory schema change: a warm persistent
// Data Cache entry under the old key would otherwise serve stories missing the new
// fields until revalidation (e.g. cards linking to /story/undefined).
export const loadManufacturingSnapshot = unstable_cache(
  () => buildManufacturingSnapshot(), ['desktop-manufacturing-v3'], { revalidate: 1800 },
)
