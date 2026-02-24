import Link from 'next/link'
import { Pet } from '@/lib/types/pet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, ArrowLeft } from 'lucide-react'
import { PetSwitcher } from './pet-switcher'
import { PetPhotoEditor } from './pet-photo-editor'

interface PetHeaderProps {
  pet: Pet
}

// Format date without timezone issues
function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return date.toLocaleDateString()
}

export function PetHeader({ pet }: PetHeaderProps) {
  const age = pet.birthday
    ? (() => {
        const [year, month, day] = pet.birthday.split('-')
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      })()
    : null

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <PetPhotoEditor
            petId={pet.id}
            petName={pet.name}
            photoUrl={pet.photo_url}
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/pets/${pet.id}`} className="hover:text-primary transition-colors">
                    <h1 className="text-2xl font-bold">{pet.name}</h1>
                  </Link>
                  <PetSwitcher currentPetId={pet.id} />
                </div>
                <p className="text-muted-foreground">
                  {pet.breed ? `${pet.breed} ` : ''}{pet.species}
                  <span className="mx-2">·</span>
                  <Link href={`/pets/${pet.id}`} className="text-primary/80 hover:text-primary text-sm">
                    View Overview
                  </Link>
                </p>
              </div>
              <Link href={`/pets/${pet.id}/edit`}>
                <Button variant="outline" size="sm" className="glass border-white/30 hover:bg-white/50 dark:hover:bg-white/10">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {age !== null && (
                <Badge variant="secondary" className="glass">
                  {age === 0 ? '< 1 year old' : `${age} year${age !== 1 ? 's' : ''} old`}
                </Badge>
              )}
              {pet.birthday && (
                <Badge variant="outline" className="glass border-white/30">
                  Born {formatDate(pet.birthday)}
                </Badge>
              )}
              {pet.microchip_number && (
                <Badge variant="outline" className="glass border-white/30">
                  Microchip: {pet.microchip_number}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
