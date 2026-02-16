'use client'

import { useEffect, useState } from 'react'

interface PetMascotProps {
  species: string
  mood: 'idle' | 'happy' | 'excited' | 'celebrating'
  size?: 'sm' | 'md' | 'lg'
}

export function PetMascot({ species, mood, size = 'md' }: PetMascotProps) {
  const [showSparkles, setShowSparkles] = useState(false)

  useEffect(() => {
    if (mood === 'excited' || mood === 'celebrating') {
      setShowSparkles(true)
      const timer = setTimeout(() => setShowSparkles(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [mood])

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }

  const animationClass = {
    idle: 'animate-float',
    happy: 'animate-bounce-gentle',
    excited: 'animate-bounce-gentle',
    celebrating: 'animate-bounce-gentle',
  }

  const isDog = species === 'dog'
  const isCat = species === 'cat'

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Sparkles */}
      {showSparkles && (
        <>
          <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse-slow text-xl">
            ✨
          </div>
          <div className="absolute -top-1 -left-3 text-yellow-400 animate-pulse-slow text-lg" style={{ animationDelay: '0.3s' }}>
            ✨
          </div>
          <div className="absolute -bottom-1 right-0 text-yellow-400 animate-pulse-slow text-sm" style={{ animationDelay: '0.6s' }}>
            ✨
          </div>
        </>
      )}

      {/* Pet Character */}
      <div className={`${animationClass[mood]} w-full h-full`}>
        {isDog ? (
          <DogCharacter mood={mood} />
        ) : isCat ? (
          <CatCharacter mood={mood} />
        ) : (
          <GenericPetCharacter mood={mood} />
        )}
      </div>
    </div>
  )
}

function DogCharacter({ mood }: { mood: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Body */}
      <ellipse cx="50" cy="65" rx="30" ry="25" fill="#D4A574" />

      {/* Head */}
      <circle cx="50" cy="35" r="25" fill="#D4A574" />

      {/* Ears */}
      <ellipse cx="30" cy="20" rx="10" ry="15" fill="#B8956E" transform="rotate(-20 30 20)" />
      <ellipse cx="70" cy="20" rx="10" ry="15" fill="#B8956E" transform="rotate(20 70 20)" />

      {/* Eyes */}
      <circle cx="42" cy="32" r="5" fill="white" />
      <circle cx="58" cy="32" r="5" fill="white" />
      <circle cx="43" cy="33" r="3" fill="#333" />
      <circle cx="59" cy="33" r="3" fill="#333" />

      {/* Eye shine */}
      <circle cx="44" cy="31" r="1" fill="white" />
      <circle cx="60" cy="31" r="1" fill="white" />

      {/* Nose */}
      <ellipse cx="50" cy="42" rx="5" ry="4" fill="#333" />

      {/* Mouth - changes with mood */}
      {mood === 'idle' ? (
        <path d="M 45 48 Q 50 50 55 48" stroke="#333" strokeWidth="2" fill="none" />
      ) : (
        <path d="M 42 46 Q 50 55 58 46" stroke="#333" strokeWidth="2" fill="none" />
      )}

      {/* Tongue when happy/excited */}
      {(mood === 'happy' || mood === 'excited' || mood === 'celebrating') && (
        <ellipse cx="50" cy="52" rx="4" ry="6" fill="#FF9999" />
      )}

      {/* Tail */}
      <g className={mood !== 'idle' ? 'animate-wag-tail' : ''} style={{ transformOrigin: '75px 70px' }}>
        <path d="M 75 65 Q 90 55 85 45" stroke="#D4A574" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>

      {/* Front legs */}
      <rect x="35" y="80" width="8" height="15" rx="4" fill="#D4A574" />
      <rect x="57" y="80" width="8" height="15" rx="4" fill="#D4A574" />
    </svg>
  )
}

function CatCharacter({ mood }: { mood: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Body */}
      <ellipse cx="50" cy="68" rx="25" ry="22" fill="#808080" />

      {/* Head */}
      <circle cx="50" cy="38" r="22" fill="#808080" />

      {/* Ears */}
      <polygon points="32,25 25,5 40,18" fill="#808080" />
      <polygon points="68,25 75,5 60,18" fill="#808080" />
      <polygon points="34,22 29,10 38,18" fill="#FFB6C1" />
      <polygon points="66,22 71,10 62,18" fill="#FFB6C1" />

      {/* Eyes */}
      <ellipse cx="42" cy="35" rx="5" ry="6" fill="#90EE90" />
      <ellipse cx="58" cy="35" rx="5" ry="6" fill="#90EE90" />
      <ellipse cx="42" cy="36" rx="2" ry="4" fill="#333" />
      <ellipse cx="58" cy="36" rx="2" ry="4" fill="#333" />

      {/* Nose */}
      <polygon points="50,42 47,46 53,46" fill="#FFB6C1" />

      {/* Mouth */}
      <path d="M 47 48 L 50 46 L 53 48" stroke="#333" strokeWidth="1.5" fill="none" />
      {mood !== 'idle' && (
        <path d="M 45 50 Q 50 54 55 50" stroke="#333" strokeWidth="1.5" fill="none" />
      )}

      {/* Whiskers */}
      <line x1="30" y1="42" x2="42" y2="44" stroke="#333" strokeWidth="1" />
      <line x1="30" y1="46" x2="42" y2="46" stroke="#333" strokeWidth="1" />
      <line x1="58" y1="44" x2="70" y2="42" stroke="#333" strokeWidth="1" />
      <line x1="58" y1="46" x2="70" y2="46" stroke="#333" strokeWidth="1" />

      {/* Tail */}
      <g className={mood !== 'idle' ? 'animate-wag-tail' : ''} style={{ transformOrigin: '75px 75px' }}>
        <path d="M 70 75 Q 85 65 90 50" stroke="#808080" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>

      {/* Front legs */}
      <rect x="38" y="82" width="7" height="12" rx="3" fill="#808080" />
      <rect x="55" y="82" width="7" height="12" rx="3" fill="#808080" />
    </svg>
  )
}

function GenericPetCharacter({ mood }: { mood: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Paw print body */}
      <circle cx="50" cy="60" r="25" fill="currentColor" className="text-primary" />

      {/* Paw pads */}
      <circle cx="35" cy="40" r="10" fill="currentColor" className="text-primary" />
      <circle cx="65" cy="40" r="10" fill="currentColor" className="text-primary" />
      <circle cx="28" cy="55" r="8" fill="currentColor" className="text-primary" />
      <circle cx="72" cy="55" r="8" fill="currentColor" className="text-primary" />

      {/* Face on main pad */}
      <circle cx="44" cy="55" r="4" fill="white" />
      <circle cx="56" cy="55" r="4" fill="white" />
      <circle cx="44" cy="56" r="2" fill="#333" />
      <circle cx="56" cy="56" r="2" fill="#333" />

      {/* Smile */}
      {mood === 'idle' ? (
        <path d="M 45 68 Q 50 70 55 68" stroke="white" strokeWidth="2" fill="none" />
      ) : (
        <path d="M 42 66 Q 50 75 58 66" stroke="white" strokeWidth="2" fill="none" />
      )}
    </svg>
  )
}
