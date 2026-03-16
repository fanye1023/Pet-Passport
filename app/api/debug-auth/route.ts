import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Debug endpoint to inspect auth state on Vercel
// Access via /api/debug-auth
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Get all cookies
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c =>
    c.name.includes('sb-') || c.name.includes('auth')
  )

  // Get Cookie header from request
  const cookieHeader = headersList.get('cookie')

  // Try to get user
  let userResult: { user: unknown; error: string | null } = { user: null, error: null }
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    userResult = {
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message || null
    }
  } catch (e) {
    userResult = { user: null, error: String(e) }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    cookies: {
      total: allCookies.length,
      authCookies: authCookies.map(c => ({
        name: c.name,
        valueLength: c.value?.length || 0,
        valuePreview: c.value?.substring(0, 50) + '...',
      })),
    },
    cookieHeader: {
      present: !!cookieHeader,
      length: cookieHeader?.length || 0,
    },
    auth: userResult,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
