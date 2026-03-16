import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardWrapper, MainContentWrapper } from '@/components/dashboard/dashboard-wrapper'
import { FeedbackButton } from '@/components/feedback/feedback-button'
import { SubscriptionProvider } from '@/contexts/subscription-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <SubscriptionProvider>
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
    </SubscriptionProvider>
  )
}
