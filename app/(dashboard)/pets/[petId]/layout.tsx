import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PetHeader } from '@/components/pets/pet-header'
import { PetNav } from '@/components/pets/pet-nav'
import { PetStickyHeader } from '@/components/pets/pet-sticky-header'
import { OnboardingPrompt } from '@/components/pets/onboarding-prompt'

// Disable caching to ensure fresh auth check on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function PetLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ petId: string }>
}) {
  // Disable all caching
  noStore()

  // Force dynamic by reading headers
  const headersList = await headers()
  const cookie = headersList.get('cookie')

  const { petId } = await params
  const supabase = await createClient()

  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  console.log('[PetLayout] Pet query:', {
    petId,
    petName: pet?.name,
    error: error?.message,
    hasCookieHeader: !!cookie,
    cookieLength: cookie?.length || 0,
  })

  if (error || !pet) {
    console.log('[PetLayout] Pet not found, calling notFound()')
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
