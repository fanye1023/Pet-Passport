import { DashboardSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardSkeleton />
    </div>
  )
}
