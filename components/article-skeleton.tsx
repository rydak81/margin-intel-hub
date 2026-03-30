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
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] min-h-[350px] md:min-h-[400px] lg:min-h-[450px] relative">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-full max-w-3xl" />
          <Skeleton className="h-10 w-4/5 max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex justify-between items-center gap-4 pt-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
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
