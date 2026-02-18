'use client'

import { ReactNode } from 'react'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'

interface DashboardWrapperProps {
  children: ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  return (
    <PullToRefresh>
      <div className="animate-fade-in">
        {children}
      </div>
    </PullToRefresh>
  )
}
