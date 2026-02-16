import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function PetCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="h-16 w-16 rounded-full skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32 skeleton-shimmer" />
          <Skeleton className="h-4 w-24 skeleton-shimmer" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full skeleton-shimmer" />
            <Skeleton className="h-5 w-20 rounded-full skeleton-shimmer" />
          </div>
        </div>
        <Skeleton className="h-5 w-5 skeleton-shimmer" />
      </CardContent>
    </Card>
  )
}

export function RecordCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 skeleton-shimmer" />
            <Skeleton className="h-4 w-32 skeleton-shimmer" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded skeleton-shimmer" />
            <Skeleton className="h-8 w-8 rounded skeleton-shimmer" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full skeleton-shimmer" />
          <Skeleton className="h-5 w-16 rounded-full skeleton-shimmer" />
        </div>
        <Skeleton className="h-4 w-full skeleton-shimmer" />
      </CardContent>
    </Card>
  )
}

export function VetCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 skeleton-shimmer" />
            <Skeleton className="h-4 w-24 skeleton-shimmer" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded skeleton-shimmer" />
            <Skeleton className="h-8 w-8 rounded skeleton-shimmer" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Skeleton className="h-4 w-28 skeleton-shimmer" />
        <Skeleton className="h-4 w-36 skeleton-shimmer" />
        <Skeleton className="h-4 w-full skeleton-shimmer" />
      </CardContent>
    </Card>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 skeleton-shimmer" />
        <Skeleton className="h-10 w-full skeleton-shimmer" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 skeleton-shimmer" />
        <Skeleton className="h-10 w-full skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 skeleton-shimmer" />
          <Skeleton className="h-10 w-full skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 skeleton-shimmer" />
          <Skeleton className="h-10 w-full skeleton-shimmer" />
        </div>
      </div>
      <Skeleton className="h-10 w-full skeleton-shimmer" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 skeleton-shimmer" />
          <Skeleton className="h-4 w-48 skeleton-shimmer" />
        </div>
        <Skeleton className="h-10 w-24 skeleton-shimmer" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PetCardSkeleton />
        <PetCardSkeleton />
        <PetCardSkeleton />
      </div>
    </div>
  )
}
