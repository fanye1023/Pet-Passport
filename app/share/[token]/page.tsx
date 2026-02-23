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

  const siteName = 'Pet ShareLink'
  const defaultDescription = 'Share your pet\'s care info safely with vets, sitters, and family.'

  if (!data) {
    return {
      title: siteName,
      description: defaultDescription,
      openGraph: {
        title: siteName,
        description: defaultDescription,
        siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: siteName,
        description: defaultDescription,
      },
    }
  }

  // Handle PIN-protected links
  if ((data as SharePinRequired).pin_required) {
    const pinData = data as SharePinRequired
    const title = `${pinData.pet_name}'s Care Info`
    const description = `View care instructions, emergency contacts, and health info for ${pinData.pet_name}`
    const photoUrl = pinData.pet_photo_url

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        siteName,
        type: 'website',
        images: photoUrl ? [{
          url: photoUrl,
          width: 400,
          height: 400,
          alt: `Photo of ${pinData.pet_name}`,
        }] : undefined,
      },
      twitter: {
        card: photoUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        images: photoUrl ? [photoUrl] : undefined,
      },
    }
  }

  const petData = data as SharedPetData
  const petName = petData.pet?.name || 'Pet'
  const species = petData.pet?.species || 'pet'
  const breed = petData.pet?.breed
  const title = `${petName}'s Care Info`
  const description = breed
    ? `Care instructions, emergency contacts, and health info for ${petName} the ${breed}`
    : `Care instructions, emergency contacts, and health info for ${petName}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName,
      type: 'website',
      images: petData.pet?.photo_url ? [{
        url: petData.pet.photo_url,
        width: 400,
        height: 400,
        alt: `Photo of ${petName}`,
      }] : undefined,
    },
    twitter: {
      card: petData.pet?.photo_url ? 'summary_large_image' : 'summary',
      title,
      description,
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
