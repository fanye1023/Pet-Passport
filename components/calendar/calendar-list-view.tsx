'use client'

import { CareEvent, CalendarOccurrence } from '@/lib/types/pet'
import { CalendarEventCard } from './calendar-event-card'
import { groupOccurrencesByDate, isToday } from './calendar-utils'
import { CalendarDays } from 'lucide-react'

interface CalendarListViewProps {
  occurrences: CalendarOccurrence[]
  onEdit?: (event: CareEvent) => void
  onDelete?: (event: CareEvent) => void
}

export function CalendarListView({
  occurrences,
  onEdit,
  onDelete,
}: CalendarListViewProps) {
  const grouped = groupOccurrencesByDate(occurrences)
  const sortedDates = Array.from(grouped.keys()).sort()

  if (occurrences.length === 0) {
    return (
      <div className="glass-subtle rounded-2xl p-12 text-center">
        <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
        <p className="text-muted-foreground font-medium">No upcoming events</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Add your first care event to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((dateKey) => {
        const dateOccurrences = grouped.get(dateKey) || []
        const date = new Date(dateKey)
        const today = isToday(date)

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-4">
              {today && (
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold shadow-sm">
                  Today
                </span>
              )}
              <h3 className="text-sm font-semibold text-muted-foreground">
                {date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                })}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dateOccurrences.map((occ) => (
                <CalendarEventCard
                  key={occ.id}
                  occurrence={occ}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
