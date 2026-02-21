import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@/lib/supabase/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip path traversal sequences, separators, and null bytes from a file name. */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/\0/g, '')       // null bytes
    .replace(/\.\./g, '')     // path traversal
    .replace(/[/\\]/g, '_')   // path separators
    .trim() || 'file'
}

/**
 * Open a PDF document using a signed URL.
 * Handles private bucket URLs by generating a temporary signed URL.
 */
export async function openPdfWithSignedUrl(documentUrl: string): Promise<void> {
  const supabase = createClient()

  // Extract the path from the URL
  const urlPath = documentUrl.split('/pet-documents/')[1]

  if (urlPath) {
    // Generate a signed URL that's valid for 5 minutes
    const { data: signedUrlData, error } = await supabase.storage
      .from('pet-documents')
      .createSignedUrl(urlPath, 300)

    if (signedUrlData?.signedUrl && !error) {
      window.open(signedUrlData.signedUrl, '_blank')
      return
    }
  }

  // Fallback to the original URL if signed URL fails
  window.open(documentUrl, '_blank')
}
