'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { routineTypes, timeOfDayOptions, daysOfWeek } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { RoutineFormData } from './routine-item-card'

interface RoutineInlineFormProps {
  petSpecies: string
  onAdd: (routine: RoutineFormData) => void
}

const DURATIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
]

export function RoutineInlineForm({ petSpecies, onAdd }: RoutineInlineFormProps) {
  const [routineType, setRoutineType] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [duration, setDuration] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [description, setDescription] = useState('')

  // Filter activities based on species (walk only for dogs)
  const availableRoutines = petSpecies === 'dog'
    ? routineTypes
    : routineTypes.filter(r => r.value !== 'walk')

  // Show duration for walk and play
  const showDuration = routineType === 'walk' || routineType === 'play'

  const canAdd = routineType.length > 0 && timeOfDay.length > 0

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    )
  }

  const handleSelectAllDays = () => {
    if (selectedDays.length === 7) {
      setSelectedDays([])
    } else {
      setSelectedDays(daysOfWeek.map((d) => d.value))
    }
  }

  const handleAdd = () => {
    if (!canAdd) return

    onAdd({
      routineType,
      timeOfDay,
      durationMinutes: showDuration && duration ? parseInt(duration) : null,
      daysOfWeek: selectedDays,
      description: description.trim(),
    })

    // Reset form
    setRoutineType('')
    setTimeOfDay('')
    setDuration('')
    setSelectedDays([])
    setDescription('')
  }

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Activity Type *</Label>
          <Select value={routineType} onValueChange={setRoutineType}>
            <SelectTrigger>
              <SelectValue placeholder="What activity?" />
            </SelectTrigger>
            <SelectContent>
              {availableRoutines.map((routine) => (
                <SelectItem key={routine.value} value={routine.value}>
                  {routine.icon} {routine.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Time of Day *</Label>
          <Select value={timeOfDay} onValueChange={setTimeOfDay}>
            <SelectTrigger>
              <SelectValue placeholder="When?" />
            </SelectTrigger>
            <SelectContent>
              {timeOfDayOptions.filter(t => t.value !== 'custom').map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showDuration && (
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="How long?" />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((dur) => (
                <SelectItem key={dur.value} value={dur.value}>
                  {dur.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Days of Week</Label>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleSelectAllDays}
            className="text-xs"
          >
            {selectedDays.length === 7 ? 'Clear all' : 'Select all'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {daysOfWeek.map((day) => (
            <Button
              key={day.value}
              type="button"
              variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
              size="xs"
              onClick={() => handleDayToggle(day.value)}
              className={cn(
                'min-w-[40px]',
                selectedDays.includes(day.value) && 'bg-primary text-primary-foreground'
              )}
            >
              {day.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Notes (optional)</Label>
        <Input
          id="description"
          placeholder="e.g., Around the neighborhood, after dinner..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          <Plus className="h-4 w-4" />
          Add Routine
        </Button>
      </div>
    </div>
  )
}
