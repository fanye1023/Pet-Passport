'use client'

import { CalendarOccurrence } from '@/lib/types/pet'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarDayCell } from './calendar-day-cell'
import { getCalendarDays, getOccurrencesForDay } from './calendar-utils'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarMonthViewProps {
  year: number
  month: number
  occurrences: CalendarOccurrence[]
  selectedDate?: Date | null
  onSelectDate?: (date: Date) => void
  onSelectEvent?: (occurrence: CalendarOccurrence) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export function CalendarMonthView({
  year,
  month,
  occurrences,
  selectedDate,
  onSelectDate,
  onSelectEvent,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarMonthViewProps) {
  const days = getCalendarDays(year, month)
  const monthName = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="glass border-white/30 hover:bg-white/50 dark:hover:bg-white/10"
          >
            Today
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviousMonth}
              className="glass border-white/30 hover:bg-white/50 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
              className="glass border-white/30 hover:bg-white/50 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayOccurrences = getOccurrencesForDay(occurrences, date)
          return (
            <CalendarDayCell
              key={index}
              date={date}
              currentMonth={month}
              occurrences={dayOccurrences}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              onSelectEvent={onSelectEvent}
            />
          )
        })}
      </div>
    </div>
  )
}
