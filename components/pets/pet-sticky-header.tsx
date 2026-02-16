'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Pet } from '@/lib/types/pet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PawPrint, Pencil, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PetStickyHeaderProps {
  pet: Pet
}

function calculateAge(birthday: string): number | null {
  if (!birthday) return null
  const [year, month, day] = birthday.split('-')
  const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export function PetStickyHeader({ pet }: PetStickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const age = pet.birthday ? calculateAge(pet.birthday) : null

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past 200px (roughly past the main header)
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link
              href={`/pets/${pet.id}`}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                  <PawPrint className="h-4 w-4 text-primary/60" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                    {pet.name}
                  </span>
                  {age !== null && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {age === 0 ? '<1y' : `${age}y`}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground leading-tight">
                  {pet.breed ? `${pet.breed} ` : ''}{pet.species}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link href={`/pets/${pet.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1.5">Edit</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                <span className="hidden sm:inline ml-1.5">Top</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
