import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_project_url') {
    return NextResponse.next()
  }

  // Debug: Log for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('[Middleware] API route:', request.nextUrl.pathname)
  }

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and getUser()
  // Refresh the session - this is critical for maintaining auth state
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Debug logging for auth issues
  if (request.nextUrl.pathname.startsWith('/pets/') || request.nextUrl.pathname === '/dashboard') {
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
