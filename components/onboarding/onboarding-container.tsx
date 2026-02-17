'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Stethoscope, Syringe, Phone, Utensils, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingProgress } from './onboarding-progress'
import { PetMascot } from './pet-mascot'
import { Confetti } from './confetti'
import { StepVet } from './steps/step-vet'
import { StepVaccination } from './steps/step-vaccination'
import { StepEmergency } from './steps/step-emergency'
import { StepFood } from './steps/step-food'
import { StepRoutine } from './steps/step-routine'
import { StepInsurance } from './steps/step-insurance'
import { StepComplete } from './steps/step-complete'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface OnboardingContainerProps {
  petId: string
  petName: string
  petSpecies: string
}

const STEPS = [
  { id: 'vet', title: 'Vet', icon: Stethoscope },
  { id: 'vaccination', title: 'Vaccines', icon: Syringe },
  { id: 'emergency', title: 'Emergency', icon: Phone },
  { id: 'food', title: 'Food', icon: Utensils },
  { id: 'routine', title: 'Routine', icon: Clock },
  { id: 'insurance', title: 'Insurance', icon: Shield },
]

interface OnboardingState {
  completedSteps: number[]
  skippedSteps: number[]
}

// Database operations for onboarding progress
async function loadStateFromDB(petId: string, supabase: ReturnType<typeof createClient>): Promise<OnboardingState | null> {
  const { data } = await supabase
    .from('onboarding_progress')
    .select('completed_steps, skipped_steps')
    .eq('pet_id', petId)
    .single()

  if (data) {
    return {
      completedSteps: data.completed_steps || [],
      skippedSteps: data.skipped_steps || []
    }
  }
  return null
}

async function saveStateToDB(
  petId: string,
  state: OnboardingState,
  currentStep: number,
  isCompleted: boolean,
  supabase: ReturnType<typeof createClient>
) {
  await supabase
    .from('onboarding_progress')
    .upsert({
      pet_id: petId,
      current_step: currentStep,
      completed_steps: state.completedSteps,
      skipped_steps: state.skippedSteps,
      is_completed: isCompleted,
      updated_at: new Date().toISOString()
    }, { onConflict: 'pet_id' })
}

async function markCompleteInDB(petId: string, supabase: ReturnType<typeof createClient>) {
  await supabase
    .from('onboarding_progress')
    .upsert({
      pet_id: petId,
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'pet_id' })
}

