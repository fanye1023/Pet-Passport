'use client'

import { useEffect, useRef } from 'react'
import { useCompanionOptional } from '@/components/ui/pet-companion'

interface ProfileCounts {
  vaccination_records?: number
  vaccination_docs?: number
  health_records?: number
  health_docs?: number
  insurance?: number
  vets?: number
  emergency_contacts?: number
  routines?: number
  foods?: number
  care_events?: number
  care_instructions?: number
  behavioral_notes?: number
}

interface UseProfileCheckConfig {
  counts: ProfileCounts | null
  enabled?: boolean
}

const CONCERN_MESSAGES = [
  "Looks like some info is missing!",
  "Let's fill in the blanks!",
  "Adding more info helps a lot!",
  "Some sections need attention",
]

const PRIORITY_CHECKS = [
  { key: 'emergency_contacts', message: 'Emergency contacts are important!' },
  { key: 'vaccination_records', message: 'Vaccinations keep pets safe!' },
  { key: 'vets', message: 'Add your vet\'s info!' },
] as const

/**
 * Shows "concerned" mood when critical pet profile items are missing.
 * Use on pet detail pages where counts data is available.
 */
export function useCompanionProfileCheck({ counts, enabled = true }: UseProfileCheckConfig) {
  const companion = useCompanionOptional()
  const hasShownRef = useRef(false)
  const companionRef = useRef(companion)

  // Keep ref updated
  useEffect(() => {
    companionRef.current = companion
  }, [companion])

  useEffect(() => {
    const currentCompanion = companionRef.current
    if (!enabled || !currentCompanion || !counts || hasShownRef.current) return
    if (!currentCompanion.state.isVisible) return

    // Check for missing critical items
    const missingPriority = PRIORITY_CHECKS.find(check => {
      const value = counts[check.key as keyof ProfileCounts]
      return value === 0 || value === undefined
    })

    if (missingPriority) {
      // Delay to not interrupt initial load
      const timeout = setTimeout(() => {
        companionRef.current?.setMood('concerned')

        // Show specific message after a moment
        setTimeout(() => {
          companionRef.current?.showMessage(missingPriority.message, 5000)
        }, 1000)

        // Return to idle after showing concern
        setTimeout(() => {
          companionRef.current?.setMood('idle')
        }, 6000)

        hasShownRef.current = true
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [counts, enabled])

  // Reset when navigating away
  useEffect(() => {
    return () => {
      hasShownRef.current = false
    }
  }, [])
}

/**
 * Check if profile needs attention based on counts.
 * Returns missing item types.
 */
export function getProfileGaps(counts: ProfileCounts | null): string[] {
  if (!counts) return []

  const gaps: string[] = []

  if (!counts.emergency_contacts) gaps.push('emergency contacts')
  if (!counts.vaccination_records && !counts.vaccination_docs) gaps.push('vaccinations')
  if (!counts.vets) gaps.push('vet info')
  if (!counts.health_records && !counts.health_docs) gaps.push('health records')

  return gaps
}
