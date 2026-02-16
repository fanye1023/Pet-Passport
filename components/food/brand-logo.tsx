'use client'

import { useState } from 'react'

// Logo sources in order of preference
const getLogoSources = (domain: string) => [
  `https://logo.clearbit.com/${domain}`,
  `https://img.logo.dev/${domain}?token=pk_VAZ6tvAVQHCDwKeqFfSbYQ`, // Logo.dev free tier
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  `https://${domain}/favicon.ico`,
]

interface BrandLogoProps {
  domain: string
  brandName?: string
  size?: number
  className?: string
  containerClassName?: string
}

export function BrandLogo({
  domain,
  brandName,
  size = 64,
  className = '',
  containerClassName = ''
}: BrandLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [allFailed, setAllFailed] = useState(false)

  const sources = getLogoSources(domain)

  const handleError = () => {
    const nextIndex = sourceIndex + 1
    if (nextIndex < sources.length) {
      setSourceIndex(nextIndex)
    } else {
      setAllFailed(true)
    }
  }

  if (allFailed) {
    return null
  }

  return (
    <div className={containerClassName} style={{ display: loaded ? undefined : 'none' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[sourceIndex]}
        alt={brandName || 'Brand logo'}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        onError={handleError}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
