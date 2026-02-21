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

const CONTACT_TYPES = [
  { value: 'owner', label: 'Owner' },
  { value: 'family', label: 'Family Member' },
  { value: 'friend', label: 'Friend' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'pet_sitter', label: 'Pet Sitter' },
  { value: 'veterinarian', label: 'Veterinarian' },
  { value: 'other', label: 'Other' },
]

export function StepEmergency({ petId, onComplete, onSkip, onBack, isFirstStep }: StepEmergencyProps) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhone] = useState('')
  const [contactType, setContactType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !phoneNumber.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const typeLabel = CONTACT_TYPES.find(r => r.value === contactType)?.label || null

    const { error } = await supabase.from('emergency_contacts').insert({
      pet_id: petId,
      name: name.trim(),
      phone: phoneNumber.trim(),
      contact_type: contactType || 'other',
      relationship: typeLabel,
      is_primary: contactType === 'owner',
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
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm">Contact Name *</Label>
          <Input
            id="name"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Contact Type</Label>
          <Select value={contactType} onValueChange={setContactType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </OnboardingStep>
  )
}
