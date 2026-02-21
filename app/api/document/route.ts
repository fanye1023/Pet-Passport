import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Verify user is authenticated
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const documentUrl = searchParams.get('url')

    if (!documentUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    // Extract path from the document URL
    const urlPath = documentUrl.split('/pet-documents/')[1]

    if (!urlPath) {
      return NextResponse.json({ error: 'Invalid document URL' }, { status: 400 })
    }

    // Check if the user has access to this document
    // The path format is: {user_id}/{pet_id}/...
    const pathParts = urlPath.split('/')
    const fileOwnerId = pathParts[0]
    const petId = pathParts[1]

    // User owns the file directly
    const isOwner = fileOwnerId === user.id

    // Or user is a collaborator on the pet
    let isCollaborator = false
    if (!isOwner && petId) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
      const { data: collab } = await supabaseAdmin
        .from('pet_collaborators')
        .select('id')
        .eq('pet_id', petId)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .single()

      isCollaborator = !!collab
    }

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Use service role to generate signed URL
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
      .from('pet-documents')
      .createSignedUrl(urlPath, 300) // 5 minutes

    if (signError || !signedUrlData?.signedUrl) {
      console.error('Failed to generate signed URL:', signError)
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
    }

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrlData.signedUrl)
  } catch (error) {
    console.error('Document API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
