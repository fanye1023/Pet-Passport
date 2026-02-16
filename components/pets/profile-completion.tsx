'use client'

import { Progress } from '@/components/ui/progress'

interface ProfileCompletionProps {
  vaccinations: number
  healthRecords: number
  insurance: number
  vets: number
  emergencyContacts: number
  food: number
  routines: number
  sitterInfo: number
}

export function ProfileCompletion({
  vaccinations,
  healthRecords,
  insurance,
  vets,
  emergencyContacts,
  food,
  routines,
  sitterInfo,
}: ProfileCompletionProps) {
  const sections = [
    { name: 'Vaccinations', hasData: vaccinations > 0 },
    { name: 'Health Records', hasData: healthRecords > 0 },
    { name: 'Insurance', hasData: insurance > 0 },
    { name: 'Veterinarians', hasData: vets > 0 },
    { name: 'Emergency Contacts', hasData: emergencyContacts > 0 },
    { name: 'Food & Diet', hasData: food > 0 },
    { name: 'Daily Routine', hasData: routines > 0 },
    { name: 'Sitter Info', hasData: sitterInfo > 0 },
  ]

  const completedCount = sections.filter((s) => s.hasData).length
  const percentage = Math.round((completedCount / sections.length) * 100)
  const missingSections = sections.filter((s) => !s.hasData).map((s) => s.name)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Profile completion</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      {missingSections.length > 0 && missingSections.length <= 3 && (
        <p className="text-xs text-muted-foreground">
          Add: {missingSections.join(', ')}
        </p>
      )}
    </div>
  )
}
