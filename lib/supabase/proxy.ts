import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Skip session refresh if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_project_url') {
    return NextResponse.next({ request })
  }

  // Create response that we'll modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          // Update request cookies so downstream Server Components can read them
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // Create a new response with the updated request
          response = NextResponse.next({
            request,
          })

          // Also set cookies on the response so the browser receives them
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Call getUser() to refresh the session
  // This validates the JWT and refreshes tokens if needed
  const { data: { user }, error } = await supabase.auth.getUser()

  // If there's no user and we're on a protected route,
  // the Server Component will handle the redirect
  // We just need to make sure the response has the right cookies

  return response
}
