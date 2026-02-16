export function generateShareToken(): string {
  // Generate 16 random bytes and encode as URL-safe base64
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function isValidShareToken(token: string): boolean {
  // Token should be URL-safe base64, 22 characters
  return /^[A-Za-z0-9_-]{22}$/.test(token)
}

export function getShareUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${token}`
  }
  return `/share/${token}`
}
