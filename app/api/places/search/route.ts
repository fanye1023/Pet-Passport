import { NextRequest, NextResponse } from 'next/server'

// Cache search results for 1 hour
export const revalidate = 3600

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  try {
    // Search for veterinary clinics
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' veterinary clinic')}&type=veterinary_care&key=${apiKey}`

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', JSON.stringify(searchData, null, 2))
      return NextResponse.json({
        error: 'Failed to search places',
        details: searchData.status,
        message: searchData.error_message
      }, { status: 500 })
    }

    const results = searchData.results?.slice(0, 5).map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
    })) || []

    return NextResponse.json({ results }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Places search error:', error)
    return NextResponse.json({ error: 'Failed to search places' }, { status: 500 })
  }
}
