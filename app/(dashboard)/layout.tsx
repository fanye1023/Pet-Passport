import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardWrapper, MainContentWrapper } from '@/components/dashboard/dashboard-wrapper'
import { FeedbackButton } from '@/components/feedback/feedback-button'
import { SubscriptionProvider } from '@/contexts/subscription-context'

// Disable caching to ensure fresh auth check on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Disable all caching
  noStore()

  // Force dynamic by reading headers
  const headersList = await headers()
  const cookie = headersList.get('cookie')

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('[DashboardLayout] Server auth check:', {
    hasUser: !!user,
    userId: user?.id,
    error: error?.message,
    hasCookieHeader: !!cookie,
    cookieLength: cookie?.length || 0,
  })

  if (!user) {
    console.log('[DashboardLayout] No user found, redirecting to login')
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
