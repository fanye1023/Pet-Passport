import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero skeleton */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="h-32 w-32 rounded-full skeleton-shimmer" />
            <Skeleton className="h-10 w-40 mt-4 skeleton-shimmer" />
            <Skeleton className="h-5 w-32 mt-2 skeleton-shimmer" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-24 rounded-full skeleton-shimmer" />
              <Skeleton className="h-6 w-28 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto max-w-5xl py-6 px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 skeleton-shimmer" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full skeleton-shimmer" />
              <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-4 w-1/2 skeleton-shimmer" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28 skeleton-shimmer" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full skeleton-shimmer" />
              <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
