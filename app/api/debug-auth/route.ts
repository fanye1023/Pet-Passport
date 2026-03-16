import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Debug endpoint to inspect auth state on Vercel
// Access via /api/debug-auth
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Get all cookies from Next.js cookies() API
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c =>
    c.name.includes('sb-') || c.name.includes('auth')
  )

  // Get Cookie header from request headers
  const cookieHeader = headersList.get('cookie')

  // Also get cookies directly from the NextRequest object
  const requestCookies = request.cookies.getAll()
  const requestAuthCookies = requestCookies.filter(c =>
    c.name.includes('sb-') || c.name.includes('auth')
  )

  // Parse cookie header manually to compare
  const parsedFromHeader: { name: string; valueLength: number }[] = []
  if (cookieHeader) {
    const pairs = cookieHeader.split(';').map(s => s.trim())
    for (const pair of pairs) {
      const eqIndex = pair.indexOf('=')
      if (eqIndex > 0) {
        const name = pair.substring(0, eqIndex)
        const value = pair.substring(eqIndex + 1)
        if (name.includes('sb-') || name.includes('auth')) {
          parsedFromHeader.push({ name, valueLength: value.length })
        }
      }
    }
  }

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
    cookiesFromNextApi: {
      total: allCookies.length,
      authCookies: authCookies.map(c => ({
        name: c.name,
        valueLength: c.value?.length || 0,
        valuePreview: c.value?.substring(0, 50) + '...',
      })),
    },
    cookiesFromRequest: {
      total: requestCookies.length,
      authCookies: requestAuthCookies.map(c => ({
        name: c.name,
        valueLength: c.value?.length || 0,
      })),
    },
    cookieHeader: {
      present: !!cookieHeader,
      length: cookieHeader?.length || 0,
      preview: cookieHeader ? cookieHeader.substring(0, 200) + '...' : null,
      parsedAuthCookies: parsedFromHeader,
    },
    auth: userResult,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
