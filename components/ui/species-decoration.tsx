'use client'

import { ReactNode } from 'react'

interface SpeciesDecorationProps {
  species: string
  children: ReactNode
  intensity?: 'light' | 'medium' | 'strong'
  className?: string
}

// SVG patterns for different species
const patterns = {
  dog: `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Paw print -->
      <ellipse cx="30" cy="35" rx="8" ry="10" fill="currentColor"/>
      <circle cx="20" cy="22" r="5" fill="currentColor"/>
      <circle cx="30" cy="18" r="5" fill="currentColor"/>
      <circle cx="40" cy="22" r="5" fill="currentColor"/>
      <!-- Bone -->
      <g transform="translate(5, 45) rotate(-30)">
        <rect x="8" y="4" width="14" height="4" rx="2" fill="currentColor"/>
        <circle cx="8" cy="4" r="4" fill="currentColor"/>
        <circle cx="8" cy="8" r="4" fill="currentColor"/>
        <circle cx="22" cy="4" r="4" fill="currentColor"/>
        <circle cx="22" cy="8" r="4" fill="currentColor"/>
      </g>
    </svg>
  `,
  cat: `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Paw print (smaller, more delicate) -->
      <ellipse cx="30" cy="38" rx="6" ry="8" fill="currentColor"/>
      <circle cx="22" cy="28" r="4" fill="currentColor"/>
      <circle cx="30" cy="25" r="4" fill="currentColor"/>
      <circle cx="38" cy="28" r="4" fill="currentColor"/>
      <!-- Fish -->
      <g transform="translate(8, 48)">
        <ellipse cx="12" cy="6" rx="10" ry="5" fill="currentColor"/>
        <path d="M22 6 L30 0 L30 12 Z" fill="currentColor"/>
        <circle cx="7" cy="5" r="1.5" fill="white" opacity="0.5"/>
      </g>
    </svg>
  `,
  other: `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Generic paw -->
      <ellipse cx="30" cy="35" rx="7" ry="9" fill="currentColor"/>
      <circle cx="21" cy="24" r="4.5" fill="currentColor"/>
      <circle cx="30" cy="20" r="4.5" fill="currentColor"/>
      <circle cx="39" cy="24" r="4.5" fill="currentColor"/>
      <!-- Heart -->
      <g transform="translate(8, 45)">
        <path d="M10 5 C10 2, 6 0, 3 3 C0 6, 0 9, 10 16 C20 9, 20 6, 17 3 C14 0, 10 2, 10 5" fill="currentColor"/>
      </g>
    </svg>
  `,
}

const opacityMap = {
  light: 0.03,
  medium: 0.05,
  strong: 0.08,
}

export function SpeciesDecoration({
  species,
  children,
  intensity = 'light',
  className = '',
}: SpeciesDecorationProps) {
  const pattern = patterns[species as keyof typeof patterns] || patterns.other
  const opacity = opacityMap[intensity]

  // Create data URI for the SVG pattern
  const encodedPattern = encodeURIComponent(pattern.replace('currentColor', 'rgb(20, 184, 166)'))
  const dataUri = `url("data:image/svg+xml,${encodedPattern}")`

  return (
    <div className={`relative ${className}`}>
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: dataUri,
          backgroundRepeat: 'repeat',
          backgroundSize: '60px 60px',
          opacity,
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Floating decorations that animate
export function FloatingSpeciesIcons({ species }: { species: string }) {
  const icons = species === 'dog'
    ? ['🦴', '🐾', '🎾', '🦮']
    : species === 'cat'
    ? ['🐟', '🐾', '🧶', '🐱']
    : ['🐾', '❤️', '⭐', '🌟']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map((icon, index) => (
        <div
          key={index}
          className="absolute text-2xl opacity-10 animate-float-slow"
          style={{
            left: `${15 + index * 25}%`,
            top: `${20 + (index % 2) * 40}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${4 + index}s`,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  )
}
