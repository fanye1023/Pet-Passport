import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PetForm } from '@/components/pets/pet-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  const supabase = await createClient()

  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  if (error || !pet) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/pets/${petId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {pet.name}
      </Link>

      <div className="flex justify-center">
        <PetForm pet={pet} />
      </div>
    </div>
  )
}
