import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_project_url') {
    return NextResponse.next()
  }

  // Create a response that we'll modify if needed
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
          // First, update the request cookies so server components can read them
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // Create a new response with the updated request
          supabaseResponse = NextResponse.next({
            request,
          })

          // Set cookies on the response so they're sent to the browser
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, {
              ...options,
              secure: true, // Required for HTTPS
            })
          })
        },
      },
    }
  )

  // IMPORTANT: Do not add any code between createServerClient and getUser()
  // This could cause issues with token refresh
  await supabase.auth.getUser()

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
