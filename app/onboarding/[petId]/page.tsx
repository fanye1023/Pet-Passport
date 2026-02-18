import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingContainerNew } from '@/components/onboarding/onboarding-container-new'

export default async function OnboardingSetupPage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: pet, error } = await supabase
    .from('pets')
    .select('id, name, species, photo_url')
    .eq('id', petId)
    .single()

  if (error || !pet) {
    notFound()
  }

  return (
    <OnboardingContainerNew
      petId={pet.id}
      petName={pet.name}
      petSpecies={pet.species}
      petPhotoUrl={pet.photo_url}
    />
  )
}
