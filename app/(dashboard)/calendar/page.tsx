'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MultiPetCalendar } from '@/components/calendar/multi-pet-calendar'
import { CalendarFeedManager } from '@/components/calendar/calendar-feed-manager'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Pet, CareEvent } from '@/lib/types/pet'
import { CalendarDays, PawPrint } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnifiedCalendarPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [eventsByPet, setEventsByPet] = useState<Map<string, CareEvent[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      // Fetch all accessible pets (owned + collaborated)
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .order('name')

      if (petsError) {
        setError('Failed to load pets')
        setIsLoading(false)
        return
      }

      setPets(petsData || [])

      if (petsData && petsData.length > 0) {
        // Fetch care events for all pets
        const { data: eventsData, error: eventsError } = await supabase
          .from('care_events')
          .select('*')
          .in('pet_id', petsData.map(p => p.id))

        if (eventsError) {
          console.error('Failed to load events:', eventsError)
        }

        // Group events by pet
        const eventsMap = new Map<string, CareEvent[]>()
        for (const pet of petsData) {
          eventsMap.set(pet.id, [])
        }
        for (const event of (eventsData || [])) {
          const petEvents = eventsMap.get(event.pet_id)
          if (petEvents) {
            petEvents.push(event)
          }
        }
        setEventsByPet(eventsMap)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <PawPrint className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Pets Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Add your first pet to start tracking their care events and appointments.
        </p>
        <Link href="/pets/new">
          <Button>
            <PawPrint className="h-4 w-4 mr-2" />
            Add Your First Pet
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          All Pets Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          View care events and appointments for all your pets in one place
        </p>
      </div>

      <MultiPetCalendar pets={pets} eventsByPet={eventsByPet} />

      <Separator />

      <CalendarFeedManager />
    </div>
  )
}
