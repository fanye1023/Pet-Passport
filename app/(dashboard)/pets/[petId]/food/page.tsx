import { redirect } from 'next/navigation'

export default async function FoodPage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  redirect(`/pets/${petId}/care`)
}
