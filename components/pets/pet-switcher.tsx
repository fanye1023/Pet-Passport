'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pet } from '@/lib/types/pet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PawPrint, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PetSwitcherProps {
  currentPetId: string
}

export function PetSwitcher({ currentPetId }: PetSwitcherProps) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function fetchPets() {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user's own pets and collaborated pets
      const [ownPets, collaboratedPets] = await Promise.all([
        supabase
          .from('pets')
          .select('*')
          .eq('user_id', user.id)
          .order('name'),
        supabase
          .from('pet_collaborators')
          .select('pets(*)')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
      ])

      const allPets: Pet[] = []

      if (ownPets.data) {
        allPets.push(...ownPets.data)
      }

      if (collaboratedPets.data) {
        for (const collab of collaboratedPets.data) {
          const pet = collab.pets as unknown as Pet | null
          if (pet && !allPets.find(p => p.id === pet.id)) {
            allPets.push(pet)
          }
        }
      }

      // Sort by name
      allPets.sort((a, b) => a.name.localeCompare(b.name))

      setPets(allPets)
      setLoading(false)
    }

    fetchPets()
  }, [])

  const currentPet = pets.find(p => p.id === currentPetId)

  const handleSwitchPet = (petId: string) => {
    // Keep the same sub-route when switching pets
    const pathParts = pathname.split('/')
    // /pets/[petId]/... -> replace petId
    const petIdIndex = pathParts.indexOf('pets') + 1
    if (petIdIndex > 0 && pathParts[petIdIndex]) {
      pathParts[petIdIndex] = petId
      router.push(pathParts.join('/'))
    } else {
      router.push(`/pets/${petId}`)
    }
  }

  // Don't show switcher if only one pet or still loading
  if (loading || pets.length <= 1) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground">
          <span className="text-xs">Switch Pet</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Your Pets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pets.map((pet) => (
          <DropdownMenuItem
            key={pet.id}
            onClick={() => handleSwitchPet(pet.id)}
            className={cn(
              'flex items-center gap-3 cursor-pointer',
              pet.id === currentPetId && 'bg-accent'
            )}
          >
            <Avatar className="h-8 w-8 ring-2 ring-white/50">
              <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xs">
                {pet.name[0]?.toUpperCase() || <PawPrint className="h-4 w-4 text-primary/60" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{pet.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {pet.breed ? `${pet.breed} ` : ''}{pet.species}
              </p>
            </div>
            {pet.id === currentPetId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
