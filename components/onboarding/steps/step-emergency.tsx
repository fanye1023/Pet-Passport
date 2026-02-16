'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingStep } from '../onboarding-step'
import { createClient } from '@/lib/supabase/client'

interface StepEmergencyProps {
  petId: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
}

const RELATIONSHIPS = [
  { value: 'owner', label: 'Owner' },
  { value: 'family', label: 'Family Member' },
  { value: 'friend', label: 'Friend' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'pet_sitter', label: 'Pet Sitter' },
  { value: 'other', label: 'Other' },
]

export function StepEmergency({ petId, onComplete, onSkip, onBack, isFirstStep }: StepEmergencyProps) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !phoneNumber.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const relationshipLabel = RELATIONSHIPS.find(r => r.value === relationship)?.label || relationship

    const { error } = await supabase.from('emergency_contacts').insert({
      pet_id: petId,
      name: name.trim(),
      phone: phoneNumber.trim(),
      relationship: relationshipLabel || null,
    })

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  return (
    <OnboardingStep
      icon={Phone}
      title="Emergency Contact"
      description="Who should we call in case of emergency?"
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={name.trim().length > 0 && phoneNumber.trim().length > 0}
      isFirstStep={isFirstStep}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Contact Name *</Label>
          <Input
            id="name"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Relationship</Label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIPS.map((rel) => (
                <SelectItem key={rel.value} value={rel.value}>
                  {rel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </OnboardingStep>
  )
}
