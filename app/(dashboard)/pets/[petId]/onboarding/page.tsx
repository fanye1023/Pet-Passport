import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingContainer } from '@/components/onboarding/onboarding-container'

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  const supabase = await createClient()

  const { data: pet, error } = await supabase
    .from('pets')
    .select('id, name, species')
    .eq('id', petId)
    .single()

  if (error || !pet) {
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <OnboardingContainer
        petId={pet.id}
        petName={pet.name}
        petSpecies={pet.species}
      />
    </div>
  )
}
