'use client'

import { cn } from '@/lib/utils'
import { roleLabels, roleColors } from '@/lib/collaborators'
import type { CollaboratorRole } from '@/lib/types/pet'
import { Crown, Edit, Eye } from 'lucide-react'

interface RoleBadgeProps {
  role: CollaboratorRole
  size?: 'sm' | 'md'
  showIcon?: boolean
}

const roleIcons: Record<CollaboratorRole, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  editor: Edit,
  viewer: Eye
}

export function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
  const Icon = roleIcons[role]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        roleColors[role],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {roleLabels[role]}
    </span>
  )
}
