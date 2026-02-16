import { CareEvent, CalendarOccurrence, RecurrencePattern } from '@/lib/types/pet'

// Get the start and end dates for a month
export function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return { start, end }
}

// Get all days in a month including padding days from prev/next months
export function getCalendarDays(year: number, month: number): Date[] {
  const { start, end } = getMonthBounds(year, month)
  const days: Date[] = []

  // Add padding days from previous month (to start on Sunday)
  const startDay = start.getDay()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push(date)
  }

  // Add all days of the current month
  for (let i = 1; i <= end.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add padding days from next month (to complete the last week)
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
  }

  return days
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Check if a date is today
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Format time for display
export function formatTime(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Get the day of week name from a date
function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

// Check if a recurring event occurs on a specific date
function eventOccursOnDate(event: CareEvent, date: Date): boolean {
  if (!event.is_recurring || !event.recurrence_pattern || !event.recurrence_start_date) {
    return false
  }

  const startDate = new Date(event.recurrence_start_date)
  const endDate = event.recurrence_end_date ? new Date(event.recurrence_end_date) : null

  // Check if date is within the recurrence range
  if (date < startDate) return false
  if (endDate && date > endDate) return false

  switch (event.recurrence_pattern) {
    case 'daily':
      return true

    case 'weekly':
      if (event.recurrence_day_of_week) {
        return getDayOfWeek(date) === event.recurrence_day_of_week
      }
      // If no day specified, use the start date's day
      return getDayOfWeek(date) === getDayOfWeek(startDate)

    case 'biweekly':
      const dayOfWeekMatch = event.recurrence_day_of_week
        ? getDayOfWeek(date) === event.recurrence_day_of_week
        : getDayOfWeek(date) === getDayOfWeek(startDate)

      if (!dayOfWeekMatch) return false

      // Check if it's an even number of weeks from the start
      const diffTime = date.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffWeeks = Math.floor(diffDays / 7)
      return diffWeeks % 2 === 0

    case 'monthly':
      if (event.recurrence_day_of_month) {
        return date.getDate() === event.recurrence_day_of_month
      }
      // If no day specified, use the start date's day
      return date.getDate() === startDate.getDate()

    case 'yearly':
      return (
        date.getMonth() === startDate.getMonth() &&
        date.getDate() === startDate.getDate()
      )

    default:
      return false
  }
}

// Expand care events into calendar occurrences for a date range
export function expandEventsToOccurrences(
  events: CareEvent[],
  startDate: Date,
  endDate: Date
): CalendarOccurrence[] {
  const occurrences: CalendarOccurrence[] = []

  for (const event of events) {
    if (event.is_recurring) {
      // Generate occurrences for recurring events
      const current = new Date(startDate)
      while (current <= endDate) {
        if (eventOccursOnDate(event, current)) {
          occurrences.push({
            id: `${event.id}-${current.toISOString().split('T')[0]}`,
            event,
            date: new Date(current),
            isRecurring: true,
          })
        }
        current.setDate(current.getDate() + 1)
      }
    } else if (event.event_date) {
      // One-time event
      const eventDate = new Date(event.event_date)
      if (eventDate >= startDate && eventDate <= endDate) {
        occurrences.push({
          id: event.id,
          event,
          date: eventDate,
          isRecurring: false,
        })
      }
    }
  }

  // Sort by date
  occurrences.sort((a, b) => a.date.getTime() - b.date.getTime())

  return occurrences
}

// Get occurrences for a specific day
export function getOccurrencesForDay(
  occurrences: CalendarOccurrence[],
  date: Date
): CalendarOccurrence[] {
  return occurrences.filter((occ) => isSameDay(occ.date, date))
}

// Get upcoming occurrences from today
export function getUpcomingOccurrences(
  events: CareEvent[],
  days: number = 30
): CalendarOccurrence[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + days)

  return expandEventsToOccurrences(events, today, endDate)
}

// Group occurrences by date
export function groupOccurrencesByDate(
  occurrences: CalendarOccurrence[]
): Map<string, CalendarOccurrence[]> {
  const groups = new Map<string, CalendarOccurrence[]>()

  for (const occ of occurrences) {
    const key = occ.date.toISOString().split('T')[0]
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(occ)
  }

  return groups
}

// Get recurrence description
export function getRecurrenceDescription(event: CareEvent): string {
  if (!event.is_recurring || !event.recurrence_pattern) {
    return 'One-time'
  }

  const pattern = event.recurrence_pattern as RecurrencePattern

  switch (pattern) {
    case 'daily':
      return 'Every day'
    case 'weekly':
      if (event.recurrence_day_of_week) {
        const dayName = event.recurrence_day_of_week.charAt(0).toUpperCase() + event.recurrence_day_of_week.slice(1)
        return `Every ${dayName}`
      }
      return 'Weekly'
    case 'biweekly':
      if (event.recurrence_day_of_week) {
        const dayName = event.recurrence_day_of_week.charAt(0).toUpperCase() + event.recurrence_day_of_week.slice(1)
        return `Every other ${dayName}`
      }
      return 'Every 2 weeks'
    case 'monthly':
      if (event.recurrence_day_of_month) {
        const suffix = getOrdinalSuffix(event.recurrence_day_of_month)
        return `${event.recurrence_day_of_month}${suffix} of every month`
      }
      return 'Monthly'
    case 'yearly':
      return 'Yearly'
    default:
      return 'Recurring'
  }
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
