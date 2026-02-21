import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

interface LoginPageProps {
  searchParams: Promise<{
    returnTo?: string
    saveToken?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(params.returnTo || '/dashboard')
  }

  return <LoginForm returnTo={params.returnTo} saveToken={params.saveToken} />
}
