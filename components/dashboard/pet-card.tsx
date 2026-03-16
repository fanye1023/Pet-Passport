import Link from 'next/link'
import { Pet } from '@/lib/types/pet'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PawPrint, ChevronRight } from 'lucide-react'

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const age = pet.birthday
    ? Math.floor(
        (Date.now() - new Date(pet.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  return (
    <Link href={`/pets/${pet.id}`}>
      <Card className="hover:bg-muted/50 cursor-pointer card-hover group">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
            <AvatarFallback>
              <PawPrint className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{pet.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {pet.breed ? `${pet.breed} ` : ''}{pet.species}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {age !== null && (
                <Badge variant="secondary" className="text-xs">
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
        </CardContent>
      </Card>
    </Link>
  )
}