export function OnboardingContainer({ petId, petName, petSpecies }: OnboardingContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [skippedSteps, setSkippedSteps] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'excited' | 'celebrating'>('idle')
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check database for existing data and load state
  useEffect(() => {
    async function checkExistingData() {
      const supabase = createClient()

      // Check each category for existing data
      const [
        { count: vetCount },
        { count: vaccinationCount },
        { count: vaccinationDocCount },
        { count: emergencyCount },
        { count: foodCount },
        { count: routineCount },
        { count: insuranceCount },
      ] = await Promise.all([
        supabase.from('veterinarians').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('vaccination_records').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('pet_documents').select('*', { count: 'exact', head: true }).eq('pet_id', petId).eq('category', 'vaccination'),
        supabase.from('emergency_contacts').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('food_preferences').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('daily_routines').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('pet_insurance').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
      ])

      // Determine which steps are already completed based on existing data
      const existingCompleted: number[] = []
      if ((vetCount ?? 0) > 0) existingCompleted.push(0)
      if ((vaccinationCount ?? 0) + (vaccinationDocCount ?? 0) > 0) existingCompleted.push(1)
      if ((emergencyCount ?? 0) > 0) existingCompleted.push(2)
      if ((foodCount ?? 0) > 0) existingCompleted.push(3)
      if ((routineCount ?? 0) > 0) existingCompleted.push(4)
      if ((insuranceCount ?? 0) > 0) existingCompleted.push(5)

      // Load database state and merge with existing data
      const dbState = await loadStateFromDB(petId, supabase)
      const savedCompleted = dbState?.completedSteps || []
      const savedSkipped = dbState?.skippedSteps || []
      const mergedCompleted = [...new Set([...existingCompleted, ...savedCompleted])]

      setCompletedSteps(mergedCompleted)
      setSkippedSteps(savedSkipped)

      // Get step from URL or find first incomplete step
      const urlStep = searchParams.get('step')
      if (urlStep) {
        const stepNum = parseInt(urlStep)
        if (!isNaN(stepNum) && stepNum >= 0 && stepNum < STEPS.length) {
          // Only go to URL step if it's not already completed
          if (!mergedCompleted.includes(stepNum)) {
            setCurrentStep(stepNum)
            setIsLoading(false)
            return
          }
        }
      }

      // Find first incomplete step
      const allDone = [...mergedCompleted, ...savedSkipped]
      const firstIncomplete = STEPS.findIndex((_, i) => !allDone.includes(i))
      if (firstIncomplete === -1) {
        // All steps done, show completion
        setIsComplete(true)
      } else {
        setCurrentStep(firstIncomplete)
      }
      setIsLoading(false)
    }

    checkExistingData()
  }, [petId, searchParams])

  // Update URL when step changes
  useEffect(() => {
    if (!isComplete) {
      const url = new URL(window.location.href)
      url.searchParams.set('step', currentStep.toString())
      window.history.replaceState({}, '', url.toString())
    }
  }, [currentStep, isComplete])

  const goToNextStep = useCallback(async () => {
    const allDone = [...completedSteps, ...skippedSteps]
    const nextIncomplete = STEPS.findIndex((_, i) => i > currentStep && !allDone.includes(i))

    if (nextIncomplete === -1) {
      // All steps done - mark complete in database
      const supabase = createClient()
      await markCompleteInDB(petId, supabase)
      setIsComplete(true)
      setMascotMood('celebrating')
      setShowConfetti(true)
    } else {
      setCurrentStep(nextIncomplete)
      setMascotMood('idle')
    }
  }, [completedSteps, skippedSteps, currentStep, petId])

  const handleStepComplete = useCallback(async () => {
    const newCompleted = [...completedSteps, currentStep]
    setCompletedSteps(newCompleted)

    // Save to database
    const supabase = createClient()
    await saveStateToDB(petId, { completedSteps: newCompleted, skippedSteps }, currentStep, false, supabase)

    // Show celebration
    setMascotMood('excited')
    setShowConfetti(true)

    // Move to next after brief delay
    setTimeout(() => {
      goToNextStep()
    }, 1500)
  }, [completedSteps, currentStep, petId, skippedSteps, goToNextStep])

  const handleStepSkip = useCallback(async () => {
    const newSkipped = [...skippedSteps, currentStep]
    setSkippedSteps(newSkipped)

    // Save to database
    const supabase = createClient()
    await saveStateToDB(petId, { completedSteps, skippedSteps: newSkipped }, currentStep, false, supabase)

    goToNextStep()
  }, [completedSteps, currentStep, petId, skippedSteps, goToNextStep])

  const handleStepBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setMascotMood('idle')
    }
  }, [currentStep])

  const handleExit = async () => {
    // Save progress to database before exiting
    const supabase = createClient()
    await saveStateToDB(petId, { completedSteps, skippedSteps }, currentStep, false, supabase)
    router.push(`/pets/${petId}`)
  }

  const renderCurrentStep = () => {
    const isLast = currentStep === STEPS.length - 1
    const isFirst = currentStep === 0

    switch (STEPS[currentStep]?.id) {
      case 'vet':
        return (
          <StepVet
            petId={petId}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onBack={handleStepBack}
            isFirstStep={isFirst}
          />
        )
      case 'vaccination':
        return (
          <StepVaccination
            petId={petId}
            petSpecies={petSpecies}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onBack={handleStepBack}
            isFirstStep={isFirst}
          />
        )
      case 'emergency':
        return (
          <StepEmergency
            petId={petId}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onBack={handleStepBack}
            isFirstStep={isFirst}
          />
        )
      case 'food':
        return (
          <StepFood
            petId={petId}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onBack={handleStepBack}
            isFirstStep={isFirst}
          />
        )
      case 'routine':
        return (
          <StepRoutine
            petId={petId}
            petSpecies={petSpecies}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onBack={handleStepBack}
            isFirstStep={isFirst}
          />
        )
      case 'insurance':
        return (
          <StepInsurance
            petId={petId}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onBack={handleStepBack}
            isFirstStep={isFirst}
            isLastStep={isLast}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <PetMascot species={petSpecies} mood="idle" size="lg" />
        <p className="text-muted-foreground mt-4">Checking {petName}&apos;s profile...</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <>
        <Confetti trigger={showConfetti} intensity="high" onComplete={() => setShowConfetti(false)} />
        <StepComplete
          petId={petId}
          petName={petName}
          petSpecies={petSpecies}
          completedSteps={completedSteps}
          totalSteps={STEPS.length}
        />
      </>
    )
  }

  return (
    <>
      <Confetti trigger={showConfetti} intensity="medium" onComplete={() => setShowConfetti(false)} />

      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        {/* Header with exit button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">
            Setting up {petName}&apos;s profile
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <OnboardingProgress
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            skippedSteps={skippedSteps}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
          {/* Pet mascot - hidden on mobile, visible on larger screens */}
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:w-1/3">
            <PetMascot species={petSpecies} mood={mascotMood} size="lg" />
            <p className="text-center text-sm text-muted-foreground mt-4">
              {mascotMood === 'excited' ? "Great job! Let's keep going!" : `Hi! I'm ${petName}`}
            </p>
          </div>

          {/* Step content */}
          <div className="w-full max-w-md lg:w-2/3">
            {renderCurrentStep()}
          </div>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. You can continue setting up {petName}&apos;s profile anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Setup</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
