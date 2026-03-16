import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_project_url') {
    return NextResponse.next()
  }

  // Create initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so subsequent server code can read them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Create new response with updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          // Also set cookies on the response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
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
      request.nextUrl.pathname.startsWith('/api/')) {
    const authCookies = request.cookies.getAll().filter(c =>
      c.name.includes('sb-') || c.name.includes('auth')
    )
    console.log('[Middleware]', request.nextUrl.pathname, {
      hasUser: !!user,
      userId: user?.id?.slice(0, 8),
      error: error?.message,
      authCookiesCount: authCookies.length
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
