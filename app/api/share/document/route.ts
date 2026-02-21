import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Use service role to bypass RLS for generating signed URLs
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

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
  // The URL might be URL-encoded, so we need to handle both cases
  let urlPath = documentUrl.split('/pet-documents/')[1]

  if (!urlPath) {
    return NextResponse.json({ error: 'Invalid document URL' }, { status: 400 })
  }

  // Decode the path in case it was double-encoded
  // But preserve the original encoding that Supabase expects
  try {
    // If the path contains %25 (encoded %), it was double-encoded
    if (urlPath.includes('%25')) {
      urlPath = decodeURIComponent(urlPath)
    }
  } catch {
    // If decoding fails, use the original path
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
    console.error('Signed URL error:', { error: signError, urlPath, documentUrl })
    return NextResponse.json({
      error: 'Failed to generate signed URL',
      details: signError?.message
    }, { status: 500 })
  }

  // Redirect to the signed URL
  return NextResponse.redirect(signedUrlData.signedUrl)
  } catch (error) {
    console.error('Share document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
