'use client'

import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
}

interface OnboardingProgressProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  skippedSteps: number[]
}

export function OnboardingProgress({
  steps,
  currentStep,
  completedSteps,
  skippedSteps,
}: OnboardingProgressProps) {
  const totalSteps = steps.length
  const progressPercentage = ((currentStep) / totalSteps) * 100

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isSkipped = skippedSteps.includes(index)
          const isCurrent = currentStep === index
          const isPast = index < currentStep

          return (
            <div key={step.id} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isSkipped && 'bg-muted text-muted-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isSkipped && !isCurrent && isPast && 'bg-muted text-muted-foreground',
                  !isCompleted && !isSkipped && !isCurrent && !isPast && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isSkipped ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs text-center hidden sm:block max-w-[60px] truncate',
                  isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current step label for mobile */}
      <p className="text-center text-sm text-muted-foreground sm:hidden">
        Step {currentStep + 1} of {totalSteps}: {steps[currentStep]?.title}
      </p>
    </div>
  )
}
