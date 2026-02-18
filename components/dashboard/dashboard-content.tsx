'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, PawPrint, ChevronRight, AlertTriangle, Sparkles, CalendarDays, Activity } from 'lucide-react'
import { AnimatedMascot } from '@/components/ui/animated-mascot'
import { ProfileCompletion } from '@/components/pets/profile-completion'
import { DeletePetButton } from '@/components/pets/delete-pet-button'
import { AggregateAlerts } from '@/components/dashboard/aggregate-alerts'
import type { Pet, Vaccination, CareEvent } from '@/lib/types/pet'

interface PetWithStats extends Pet {
  vaccinations: number
  healthRecords: number
  insurance: number
  vets: number
  emergencyContacts: number
  food: number
  routines: number
  expiringVaccinations: number
  expiredVaccinations: number
  sitterInfo: number
}

export function DashboardContent() {
  const router = useRouter()
  const [petsWithStats, setPetsWithStats] = useState<PetWithStats[]>([])
  const [vaccinationsByPet, setVaccinationsByPet] = useState<Map<string, Vaccination[]>>(new Map())
  const [eventsByPet, setEventsByPet] = useState<Map<string, CareEvent[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data: pets } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })

      if (!pets || pets.length === 0) {
        // Redirect new users to create their first pet
        router.push('/onboarding/new')
        return
      }

      const petIds = pets.map(p => p.id)

      // Fetch stats, vaccinations, and events in 3 queries total
      const [
        { data: statsData },
        { data: allVaccinations },
        { data: allEvents },
      ] = await Promise.all([
        supabase.rpc('get_pets_stats', { pet_ids: petIds }),
        supabase.from('vaccination_records').select('*').in('pet_id', petIds),
        supabase.from('care_events').select('*').in('pet_id', petIds),
      ])

      // Group vaccinations and events by pet
      const vaccMap = new Map<string, Vaccination[]>()
      const eventsMap = new Map<string, CareEvent[]>()

      for (const pet of pets) {
        vaccMap.set(pet.id, [])
        eventsMap.set(pet.id, [])
      }

      for (const v of allVaccinations || []) {
        vaccMap.get(v.pet_id)?.push(v)
      }

      for (const e of allEvents || []) {
        eventsMap.get(e.pet_id)?.push(e)
      }

      setVaccinationsByPet(vaccMap)
      setEventsByPet(eventsMap)

      // Build pets with stats from RPC results
      const statsMap = new Map<string, (typeof statsData)[number]>()
      for (const row of statsData || []) {
        statsMap.set(row.pet_id, row)
      }

      const petsStats: PetWithStats[] = pets.map((pet: Pet) => {
        const s = statsMap.get(pet.id)
        return {
          ...pet,
          vaccinations: Number(s?.vaccinations ?? 0),
          healthRecords: Number(s?.health_records ?? 0),
          insurance: Number(s?.insurance ?? 0),
          vets: Number(s?.vets ?? 0),
          emergencyContacts: Number(s?.emergency_contacts ?? 0),
          food: Number(s?.food ?? 0),
          routines: Number(s?.routines ?? 0),
          expiringVaccinations: Number(s?.expiring_vaccinations ?? 0),
          expiredVaccinations: Number(s?.expired_vaccinations ?? 0),
          sitterInfo: Number(s?.sitter_info ?? 0),
        }
      })

      setPetsWithStats(petsStats)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handlePetDeleted = (petId: string) => {
    setPetsWithStats((prev) => prev.filter((p) => p.id !== petId))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bento-grid">
          <div className="bento-item span-full">
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="bento-item span-6">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="bento-item span-6">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const pets = petsWithStats.map(p => ({
    id: p.id,
    user_id: p.user_id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    birthday: p.birthday,
    photo_url: p.photo_url,
    microchip_number: p.microchip_number,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }))

  return (
    <div className="space-y-6">
      {/* Bento Grid Layout */}
      <div className="bento-grid">
        {/* Header */}
        <div className="bento-item span-full">
          <div className="glass-nav rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Pets</h1>
              <p className="text-muted-foreground">
                Manage your pets and their information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/calendar">
                <Button variant="outline" className="hidden sm:flex">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  All Pets Calendar
                </Button>
              </Link>
              <Link href="/activity">
                <Button variant="outline" className="hidden sm:flex">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </Button>
              </Link>
              <Link href="/pets/new">
                <Button className="shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pet
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Aggregate Alerts */}
        {petsWithStats.length > 0 && (
          <div className="bento-item span-full">
            <AggregateAlerts
              pets={pets}
              vaccinationsByPet={vaccinationsByPet}
              eventsByPet={eventsByPet}
            />
          </div>
        )}

        {/* Pet Cards */}
        {petsWithStats && petsWithStats.length > 0 ? (
          petsWithStats.map((pet) => (
            <div key={pet.id} className="bento-item span-6">
              <PetCardWithStats pet={pet} onDeleted={() => handlePetDeleted(pet.id)} />
            </div>
          ))
        ) : (
          <div className="bento-item span-full">
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <AnimatedMascot species="dog" mood="happy" size="lg" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No pets yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first pet to get started
              </p>
              <Link href="/pets/new">
                <Button className="shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Pet
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PetCardWithStats({ pet, onDeleted }: { pet: PetWithStats; onDeleted: () => void }) {
  const age = pet.birthday
    ? (() => {
        const [year, month, day] = pet.birthday.split('-')
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      })()
    : null

  const hasAlerts = pet.expiredVaccinations > 0 || pet.expiringVaccinations > 0

  const sections = [
    pet.vaccinations > 0,
    pet.healthRecords > 0,
    pet.insurance > 0,
    pet.vets > 0,
    pet.emergencyContacts > 0,
    pet.food > 0,
    pet.routines > 0,
  ]
  const completedSections = sections.filter(Boolean).length
  const completionPercentage = Math.round((completedSections / sections.length) * 100)
  const showOnboardingButton = completionPercentage < 50

  return (
    <div className="glass-card rounded-2xl p-5 h-full group relative transition-all hover:scale-[1.01]">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DeletePetButton petId={pet.id} petName={pet.name} onDeleted={onDeleted} />
      </div>

      <Link href={`/pets/${pet.id}`} className="block">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-4 ring-white/50 dark:ring-white/10 shadow-lg">
            <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
              <PawPrint className="h-10 w-10 text-primary/60" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{pet.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {pet.breed ? `${pet.breed} ` : ''}{pet.species}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {age !== null && (
                <Badge variant="secondary" className="text-xs glass">
                  {age === 0 ? '< 1 year' : `${age} year${age !== 1 ? 's' : ''}`}
                </Badge>
              )}
              {pet.microchip_number && (
                <Badge variant="outline" className="text-xs">
                  Microchipped
                </Badge>
              )}
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {hasAlerts && (
        <div className="mt-4 space-y-1">
          {pet.expiredVaccinations > 0 && (
            <div className="flex items-center gap-2 text-destructive text-sm glass-subtle rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{pet.expiredVaccinations} vaccination{pet.expiredVaccinations !== 1 ? 's' : ''} expired</span>
            </div>
          )}
          {pet.expiringVaccinations > 0 && (
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm glass-subtle rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{pet.expiringVaccinations} vaccination{pet.expiringVaccinations !== 1 ? 's' : ''} expiring soon</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <ProfileCompletion
          vaccinations={pet.vaccinations}
          healthRecords={pet.healthRecords}
          insurance={pet.insurance}
          vets={pet.vets}
          emergencyContacts={pet.emergencyContacts}
          food={pet.food}
          routines={pet.routines}
          sitterInfo={pet.sitterInfo}
        />
      </div>

      {showOnboardingButton && (
        <Link href={`/pets/${pet.id}/onboarding`} className="block mt-4">
          <Button variant="outline" size="sm" className="w-full btn-press glass border-white/30">
            <Sparkles className="h-4 w-4 mr-2" />
            Complete Profile
          </Button>
        </Link>
      )}
    </div>
  )
}
