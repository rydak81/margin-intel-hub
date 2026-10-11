import { unstable_cache } from 'next/cache'
import { buildManufacturingSnapshot } from '@/lib/manufacturing-feeds'
// Isolated public-feed cache. Does not mix manufacturing into the commerce archive
// or spend AI/database credits. Each source has an independent timeout/error state.
export const loadManufacturingSnapshot = unstable_cache(
  () => buildManufacturingSnapshot(), ['desktop-manufacturing-v2'], { revalidate: 1800 },
)
