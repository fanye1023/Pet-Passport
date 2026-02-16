'use client'

import { Badge } from '@/components/ui/badge'
import { ClaimStatus } from '@/lib/types/pet'
import { cn } from '@/lib/utils'

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  not_submitted: {
    label: 'Not Submitted',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  },
  denied: {
    label: 'Denied',
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  },
}

interface ClaimStatusBadgeProps {
  status: ClaimStatus
  className?: string
}

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

// Helper to get status options for select
export const claimStatusOptions = [
  { value: 'not_submitted', label: 'Not Submitted' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'paid', label: 'Paid' },
]
