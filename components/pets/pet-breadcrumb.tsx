import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PawPrint } from 'lucide-react'

interface PetBreadcrumbProps {
  petId: string
  petName: string
  petPhotoUrl?: string | null
  currentPage?: string
}

export function PetBreadcrumb({ petId, petName, petPhotoUrl, currentPage }: PetBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {currentPage ? (
            <BreadcrumbLink asChild>
              <Link href={`/pets/${petId}`} className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={petPhotoUrl || undefined} alt={petName} />
                  <AvatarFallback className="bg-primary/10 text-[8px]">
                    <PawPrint className="h-3 w-3 text-primary/60" />
                  </AvatarFallback>
                </Avatar>
                {petName}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={petPhotoUrl || undefined} alt={petName} />
                <AvatarFallback className="bg-primary/10 text-[8px]">
                  <PawPrint className="h-3 w-3 text-primary/60" />
                </AvatarFallback>
              </Avatar>
              {petName}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {currentPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
