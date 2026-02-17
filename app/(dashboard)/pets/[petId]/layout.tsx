import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PetHeader } from '@/components/pets/pet-header'
import { PetNav } from '@/components/pets/pet-nav'
import { PetStickyHeader } from '@/components/pets/pet-sticky-header'
import { OnboardingPrompt } from '@/components/pets/onboarding-prompt'

export default async function PetLayout({
  children,
  params,
}: {
  children: React.ReactNode
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
    <>
      <PetStickyHeader pet={pet} />
      <div className="space-y-6">
        <PetHeader pet={pet} />
        <OnboardingPrompt petId={petId} petName={pet.name} />
        <PetNav petId={petId} />
        {children}
      </div>
    </>
  )
}
