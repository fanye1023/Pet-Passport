import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardWrapper, MainContentWrapper } from '@/components/dashboard/dashboard-wrapper'
import { FeedbackButton } from '@/components/feedback/feedback-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // First try getSession() which reads from cookies (fast, no network call)
  // Then validate with getUser() if session exists
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Validate the session is still valid
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardWrapper>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
            <MainContentWrapper>
              {children}
            </MainContentWrapper>
          </main>
        </div>
        <MobileNav />
        <FeedbackButton />
      </div>
    </DashboardWrapper>
  )
}
