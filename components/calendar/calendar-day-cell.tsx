'use client'

import { CalendarOccurrence } from '@/lib/types/pet'
import { cn } from '@/lib/utils'
import { isToday, isSameDay } from './calendar-utils'
import { EventDot, EventMiniCard } from './calendar-event-card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface CalendarDayCellProps {
  date: Date
  currentMonth: number
  occurrences: CalendarOccurrence[]
  selectedDate?: Date | null
  onSelectDate?: (date: Date) => void
  onSelectEvent?: (occurrence: CalendarOccurrence) => void
}

export function CalendarDayCell({
  date,
  currentMonth,
  occurrences,
  selectedDate,
  onSelectDate,
  onSelectEvent,
}: CalendarDayCellProps) {
  const isCurrentMonth = date.getMonth() === currentMonth
  const today = isToday(date)
  const selected = selectedDate ? isSameDay(date, selectedDate) : false
  const hasEvents = occurrences.length > 0

  const displayOccurrences = occurrences.slice(0, 3)
  const remainingCount = occurrences.length - 3

  const handleClick = () => {
    onSelectDate?.(date)
  }

  const cellContent = (
    <button
      onClick={handleClick}
      className={cn(
        'w-full aspect-square p-1 flex flex-col items-center justify-start rounded-xl transition-all',
        !isCurrentMonth && 'text-muted-foreground/40',
        isCurrentMonth && 'hover:bg-white/60 dark:hover:bg-white/10',
        today && 'glass-subtle ring-2 ring-primary/30 font-semibold',
        selected && 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90',
        selected && today && 'bg-primary'
      )}
    >
      <span className="text-sm">{date.getDate()}</span>
      {hasEvents && (
        <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
          {displayOccurrences.map((occ) => (
            <EventDot key={occ.id} event={occ.event} />
          ))}
          {remainingCount > 0 && (
            <span className="text-xs text-muted-foreground">+{remainingCount}</span>
          )}
        </div>
      )}
    </button>
  )

  if (!hasEvents) {
    return (
      <div className="glass-subtle rounded-xl">
        {cellContent}
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="glass-subtle rounded-xl cursor-pointer hover:shadow-md transition-shadow">
          {cellContent}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 glass border-white/20" align="start">
        <div className="space-y-2">
          <p className="text-sm font-semibold px-1">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <div className="space-y-1">
            {occurrences.map((occ) => (
              <EventMiniCard
                key={occ.id}
                occurrence={occ}
                onClick={() => onSelectEvent?.(occ)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
