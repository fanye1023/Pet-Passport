'use client'

import { useState, useEffect } from 'react'

interface AnimatedMascotProps {
  species: string
  mood?: 'idle' | 'happy' | 'excited' | 'sleeping' | 'thinking'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// SVG mascots for different species
const DogMascot = ({ mood, className }: { mood: string; className: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <ellipse cx="50" cy="65" rx="25" ry="20" className="fill-amber-200" />

    {/* Head */}
    <circle cx="50" cy="40" r="22" className="fill-amber-300" />

    {/* Ears */}
    <ellipse cx="30" cy="28" rx="8" ry="14" className="fill-amber-400" transform="rotate(-20 30 28)">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="-20 30 28; -15 30 28; -20 30 28"
        dur="2s"
        repeatCount="indefinite"
      />
    </ellipse>
    <ellipse cx="70" cy="28" rx="8" ry="14" className="fill-amber-400" transform="rotate(20 70 28)">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="20 70 28; 15 70 28; 20 70 28"
        dur="2s"
        repeatCount="indefinite"
        begin="0.5s"
      />
    </ellipse>

    {/* Eyes */}
    <g className={mood === 'sleeping' ? 'hidden' : ''}>
      <circle cx="42" cy="38" r="4" className="fill-gray-800">
        {mood === 'excited' && (
          <animate attributeName="r" values="4;5;4" dur="0.5s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="58" cy="38" r="4" className="fill-gray-800">
        {mood === 'excited' && (
          <animate attributeName="r" values="4;5;4" dur="0.5s" repeatCount="indefinite" />
        )}
      </circle>
      {/* Eye shine */}
      <circle cx="43" cy="37" r="1.5" className="fill-white" />
      <circle cx="59" cy="37" r="1.5" className="fill-white" />
    </g>

    {/* Sleeping eyes */}
    {mood === 'sleeping' && (
      <g>
        <path d="M38 38 L46 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-800" />
        <path d="M54 38 L62 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-800" />
        {/* Zzz */}
        <text x="70" y="25" className="fill-gray-400 text-xs font-bold">
          <tspan>z</tspan>
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </text>
        <text x="75" y="18" className="fill-gray-400 text-[8px] font-bold">
          <tspan>z</tspan>
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </text>
      </g>
    )}

    {/* Nose */}
    <ellipse cx="50" cy="46" rx="4" ry="3" className="fill-gray-800" />

    {/* Mouth */}
    <path
      d={mood === 'happy' || mood === 'excited' ? "M44 52 Q50 58 56 52" : "M46 52 Q50 54 54 52"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-gray-800"
    />

    {/* Tongue (when happy/excited) */}
    {(mood === 'happy' || mood === 'excited') && (
      <ellipse cx="50" cy="56" rx="3" ry="4" className="fill-pink-400">
        <animate attributeName="cy" values="56;58;56" dur="0.5s" repeatCount="indefinite" />
      </ellipse>
    )}

    {/* Tail */}
    <path
      d="M75 65 Q85 55 80 45"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      className="text-amber-400"
    >
      {(mood === 'happy' || mood === 'excited') && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 75 65; 15 75 65; 0 75 65; -15 75 65; 0 75 65"
          dur="0.4s"
          repeatCount="indefinite"
        />
      )}
    </path>

    {/* Thinking bubble */}
    {mood === 'thinking' && (
      <g>
        <circle cx="78" cy="20" r="8" className="fill-white stroke-gray-300" strokeWidth="1" />
        <circle cx="72" cy="30" r="4" className="fill-white stroke-gray-300" strokeWidth="1" />
        <circle cx="68" cy="36" r="2" className="fill-white stroke-gray-300" strokeWidth="1" />
        <text x="74" y="23" className="fill-gray-600 text-[8px]">?</text>
      </g>
    )}
  </svg>
)

const CatMascot = ({ mood, className }: { mood: string; className: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <ellipse cx="50" cy="68" rx="22" ry="18" className="fill-gray-300" />

    {/* Head */}
    <circle cx="50" cy="42" r="20" className="fill-gray-400" />

    {/* Ears (triangular) */}
    <polygon points="30,30 38,10 46,30" className="fill-gray-500">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 38 30; -5 38 30; 0 38 30"
        dur="3s"
        repeatCount="indefinite"
      />
    </polygon>
    <polygon points="54,30 62,10 70,30" className="fill-gray-500">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 62 30; 5 62 30; 0 62 30"
        dur="3s"
        repeatCount="indefinite"
        begin="1s"
      />
    </polygon>
    {/* Inner ears */}
    <polygon points="33,28 38,15 43,28" className="fill-pink-300" />
    <polygon points="57,28 62,15 67,28" className="fill-pink-300" />

    {/* Eyes */}
    <g className={mood === 'sleeping' ? 'hidden' : ''}>
      <ellipse cx="42" cy="40" rx="5" ry={mood === 'excited' ? '6' : '4'} className="fill-green-500" />
      <ellipse cx="58" cy="40" rx="5" ry={mood === 'excited' ? '6' : '4'} className="fill-green-500" />
      {/* Pupils */}
      <ellipse cx="42" cy="40" rx="2" ry={mood === 'excited' ? '4' : '3'} className="fill-gray-800">
        {mood === 'idle' && (
          <animate attributeName="cx" values="42;44;42;40;42" dur="4s" repeatCount="indefinite" />
        )}
      </ellipse>
      <ellipse cx="58" cy="40" rx="2" ry={mood === 'excited' ? '4' : '3'} className="fill-gray-800">
        {mood === 'idle' && (
          <animate attributeName="cx" values="58;60;58;56;58" dur="4s" repeatCount="indefinite" />
        )}
      </ellipse>
    </g>

    {/* Sleeping eyes */}
    {mood === 'sleeping' && (
      <g>
        <path d="M37 40 Q42 43 47 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-600" />
        <path d="M53 40 Q58 43 63 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-600" />
      </g>
    )}

    {/* Nose */}
    <polygon points="50,46 47,50 53,50" className="fill-pink-400" />

    {/* Mouth */}
    <path d="M47 52 L50 55 L53 52" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600" />

    {/* Whiskers */}
    <g className="text-gray-500">
      <line x1="25" y1="45" x2="38" y2="48" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="50" x2="38" y2="50" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="55" x2="38" y2="52" stroke="currentColor" strokeWidth="1" />
      <line x1="75" y1="45" x2="62" y2="48" stroke="currentColor" strokeWidth="1" />
      <line x1="75" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="1" />
      <line x1="75" y1="55" x2="62" y2="52" stroke="currentColor" strokeWidth="1" />
    </g>

    {/* Tail */}
    <path
      d="M72 68 Q85 60 82 45 Q80 35 85 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      className="text-gray-400"
    >
      {mood === 'happy' && (
        <animate attributeName="d"
          values="M72 68 Q85 60 82 45 Q80 35 85 30;M72 68 Q88 60 85 45 Q83 35 88 30;M72 68 Q85 60 82 45 Q80 35 85 30"
          dur="1s"
          repeatCount="indefinite"
        />
      )}
    </path>
  </svg>
)

const OtherMascot = ({ mood, className }: { mood: string; className: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Simple cute creature */}
    <circle cx="50" cy="55" r="30" className="fill-teal-300">
      <animate attributeName="r" values="30;31;30" dur="2s" repeatCount="indefinite" />
    </circle>

    {/* Eyes */}
    <g className={mood === 'sleeping' ? 'hidden' : ''}>
      <circle cx="40" cy="50" r="6" className="fill-white" />
      <circle cx="60" cy="50" r="6" className="fill-white" />
      <circle cx="40" cy="50" r="3" className="fill-gray-800">
        <animate attributeName="cy" values="50;48;50" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="50" r="3" className="fill-gray-800">
        <animate attributeName="cy" values="50;48;50" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* Sleeping eyes */}
    {mood === 'sleeping' && (
      <g>
        <path d="M34 50 L46 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-700" />
        <path d="M54 50 L66 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-700" />
      </g>
    )}

    {/* Blush */}
    <ellipse cx="32" cy="58" rx="5" ry="3" className="fill-pink-300 opacity-50" />
    <ellipse cx="68" cy="58" rx="5" ry="3" className="fill-pink-300 opacity-50" />

    {/* Mouth */}
    <path
      d={mood === 'happy' || mood === 'excited' ? "M42 65 Q50 72 58 65" : "M45 65 Q50 68 55 65"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-gray-700"
    />

    {/* Little feet */}
    <ellipse cx="38" cy="82" rx="8" ry="4" className="fill-teal-400" />
    <ellipse cx="62" cy="82" rx="8" ry="4" className="fill-teal-400" />

    {/* Sparkles when excited */}
    {mood === 'excited' && (
      <g className="text-yellow-400">
        <text x="75" y="35" className="text-lg">✨</text>
        <text x="20" y="40" className="text-sm">✨</text>
      </g>
    )}
  </svg>
)

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export function AnimatedMascot({
  species,
  mood = 'idle',
  size = 'md',
  className = '',
}: AnimatedMascotProps) {
  const [currentMood, setCurrentMood] = useState(mood)

  // Random idle animations
  useEffect(() => {
    if (mood === 'idle') {
      const interval = setInterval(() => {
        const random = Math.random()
        if (random < 0.1) {
          setCurrentMood('happy')
          setTimeout(() => setCurrentMood('idle'), 2000)
        }
      }, 5000)
      return () => clearInterval(interval)
    } else {
      setCurrentMood(mood)
    }
  }, [mood])

  const sizeClass = sizeClasses[size]
  const combinedClass = `${sizeClass} ${className}`

  if (species === 'dog') {
    return <DogMascot mood={currentMood} className={combinedClass} />
  } else if (species === 'cat') {
    return <CatMascot mood={currentMood} className={combinedClass} />
  } else {
    return <OtherMascot mood={currentMood} className={combinedClass} />
  }
}

// Mini mascot for corners/accents
export function MiniMascot({ species, className = '' }: { species: string; className?: string }) {
  return (
    <div className={`inline-block ${className}`}>
      <AnimatedMascot species={species} size="sm" mood="idle" />
    </div>
  )
}
