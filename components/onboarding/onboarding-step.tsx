'use client'

import { ReactNode, useState, useEffect } from 'react'
import { LucideIcon, ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

const SKIP_CONFIRM_KEY = 'onboarding-skip-confirmed'

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
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [skipConfirmed, setSkipConfirmed] = useState(false)
  const [dontAskAgain, setDontAskAgain] = useState(false)

  // Check if user has already confirmed skip before
  useEffect(() => {
    const confirmed = sessionStorage.getItem(SKIP_CONFIRM_KEY) === 'true'
    setSkipConfirmed(confirmed)
  }, [])

  const handleSkipClick = () => {
    if (skipConfirmed) {
      // User already confirmed once, skip directly
      onSkip()
    } else {
      setShowSkipDialog(true)
    }
  }

  const handleConfirmSkip = () => {
    if (dontAskAgain) {
      sessionStorage.setItem(SKIP_CONFIRM_KEY, 'true')
      setSkipConfirmed(true)
    }
    setShowSkipDialog(false)
    onSkip()
  }

  return (
    <div className="animate-fade-in">
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-5 pb-4 px-5">
          {/* Compact header with inline icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Form content */}
          <div className="space-y-3">
            {children}
          </div>

          {/* Action buttons - compact layout */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t">
            {!isFirstStep && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={isLoading}
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipClick}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={onNext}
              disabled={isLoading || !canProceed}
              className="btn-press px-6"
            >
              {isLoading ? 'Saving...' : isLastStep ? 'Finish' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip this step?</AlertDialogTitle>
            <AlertDialogDescription>
              You can always add this information later from your pet&apos;s profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="dont-ask"
              checked={dontAskAgain}
              onCheckedChange={(checked) => setDontAskAgain(checked === true)}
            />
            <label
              htmlFor="dont-ask"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Don&apos;t ask again this session
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSkip}>Skip</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
