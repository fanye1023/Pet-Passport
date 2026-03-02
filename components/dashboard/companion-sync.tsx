'use client'

import { useEffect, useRef } from 'react'
import { useCompanionOptional } from '@/components/ui/pet-companion'

interface CompanionSyncProps {
  species: string
  breed: string | null
  name: string
}

/**
 * Syncs the pet companion mascot with the current pet being viewed.
 * Place this component on any pet detail page to update the companion.
 */
export function CompanionSync({ species, breed, name }: CompanionSyncProps) {
  const companion = useCompanionOptional()
  const setPetRef = useRef(companion?.setPet)

  // Keep ref updated
  useEffect(() => {
    setPetRef.current = companion?.setPet
  }, [companion?.setPet])

  // Sync pet data - only triggers when pet info changes, not on companion state changes
  useEffect(() => {
    setPetRef.current?.(species, breed, name)
  }, [species, breed, name])

  // This component doesn't render anything
  return null
}

/**
 * Hook to trigger companion celebrations.
 * Can be called after successful save operations.
 */
export function useCompanionCelebrate() {
  const companion = useCompanionOptional()

  return {
    celebrate: () => companion?.celebrate(),
    showMessage: (message: string, duration?: number) => companion?.showMessage(message, duration),
    think: () => companion?.think(),
    setMood: (mood: 'idle' | 'happy' | 'excited' | 'sleeping' | 'thinking' | 'concerned') =>
      companion?.setMood(mood),
  }
}
