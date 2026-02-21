import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SharedPetData, SharePinRequired } from '@/lib/types/pet'
import { ShareContent } from '@/components/share/share-content'
import { PinEntryGate } from '@/components/share/pin-entry-gate'

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
