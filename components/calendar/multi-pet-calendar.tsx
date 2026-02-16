'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getCalendarDays,
  isSameDay,
  isToday,
  formatDate,
  formatTime,
  expandEventsToOccurrences,
  getOccurrencesForDay,
} from './calendar-utils'
import { PetColorLegend, getPetColor } from './pet-color-legend'
import { cn } from '@/lib/utils'
import type { Pet, CareEvent, CalendarOccurrence } from '@/lib/types/pet'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Stethoscope,
  Scissors,
  Pill,
  Syringe,
} from 'lucide-react'
import Link from 'next/link'

// Extended occurrence with pet info
interface MultiPetOccurrence extends CalendarOccurrence {
  pet: Pet
  petIndex: number
}

interface MultiPetCalendarProps {
  pets: Pet[]
  eventsByPet: Map<string, CareEvent[]>
}

const eventTypeIcons = {
  vet_appointment: Stethoscope,
  grooming: Scissors,
  medication: Pill,
  vaccination: Syringe,
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MultiPetCalendar({ pets, eventsByPet }: MultiPetCalendarProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [view, setView] = useState<'month' | 'list'>('month')
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set(pets.map(p => p.id)))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  // Create pet index map for consistent colors
  const petIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    pets.forEach((pet, index) => {
      map.set(pet.id, index)
    })
    return map
  }, [pets])

  // Calculate all occurrences for the current view
  const allOccurrences = useMemo(() => {
    const occurrences: MultiPetOccurrence[] = []

    // For month view, get the full calendar range including padding days
    const calendarDays = getCalendarDays(currentDate.getFullYear(), currentDate.getMonth())
    const startDate = calendarDays[0]
    const endDate = calendarDays[calendarDays.length - 1]

    for (const pet of pets) {
      if (!selectedPetIds.has(pet.id)) continue

      const events = eventsByPet.get(pet.id) || []
      const expanded = expandEventsToOccurrences(events, startDate, endDate)

      for (const occ of expanded) {
        occurrences.push({
          ...occ,
          pet,
          petIndex: petIndexMap.get(pet.id) || 0,
        })
      }
    }

    // Sort by date and time
    occurrences.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime()
      if (dateCompare !== 0) return dateCompare

      const timeA = a.event.event_time || '00:00'
      const timeB = b.event.event_time || '00:00'
      return timeA.localeCompare(timeB)
    })

    return occurrences
  }, [currentDate, pets, eventsByPet, selectedPetIds, petIndexMap])

  const handleTogglePet = (petId: string) => {
    const newSelected = new Set(selectedPetIds)
    if (newSelected.has(petId)) {
      newSelected.delete(petId)
    } else {
      newSelected.add(petId)
    }
    setSelectedPetIds(newSelected)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDay(today)
  }

  const calendarDays = getCalendarDays(currentDate.getFullYear(), currentDate.getMonth())

  // Get upcoming events for list view
  const upcomingOccurrences = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return allOccurrences.filter(occ => occ.date >= now).slice(0, 20)
  }, [allOccurrences])

  // Get events for selected day
  const selectedDayOccurrences = useMemo(() => {
    if (!selectedDay) return []
    return allOccurrences.filter(occ => isSameDay(occ.date, selectedDay))
  }, [allOccurrences, selectedDay])

  return (
    <div className="space-y-4">
      {/* Pet filter legend */}
      <PetColorLegend
        pets={pets}
        selectedPetIds={selectedPetIds}
        onTogglePet={handleTogglePet}
      />

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[160px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-white/50 dark:bg-white/10 rounded-lg p-1">
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('month')}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="grid grid-cols-7 gap-px bg-white/20 dark:bg-white/5 rounded-xl overflow-hidden border border-white/20">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="bg-white/50 dark:bg-white/5 p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const dayOccurrences = getOccurrencesForDay(allOccurrences, date) as MultiPetOccurrence[]
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isSelected = selectedDay && isSameDay(date, selectedDay)

            return (
              <div
                key={index}
                onClick={() => setSelectedDay(date)}
                className={cn(
                  'min-h-[100px] p-2 bg-white/30 dark:bg-white/5 cursor-pointer transition-colors',
                  !isCurrentMonth && 'opacity-50',
                  isSelected && 'ring-2 ring-primary ring-inset',
                  isToday(date) && 'bg-primary/10'
                )}
              >
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isToday(date) && 'text-primary'
                )}>
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayOccurrences.slice(0, 3).map((occ) => {
                    const color = getPetColor(occ.petIndex)
                    const Icon = eventTypeIcons[occ.event.event_type]

                    return (
                      <Link
                        key={occ.id}
                        href={`/pets/${occ.pet.id}/calendar`}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'block text-xs truncate rounded px-1 py-0.5',
                          color.light,
                          color.text
                        )}
                        title={`${occ.pet.name}: ${occ.event.title}`}
                      >
                        <Icon className="h-3 w-3 inline mr-1" />
                        {occ.event.title}
                      </Link>
                    )
                  })}
                  {dayOccurrences.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayOccurrences.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            {upcomingOccurrences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming events for selected pets
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingOccurrences.map((occ) => {
                  const color = getPetColor(occ.petIndex)
                  const Icon = eventTypeIcons[occ.event.event_type]

                  return (
                    <Link
                      key={occ.id}
                      href={`/pets/${occ.pet.id}/calendar`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className={cn('w-1 h-12 rounded-full', color.bg)} />

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={occ.pet.photo_url || undefined} />
                        <AvatarFallback>{occ.pet.name[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', color.text)} />
                          <span className="font-medium truncate">{occ.event.title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {occ.pet.name} - {formatDate(occ.date)}
                          {occ.event.event_time && ` at ${formatTime(occ.event.event_time)}`}
                        </div>
                      </div>

                      {isToday(occ.date) && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          Today
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected day detail panel */}
      {selectedDay && selectedDayOccurrences.length > 0 && view === 'month' && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">{formatDate(selectedDay)}</h3>
            <div className="space-y-2">
              {selectedDayOccurrences.map((occ) => {
                const typedOcc = occ as MultiPetOccurrence
                const color = getPetColor(typedOcc.petIndex)
                const Icon = eventTypeIcons[typedOcc.event.event_type]

                return (
                  <Link
                    key={typedOcc.id}
                    href={`/pets/${typedOcc.pet.id}/calendar`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10"
                  >
                    <div className={cn('w-1 h-10 rounded-full', color.bg)} />
                    <Avatar className="h-8 w-8 ring-2 ring-white/50">
                      <AvatarImage src={typedOcc.pet.photo_url || undefined} alt={typedOcc.pet.name} />
                      <AvatarFallback className="text-xs">{typedOcc.pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <Icon className={cn('h-4 w-4', color.text)} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{typedOcc.event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {typedOcc.pet.name}
                        {typedOcc.event.event_time && ` - ${formatTime(typedOcc.event.event_time)}`}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
