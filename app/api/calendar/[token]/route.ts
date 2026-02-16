import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateICSFeed, isValidCalendarFeedToken } from '@/lib/calendar/ics-generator'

// Create a Supabase client for public access (uses anon key but calls SECURITY DEFINER function)
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Validate token format
  if (!isValidCalendarFeedToken(token)) {
    return NextResponse.json(
      { error: 'Invalid token format' },
      { status: 400 }
    )
  }

  try {
    const supabase = getSupabaseClient()

    // Call the SECURITY DEFINER function to get feed data
    const { data, error } = await supabase.rpc('get_calendar_feed_data', {
      feed_token: token,
    })

    if (error) {
      console.error('Error fetching calendar feed data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calendar data' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Calendar feed not found or inactive' },
        { status: 404 }
      )
    }

    // Generate ICS content
    const baseUrl = request.nextUrl.origin
    const icsContent = generateICSFeed(data, baseUrl)

    // Return the ICS file with appropriate headers
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="pet-calendar.ics"`,
        // Allow caching for 1 hour, but revalidate
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    })
  } catch (err) {
    console.error('Calendar feed error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
