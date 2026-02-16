'use client'

import { useState, useEffect } from 'react'
import { CareEvent, CareEventType, RecurrencePattern, Veterinarian } from '@/lib/types/pet'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Stethoscope, Scissors, Pill } from 'lucide-react'

const eventTypes: { value: CareEventType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'vet_appointment', label: 'Vet Appointment', icon: Stethoscope },
  { value: 'grooming', label: 'Grooming', icon: Scissors },
  { value: 'medication', label: 'Medication', icon: Pill },
]

const recurrencePatterns: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const daysOfWeek = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
]

interface CalendarEventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CareEvent | null
  veterinarians?: Veterinarian[]
  onSave: (data: Partial<CareEvent>) => Promise<void>
}

export function CalendarEventForm({
  open,
  onOpenChange,
  event,
  veterinarians = [],
  onSave,
}: CalendarEventFormProps) {
  const [saving, setSaving] = useState(false)

  // Form state
  const [eventType, setEventType] = useState<CareEventType>('vet_appointment')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('monthly')
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState('')
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState('')
  const [recurrenceStartDate, setRecurrenceStartDate] = useState('')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [veterinarianId, setVeterinarianId] = useState('')
  const [notes, setNotes] = useState('')

  // Initialize form when event changes
  useEffect(() => {
    if (event) {
      setEventType(event.event_type)
      setTitle(event.title)
      setDescription(event.description || '')
      setEventDate(event.event_date || '')
      setEventTime(event.event_time || '')
      setIsRecurring(event.is_recurring)
      setRecurrencePattern(event.recurrence_pattern || 'monthly')
      setRecurrenceDayOfMonth(event.recurrence_day_of_month?.toString() || '')
      setRecurrenceDayOfWeek(event.recurrence_day_of_week || '')
      setRecurrenceStartDate(event.recurrence_start_date || '')
      setRecurrenceEndDate(event.recurrence_end_date || '')
      setLocation(event.location || '')
      setVeterinarianId(event.veterinarian_id || '')
      setNotes(event.notes || '')
    } else {
      resetForm()
    }
  }, [event, open])

  const resetForm = () => {
    setEventType('vet_appointment')
    setTitle('')
    setDescription('')
    setEventDate('')
    setEventTime('')
    setIsRecurring(false)
    setRecurrencePattern('monthly')
    setRecurrenceDayOfMonth('')
    setRecurrenceDayOfWeek('')
    setRecurrenceStartDate('')
    setRecurrenceEndDate('')
    setLocation('')
    setVeterinarianId('')
    setNotes('')
  }

  const handleSave = async () => {
    setSaving(true)

    const data: Partial<CareEvent> = {
      event_type: eventType,
      title,
      description: description || null,
      is_recurring: isRecurring,
      location: location || null,
      veterinarian_id: veterinarianId || null,
      notes: notes || null,
    }

    if (isRecurring) {
      data.event_date = null
      data.event_time = eventTime || null
      data.recurrence_pattern = recurrencePattern
      data.recurrence_start_date = recurrenceStartDate || null
      data.recurrence_end_date = recurrenceEndDate || null

      if (recurrencePattern === 'monthly') {
        data.recurrence_day_of_month = recurrenceDayOfMonth ? parseInt(recurrenceDayOfMonth) : null
        data.recurrence_day_of_week = null
      } else if (['weekly', 'biweekly'].includes(recurrencePattern)) {
        data.recurrence_day_of_week = recurrenceDayOfWeek || null
        data.recurrence_day_of_month = null
      } else {
        data.recurrence_day_of_month = null
        data.recurrence_day_of_week = null
      }
    } else {
      data.event_date = eventDate || null
      data.event_time = eventTime || null
      data.recurrence_pattern = null
      data.recurrence_day_of_month = null
      data.recurrence_day_of_week = null
      data.recurrence_start_date = null
      data.recurrence_end_date = null
    }

    try {
      await onSave(data)
      onOpenChange(false)
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const showDayOfWeek = isRecurring && ['weekly', 'biweekly'].includes(recurrencePattern)
  const showDayOfMonth = isRecurring && recurrencePattern === 'monthly'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add Care Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Event Type */}
          <div className="space-y-2">
            <Label>Event Type *</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as CareEventType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                eventType === 'vet_appointment'
                  ? 'Annual checkup'
                  : eventType === 'grooming'
                  ? 'Bath and nail trim'
                  : 'Heartworm pill'
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="isRecurring" className="font-normal">
              This is a recurring event
            </Label>
          </div>

          {/* One-time event fields */}
          {!isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Recurring event fields */}
          {isRecurring && (
            <>
              <div className="space-y-2">
                <Label>Repeat</Label>
                <Select
                  value={recurrencePattern}
                  onValueChange={(v) => setRecurrencePattern(v as RecurrencePattern)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrencePatterns.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showDayOfWeek && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={recurrenceDayOfWeek}
                    onValueChange={setRecurrenceDayOfWeek}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showDayOfMonth && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={recurrenceDayOfMonth}
                    onChange={(e) => setRecurrenceDayOfMonth(e.target.value)}
                    placeholder="e.g., 1 for the 1st"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={recurrenceStartDate}
                    onChange={(e) => setRecurrenceStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for no end</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Clinic address or room"
            />
          </div>

          {/* Veterinarian (for vet appointments) */}
          {eventType === 'vet_appointment' && veterinarians.length > 0 && (
            <div className="space-y-2">
              <Label>Veterinarian</Label>
              <Select
                value={veterinarianId || 'none'}
                onValueChange={(v) => setVeterinarianId(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vet (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {veterinarians.map((vet) => (
                    <SelectItem key={vet.id} value={vet.id}>
                      {vet.clinic_name}
                      {vet.name && ` - ${vet.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !title || (!isRecurring && !eventDate) || (isRecurring && !recurrenceStartDate)}
            className="w-full"
          >
            {saving ? 'Saving...' : event ? 'Save Changes' : 'Add Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
