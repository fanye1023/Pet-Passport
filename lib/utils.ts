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
 * Check if a date string represents a date that has passed (expired).
 * Compares dates only, ignoring time to avoid timezone issues.
 * A date is expired if it's strictly before today.
 */
export function isDateExpired(dateString: string | null): boolean {
  if (!dateString) return false

  // Parse the date and get just the date parts
  const [year, month, day] = dateString.split('-').map(Number)
  const expDate = new Date(year, month - 1, day) // Local midnight

  // Get today at local midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return expDate < today
}

/**
 * Check if a date is expiring soon (within the next N days).
 * A date is "expiring soon" if it's today or in the future, but within the threshold.
 */
export function isDateExpiringSoon(dateString: string | null, daysThreshold: number = 30): boolean {
  if (!dateString) return false

  // Parse the date and get just the date parts
  const [year, month, day] = dateString.split('-').map(Number)
  const expDate = new Date(year, month - 1, day) // Local midnight

  // Get today at local midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get threshold date
  const threshold = new Date(today)
  threshold.setDate(threshold.getDate() + daysThreshold)

  // Expiring soon if: not expired AND before threshold
  return expDate >= today && expDate <= threshold
}

/**
 * Open a PDF document using a signed URL.
 * Uses the API route to generate signed URLs for private bucket documents.
 */
export async function openPdfWithSignedUrl(documentUrl: string): Promise<void> {
  // Check if this is a private bucket URL
  if (documentUrl.includes('/pet-documents/')) {
    // Use the API route to get a signed URL
    const apiUrl = `/api/document?url=${encodeURIComponent(documentUrl)}`
    window.open(apiUrl, '_blank')
    return
  }

  // For public URLs, open directly
  window.open(documentUrl, '_blank')
}
