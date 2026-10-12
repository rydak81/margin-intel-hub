'use client'

import { manufacturingFallbackCover, type ManufacturingProcess } from '@/lib/manufacturing'

/**
 * Cover image for a manufacturing story. Publisher feed images come from
 * arbitrary CDN origins, so this is a plain <img> (not next/image) with an
 * onError swap to the branded per-process fallback cover — a card or brief
 * hero never renders broken or empty. Mirrors ArticleImage on the news desk.
 */
export function ManufacturingCover({
  src,
  process,
  alt,
  className = '',
  eager = false,
}: {
  src: string | null
  process: ManufacturingProcess
  alt: string
  className?: string
  eager?: boolean
}) {
  const fallback = manufacturingFallbackCover(process)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || fallback}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      onError={(event) => {
        const target = event.currentTarget
        if (!target.src.endsWith(fallback)) target.src = fallback
      }}
    />
  )
}
