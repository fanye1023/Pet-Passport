import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  // Use service role to bypass RLS for generating signed URLs
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const documentUrl = searchParams.get('url')

  if (!token || !documentUrl) {
    return NextResponse.json({ error: 'Missing token or url' }, { status: 400 })
  }

  // Verify the share token is valid
  const { data: shareLink, error: shareError } = await supabaseAdmin
    .from('share_links')
    .select('pet_id, is_active, expires_at')
    .eq('token', token)
    .single()

  if (shareError || !shareLink) {
    return NextResponse.json({ error: 'Invalid share token' }, { status: 403 })
  }

  // Check if link is active and not expired
  if (!shareLink.is_active) {
    return NextResponse.json({ error: 'Share link is inactive' }, { status: 403 })
  }

  if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Share link has expired' }, { status: 403 })
  }

  // Extract path from the document URL
  const urlPath = documentUrl.split('/pet-documents/')[1]

  if (!urlPath) {
    return NextResponse.json({ error: 'Invalid document URL' }, { status: 400 })
  }

  // Verify the document belongs to the shared pet
  const { data: document, error: docError } = await supabaseAdmin
    .from('pet_documents')
    .select('pet_id')
    .eq('document_url', documentUrl)
    .single()

  if (docError || !document || document.pet_id !== shareLink.pet_id) {
    // Also check vaccination_records and health_records
    const { data: vaccination } = await supabaseAdmin
      .from('vaccination_records')
      .select('pet_id')
      .eq('document_url', documentUrl)
      .single()

    const { data: healthRecord } = await supabaseAdmin
      .from('health_records')
      .select('pet_id')
      .eq('document_url', documentUrl)
      .single()

    const { data: insurance } = await supabaseAdmin
      .from('pet_insurance')
      .select('pet_id')
      .eq('document_url', documentUrl)
      .single()

    const foundPetId = vaccination?.pet_id || healthRecord?.pet_id || insurance?.pet_id

    if (!foundPetId || foundPetId !== shareLink.pet_id) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 403 })
    }
  }

  // Generate signed URL (valid for 5 minutes)
  const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
    .from('pet-documents')
    .createSignedUrl(urlPath, 300)

  if (signError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }

  // Redirect to the signed URL
  return NextResponse.redirect(signedUrlData.signedUrl)
}
