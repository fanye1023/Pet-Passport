'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OnboardingStep } from '../onboarding-step'
import { createClient } from '@/lib/supabase/client'

interface StepInsuranceProps {
  petId: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep?: boolean
}

export function StepInsurance({ petId, onComplete, onSkip, onBack, isFirstStep, isLastStep }: StepInsuranceProps) {
  const [providerName, setProviderName] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!providerName.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('pet_insurance').insert({
      pet_id: petId,
      provider_name: providerName.trim(),
      policy_number: policyNumber.trim() || null,
    })

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  return (
    <OnboardingStep
      icon={Shield}
      title="Pet Insurance"
      description="Do you have pet insurance? (Optional)"
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={providerName.trim().length > 0}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="provider" className="text-sm">Insurance Provider *</Label>
          <Input
            id="provider"
            placeholder="e.g., Trupanion, Healthy Paws"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="policy" className="text-sm">Policy Number</Label>
          <Input
            id="policy"
            placeholder="Enter policy number"
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
            className="h-9"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Feel free to skip if you don&apos;t have coverage yet.
        </p>
      </div>
    </OnboardingStep>
  )
}
