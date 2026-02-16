'use client'

import { ReactNode } from 'react'
import { LucideIcon, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OnboardingStepProps {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
  isLoading?: boolean
  canProceed?: boolean
  isLastStep?: boolean
  isFirstStep?: boolean
}

export function OnboardingStep({
  icon: Icon,
  title,
  description,
  children,
  onNext,
  onSkip,
  onBack,
  isLoading = false,
  canProceed = true,
  isLastStep = false,
  isFirstStep = false,
}: OnboardingStepProps) {
  return (
    <div className="animate-fade-in">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!isFirstStep && onBack ? (
              <Button
                variant="ghost"
                onClick={onBack}
                disabled={isLoading}
                className="sm:w-auto order-3 sm:order-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={isLoading}
              className="sm:flex-1 order-2"
            >
              Skip for now
            </Button>
            <Button
              onClick={onNext}
              disabled={isLoading || !canProceed}
              className="sm:flex-1 order-1 sm:order-3 btn-press"
            >
              {isLoading ? 'Saving...' : isLastStep ? 'Finish' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
