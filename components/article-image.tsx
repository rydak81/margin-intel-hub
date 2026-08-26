"use client"

import { getArticleFallbackImage } from "@/lib/article-images"

interface ArticleImageProps {
  src: string | null | undefined
  alt: string
  title: string
  category: string
  platforms?: string[]
  className?: string
  /** Set for above-the-fold hero images. */
  eager?: boolean
}

/**
 * Article image with a guaranteed render.
 *
 * Deliberately a plain <img>, not next/image: article images come from
 * arbitrary RSS-source origins, and routing those through the Vercel image
 * optimizer turns every hotlink-protected or dead origin into a hard 400 with
 * no recovery (next/image also emits a srcSet, which makes swapping src in
 * onError a no-op). A plain <img> loads what it can, and onError swaps in a
 * deterministic stock fallback — so a card never renders broken or empty.
 *
 * referrerPolicy="no-referrer" avoids the most common hotlink-protection
 * trigger in the first place.
 */
export function ArticleImage({
  src,
  alt,
  title,
  category,
  platforms = [],
  className = "",
  eager = false,
}: ArticleImageProps) {
  const fallback = getArticleFallbackImage(title, category, platforms)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || fallback}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      referrerPolicy="no-referrer"
      onError={(event) => {
        const target = event.currentTarget
        if (target.src !== fallback) target.src = fallback
      }}
    />
  )
}
