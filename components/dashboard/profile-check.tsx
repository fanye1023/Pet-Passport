'use client'

import { useCompanionProfileCheck } from '@/hooks/use-companion-profile-check'

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

interface ProfileCheckProps {
  counts: ProfileCounts | null
}

/**
 * Client component that triggers companion "concerned" mood
 * when pet profile has missing critical items.
 */
export function ProfileCheck({ counts }: ProfileCheckProps) {
  useCompanionProfileCheck({ counts, enabled: true })
  return null
}
