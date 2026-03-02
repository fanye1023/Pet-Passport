'use client'

import { useCompanionTips } from '@/hooks/use-companion-tips'

/**
 * Invisible component that enables companion tips on dashboard pages.
 * Place this in layouts or pages where you want the companion to show tips.
 */
export function CompanionTips() {
  // Enable tips with default config
  useCompanionTips({
    enabled: true,
    minDelay: 8000, // Show first tip after 8-20 seconds
    maxDelay: 20000,
    tipInterval: 90000, // 1.5 minutes between tips
    maxTipsPerSession: 2, // Max 2 tips per page visit
  })

  return null
}
