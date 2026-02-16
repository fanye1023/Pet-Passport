'use client'

import { ExternalLink } from 'lucide-react'

interface VetMapPreviewProps {
  address: string
  clinicName?: string
  className?: string
}

export function VetMapPreview({ address, clinicName, className = '' }: VetMapPreviewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Encode the address for URL
  const encodedAddress = encodeURIComponent(address)

  // Google Maps Embed API URL
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=15`
    : `https://maps.google.com/maps?q=${encodedAddress}&output=embed`

  // Google Maps directions URL (opens in new tab)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

  return (
    <div className={`relative group ${className}`}>
      {/* Map iframe container */}
      <div className="w-full aspect-square rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-muted">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map location of ${clinicName || address}`}
          className="pointer-events-none"
        />
      </div>

      {/* Clickable overlay for directions */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors rounded-xl cursor-pointer"
        title="Open directions in Google Maps"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-white text-xs font-medium bg-black/60 px-2.5 py-1.5 rounded-lg">
          <ExternalLink className="h-3.5 w-3.5" />
          Directions
        </span>
      </a>
    </div>
  )
}
