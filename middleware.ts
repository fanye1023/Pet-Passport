import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Consistent cookie options across client, server, and middleware
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_project_url') {
    return NextResponse.next()
  }

  // Clone the request headers - we'll modify these if tokens are refreshed
  const requestHeaders = new Headers(request.headers)

  // Create initial response - we'll replace this if cookies need to be set
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Track if we've updated cookies
  let cookiesUpdated = false

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesUpdated = true

          // Build the new cookie header value for the request
          // Start with existing non-auth cookies
          const existingCookies = request.cookies.getAll()
          const authCookieNames = new Set(cookiesToSet.map(c => c.name))
          const nonAuthCookies = existingCookies.filter(c => !authCookieNames.has(c.name))

          // Combine non-auth cookies with new auth cookies
          const allCookieStrings = [
            ...nonAuthCookies.map(c => `${c.name}=${c.value}`),
            ...cookiesToSet.map(c => `${c.name}=${c.value}`),
          ]

          // Update the Cookie header on the request
          requestHeaders.set('Cookie', allCookieStrings.join('; '))

          // Create new response with the updated request headers
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })

          // Set cookies on the response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...cookieOptions,
            })
          )

          console.log('[Middleware] Tokens refreshed, updated cookies:', cookiesToSet.map(c => c.name))
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Debug logging for auth issues
  if (request.nextUrl.pathname.startsWith('/pets/') ||
      request.nextUrl.pathname === '/dashboard' ||
      request.nextUrl.pathname === '/settings' ||
      request.nextUrl.pathname.startsWith('/api/')) {
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(c =>
      c.name.includes('sb-') || c.name.includes('auth')
    )
    console.log('[Middleware]', request.nextUrl.pathname, {
      hasUser: !!user,
      userId: user?.id?.slice(0, 8),
      error: error?.message,
      cookiesUpdated,
      totalCookies: allCookies.length,
      authCookies: authCookies.map(c => ({
        name: c.name,
        valueLength: c.value?.length || 0
      }))
    })
  }

  // If no user and trying to access protected routes, the layout will handle redirect
  // We still return the response with potentially refreshed cookies
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/webhooks (webhook endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)',
  ],
}
