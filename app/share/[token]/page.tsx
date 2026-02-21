import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SharedPetData, SharePinRequired } from '@/lib/types/pet'
import { ShareContent } from '@/components/share/share-content'
import { PinEntryGate } from '@/components/share/pin-entry-gate'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const supabase = await createClient()

  const { data } = await supabase.rpc('get_pet_by_share_token', {
    share_token: token,
  })

  if (!data) {
    return {
      title: 'Pet ShareLink',
      description: 'View pet information shared with you',
    }
  }

  // Handle PIN-protected links
  if ((data as SharePinRequired).pin_required) {
    const pinData = data as SharePinRequired
    return {
      title: `${pinData.pet_name}'s ShareLink`,
      description: `View care information for ${pinData.pet_name}`,
      openGraph: {
        title: `${pinData.pet_name}'s ShareLink`,
        description: `View care information for ${pinData.pet_name}`,
        type: 'website',
      },
    }
  }

  const petData = data as SharedPetData
  const petName = petData.pet?.name || 'Pet'
  const breed = petData.pet?.breed
  const description = breed
    ? `Care information for ${petName} the ${breed}`
    : `Care information for ${petName}`

  return {
    title: `${petName}'s ShareLink`,
    description,
    openGraph: {
      title: `${petName}'s ShareLink`,
      description,
      type: 'website',
      images: petData.pet?.photo_url ? [petData.pet.photo_url] : undefined,
    },
  }
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_pet_by_share_token', {
    share_token: token,
  })

  if (error || !data) {
    notFound()
  }

  // Check if PIN is required
  if ((data as SharePinRequired).pin_required) {
    const pinData = data as SharePinRequired
    return <PinEntryGate token={token} petName={pinData.pet_name} />
  }

  return <ShareContent data={data as SharedPetData} shareToken={token} />
}
