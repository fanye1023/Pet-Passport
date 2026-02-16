import { redirect } from 'next/navigation'

export default async function RoutinePage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  redirect(`/pets/${petId}/care?tab=routine`)
}
