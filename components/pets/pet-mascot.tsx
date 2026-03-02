'use client'

import { useCompanionOptional } from '@/components/ui/pet-companion'
import { cn } from '@/lib/utils'

// Simplified inline mascot SVGs for header use
function DogMascotSmall({ colors, className }: { colors: { primary: string; secondary: string }; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill={colors.primary} />
      <ellipse cx="30" cy="30" rx="8" ry="14" fill={colors.secondary} transform="rotate(-15 30 30)" />
      <ellipse cx="70" cy="30" rx="8" ry="14" fill={colors.secondary} transform="rotate(15 70 30)" />
      <circle cx="40" cy="48" r="4" fill="#333" />
      <circle cx="60" cy="48" r="4" fill="#333" />
      <circle cx="41" cy="47" r="1.5" fill="white" />
      <circle cx="61" cy="47" r="1.5" fill="white" />
      <ellipse cx="50" cy="58" rx="5" ry="4" fill="#333" />
      <path d="M42 66 Q50 74 58 66" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CatMascotSmall({ colors, className }: { colors: { primary: string; secondary: string }; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="52" r="32" fill={colors.primary} />
      <polygon points="25,35 18,8 38,28" fill={colors.secondary} />
      <polygon points="75,35 82,8 62,28" fill={colors.secondary} />
      <polygon points="27,33 22,14 36,28" fill="#FFB6C1" />
      <polygon points="73,33 78,14 64,28" fill="#FFB6C1" />
      <ellipse cx="38" cy="48" rx="4" ry="5" fill="#7EC87E" />
      <ellipse cx="62" cy="48" rx="4" ry="5" fill="#7EC87E" />
      <ellipse cx="38" cy="48" rx="1.5" ry="3" fill="#333" />
      <ellipse cx="62" cy="48" rx="1.5" ry="3" fill="#333" />
      <polygon points="50,58 46,64 54,64" fill="#FFB6C1" />
      <path d="M44 66 Q50 72 56 66" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function OtherMascotSmall({ colors, className }: { colors: { primary: string; secondary: string }; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="35" ry="30" fill={colors.primary} />
      <circle cx="38" cy="48" r="6" fill="white" />
      <circle cx="62" cy="48" r="6" fill="white" />
      <circle cx="39" cy="49" r="3" fill="#333" />
      <circle cx="63" cy="49" r="3" fill="#333" />
      <ellipse cx="30" cy="62" rx="6" ry="3" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="70" cy="62" rx="6" ry="3" fill="#FFB6C1" opacity="0.5" />
      <path d="M42 70 Q50 78 58 70" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Breed color mappings (simplified version)
const dogColors: Record<string, { primary: string; secondary: string }> = {
  'golden retriever': { primary: '#D4A574', secondary: '#C4956A' },
  'labrador': { primary: '#F5DEB3', secondary: '#E8D4A8' },
  'french bulldog': { primary: '#D4C4B0', secondary: '#C4B4A0' },
  'german shepherd': { primary: '#8B7355', secondary: '#2D2D2D' },
  'husky': { primary: '#808080', secondary: '#FFFFFF' },
  'corgi': { primary: '#E8A855', secondary: '#D49845' },
  'poodle': { primary: '#F5F5F5', secondary: '#E8E8E8' },
  'default': { primary: '#D4A574', secondary: '#C4956A' },
}

const catColors: Record<string, { primary: string; secondary: string }> = {
  'tabby': { primary: '#8B7355', secondary: '#6B5344' },
  'siamese': { primary: '#F5DEB3', secondary: '#8B7355' },
  'persian': { primary: '#F5F5F5', secondary: '#E8E8E8' },
  'black cat': { primary: '#2D2D2D', secondary: '#1A1A1A' },
  'orange': { primary: '#E8A855', secondary: '#D49845' },
  'default': { primary: '#808080', secondary: '#606060' },
}

function getColors(species: string, breed: string | null) {
  const normalizedBreed = breed?.toLowerCase().trim() || 'default'

  if (species === 'dog') {
    return dogColors[normalizedBreed] || dogColors['default']
  } else if (species === 'cat') {
    return catColors[normalizedBreed] || catColors['default']
  }

  return { primary: '#6BB5B5', secondary: '#5AA5A5' }
}

interface PetMascotProps {
  species: string
  breed: string | null
  className?: string
}

/**
 * Small inline pet mascot for use in headers/toolbars.
 * Syncs with the companion context if available.
 */
export function PetMascot({ species, breed, className }: PetMascotProps) {
  const companion = useCompanionOptional()

  // Use companion state if available, otherwise use props
  const actualSpecies = companion?.state.species || species
  const actualBreed = companion?.state.breed || breed
  const isVisible = companion?.state.isVisible ?? true

  if (!isVisible) return null

  const colors = getColors(actualSpecies, actualBreed)

  const MascotComponent =
    actualSpecies === 'dog' ? DogMascotSmall :
    actualSpecies === 'cat' ? CatMascotSmall :
    OtherMascotSmall

  return (
    <div className={cn("w-8 h-8 transition-transform hover:scale-110", className)}>
      <MascotComponent colors={colors} className="w-full h-full drop-shadow-sm" />
    </div>
  )
}
