import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from './settings-content'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Layout will redirect
  }

  // Fetch subscription server-side
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Check if expired
  const isPremium = subscription?.tier === 'premium' &&
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date())

  return (
    <SettingsContent
      email={user.email || ''}
      subscription={subscription}
      isPremium={isPremium}
    />
  )
}
