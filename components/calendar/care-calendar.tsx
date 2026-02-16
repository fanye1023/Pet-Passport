'use client'

import { useState, useEffect } from 'react'
import { CareEvent, CalendarOccurrence, Veterinarian } from '@/lib/types/pet'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, CalendarDays, List, Stethoscope, Scissors, Pill, Syringe } from 'lucide-react'
import { toast } from 'sonner'
import { CalendarMonthView } from './calendar-month-view'
import { CalendarListView } from './calendar-list-view'
import { CalendarEventForm } from './calendar-event-form'
import { CalendarEventCard } from './calendar-event-card'
import {
  expandEventsToOccurrences,
  getMonthBounds,
  getUpcomingOccurrences,
  getOccurrencesForDay,
} from './calendar-utils'

interface CareCalendarProps {
  petId: string
}

export function CareCalendar({ petId }: CareCalendarProps) {
  const supabase = createClient()

  const [events, setEvents] = useState<CareEvent[]>([])
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'month' | 'list'>('month')

  // Calendar state
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CareEvent | null>(null)

  useEffect(() => {
    loadData()
  }, [petId])

  const loadData = async () => {
    // Only fetch one-time events from the last year onward; always load all recurring events
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const cutoff = oneYearAgo.toISOString().split('T')[0]

    const [eventsResult, vetsResult] = await Promise.all([
      supabase
        .from('care_events')
        .select('*')
        .eq('pet_id', petId)
        .or(`is_recurring.eq.true,event_date.gte.${cutoff}`)
        .order('event_date', { ascending: true }),
      supabase
        .from('veterinarians')
        .select('*')
        .eq('pet_id', petId)
        .order('is_primary', { ascending: false }),
    ])

    setEvents(eventsResult.data || [])
    setVeterinarians(vetsResult.data || [])
    setLoading(false)
  }

  // Calculate occurrences for the current view
  const getMonthOccurrences = () => {
    const { start, end } = getMonthBounds(currentYear, currentMonth)
    const extendedStart = new Date(start)
    extendedStart.setDate(extendedStart.getDate() - 7)
    const extendedEnd = new Date(end)
    extendedEnd.setDate(extendedEnd.getDate() + 7)
    return expandEventsToOccurrences(events, extendedStart, extendedEnd)
  }

  const getListOccurrences = () => {
    return getUpcomingOccurrences(events, 365) // Show next year
  }

  // Get ALL future vaccine reminders (no date limit)
  const getUpcomingVaccineReminders = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return events
      .filter(e =>
        (e.event_type === 'vaccination' ||
         e.event_type === 'vet_appointment' && e.title.toLowerCase().includes('vaccine') ||
         e.event_type === 'vet_appointment' && e.title.toLowerCase().includes('booster') ||
         e.event_type === 'medication' && e.title.toLowerCase().includes('vaccine') ||
         e.event_type === 'medication' && e.title.toLowerCase().includes('booster'))
        && e.event_date
      )
      .map(e => ({
        id: `${e.id}-${e.event_date}`,
        event: e,
        date: new Date(e.event_date!),
        isRecurring: false,
      }))
      .filter(occ => occ.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const upcomingVaccines = getUpcomingVaccineReminders()

  // Stats
  const upcomingOccurrences = getUpcomingOccurrences(events, 30)
  // Count vaccine-related events (those with "vaccine" or "booster" in title)
  const isVaccineEvent = (title: string) =>
    title.toLowerCase().includes('vaccine') || title.toLowerCase().includes('booster')
  const vaccineEvents = upcomingOccurrences.filter(o => isVaccineEvent(o.event.title))
  const nonVaccineEvents = upcomingOccurrences.filter(o => !isVaccineEvent(o.event.title))

  const vetCount = nonVaccineEvents.filter(o => o.event.event_type === 'vet_appointment').length
  const groomingCount = nonVaccineEvents.filter(o => o.event.event_type === 'grooming').length
  const medicationCount = nonVaccineEvents.filter(o => o.event.event_type === 'medication').length
  const vaccinationCount = vaccineEvents.length

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(today)
  }

  const handleSelectEvent = (occurrence: CalendarOccurrence) => {
    setEditingEvent(occurrence.event)
    setFormOpen(true)
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setFormOpen(true)
  }

  const handleEditEvent = (event: CareEvent) => {
    // Don't allow editing vaccination expiration events (they come from vaccination_records)
    if (event.id.startsWith('vax-')) {
      toast.info('Vaccination reminders are auto-generated', {
        description: 'Edit the vaccination record to change the expiration date'
      })
      return
    }
    setEditingEvent(event)
    setFormOpen(true)
  }

  const handleDeleteEvent = async (event: CareEvent) => {
    // Don't allow deleting vaccination expiration events
    if (event.id.startsWith('vax-')) {
      toast.info('Vaccination reminders are auto-generated', {
        description: 'Delete the vaccination record to remove this reminder'
      })
      return
    }

    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return

    const { error } = await supabase.from('care_events').delete().eq('id', event.id)

    if (error) {
      toast.error('Failed to delete event', { description: error.message })
      return
    }

    toast.success('Event deleted')
    loadData()
  }

  const handleSaveEvent = async (data: Partial<CareEvent>) => {
    let error

    if (editingEvent) {
      const result = await supabase
        .from('care_events')
        .update(data)
        .eq('id', editingEvent.id)
      error = result.error
    } else {
      const result = await supabase.from('care_events').insert({
        pet_id: petId,
        ...data,
      })
      error = result.error
    }

    if (error) {
      toast.error('Failed to save event', { description: error.message })
      throw error
    }

    toast.success(editingEvent ? 'Event updated' : 'Event added')
    setEditingEvent(null)
    loadData()
  }

  const selectedDayOccurrences = selectedDate
    ? getOccurrencesForDay(getMonthOccurrences(), selectedDate)
    : []

  if (loading) {
    return (
      <div className="bento-grid animate-pulse">
        <div className="bento-item span-full h-16 glass-card rounded-2xl" />
        <div className="bento-item span-4 h-24 glass-card rounded-2xl" />
        <div className="bento-item span-4 h-24 glass-card rounded-2xl" />
        <div className="bento-item span-4 h-24 glass-card rounded-2xl" />
        <div className="bento-item span-8 h-96 glass-card rounded-2xl" />
        <div className="bento-item span-4 h-96 glass-card rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bento Grid Layout */}
      <div className="bento-grid">
        {/* Header Row */}
        <div className="bento-item span-full">
          <div className="glass-nav rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Care Calendar</h2>
              <p className="text-sm text-muted-foreground">
                Track appointments and medication schedules
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="glass rounded-xl p-1 flex gap-1">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    view === 'month'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-white/50 dark:hover:bg-white/10'
                  }`}
                >
                  <CalendarDays className="h-4 w-4 inline mr-1.5" />
                  Month
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    view === 'list'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-white/50 dark:hover:bg-white/10'
                  }`}
                >
                  <List className="h-4 w-4 inline mr-1.5" />
                  List
                </button>
              </div>
              <Button onClick={handleAddEvent} className="shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bento-item span-3">
          <div className="glass-card rounded-2xl p-4 h-full transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vetCount}</p>
                <p className="text-sm text-muted-foreground">Vet Visits</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-item span-3">
          <div className="glass-card rounded-2xl p-4 h-full transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groomingCount}</p>
                <p className="text-sm text-muted-foreground">Grooming</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-item span-3">
          <div className="glass-card rounded-2xl p-4 h-full transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{medicationCount}</p>
                <p className="text-sm text-muted-foreground">Medications</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-item span-3">
          <div className="glass-card rounded-2xl p-4 h-full transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Syringe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vaccinationCount}</p>
                <p className="text-sm text-muted-foreground">Vaccine Due</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Vaccines Section */}
        {upcomingVaccines.length > 0 && (
          <div className="bento-item span-full">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Syringe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Upcoming Vaccine Reminders</h3>
                  <p className="text-xs text-muted-foreground">All scheduled vaccinations</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVaccines.slice(0, 6).map((occ) => (
                  <div
                    key={occ.id}
                    className="flex items-center gap-3 p-3 rounded-xl glass-subtle hover:bg-white/60 dark:hover:bg-white/10 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
                      <Syringe className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{occ.event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {occ.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {upcomingVaccines.length > 6 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  +{upcomingVaccines.length - 6} more vaccine reminders
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Calendar / List View */}
        {view === 'month' ? (
          <>
            <div className="bento-item span-8">
              <div className="glass-card rounded-2xl p-5">
                <CalendarMonthView
                  year={currentYear}
                  month={currentMonth}
                  occurrences={getMonthOccurrences()}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSelectEvent={handleSelectEvent}
                  onPreviousMonth={handlePreviousMonth}
                  onNextMonth={handleNextMonth}
                  onToday={handleToday}
                />
              </div>
            </div>

            <div className="bento-item span-4">
              <div className="glass-card rounded-2xl p-5 h-full">
                <h3 className="text-sm font-semibold mb-4">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Select a day'}
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {selectedDate ? (
                    selectedDayOccurrences.length > 0 ? (
                      selectedDayOccurrences.map((occ) => (
                        <CalendarEventCard
                          key={occ.id}
                          occurrence={occ}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                        />
                      ))
                    ) : (
                      <div className="glass-subtle rounded-xl p-6 text-center">
                        <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          No events on this day
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddEvent}
                          className="mt-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add event
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="glass-subtle rounded-xl p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Click on a day to see its events
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bento-item span-full">
            <div className="glass-card rounded-2xl p-5">
              <CalendarListView
                occurrences={getListOccurrences()}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Form Dialog */}
      <CalendarEventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editingEvent}
        veterinarians={veterinarians}
        onSave={handleSaveEvent}
      />
    </div>
  )
}
