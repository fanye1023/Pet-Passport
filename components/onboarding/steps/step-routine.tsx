'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { OnboardingStep } from '../onboarding-step'
import { RoutineItemCard, type RoutineFormData } from '@/components/routine/routine-item-card'
import { RoutineInlineForm } from '@/components/routine/routine-inline-form'
import { createClient } from '@/lib/supabase/client'

interface StepRoutineProps {
  petId: string
  petSpecies: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
}

export function StepRoutine({ petId, petSpecies, onComplete, onSkip, onBack, isFirstStep }: StepRoutineProps) {
  const [routines, setRoutines] = useState<RoutineFormData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAddRoutine = (routine: RoutineFormData) => {
    setRoutines((prev) => [...prev, routine])
  }

  const handleRemoveRoutine = (index: number) => {
    setRoutines((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (routines.length === 0) return

    setIsLoading(true)
    const supabase = createClient()

    const insertData = routines.map((routine) => ({
      pet_id: petId,
      routine_type: routine.routineType,
      time_of_day: routine.timeOfDay,
      duration_minutes: routine.durationMinutes,
      days_of_week: routine.daysOfWeek.length > 0 ? routine.daysOfWeek : null,
      description: routine.description || null,
    }))

    const { error } = await supabase.from('daily_routines').insert(insertData)

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  return (
    <OnboardingStep
      icon={Clock}
      title="Daily Routine"
      description="Add your pet's regular activities like walks, play time, or medication schedules."
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={routines.length > 0}
      isFirstStep={isFirstStep}
    >
      <div className="space-y-4">
        {routines.length > 0 && (
          <div className="space-y-2">
            {routines.map((routine, index) => (
              <RoutineItemCard
                key={index}
                routine={routine}
                onRemove={() => handleRemoveRoutine(index)}
              />
            ))}
          </div>
        )}

        <RoutineInlineForm
          petSpecies={petSpecies}
          onAdd={handleAddRoutine}
        />

        {routines.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Add at least one routine to continue, or skip this step.
          </p>
        )}
      </div>
    </OnboardingStep>
  )
}
