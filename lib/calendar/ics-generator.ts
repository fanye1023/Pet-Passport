import { CareEvent, RecurrencePattern } from '@/lib/types/pet'

interface ICSEvent {
  uid: string
  summary: string
  description?: string
  dtstart: string
  dtend?: string
  location?: string
  rrule?: string
  categories?: string[]
}

interface CalendarFeedData {
  token_name: string | null
  pets: Array<{
    id: string
    name: string
  }>
  care_events: Array<{
    id: string
    pet_id: string
    pet_name: string
    event_type: string
    title: string
    description: string | null
    event_date: string | null
    event_time: string | null
    is_recurring: boolean
    recurrence_pattern: RecurrencePattern | null
    recurrence_day_of_month: number | null
    recurrence_day_of_week: string | null
    recurrence_start_date: string | null
    recurrence_end_date: string | null
    location: string | null
    notes: string | null
  }>
  vaccination_records: Array<{
    id: string
    pet_id: string
    pet_name: string
    vaccine_name: string
    expiration_date: string | null
    notes: string | null
  }>
}

// Days of week mapping for RRULE BYDAY
const BYDAY_MAP: Record<string, string> = {
  sunday: 'SU',
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
  saturday: 'SA',
}

// Escape special ICS characters
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// Format date for ICS (YYYYMMDD)
function formatICSDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

// Format datetime for ICS (YYYYMMDDTHHMMSS)
function formatICSDateTime(dateStr: string, timeStr?: string | null): string {
  const date = formatICSDate(dateStr)
  if (timeStr) {
    const time = timeStr.replace(/:/g, '').substring(0, 6).padEnd(6, '0')
    return `${date}T${time}`
  }
  // All-day event - just date
  return date
}

// Get day of week from a date string
function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

// Generate RRULE for recurring events
function generateRRule(event: CalendarFeedData['care_events'][0]): string | undefined {
  if (!event.is_recurring || !event.recurrence_pattern) {
    return undefined
  }

  const parts: string[] = []

  switch (event.recurrence_pattern) {
    case 'daily':
      parts.push('FREQ=DAILY')
      break

    case 'weekly':
      parts.push('FREQ=WEEKLY')
      if (event.recurrence_day_of_week) {
        const byday = BYDAY_MAP[event.recurrence_day_of_week]
        if (byday) parts.push(`BYDAY=${byday}`)
      } else if (event.recurrence_start_date) {
        // Use the start date's day
        const dayOfWeek = getDayOfWeek(event.recurrence_start_date)
        const byday = BYDAY_MAP[dayOfWeek]
        if (byday) parts.push(`BYDAY=${byday}`)
      }
      break

    case 'biweekly':
      parts.push('FREQ=WEEKLY')
      parts.push('INTERVAL=2')
      if (event.recurrence_day_of_week) {
        const byday = BYDAY_MAP[event.recurrence_day_of_week]
        if (byday) parts.push(`BYDAY=${byday}`)
      } else if (event.recurrence_start_date) {
        const dayOfWeek = getDayOfWeek(event.recurrence_start_date)
        const byday = BYDAY_MAP[dayOfWeek]
        if (byday) parts.push(`BYDAY=${byday}`)
      }
      break

    case 'monthly':
      parts.push('FREQ=MONTHLY')
      if (event.recurrence_day_of_month) {
        parts.push(`BYMONTHDAY=${event.recurrence_day_of_month}`)
      } else if (event.recurrence_start_date) {
        const day = new Date(event.recurrence_start_date).getDate()
        parts.push(`BYMONTHDAY=${day}`)
      }
      break

    case 'yearly':
      parts.push('FREQ=YEARLY')
      break

    default:
      return undefined
  }

  // Add end date if specified
  if (event.recurrence_end_date) {
    parts.push(`UNTIL=${formatICSDate(event.recurrence_end_date)}`)
  }

  return parts.join(';')
}

