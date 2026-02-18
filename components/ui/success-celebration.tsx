'use client'

import { useEffect, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { AnimatedMascot } from '@/components/ui/animated-mascot'

interface SuccessCelebrationProps {
  show: boolean
  message?: string
  onComplete?: () => void
  showMascot?: boolean
  petSpecies?: string
}

export function SuccessCelebration({ show, message = 'Saved!', onComplete, showMascot = false, petSpecies = 'dog' }: SuccessCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, showMascot ? 2500 : 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete, showMascot])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Mini confetti burst */}
      <div className="absolute">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'][i % 5],
              animation: `confetti-burst 0.8s ease-out forwards`,
              animationDelay: `${i * 0.02}s`,
              transform: `rotate(${i * 30}deg) translateY(-20px)`,
            }}
          />
        ))}
      </div>

      {/* Mascot celebration */}
      {showMascot && (
        <div className="absolute -top-16 animate-bounce">
          <AnimatedMascot species={petSpecies} mood="excited" size="md" />
        </div>
      )}

      {/* Success badge */}
      <div className="animate-scale-in bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
        <span className="font-medium text-sm">{message}</span>
        <Sparkles className="h-4 w-4 opacity-80" />
      </div>
    </div>
  )
}

// Hook for triggering celebrations
export function useSuccessCelebration() {
  const [showCelebration, setShowCelebration] = useState(false)
  const [message, setMessage] = useState('Saved!')
  const [showMascot, setShowMascot] = useState(false)
  const [petSpecies, setPetSpecies] = useState('dog')

  const celebrate = (msg?: string, options?: { showMascot?: boolean; petSpecies?: string }) => {
    if (msg) setMessage(msg)
    if (options?.showMascot !== undefined) setShowMascot(options.showMascot)
    if (options?.petSpecies) setPetSpecies(options.petSpecies)
    setShowCelebration(true)
  }

  const reset = () => {
    setShowCelebration(false)
    setShowMascot(false)
  }

  return {
    showCelebration,
    message,
    celebrate,
    reset,
    CelebrationComponent: () => (
      <SuccessCelebration
        show={showCelebration}
        message={message}
        onComplete={reset}
        showMascot={showMascot}
        petSpecies={petSpecies}
      />
    ),
  }
}
