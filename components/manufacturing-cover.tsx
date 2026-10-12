'use client'

import { useEffect, useRef, useState } from 'react'
import { manufacturingFallbackCover, type ManufacturingProcess } from '@/lib/manufacturing'

/**
 * Cover image for a manufacturing story, served through Vercel's image
 * optimizer for resizing, sharp downscales, and AVIF/WebP delivery.
 *
 * Deliberately a plain <img> on the /_next/image URL rather than next/image:
 * publisher feed images come from arbitrary CDN origins, and the optimizer
 * returns a hard 400 for a hotlink-protected or dead origin. next/image has no
 * recovery from that (its srcSet makes swapping src in onError a no-op); a
 * plain <img> lets onError walk a fallback chain instead —
 * optimized URL → raw publisher URL → branded per-process cover — so a card
 * or hero never renders broken or empty.
 */
export function ManufacturingCover(props: {
  src: string | null
  process: ManufacturingProcess
  alt: string
  className?: string
  eager?: boolean
}) {
  // Key by source so the fallback chain resets when a card is reused for another story.
  return <CoverImage key={props.src ?? 'cover'} {...props} />
}

// q must be 75: Next's images.qualities defaults to [75] and the optimizer
// rejects any other value with a 400 unless the config allowlists it.
const optimized = (src: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`

function CoverImage({
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
  // 1920/1080 are in Next's default deviceSizes; an unlisted width would 400.
  const chain = src ? [optimized(src, eager ? 1920 : 1080), src, fallback] : [fallback]
  const [step, setStep] = useState(0)
  const ref = useRef<HTMLImageElement>(null)
  // A server-rendered <img> can fail before hydration attaches onError; catch
  // that case by checking the already-settled image after mount and advancing.
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) {
      setStep((current) => Math.min(current + 1, chain.length - 1))
    }
  }, [step, chain.length])
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={chain[Math.min(step, chain.length - 1)]}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      onError={() => setStep((current) => Math.min(current + 1, chain.length - 1))}
    />
  )
}