// Generate a single VEVENT block
function generateVEvent(event: ICSEvent): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatICSDateTime(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[1]?.substring(0, 8))}`,
  ]

  // Handle date/datetime
  if (event.dtstart.includes('T')) {
    lines.push(`DTSTART:${event.dtstart}`)
    if (event.dtend) {
      lines.push(`DTEND:${event.dtend}`)
    }
  } else {
    // All-day event
    lines.push(`DTSTART;VALUE=DATE:${event.dtstart}`)
    if (event.dtend) {
      lines.push(`DTEND;VALUE=DATE:${event.dtend}`)
    }
  }

  lines.push(`SUMMARY:${escapeICSText(event.summary)}`)

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`)
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`)
  }

  if (event.rrule) {
    lines.push(`RRULE:${event.rrule}`)
  }

  if (event.categories && event.categories.length > 0) {
    lines.push(`CATEGORIES:${event.categories.join(',')}`)
  }

  lines.push('END:VEVENT')

  return lines.join('\r\n')
}

// Get event type display name
function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    vet_appointment: 'Vet Appointment',
    grooming: 'Grooming',
    medication: 'Medication',
    vaccination: 'Vaccination',
  }
  return labels[eventType] || eventType
}

// Main function to generate ICS content
export function generateICSFeed(data: CalendarFeedData, baseUrl: string): string {
  const events: ICSEvent[] = []

  // Process care events
  for (const careEvent of data.care_events) {
    const petName = careEvent.pet_name
    const eventTypeLabel = getEventTypeLabel(careEvent.event_type)

    // Build description
    const descParts: string[] = []
    if (careEvent.description) descParts.push(careEvent.description)
    if (careEvent.notes) descParts.push(`Notes: ${careEvent.notes}`)
    descParts.push(`Pet: ${petName}`)
    descParts.push(`Type: ${eventTypeLabel}`)

    const description = descParts.join('\\n')

    if (careEvent.is_recurring && careEvent.recurrence_start_date) {
      // Recurring event
      const rrule = generateRRule(careEvent)

      events.push({
        uid: `care-${careEvent.id}@pet-passport`,
        summary: `[${petName}] ${careEvent.title}`,
        description,
        dtstart: formatICSDateTime(careEvent.recurrence_start_date, careEvent.event_time),
        location: careEvent.location || undefined,
        rrule,
        categories: [eventTypeLabel, petName],
      })
    } else if (careEvent.event_date) {
      // One-time event
      events.push({
        uid: `care-${careEvent.id}@pet-passport`,
        summary: `[${petName}] ${careEvent.title}`,
        description,
        dtstart: formatICSDateTime(careEvent.event_date, careEvent.event_time),
        location: careEvent.location || undefined,
        categories: [eventTypeLabel, petName],
      })
    }
  }

  // Process vaccination expiration dates as reminder events
  for (const vax of data.vaccination_records) {
    if (!vax.expiration_date) continue

    const petName = vax.pet_name
    const descParts: string[] = [
      `Vaccination expires: ${vax.vaccine_name}`,
      `Pet: ${petName}`,
    ]
    if (vax.notes) descParts.push(`Notes: ${vax.notes}`)

    events.push({
      uid: `vax-exp-${vax.id}@pet-passport`,
      summary: `[${petName}] ${vax.vaccine_name} Expires`,
      description: descParts.join('\\n'),
      dtstart: formatICSDate(vax.expiration_date),
      categories: ['Vaccination', 'Reminder', petName],
    })
  }

  // Generate the calendar
  const calendarName = data.token_name || 'Pet Care Calendar'

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pet ShareLink//Pet Care Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICSText(calendarName)}`,
    `X-WR-CALDESC:Pet care events from Pet ShareLink`,
  ]

  // Add all events
  for (const event of events) {
    icsLines.push(generateVEvent(event))
  }

  icsLines.push('END:VCALENDAR')

  // Join with CRLF as per ICS spec
  return icsLines.join('\r\n')
}

// Generate a secure calendar feed token
export function generateCalendarFeedToken(): string {
  // Generate 24 random bytes and encode as URL-safe base64
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Validate calendar feed token format
export function isValidCalendarFeedToken(token: string): boolean {
  // Token should be URL-safe base64, 32 characters (from 24 bytes)
  return /^[A-Za-z0-9_-]{32}$/.test(token)
}

// Get the calendar feed URL
export function getCalendarFeedUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/api/calendar/${token}`
}
