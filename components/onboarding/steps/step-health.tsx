'use client'

import { useState } from 'react'
import { HeartPulse } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OnboardingStep } from '../onboarding-step'
import { createClient } from '@/lib/supabase/client'

interface StepHealthProps {
  petId: string
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
  isFirstStep: boolean
}

const recordTypes = [
  { value: 'allergy', label: 'Allergy' },
  { value: 'condition', label: 'Condition' },
  { value: 'checkup', label: 'Recent Checkup' },
  { value: 'surgery', label: 'Past Surgery' },
]

export function StepHealth({ petId, onComplete, onSkip, onBack, isFirstStep }: StepHealthProps) {
  const [recordType, setRecordType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!recordType || !title.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('health_records').insert({
      pet_id: petId,
      record_type: recordType,
      title: title.trim(),
      description: description.trim() || null,
      record_date: new Date().toISOString().split('T')[0],
    })

    setIsLoading(false)

    if (!error) {
      onComplete()
    }
  }

  return (
    <OnboardingStep
      icon={HeartPulse}
      title="Health Information"
      description="Any allergies, conditions, or recent checkups? (Optional)"
      onNext={handleSave}
      onSkip={onSkip}
      onBack={onBack}
      isLoading={isLoading}
      canProceed={recordType.length > 0 && title.trim().length > 0}
      isFirstStep={isFirstStep}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="recordType" className="text-sm">Record Type *</Label>
          <Select value={recordType} onValueChange={setRecordType}>
            <SelectTrigger id="recordType" className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {recordTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm">Title *</Label>
          <Input
            id="title"
            placeholder={recordType === 'allergy' ? 'e.g., Chicken allergy' : 'e.g., Annual checkup'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm">Notes</Label>
          <Textarea
            id="description"
            placeholder="Any additional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          You can add more detailed records later from the Health section.
        </p>
      </div>
    </OnboardingStep>
  )
}
