'use client'

import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumBadgeProps {
  className?: string
  size?: 'sm' | 'md'
}

export function PremiumBadge({ className, size = 'sm' }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
        'text-amber-700 dark:text-amber-400',
        'border border-amber-500/30',
        sizeClasses[size],
        className
      )}
    >
      <Crown className={iconSize[size]} />
      Premium
    </span>
  )
}
