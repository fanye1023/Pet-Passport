'use client'

import { CareEvent, CalendarOccurrence } from '@/lib/types/pet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stethoscope, Scissors, Pill, Syringe, MapPin, Pencil, Trash2, Repeat } from 'lucide-react'
import { formatTime, getRecurrenceDescription } from './calendar-utils'

const eventTypeConfig = {
  vet_appointment: {
    label: 'Vet Appointment',
    icon: Stethoscope,
    color: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeVariant: 'default' as const,
  },
  grooming: {
    label: 'Grooming',
    icon: Scissors,
    color: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    textColor: 'text-purple-600 dark:text-purple-400',
    badgeVariant: 'secondary' as const,
  },
  medication: {
    label: 'Medication',
    icon: Pill,
    color: 'bg-green-500',
    bgLight: 'bg-green-500/10',
    textColor: 'text-green-600 dark:text-green-400',
    badgeVariant: 'outline' as const,
  },
  vaccination: {
    label: 'Vaccine Due',
    icon: Syringe,
    color: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    badgeVariant: 'secondary' as const,
  },
}

interface CalendarEventCardProps {
  occurrence: CalendarOccurrence
  onEdit?: (event: CareEvent) => void
  onDelete?: (event: CareEvent) => void
  showDate?: boolean
}

export function CalendarEventCard({
  occurrence,
  onEdit,
  onDelete,
  showDate = false,
}: CalendarEventCardProps) {
  const { event, date, isRecurring } = occurrence
  const config = eventTypeConfig[event.event_type]
  const Icon = config.icon

  return (
    <div className="glass-card rounded-xl p-4 transition-all hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.color} text-white shadow-sm`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-sm">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={config.badgeVariant} className="text-xs">
                {config.label}
              </Badge>
              {isRecurring && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Repeat className="h-3 w-3" />
                  {getRecurrenceDescription(event)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-0.5">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(event)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        {showDate && (
          <p className="font-medium text-foreground">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {event.event_time && (
          <p>{formatTime(event.event_time)}</p>
        )}
        {event.location && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {event.location}
          </p>
        )}
        {event.description && (
          <p className="text-muted-foreground/80">{event.description}</p>
        )}
        {event.notes && (
          <p className="italic text-muted-foreground/70">{event.notes}</p>
        )}
      </div>
    </div>
  )
}

// Compact version for calendar day view
interface EventDotProps {
  event: CareEvent
}

export function EventDot({ event }: EventDotProps) {
  const config = eventTypeConfig[event.event_type]
  return (
    <div
      className={`w-2 h-2 rounded-full ${config.color} shadow-sm`}
      title={event.title}
    />
  )
}

// Mini card for day popover
interface EventMiniCardProps {
  occurrence: CalendarOccurrence
  onClick?: () => void
}

export function EventMiniCard({ occurrence, onClick }: EventMiniCardProps) {
  const { event } = occurrence
  const config = eventTypeConfig[event.event_type]
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2 rounded-lg glass-subtle hover:bg-white/60 dark:hover:bg-white/10 transition-all text-left"
    >
      <div className={`p-1.5 rounded-lg ${config.color} text-white shadow-sm`}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.title}</p>
        {event.event_time && (
          <p className="text-xs text-muted-foreground">{formatTime(event.event_time)}</p>
        )}
      </div>
    </button>
  )
}

export { eventTypeConfig }
