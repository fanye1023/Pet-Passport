'use client'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Pet } from '@/lib/types/pet'

// Predefined color palette for pets
export const petColors = [
  { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30' },
  { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-100 dark:bg-green-900/30' },
  { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30' },
  { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30' },
  { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-100 dark:bg-pink-900/30' },
  { bg: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-100 dark:bg-teal-900/30' },
  { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-900/30' },
  { bg: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-900/30' },
]

export function getPetColor(index: number) {
  return petColors[index % petColors.length]
}

interface PetColorLegendProps {
  pets: Pet[]
  selectedPetIds: Set<string>
  onTogglePet: (petId: string) => void
}

export function PetColorLegend({ pets, selectedPetIds, onTogglePet }: PetColorLegendProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {pets.map((pet, index) => {
        const color = getPetColor(index)
        const isSelected = selectedPetIds.has(pet.id)

        return (
          <label
            key={pet.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all',
              'border border-white/20 hover:border-primary/30',
              isSelected
                ? 'bg-white/50 dark:bg-white/10'
                : 'bg-white/20 dark:bg-white/5 opacity-60'
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onTogglePet(pet.id)}
              className="sr-only"
            />
            <div className={cn('w-3 h-3 rounded-full', color.bg)} />
            <Avatar className="h-6 w-6">
              <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
              <AvatarFallback className="text-xs">
                {pet.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              'text-sm font-medium',
              !isSelected && 'text-muted-foreground'
            )}>
              {pet.name}
            </span>
          </label>
        )
      })}
    </div>
  )
}
