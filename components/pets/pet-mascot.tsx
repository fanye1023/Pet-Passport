'use client'

import { useState } from 'react'
import { useCompanionOptional } from '@/components/ui/pet-companion'
import { cn } from '@/lib/utils'

// Breed characteristics for visual differentiation
interface BreedTraits {
  colors: { primary: string; secondary: string; nose: string }
  earType: 'floppy' | 'pointed' | 'folded' | 'round' | 'small'
  faceType: 'round' | 'long' | 'flat' | 'normal'
  furType: 'fluffy' | 'sleek' | 'curly'
}

const dogBreedTraits: Record<string, BreedTraits> = {
  // Retrievers - floppy ears, friendly face
  'golden retriever': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'fluffy' },
  'labrador': { colors: { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'sleek' },
  'labrador retriever': { colors: { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'sleek' },

  // Flat-faced breeds
  'french bulldog': { colors: { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' }, earType: 'pointed', faceType: 'flat', furType: 'sleek' },
  'bulldog': { colors: { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' }, earType: 'folded', faceType: 'flat', furType: 'sleek' },
  'pug': { colors: { primary: '#D4B896', secondary: '#1A1A1A', nose: '#333' }, earType: 'folded', faceType: 'flat', furType: 'sleek' },
  'boston terrier': { colors: { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#333' }, earType: 'pointed', faceType: 'flat', furType: 'sleek' },

  // Pointed ear breeds
  'german shepherd': { colors: { primary: '#8B7355', secondary: '#2D2D2D', nose: '#333' }, earType: 'pointed', faceType: 'long', furType: 'fluffy' },
  'husky': { colors: { primary: '#808080', secondary: '#FFFFFF', nose: '#333' }, earType: 'pointed', faceType: 'normal', furType: 'fluffy' },
  'siberian husky': { colors: { primary: '#808080', secondary: '#FFFFFF', nose: '#333' }, earType: 'pointed', faceType: 'normal', furType: 'fluffy' },
  'corgi': { colors: { primary: '#E8A855', secondary: '#FFFFFF', nose: '#333' }, earType: 'pointed', faceType: 'long', furType: 'fluffy' },
  'shiba inu': { colors: { primary: '#E8A855', secondary: '#F5F5F5', nose: '#333' }, earType: 'pointed', faceType: 'normal', furType: 'fluffy' },

  // Small breeds
  'chihuahua': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'pointed', faceType: 'round', furType: 'sleek' },
  'yorkie': { colors: { primary: '#8B7355', secondary: '#D4A574', nose: '#333' }, earType: 'pointed', faceType: 'normal', furType: 'fluffy' },
  'yorkshire terrier': { colors: { primary: '#8B7355', secondary: '#D4A574', nose: '#333' }, earType: 'pointed', faceType: 'normal', furType: 'fluffy' },
  'pomeranian': { colors: { primary: '#E8A855', secondary: '#D49845', nose: '#333' }, earType: 'small', faceType: 'round', furType: 'fluffy' },
  'maltese': { colors: { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#333' }, earType: 'floppy', faceType: 'round', furType: 'fluffy' },
  'shih tzu': { colors: { primary: '#F5F5F5', secondary: '#D4A574', nose: '#333' }, earType: 'floppy', faceType: 'flat', furType: 'fluffy' },

  // Hounds & long snouts
  'beagle': { colors: { primary: '#D4A574', secondary: '#8B4513', nose: '#333' }, earType: 'floppy', faceType: 'long', furType: 'sleek' },
  'dachshund': { colors: { primary: '#8B4513', secondary: '#7A3A0F', nose: '#333' }, earType: 'floppy', faceType: 'long', furType: 'sleek' },
  'greyhound': { colors: { primary: '#808080', secondary: '#606060', nose: '#333' }, earType: 'folded', faceType: 'long', furType: 'sleek' },

  // Curly coated
  'poodle': { colors: { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'curly' },
  'goldendoodle': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'curly' },
  'labradoodle': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'curly' },
  'bichon frise': { colors: { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#333' }, earType: 'floppy', faceType: 'round', furType: 'curly' },

  // Large breeds
  'rottweiler': { colors: { primary: '#1A1A1A', secondary: '#8B4513', nose: '#333' }, earType: 'folded', faceType: 'normal', furType: 'sleek' },
  'doberman': { colors: { primary: '#1A1A1A', secondary: '#8B4513', nose: '#333' }, earType: 'pointed', faceType: 'long', furType: 'sleek' },
  'boxer': { colors: { primary: '#8B5A2B', secondary: '#FFFFFF', nose: '#333' }, earType: 'folded', faceType: 'flat', furType: 'sleek' },
  'great dane': { colors: { primary: '#4A4A4A', secondary: '#3A3A3A', nose: '#333' }, earType: 'floppy', faceType: 'long', furType: 'sleek' },

  // Spaniels
  'cocker spaniel': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'fluffy' },
  'cavalier': { colors: { primary: '#8B4513', secondary: '#FFFFFF', nose: '#333' }, earType: 'floppy', faceType: 'round', furType: 'fluffy' },
  'cavalier king charles': { colors: { primary: '#8B4513', secondary: '#FFFFFF', nose: '#333' }, earType: 'floppy', faceType: 'round', furType: 'fluffy' },

  // Border collie
  'border collie': { colors: { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#333' }, earType: 'folded', faceType: 'long', furType: 'fluffy' },
  'australian shepherd': { colors: { primary: '#4A4A4A', secondary: '#D4A574', nose: '#333' }, earType: 'folded', faceType: 'normal', furType: 'fluffy' },

  'default': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal', furType: 'sleek' },
}

const catBreedTraits: Record<string, BreedTraits> = {
  // Standard cats
  'tabby': { colors: { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },
  'orange tabby': { colors: { primary: '#E8A855', secondary: '#D49845', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },
  'domestic shorthair': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },

  // Flat-faced cats
  'persian': { colors: { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#FFB6C1' }, earType: 'small', faceType: 'flat', furType: 'fluffy' },
  'exotic shorthair': { colors: { primary: '#E8A855', secondary: '#D49845', nose: '#FFB6C1' }, earType: 'small', faceType: 'flat', furType: 'sleek' },
  'himalayan': { colors: { primary: '#F5F5F5', secondary: '#8B7355', nose: '#FFB6C1' }, earType: 'small', faceType: 'flat', furType: 'fluffy' },

  // Angular/sleek
  'siamese': { colors: { primary: '#F5DEB3', secondary: '#8B7355', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long', furType: 'sleek' },
  'oriental': { colors: { primary: '#F5DEB3', secondary: '#8B7355', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long', furType: 'sleek' },
  'abyssinian': { colors: { primary: '#C4956A', secondary: '#B4856A', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long', furType: 'sleek' },

  // Folded ears
  'scottish fold': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'folded', faceType: 'round', furType: 'sleek' },

  // Round face
  'british shorthair': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'small', faceType: 'round', furType: 'sleek' },
  'ragdoll': { colors: { primary: '#F5F5F5', secondary: '#C4B4A0', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'round', furType: 'fluffy' },

  // Fluffy
  'maine coon': { colors: { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long', furType: 'fluffy' },
  'norwegian forest': { colors: { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'fluffy' },

  // Special
  'sphynx': { colors: { primary: '#E8D4C4', secondary: '#D8C4B4', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long', furType: 'sleek' },
  'bengal': { colors: { primary: '#D4A574', secondary: '#8B7355', nose: '#FFB6C1' }, earType: 'small', faceType: 'normal', furType: 'sleek' },
  'russian blue': { colors: { primary: '#6B7B8B', secondary: '#5B6B7B', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },

  // Patterns
  'tuxedo': { colors: { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },
  'calico': { colors: { primary: '#FFFFFF', secondary: '#E8A855', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },
  'black cat': { colors: { primary: '#1A1A1A', secondary: '#0A0A0A', nose: '#333' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },
  'white cat': { colors: { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },

  'default': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal', furType: 'sleek' },
}

function getBreedTraits(species: string, breed: string | null): BreedTraits {
  const normalizedBreed = breed?.toLowerCase().trim() || 'default'

  if (species === 'dog') {
    return dogBreedTraits[normalizedBreed] || dogBreedTraits['default']
  } else if (species === 'cat') {
    return catBreedTraits[normalizedBreed] || catBreedTraits['default']
  }

  return {
    colors: { primary: '#6BB5B5', secondary: '#5AA5A5', nose: '#333' },
    earType: 'round',
    faceType: 'round',
    furType: 'sleek',
  }
}

// Dog SVG with breed-specific features
function DogMascot({ traits, isHappy }: { traits: BreedTraits; isHappy: boolean }) {
  const { colors, earType, faceType, furType } = traits

  // Adjust face proportions based on faceType
  const snoutLength = faceType === 'long' ? 12 : faceType === 'flat' ? 4 : 8
  const faceWidth = faceType === 'round' ? 38 : faceType === 'flat' ? 40 : 35
  const eyeY = faceType === 'flat' ? 44 : 46
  const noseY = faceType === 'flat' ? 52 : faceType === 'long' ? 58 : 55

  // Fluffy outline effect
  const fluffyFilter = furType === 'fluffy' || furType === 'curly'

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {fluffyFilter && (
        <defs>
          <filter id="fluffy" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency={furType === 'curly' ? '0.08' : '0.04'} numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      )}

      {/* Head */}
      <ellipse
        cx="50" cy="52"
        rx={faceWidth} ry="32"
        fill={colors.primary}
        filter={fluffyFilter ? "url(#fluffy)" : undefined}
      />

      {/* Ears based on type */}
      {earType === 'floppy' && (
        <>
          <ellipse cx="22" cy="45" rx="10" ry="18" fill={colors.secondary} transform="rotate(-20 22 45)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="-20 22 45;-15 22 45;-20 22 45" dur="0.5s" repeatCount="indefinite"/>}
          </ellipse>
          <ellipse cx="78" cy="45" rx="10" ry="18" fill={colors.secondary} transform="rotate(20 78 45)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="20 78 45;15 78 45;20 78 45" dur="0.5s" repeatCount="indefinite" begin="0.1s"/>}
          </ellipse>
        </>
      )}
      {earType === 'pointed' && (
        <>
          <polygon points="25,40 15,12 38,32" fill={colors.secondary}>
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="0 25 40;-5 25 40;0 25 40" dur="0.4s" repeatCount="indefinite"/>}
          </polygon>
          <polygon points="75,40 85,12 62,32" fill={colors.secondary}>
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="0 75 40;5 75 40;0 75 40" dur="0.4s" repeatCount="indefinite" begin="0.1s"/>}
          </polygon>
        </>
      )}
      {earType === 'folded' && (
        <>
          <ellipse cx="25" cy="38" rx="12" ry="10" fill={colors.secondary} transform="rotate(-30 25 38)"/>
          <ellipse cx="75" cy="38" rx="12" ry="10" fill={colors.secondary} transform="rotate(30 75 38)"/>
        </>
      )}
      {earType === 'small' && (
        <>
          <ellipse cx="28" cy="30" rx="8" ry="10" fill={colors.secondary} transform="rotate(-15 28 30)"/>
          <ellipse cx="72" cy="30" rx="8" ry="10" fill={colors.secondary} transform="rotate(15 72 30)"/>
        </>
      )}

      {/* Snout area for flat-faced breeds */}
      {faceType === 'flat' && (
        <ellipse cx="50" cy="58" rx="18" ry="12" fill={colors.secondary} opacity="0.3"/>
      )}

      {/* Eyes */}
      <circle cx="38" cy={eyeY} r="5" fill="#333">
        {isHappy && <animate attributeName="r" values="5;6;5" dur="0.3s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="62" cy={eyeY} r="5" fill="#333">
        {isHappy && <animate attributeName="r" values="5;6;5" dur="0.3s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="39" cy={eyeY - 1} r="2" fill="white"/>
      <circle cx="63" cy={eyeY - 1} r="2" fill="white"/>

      {/* Nose */}
      <ellipse cx="50" cy={noseY} rx="6" ry="4" fill={colors.nose}/>

      {/* Mouth */}
      <path
        d={isHappy ? `M40 ${noseY + 8} Q50 ${noseY + 16} 60 ${noseY + 8}` : `M44 ${noseY + 6} Q50 ${noseY + 10} 56 ${noseY + 6}`}
        fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"
      />

      {/* Tongue when happy */}
      {isHappy && (
        <ellipse cx="50" cy={noseY + 14} rx="4" ry="5" fill="#FF9999">
          <animate attributeName="cy" values={`${noseY + 14};${noseY + 16};${noseY + 14}`} dur="0.3s" repeatCount="indefinite"/>
        </ellipse>
      )}
    </svg>
  )
}

// Cat SVG with breed-specific features
function CatMascot({ traits, isHappy }: { traits: BreedTraits; isHappy: boolean }) {
  const { colors, earType, faceType, furType } = traits

  const faceRx = faceType === 'round' ? 34 : faceType === 'long' ? 28 : 30
  const faceRy = faceType === 'round' ? 30 : faceType === 'flat' ? 28 : 30
  const eyeSpacing = faceType === 'long' ? 10 : 12
  const noseY = faceType === 'flat' ? 56 : faceType === 'long' ? 58 : 56

  const fluffyFilter = furType === 'fluffy'

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {fluffyFilter && (
        <defs>
          <filter id="fluffyCat" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      )}

      {/* Head */}
      <ellipse
        cx="50" cy="52"
        rx={faceRx} ry={faceRy}
        fill={colors.primary}
        filter={fluffyFilter ? "url(#fluffyCat)" : undefined}
      />

      {/* Ears */}
      {earType === 'pointed' && (
        <>
          <polygon points="25,38 16,8 40,30" fill={colors.secondary}>
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="0 25 38;-3 25 38;0 25 38" dur="0.6s" repeatCount="indefinite"/>}
          </polygon>
          <polygon points="75,38 84,8 60,30" fill={colors.secondary}>
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="0 75 38;3 75 38;0 75 38" dur="0.6s" repeatCount="indefinite" begin="0.2s"/>}
          </polygon>
          <polygon points="27,36 20,14 38,30" fill="#FFB6C1"/>
          <polygon points="73,36 80,14 62,30" fill="#FFB6C1"/>
        </>
      )}
      {earType === 'folded' && (
        <>
          <ellipse cx="28" cy="35" rx="12" ry="8" fill={colors.secondary} transform="rotate(-20 28 35)"/>
          <ellipse cx="72" cy="35" rx="12" ry="8" fill={colors.secondary} transform="rotate(20 72 35)"/>
        </>
      )}
      {earType === 'small' && (
        <>
          <polygon points="30,38 24,20 40,34" fill={colors.secondary}/>
          <polygon points="70,38 76,20 60,34" fill={colors.secondary}/>
          <polygon points="31,37 26,24 38,34" fill="#FFB6C1"/>
          <polygon points="69,37 74,24 62,34" fill="#FFB6C1"/>
        </>
      )}

      {/* Eyes - cat eyes are more almond shaped */}
      <ellipse cx={50 - eyeSpacing} cy="48" rx="5" ry={isHappy ? 6 : 5} fill="#7EC87E"/>
      <ellipse cx={50 + eyeSpacing} cy="48" rx="5" ry={isHappy ? 6 : 5} fill="#7EC87E"/>
      <ellipse cx={50 - eyeSpacing} cy="48" rx="2" ry={isHappy ? 4 : 3} fill="#333"/>
      <ellipse cx={50 + eyeSpacing} cy="48" rx="2" ry={isHappy ? 4 : 3} fill="#333"/>

      {/* Nose */}
      <polygon points={`50,${noseY - 2} 46,${noseY + 4} 54,${noseY + 4}`} fill={colors.nose}/>

      {/* Mouth */}
      <path d={`M46 ${noseY + 6} L50 ${noseY + 4} L54 ${noseY + 6}`} stroke="#333" strokeWidth="1.5" fill="none"/>
      {isHappy && (
        <path d={`M44 ${noseY + 8} Q50 ${noseY + 14} 56 ${noseY + 8}`} stroke="#333" strokeWidth="1.5" fill="none"/>
      )}

      {/* Whiskers */}
      <g stroke="#666" strokeWidth="0.75">
        <line x1="20" y1="52" x2="36" y2="54"/>
        <line x1="20" y1="56" x2="36" y2="56"/>
        <line x1="20" y1="60" x2="36" y2="58"/>
        <line x1="80" y1="52" x2="64" y2="54"/>
        <line x1="80" y1="56" x2="64" y2="56"/>
        <line x1="80" y1="60" x2="64" y2="58"/>
      </g>
    </svg>
  )
}

// Generic pet mascot
function OtherMascot({ isHappy }: { isHappy: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#6BB5B5">
        <animate attributeName="ry" values="30;31;30" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="38" cy="48" r="6" fill="white"/>
      <circle cx="62" cy="48" r="6" fill="white"/>
      <circle cx="39" cy="49" r="3" fill="#333">
        {isHappy && <animate attributeName="cy" values="49;47;49" dur="0.5s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="63" cy="49" r="3" fill="#333">
        {isHappy && <animate attributeName="cy" values="49;47;49" dur="0.5s" repeatCount="indefinite"/>}
      </circle>
      <ellipse cx="30" cy="62" rx="6" ry="3" fill="#FFB6C1" opacity="0.5"/>
      <ellipse cx="70" cy="62" rx="6" ry="3" fill="#FFB6C1" opacity="0.5"/>
      <path
        d={isHappy ? "M40 68 Q50 78 60 68" : "M44 68 Q50 72 56 68"}
        fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"
      />
    </svg>
  )
}

// Random tips for the speech bubble
const MASCOT_TIPS = [
  "Looking good today!",
  "Time for a walk?",
  "Don't forget treats!",
  "Belly rubs are the best!",
  "Keep those records updated!",
  "Ready for adventure!",
  "You're doing great!",
  "Stay pawsitive!",
]

interface PetMascotProps {
  species: string
  breed: string | null
  petName?: string
  className?: string
}

export function PetMascot({ species, breed, petName, className }: PetMascotProps) {
  const companion = useCompanionOptional()
  const [isHovered, setIsHovered] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')

  // Use companion state if available
  const actualSpecies = companion?.state.species || species
  const actualBreed = companion?.state.breed || breed
  const actualName = companion?.state.petName || petName
  const isVisible = companion?.state.isVisible ?? true

  if (!isVisible) return null

  const traits = getBreedTraits(actualSpecies, actualBreed)
  const isHappy = isHovered

  const handleClick = () => {
    const tip = MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)]
    setBubbleText(actualName ? `${tip} - ${actualName}` : tip)
    setShowBubble(true)

    // Also trigger companion celebration if available
    companion?.celebrate()

    // Hide bubble after 3 seconds
    setTimeout(() => setShowBubble(false), 3000)
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative bg-popover border rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
            <p className="text-xs font-medium">{bubbleText}</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-popover border-r border-b rotate-45"/>
          </div>
        </div>
      )}

      {/* Name tooltip on hover */}
      {isHovered && !showBubble && actualName && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50">
          <span className="text-xs bg-popover/90 border rounded px-2 py-0.5 shadow-sm whitespace-nowrap">
            {actualName}
          </span>
        </div>
      )}

      {/* Mascot */}
      <button
        onClick={handleClick}
        className={cn(
          "w-10 h-10 transition-all duration-200 cursor-pointer rounded-full",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        )}
        aria-label={`${actualName || 'Pet'} mascot - click for a tip`}
      >
        {actualSpecies === 'dog' && <DogMascot traits={traits} isHappy={isHappy} />}
        {actualSpecies === 'cat' && <CatMascot traits={traits} isHappy={isHappy} />}
        {actualSpecies !== 'dog' && actualSpecies !== 'cat' && <OtherMascot isHappy={isHappy} />}
      </button>
    </div>
  )
}
