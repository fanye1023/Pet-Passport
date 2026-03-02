'use client'

import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

type CompanionMood = 'idle' | 'happy' | 'excited' | 'sleeping' | 'thinking' | 'concerned'

interface CompanionState {
  isVisible: boolean
  mood: CompanionMood
  message: string | null
  species: string
  breed: string | null
  petName: string | null
}

interface CompanionContextValue {
  state: CompanionState
  setMood: (mood: CompanionMood) => void
  showMessage: (message: string, duration?: number) => void
  celebrate: () => void
  think: () => void
  hide: () => void
  show: () => void
  toggle: () => void
  setPet: (species: string, breed: string | null, name: string | null) => void
}

// ============================================================================
// BREED COLOR MAPPINGS
// ============================================================================

interface BreedColors {
  primary: string      // Main body color
  secondary: string    // Ears, accents
  nose: string         // Nose color
  pattern?: 'solid' | 'spotted' | 'striped' | 'tuxedo' | 'bicolor'
}

const dogBreedColors: Record<string, BreedColors> = {
  // Retrievers & similar
  'golden retriever': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },
  'labrador': { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' },
  'labrador retriever': { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' },
  'yellow lab': { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' },
  'black lab': { primary: '#2D2D2D', secondary: '#1A1A1A', nose: '#111' },
  'chocolate lab': { primary: '#5D4037', secondary: '#4E342E', nose: '#3E2723' },

  // Small breeds
  'french bulldog': { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' },
  'frenchie': { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' },
  'pug': { primary: '#D4B896', secondary: '#C4A886', nose: '#333' },
  'chihuahua': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },
  'dachshund': { primary: '#8B4513', secondary: '#7A3A0F', nose: '#333' },
  'corgi': { primary: '#E8A855', secondary: '#D49845', nose: '#333' },
  'beagle': { primary: '#D4A574', secondary: '#8B4513', nose: '#333', pattern: 'bicolor' },
  'shih tzu': { primary: '#F5F5F5', secondary: '#D4A574', nose: '#333', pattern: 'bicolor' },
  'yorkshire terrier': { primary: '#8B7355', secondary: '#D4A574', nose: '#333' },
  'yorkie': { primary: '#8B7355', secondary: '#D4A574', nose: '#333' },
  'pomeranian': { primary: '#E8A855', secondary: '#D49845', nose: '#333' },
  'maltese': { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#333' },

  // Medium breeds
  'bulldog': { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' },
  'english bulldog': { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' },
  'cocker spaniel': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },
  'border collie': { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#333', pattern: 'bicolor' },
  'australian shepherd': { primary: '#4A4A4A', secondary: '#D4A574', nose: '#333', pattern: 'spotted' },

  // Large breeds
  'german shepherd': { primary: '#8B7355', secondary: '#2D2D2D', nose: '#333', pattern: 'bicolor' },
  'husky': { primary: '#808080', secondary: '#FFFFFF', nose: '#333', pattern: 'bicolor' },
  'siberian husky': { primary: '#808080', secondary: '#FFFFFF', nose: '#333', pattern: 'bicolor' },
  'rottweiler': { primary: '#1A1A1A', secondary: '#8B4513', nose: '#333', pattern: 'bicolor' },
  'boxer': { primary: '#8B5A2B', secondary: '#FFFFFF', nose: '#333', pattern: 'bicolor' },
  'great dane': { primary: '#4A4A4A', secondary: '#3A3A3A', nose: '#333' },
  'doberman': { primary: '#1A1A1A', secondary: '#8B4513', nose: '#333', pattern: 'bicolor' },

  // Poodles
  'poodle': { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#333' },
  'standard poodle': { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#333' },
  'toy poodle': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },
  'goldendoodle': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },
  'labradoodle': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },

  // Default
  'default': { primary: '#D4A574', secondary: '#C4956A', nose: '#333' },
}

const catBreedColors: Record<string, BreedColors> = {
  // Tabbies
  'tabby': { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1', pattern: 'striped' },
  'orange tabby': { primary: '#E8A855', secondary: '#D49845', nose: '#FFB6C1', pattern: 'striped' },
  'gray tabby': { primary: '#808080', secondary: '#606060', nose: '#FFB6C1', pattern: 'striped' },
  'brown tabby': { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1', pattern: 'striped' },

  // Solid colors
  'black cat': { primary: '#1A1A1A', secondary: '#0A0A0A', nose: '#333' },
  'white cat': { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#FFB6C1' },
  'gray cat': { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' },
  'orange cat': { primary: '#E8A855', secondary: '#D49845', nose: '#FFB6C1' },

  // Breeds
  'siamese': { primary: '#F5DEB3', secondary: '#8B7355', nose: '#FFB6C1' },
  'persian': { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#FFB6C1' },
  'maine coon': { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1' },
  'ragdoll': { primary: '#F5F5F5', secondary: '#C4B4A0', nose: '#FFB6C1' },
  'british shorthair': { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' },
  'scottish fold': { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' },
  'bengal': { primary: '#D4A574', secondary: '#8B7355', nose: '#FFB6C1', pattern: 'spotted' },
  'sphynx': { primary: '#E8D4C4', secondary: '#D8C4B4', nose: '#FFB6C1' },
  'russian blue': { primary: '#6B7B8B', secondary: '#5B6B7B', nose: '#FFB6C1' },
  'abyssinian': { primary: '#C4956A', secondary: '#B4856A', nose: '#FFB6C1' },

  // Patterns
  'tuxedo': { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#FFB6C1', pattern: 'tuxedo' },
  'calico': { primary: '#FFFFFF', secondary: '#E8A855', nose: '#FFB6C1', pattern: 'spotted' },
  'tortoiseshell': { primary: '#1A1A1A', secondary: '#E8A855', nose: '#FFB6C1', pattern: 'spotted' },

  // Default
  'default': { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' },
}

function getBreedColors(species: string, breed: string | null): BreedColors {
  const normalizedBreed = breed?.toLowerCase().trim() || 'default'

  if (species === 'dog') {
    return dogBreedColors[normalizedBreed] || dogBreedColors['default']
  } else if (species === 'cat') {
    return catBreedColors[normalizedBreed] || catBreedColors['default']
  }

  return { primary: '#6BB5B5', secondary: '#5AA5A5', nose: '#333' } // Teal for other
}

// ============================================================================
// SVG MASCOTS
// ============================================================================

interface MascotProps {
  mood: CompanionMood
  colors: BreedColors
  className?: string
}

function DogMascot({ mood, colors, className }: MascotProps) {
  const isHappy = mood === 'happy' || mood === 'excited'
  const isSleeping = mood === 'sleeping'

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="50" cy="68" rx="22" ry="18" fill={colors.primary} />

      {/* Head */}
      <circle cx="50" cy="42" r="20" fill={colors.primary} />

      {/* Ears */}
      <ellipse cx="32" cy="28" rx="7" ry="12" fill={colors.secondary} transform="rotate(-15 32 28)">
        {isHappy && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-15 32 28; -10 32 28; -15 32 28"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>
      <ellipse cx="68" cy="28" rx="7" ry="12" fill={colors.secondary} transform="rotate(15 68 28)">
        {isHappy && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="15 68 28; 10 68 28; 15 68 28"
            dur="0.5s"
            repeatCount="indefinite"
            begin="0.1s"
          />
        )}
      </ellipse>

      {/* Eyes */}
      {!isSleeping ? (
        <g>
          <circle cx="43" cy="40" r="4" fill="#333">
            {mood === 'excited' && (
              <animate attributeName="r" values="4;5;4" dur="0.3s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="57" cy="40" r="4" fill="#333">
            {mood === 'excited' && (
              <animate attributeName="r" values="4;5;4" dur="0.3s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="44" cy="39" r="1.5" fill="white" />
          <circle cx="58" cy="39" r="1.5" fill="white" />
        </g>
      ) : (
        <g>
          <path d="M39 40 L47 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <path d="M53 40 L61 40" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Concerned eyebrows */}
      {mood === 'concerned' && (
        <g>
          <path d="M39 35 L47 37" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M61 35 L53 37" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {/* Nose */}
      <ellipse cx="50" cy="48" rx="4" ry="3" fill={colors.nose} />

      {/* Mouth */}
      <path
        d={isHappy ? "M44 54 Q50 60 56 54" : "M46 54 Q50 56 54 54"}
        fill="none"
        stroke="#333"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Tongue when happy */}
      {isHappy && (
        <ellipse cx="50" cy="58" rx="3" ry="4" fill="#FF9999">
          <animate attributeName="cy" values="58;60;58" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Tail */}
      <path
        d="M72 68 Q82 58 78 48"
        fill="none"
        stroke={colors.secondary}
        strokeWidth="5"
        strokeLinecap="round"
      >
        {isHappy && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 72 68; 20 72 68; 0 72 68; -20 72 68; 0 72 68"
            dur="0.3s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Zzz when sleeping */}
      {isSleeping && (
        <g className="fill-gray-400">
          <text x="68" y="28" fontSize="10" fontWeight="bold">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </text>
          <text x="74" y="22" fontSize="8" fontWeight="bold">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </text>
        </g>
      )}

      {/* Thinking dots */}
      {mood === 'thinking' && (
        <g className="fill-gray-500">
          <circle cx="70" cy="30" r="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="76" cy="24" r="2.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="82" cy="18" r="3">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </g>
      )}
    </svg>
  )
}

function CatMascot({ mood, colors, className }: MascotProps) {
  const isHappy = mood === 'happy' || mood === 'excited'
  const isSleeping = mood === 'sleeping'

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="50" cy="70" rx="20" ry="16" fill={colors.primary} />

      {/* Head */}
      <circle cx="50" cy="44" r="18" fill={colors.primary} />

      {/* Ears */}
      <polygon points="34,32 28,12 42,26" fill={colors.secondary}>
        {isHappy && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 32; -5 35 32; 0 35 32"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </polygon>
      <polygon points="66,32 72,12 58,26" fill={colors.secondary}>
        {isHappy && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 65 32; 5 65 32; 0 65 32"
            dur="0.8s"
            repeatCount="indefinite"
            begin="0.2s"
          />
        )}
      </polygon>
      {/* Inner ears */}
      <polygon points="36,30 32,18 40,26" fill="#FFB6C1" />
      <polygon points="64,30 68,18 60,26" fill="#FFB6C1" />

      {/* Eyes */}
      {!isSleeping ? (
        <g>
          <ellipse cx="43" cy="42" rx="4" ry={isHappy ? '5' : '4'} fill="#7EC87E" />
          <ellipse cx="57" cy="42" rx="4" ry={isHappy ? '5' : '4'} fill="#7EC87E" />
          <ellipse cx="43" cy="42" rx="1.5" ry={isHappy ? '3' : '2.5'} fill="#333" />
          <ellipse cx="57" cy="42" rx="1.5" ry={isHappy ? '3' : '2.5'} fill="#333" />
        </g>
      ) : (
        <g>
          <path d="M39 42 Q43 45 47 42" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M53 42 Q57 45 61 42" stroke="#333" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* Nose */}
      <polygon points="50,48 47,52 53,52" fill={colors.nose} />

      {/* Mouth */}
      <path d="M47 54 L50 52 L53 54" stroke="#333" strokeWidth="1.5" fill="none" />
      {isHappy && (
        <path d="M45 55 Q50 60 55 55" stroke="#333" strokeWidth="1.5" fill="none" />
      )}

      {/* Whiskers */}
      <g stroke="#666" strokeWidth="0.75">
        <line x1="28" y1="48" x2="40" y2="50" />
        <line x1="28" y1="52" x2="40" y2="52" />
        <line x1="28" y1="56" x2="40" y2="54" />
        <line x1="72" y1="48" x2="60" y2="50" />
        <line x1="72" y1="52" x2="60" y2="52" />
        <line x1="72" y1="56" x2="60" y2="54" />
      </g>

      {/* Tail */}
      <path
        d="M70 70 Q85 60 82 45"
        fill="none"
        stroke={colors.primary}
        strokeWidth="5"
        strokeLinecap="round"
      >
        {isHappy && (
          <animate
            attributeName="d"
            values="M70 70 Q85 60 82 45;M70 70 Q88 55 85 42;M70 70 Q85 60 82 45"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Zzz when sleeping */}
      {isSleeping && (
        <g className="fill-gray-400">
          <text x="68" y="28" fontSize="10" fontWeight="bold">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </text>
          <text x="74" y="22" fontSize="8" fontWeight="bold">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </text>
        </g>
      )}

      {/* Thinking dots */}
      {mood === 'thinking' && (
        <g className="fill-gray-500">
          <circle cx="70" cy="30" r="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="76" cy="24" r="2.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="82" cy="18" r="3">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </g>
      )}
    </svg>
  )
}

function OtherPetMascot({ mood, colors, className }: MascotProps) {
  const isHappy = mood === 'happy' || mood === 'excited'
  const isSleeping = mood === 'sleeping'

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Body - cute blob */}
      <ellipse cx="50" cy="55" rx="28" ry="25" fill={colors.primary}>
        <animate attributeName="ry" values="25;26;25" dur="2s" repeatCount="indefinite" />
      </ellipse>

      {/* Eyes */}
      {!isSleeping ? (
        <g>
          <circle cx="40" cy="48" r="6" fill="white" />
          <circle cx="60" cy="48" r="6" fill="white" />
          <circle cx="41" cy="49" r="3" fill="#333">
            {isHappy && (
              <animate attributeName="cy" values="49;47;49" dur="0.5s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="61" cy="49" r="3" fill="#333">
            {isHappy && (
              <animate attributeName="cy" values="49;47;49" dur="0.5s" repeatCount="indefinite" />
            )}
          </circle>
        </g>
      ) : (
        <g>
          <path d="M34 48 L46 48" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 48 L66 48" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Blush */}
      <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="68" cy="58" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />

      {/* Mouth */}
      <path
        d={isHappy ? "M42 65 Q50 73 58 65" : "M45 65 Q50 68 55 65"}
        fill="none"
        stroke="#333"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Little feet */}
      <ellipse cx="38" cy="78" rx="7" ry="4" fill={colors.secondary} />
      <ellipse cx="62" cy="78" rx="7" ry="4" fill={colors.secondary} />

      {/* Sparkles when excited */}
      {mood === 'excited' && (
        <g className="fill-yellow-400">
          <text x="72" y="35" fontSize="12">✨</text>
          <text x="22" y="40" fontSize="10">✨</text>
        </g>
      )}

      {/* Zzz when sleeping */}
      {isSleeping && (
        <g className="fill-gray-400">
          <text x="68" y="35" fontSize="10" fontWeight="bold">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </text>
          <text x="74" y="28" fontSize="8" fontWeight="bold">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </text>
        </g>
      )}

      {/* Thinking dots */}
      {mood === 'thinking' && (
        <g className="fill-gray-500">
          <circle cx="72" cy="32" r="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="78" cy="26" r="2.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="84" cy="20" r="3">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </g>
      )}
    </svg>
  )
}

// ============================================================================
// CONTEXT
// ============================================================================

const CompanionContext = createContext<CompanionContextValue | null>(null)

export function useCompanion() {
  const context = useContext(CompanionContext)
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider')
  }
  return context
}

// Optional hook that doesn't throw - for components that may be outside provider
export function useCompanionOptional() {
  return useContext(CompanionContext)
}

// ============================================================================
// PROVIDER
// ============================================================================

interface CompanionProviderProps {
  children: ReactNode
  defaultVisible?: boolean
}

const COMPANION_STORAGE_KEY = 'pet-companion-visible'

export function CompanionProvider({ children, defaultVisible = true }: CompanionProviderProps) {
  const [state, setState] = useState<CompanionState>({
    isVisible: defaultVisible,
    mood: 'idle',
    message: null,
    species: 'dog',
    breed: null,
    petName: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Load visibility preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COMPANION_STORAGE_KEY)
    if (stored !== null) {
      setState(prev => ({ ...prev, isVisible: stored === 'true' }))
    }
    setIsInitialized(true)
  }, [])

  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null)
  const [moodTimeout, setMoodTimeout] = useState<NodeJS.Timeout | null>(null)

  const setMood = useCallback((mood: CompanionMood) => {
    setState(prev => ({ ...prev, mood }))
  }, [])

  const showMessage = useCallback((message: string, duration = 4000) => {
    // Clear existing timeout
    if (messageTimeout) clearTimeout(messageTimeout)

    setState(prev => ({ ...prev, message }))

    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, message: null }))
    }, duration)

    setMessageTimeout(timeout)
  }, [messageTimeout])

  const celebrate = useCallback(() => {
    // Clear existing mood timeout
    if (moodTimeout) clearTimeout(moodTimeout)

    setState(prev => ({ ...prev, mood: 'excited' }))

    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, mood: 'idle' }))
    }, 2000)

    setMoodTimeout(timeout)
  }, [moodTimeout])

  const think = useCallback(() => {
    setState(prev => ({ ...prev, mood: 'thinking' }))
  }, [])

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }))
    localStorage.setItem(COMPANION_STORAGE_KEY, 'false')
  }, [])

  const show = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: true }))
    localStorage.setItem(COMPANION_STORAGE_KEY, 'true')
  }, [])

  const toggle = useCallback(() => {
    setState(prev => {
      const newVisible = !prev.isVisible
      localStorage.setItem(COMPANION_STORAGE_KEY, String(newVisible))
      return { ...prev, isVisible: newVisible }
    })
  }, [])

  const setPet = useCallback((species: string, breed: string | null, name: string | null) => {
    setState(prev => ({ ...prev, species, breed, petName: name }))
  }, [])

  // Auto-sleep after inactivity
  useEffect(() => {
    let sleepTimeout: NodeJS.Timeout

    const resetSleepTimer = () => {
      if (sleepTimeout) clearTimeout(sleepTimeout)

      // Only reset to idle if currently sleeping
      if (state.mood === 'sleeping') {
        setState(prev => ({ ...prev, mood: 'idle' }))
      }

      sleepTimeout = setTimeout(() => {
        // Only sleep if in idle state
        if (state.mood === 'idle') {
          setState(prev => ({ ...prev, mood: 'sleeping' }))
        }
      }, 60000) // Sleep after 1 minute of inactivity
    }

    // Listen for user activity
    window.addEventListener('mousemove', resetSleepTimer)
    window.addEventListener('keydown', resetSleepTimer)
    window.addEventListener('click', resetSleepTimer)
    window.addEventListener('scroll', resetSleepTimer)

    // Initial timer
    resetSleepTimer()

    return () => {
      if (sleepTimeout) clearTimeout(sleepTimeout)
      window.removeEventListener('mousemove', resetSleepTimer)
      window.removeEventListener('keydown', resetSleepTimer)
      window.removeEventListener('click', resetSleepTimer)
      window.removeEventListener('scroll', resetSleepTimer)
    }
  }, [state.mood])

  const contextValue = useMemo(
    () => ({
      state,
      setMood,
      showMessage,
      celebrate,
      think,
      hide,
      show,
      toggle,
      setPet,
    }),
    [state, setMood, showMessage, celebrate, think, hide, show, toggle, setPet]
  )

  return (
    <CompanionContext.Provider value={contextValue}>
      {children}
    </CompanionContext.Provider>
  )
}

// ============================================================================
// COMPANION COMPONENT
// ============================================================================

interface PetCompanionProps {
  className?: string
}

export function PetCompanion({ className }: PetCompanionProps) {
  const { state, hide } = useCompanion()
  const [isHovered, setIsHovered] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (!state.isVisible || isDismissed) return null

  const colors = getBreedColors(state.species, state.breed)

  const MascotComponent =
    state.species === 'dog' ? DogMascot :
    state.species === 'cat' ? CatMascot :
    OtherPetMascot

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 transition-all duration-300",
        isHovered ? "scale-110" : "scale-100",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech bubble */}
      {state.message && (
        <div className="absolute bottom-full left-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative bg-popover border rounded-lg shadow-lg p-3 max-w-[200px]">
            <p className="text-sm text-popover-foreground">{state.message}</p>
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-popover border-l border-b -rotate-45 -z-10" />
          </div>
        </div>
      )}

      {/* Mascot container */}
      <div className="relative">
        {/* Close button - only visible on hover */}
        <button
          onClick={() => {
            setIsDismissed(true)
            hide()
          }}
          className={cn(
            "absolute -top-1 -left-1 w-5 h-5 rounded-full bg-muted border flex items-center justify-center",
            "text-muted-foreground hover:text-foreground hover:bg-muted/80",
            "transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label="Hide companion"
        >
          <X className="w-3 h-3" />
        </button>

        {/* The mascot */}
        <div className="w-12 h-12 cursor-pointer drop-shadow-md">
          <MascotComponent mood={state.mood} colors={colors} className="w-full h-full" />
        </div>

        {/* Pet name tooltip on hover */}
        {isHovered && state.petName && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs bg-popover border rounded px-2 py-1 shadow-sm">
              {state.petName}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// HELPER HOOK FOR INTEGRATING WITH PET DATA
// ============================================================================

export function useCompanionWithPet(pet: { species: string; breed: string | null; name: string } | null) {
  const companion = useCompanionOptional()

  useEffect(() => {
    if (companion && pet) {
      companion.setPet(pet.species, pet.breed, pet.name)
    }
  }, [companion, pet?.species, pet?.breed, pet?.name])

  return companion
}
