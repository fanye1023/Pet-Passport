import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website&key=${apiKey}`

    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (detailsData.status !== 'OK') {
      console.error('Places details API error:', detailsData)
      return NextResponse.json({ error: 'Failed to get place details' }, { status: 500 })
    }

    const place = detailsData.result

    return NextResponse.json({
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
    })
  } catch (error) {
    console.error('Places details error:', error)
    return NextResponse.json({ error: 'Failed to get place details' }, { status: 500 })
  }
}
