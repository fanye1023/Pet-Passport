'use client'

import { useState } from 'react'
import { Home } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingStep } from '../onboarding-step'
import { createClient } from '@/lib/supabase/client'

interface StepSitterProps {
  petId: string
  petSpecies: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep?: boolean
}

export function StepSitter({ petId, petSpecies, onComplete, onSkip, onBack, isFirstStep, isLastStep }: StepSitterProps) {
  const [fearsAndTriggers, setFearsAndTriggers] = useState('')
  const [temperament, setTemperament] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!fearsAndTriggers.trim() && !temperament.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('behavioral_notes').insert({
      pet_id: petId,
      fears_and_triggers: fearsAndTriggers.trim() || null,
      temperament: temperament.trim() || null,
    })

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  const isDog = petSpecies?.toLowerCase() === 'dog'

  return (
    <OnboardingStep
      icon={Home}
      title="Sitter Info"
      description="Helpful info for pet sitters or boarders (Optional)"
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={fearsAndTriggers.trim().length > 0 || temperament.trim().length > 0}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="temperament" className="text-sm">Temperament</Label>
          <Textarea
            id="temperament"
            placeholder={isDog
              ? 'e.g., Friendly but shy with strangers, loves belly rubs'
              : 'e.g., Independent, likes to hide when nervous'}
            value={temperament}
            onChange={(e) => setTemperament(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fears" className="text-sm">Fears & Triggers</Label>
          <Textarea
            id="fears"
            placeholder={isDog
              ? 'e.g., Thunder, vacuum cleaner, skateboards'
              : 'e.g., Loud noises, being picked up suddenly'}
            value={fearsAndTriggers}
            onChange={(e) => setFearsAndTriggers(e.target.value)}
            rows={2}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          You can add more sitter details later including house access info.
        </p>
      </div>
    </OnboardingStep>
  )
}
