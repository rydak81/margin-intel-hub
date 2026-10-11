"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="flex flex-col">
        <Skeleton className="h-48 w-full rounded-none" />
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function FeaturedArticleSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2" aria-label="Loading lead story" role="status">
      <Skeleton className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-[380px]" />
      <div className="space-y-5 p-6 sm:p-8 lg:p-10">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

export function HeroArticleSkeleton() {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="relative w-full h-[300px] md:h-[400px] rounded-xl">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </Card>
    </section>
  )
}

export function CompactNewsletterSkeleton() {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-40 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MarketSnapshotSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function SidebarCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-36" />
        </div>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}
