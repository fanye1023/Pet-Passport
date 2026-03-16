import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardWrapper, MainContentWrapper } from '@/components/dashboard/dashboard-wrapper'
import { FeedbackButton } from '@/components/feedback/feedback-button'
import { SubscriptionProvider } from '@/contexts/subscription-context'

// Force dynamic rendering to ensure fresh auth check on every request
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Debug: Check what cookies are available
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'))
  console.log('[DashboardLayout] Cookies:', {
    total: allCookies.length,
    authCookieCount: authCookies.length,
    authCookieNames: authCookies.map(c => c.name),
  })

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('[DashboardLayout] Auth check:', {
    hasUser: !!user,
    userId: user?.id?.slice(0, 8),
    error: error?.message,
  })

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
