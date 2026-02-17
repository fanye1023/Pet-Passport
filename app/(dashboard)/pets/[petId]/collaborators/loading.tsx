import { PageHeaderSkeleton, ListSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <ListSkeleton count={3} />
    </div>
  )
}
