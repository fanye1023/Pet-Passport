'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { routineIcons, timeOfDayLabels, daysOfWeek } from '@/lib/constants'

export interface RoutineFormData {
  routineType: string
  timeOfDay: string
  durationMinutes: number | null
  daysOfWeek: string[]
  description: string
}

interface RoutineItemCardProps {
  routine: RoutineFormData
  onRemove: () => void
}

const routineTypeLabels: Record<string, string> = {
  walk: 'Walk',
  feeding: 'Feeding',
  play: 'Play Time',
  medication: 'Medication',
  sleep: 'Sleep',
}

export function RoutineItemCard({ routine, onRemove }: RoutineItemCardProps) {
  const icon = routineIcons[routine.routineType] || ''
  const label = routineTypeLabels[routine.routineType] || routine.routineType
  const timeLabel = timeOfDayLabels[routine.timeOfDay] || routine.timeOfDay

  // Format days display
  const formatDays = () => {
    if (routine.daysOfWeek.length === 0) return null
    if (routine.daysOfWeek.length === 7) return 'Every day'

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    const weekends = ['saturday', 'sunday']

    const isWeekdays = weekdays.every(d => routine.daysOfWeek.includes(d)) &&
                       !weekends.some(d => routine.daysOfWeek.includes(d))
    const isWeekends = weekends.every(d => routine.daysOfWeek.includes(d)) &&
                       !weekdays.some(d => routine.daysOfWeek.includes(d))

    if (isWeekdays) return 'Weekdays'
    if (isWeekends) return 'Weekends'

    return routine.daysOfWeek
      .map(d => daysOfWeek.find(day => day.value === d)?.label || d)
      .join(', ')
  }

  const daysDisplay = formatDays()

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <span className="text-base">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <div className="flex items-center flex-wrap gap-2 mt-0.5">
          <Badge variant="secondary" className="text-xs">
            {timeLabel}
          </Badge>
          {routine.durationMinutes && (
            <span className="text-xs text-muted-foreground">
              {routine.durationMinutes} min
            </span>
          )}
          {daysDisplay && (
            <span className="text-xs text-muted-foreground">{daysDisplay}</span>
          )}
        </div>
        {routine.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {routine.description}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
