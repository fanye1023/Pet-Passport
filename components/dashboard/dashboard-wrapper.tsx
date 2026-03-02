'use client'

import { ReactNode } from 'react'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TourProvider } from '@/components/tour/tour-provider'
import { CompanionProvider } from '@/components/ui/pet-companion'
import { CompanionTips } from '@/components/dashboard/companion-tips'

interface DashboardWrapperProps {
  children: ReactNode
}

/**
 * Wraps the entire dashboard layout with providers.
 * TourProvider wraps everything so components like HelpButton can access tour context.
 * CompanionProvider enables the pet mascot companion feature.
 */
export function DashboardWrapper({ children }: DashboardWrapperProps) {
  return (
    <TooltipProvider>
      <TourProvider>
        <CompanionProvider>
          {children}
          <CompanionTips />
        </CompanionProvider>
      </TourProvider>
    </TooltipProvider>
  )
}

interface MainContentWrapperProps {
  children: ReactNode
}

/**
 * Wraps the main content area with pull-to-refresh and animations.
 */
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <PullToRefresh>
      <div className="animate-fade-in">
        {children}
      </div>
    </PullToRefresh>
  )
}
