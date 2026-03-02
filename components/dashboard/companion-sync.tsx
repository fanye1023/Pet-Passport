'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (companion) {
      companion.setPet(species, breed, name)
    }
  }, [companion, species, breed, name])

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
