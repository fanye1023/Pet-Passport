'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { X, Sparkles, Check, Circle } from 'lucide-react'
import { Stethoscope, Syringe, Phone, Utensils, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PawPrint } from 'lucide-react'
import { AnimatedMascot } from '@/components/ui/animated-mascot'
import { Confetti } from './confetti'
import { StepVet } from './steps/step-vet'
import { StepVaccination } from './steps/step-vaccination'
import { StepEmergency } from './steps/step-emergency'
import { StepFood } from './steps/step-food'
import { StepRoutine } from './steps/step-routine'
import { StepInsurance } from './steps/step-insurance'
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

interface OnboardingContainerNewProps {
  petId: string
  petName: string
  petSpecies: string
  petPhotoUrl: string | null
}

const STEPS = [
  { id: 'vet', title: 'Vet Info', icon: Stethoscope, description: 'Where does your pet go for checkups?' },
  { id: 'vaccination', title: 'Vaccines', icon: Syringe, description: 'Keep vaccination records up to date' },
  { id: 'emergency', title: 'Emergency', icon: Phone, description: 'Who to call in case of emergency' },
  { id: 'food', title: 'Food & Diet', icon: Utensils, description: 'What does your pet eat?' },
  { id: 'routine', title: 'Routine', icon: Clock, description: 'Daily activities and schedule' },
  { id: 'insurance', title: 'Insurance', icon: Shield, description: 'Pet insurance information' },
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

export function OnboardingContainerNew({ petId, petName, petSpecies, petPhotoUrl }: OnboardingContainerNewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [skippedSteps, setSkippedSteps] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
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
      const supabase = createClient()
      await markCompleteInDB(petId, supabase)
      setIsComplete(true)
      setShowConfetti(true)
    } else {
      setCurrentStep(nextIncomplete)
    }
  }, [completedSteps, skippedSteps, currentStep, petId])

  const handleStepComplete = useCallback(async () => {
    const newCompleted = [...completedSteps, currentStep]
    setCompletedSteps(newCompleted)

    const supabase = createClient()
    await saveStateToDB(petId, { completedSteps: newCompleted, skippedSteps }, currentStep, false, supabase)

    setShowConfetti(true)

    setTimeout(() => {
      goToNextStep()
    }, 1200)
  }, [completedSteps, currentStep, petId, skippedSteps, goToNextStep])

  const handleStepSkip = useCallback(async () => {
    const newSkipped = [...skippedSteps, currentStep]
    setSkippedSteps(newSkipped)

    const supabase = createClient()
    await saveStateToDB(petId, { completedSteps, skippedSteps: newSkipped }, currentStep, false, supabase)

    goToNextStep()
  }, [completedSteps, currentStep, petId, skippedSteps, goToNextStep])

  const handleStepBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleExit = async () => {
    const supabase = createClient()
    await saveStateToDB(petId, { completedSteps, skippedSteps }, currentStep, false, supabase)
    router.push(`/pets/${petId}`)
  }

  const renderCurrentStep = () => {
    const isLast = currentStep === STEPS.length - 1
    const isFirst = currentStep === 0

    switch (STEPS[currentStep]?.id) {
      case 'vet':
        return <StepVet petId={petId} onComplete={handleStepComplete} onSkip={handleStepSkip} onBack={handleStepBack} isFirstStep={isFirst} />
      case 'vaccination':
        return <StepVaccination petId={petId} petSpecies={petSpecies} onComplete={handleStepComplete} onSkip={handleStepSkip} onBack={handleStepBack} isFirstStep={isFirst} />
      case 'emergency':
        return <StepEmergency petId={petId} onComplete={handleStepComplete} onSkip={handleStepSkip} onBack={handleStepBack} isFirstStep={isFirst} />
      case 'food':
        return <StepFood petId={petId} onComplete={handleStepComplete} onSkip={handleStepSkip} onBack={handleStepBack} isFirstStep={isFirst} />
      case 'routine':
        return <StepRoutine petId={petId} petSpecies={petSpecies} onComplete={handleStepComplete} onSkip={handleStepSkip} onBack={handleStepBack} isFirstStep={isFirst} />
      case 'insurance':
        return <StepInsurance petId={petId} onComplete={handleStepComplete} onSkip={handleStepSkip} onBack={handleStepBack} isFirstStep={isFirst} isLastStep={isLast} />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto text-center animate-fade-in">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex justify-center mb-4">
            <AnimatedMascot species={petSpecies} mood="thinking" size="lg" />
          </div>
          <Avatar className="h-16 w-16 mx-auto ring-4 ring-primary/20 mb-4">
            <AvatarImage src={petPhotoUrl || undefined} />
            <AvatarFallback className="bg-primary/10">
              <PawPrint className="h-8 w-8 text-primary/60" />
            </AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground animate-pulse">Loading {petName}&apos;s profile...</p>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <>
        <Confetti trigger={showConfetti} intensity="high" onComplete={() => setShowConfetti(false)} />
        <div className="w-full max-w-md mx-auto text-center animate-fade-in">
          <div className="glass-card rounded-2xl p-8 shadow-xl">
            {/* Excited mascot */}
            <div className="flex justify-center mb-4 animate-bounce">
              <AnimatedMascot species={petSpecies} mood="excited" size="lg" />
            </div>

            {/* Success badge */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-scale-in">
              <Check className="h-7 w-7 text-white" />
            </div>

            {/* Pet avatar */}
            <Avatar className="h-12 w-12 mx-auto ring-4 ring-primary/20 mb-4">
              <AvatarImage src={petPhotoUrl || undefined} />
              <AvatarFallback className="bg-primary/10">
                <PawPrint className="h-6 w-6 text-primary/60" />
              </AvatarFallback>
            </Avatar>

            <h2 className="text-2xl font-bold mb-2">
              {petName}&apos;s profile is ready!
            </h2>
            <p className="text-muted-foreground mb-6">
              You completed {completedSteps.length} of {STEPS.length} sections.
              {skippedSteps.length > 0 && ` You can add ${skippedSteps.length} more anytime.`}
            </p>

            {/* Completion stats */}
            <div className="flex justify-center gap-4 mb-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = completedSteps.includes(index)
                const isSkipped = skippedSteps.includes(index)
                return (
                  <div
                    key={step.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-600'
                        : isSkipped
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    title={step.title}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )
              })}
            </div>

            <Link href={`/pets/${petId}`}>
              <Button className="w-full shadow-lg btn-press" size="lg">
                <Sparkles className="h-5 w-5 mr-2" />
                View {petName}&apos;s Profile
              </Button>
            </Link>

            <Link href="/" className="block mt-4">
              <Button variant="ghost" className="text-muted-foreground">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const progress = ((completedSteps.length + skippedSteps.length) / STEPS.length) * 100

  return (
    <>
      <Confetti trigger={showConfetti} intensity="medium" onComplete={() => setShowConfetti(false)} />

      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* Header with pet info and exit */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={petPhotoUrl || undefined} />
              <AvatarFallback className="bg-primary/10">
                <PawPrint className="h-5 w-5 text-primary/60" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{petName}</p>
              <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-teal-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = completedSteps.includes(index)
              const isSkipped = skippedSteps.includes(index)
              const isCurrent = index === currentStep
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center transition-all ${
                    isCurrent ? 'scale-110' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : isSkipped
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted/50 text-muted-foreground/50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 ${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="animate-fade-in">
          {renderCurrentStep()}
        </div>

        {/* Skip all link */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowExitDialog(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Finish setup later →
          </button>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress is saved! You can continue setting up {petName}&apos;s profile anytime from the dashboard.
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
