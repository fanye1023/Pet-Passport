'use client'

import { useState } from 'react'
import { useCompanionOptional } from '@/components/ui/pet-companion'
import { cn } from '@/lib/utils'

// Breed characteristics
interface BreedTraits {
  colors: { primary: string; secondary: string; nose: string; accent?: string }
  earType: 'floppy' | 'pointed' | 'folded' | 'small' | 'corgi' | 'bat'
  faceType: 'round' | 'long' | 'flat' | 'normal' | 'fox'
  hasMarkings?: 'corgi' | 'husky' | 'collie'
}

const dogBreedTraits: Record<string, BreedTraits> = {
  'golden retriever': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
  'labrador': { colors: { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
  'labrador retriever': { colors: { primary: '#F5DEB3', secondary: '#E8D4A8', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
  'french bulldog': { colors: { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' }, earType: 'bat', faceType: 'flat' },
  'bulldog': { colors: { primary: '#D4C4B0', secondary: '#C4B4A0', nose: '#333' }, earType: 'folded', faceType: 'flat' },
  'pug': { colors: { primary: '#D4B896', secondary: '#1A1A1A', nose: '#333' }, earType: 'folded', faceType: 'flat' },
  'boston terrier': { colors: { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#333' }, earType: 'bat', faceType: 'flat' },
  'corgi': { colors: { primary: '#E8A855', secondary: '#FFFFFF', nose: '#333', accent: '#D49845' }, earType: 'corgi', faceType: 'fox', hasMarkings: 'corgi' },
  'pembroke welsh corgi': { colors: { primary: '#E8A855', secondary: '#FFFFFF', nose: '#333', accent: '#D49845' }, earType: 'corgi', faceType: 'fox', hasMarkings: 'corgi' },
  'cardigan welsh corgi': { colors: { primary: '#8B7355', secondary: '#FFFFFF', nose: '#333', accent: '#6B5344' }, earType: 'corgi', faceType: 'fox', hasMarkings: 'corgi' },
  'german shepherd': { colors: { primary: '#8B7355', secondary: '#2D2D2D', nose: '#333' }, earType: 'pointed', faceType: 'long' },
  'husky': { colors: { primary: '#808080', secondary: '#FFFFFF', nose: '#333' }, earType: 'pointed', faceType: 'normal', hasMarkings: 'husky' },
  'siberian husky': { colors: { primary: '#808080', secondary: '#FFFFFF', nose: '#333' }, earType: 'pointed', faceType: 'normal', hasMarkings: 'husky' },
  'shiba inu': { colors: { primary: '#E8A855', secondary: '#F5F5F5', nose: '#333' }, earType: 'pointed', faceType: 'fox' },
  'chihuahua': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'bat', faceType: 'round' },
  'yorkie': { colors: { primary: '#8B7355', secondary: '#D4A574', nose: '#333' }, earType: 'pointed', faceType: 'normal' },
  'yorkshire terrier': { colors: { primary: '#8B7355', secondary: '#D4A574', nose: '#333' }, earType: 'pointed', faceType: 'normal' },
  'pomeranian': { colors: { primary: '#E8A855', secondary: '#D49845', nose: '#333' }, earType: 'small', faceType: 'round' },
  'maltese': { colors: { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#333' }, earType: 'floppy', faceType: 'round' },
  'shih tzu': { colors: { primary: '#F5F5F5', secondary: '#D4A574', nose: '#333' }, earType: 'floppy', faceType: 'flat' },
  'beagle': { colors: { primary: '#D4A574', secondary: '#8B4513', nose: '#333' }, earType: 'floppy', faceType: 'long' },
  'dachshund': { colors: { primary: '#8B4513', secondary: '#7A3A0F', nose: '#333' }, earType: 'floppy', faceType: 'long' },
  'poodle': { colors: { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
  'goldendoodle': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
  'border collie': { colors: { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#333' }, earType: 'folded', faceType: 'long', hasMarkings: 'collie' },
  'australian shepherd': { colors: { primary: '#4A4A4A', secondary: '#D4A574', nose: '#333' }, earType: 'folded', faceType: 'normal' },
  'rottweiler': { colors: { primary: '#1A1A1A', secondary: '#8B4513', nose: '#333' }, earType: 'folded', faceType: 'normal' },
  'boxer': { colors: { primary: '#8B5A2B', secondary: '#FFFFFF', nose: '#333' }, earType: 'folded', faceType: 'flat' },
  'cocker spaniel': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
  'cavalier': { colors: { primary: '#8B4513', secondary: '#FFFFFF', nose: '#333' }, earType: 'floppy', faceType: 'round' },
  'default': { colors: { primary: '#D4A574', secondary: '#C4956A', nose: '#333' }, earType: 'floppy', faceType: 'normal' },
}

const catBreedTraits: Record<string, BreedTraits> = {
  'tabby': { colors: { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal' },
  'orange tabby': { colors: { primary: '#E8A855', secondary: '#D49845', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal' },
  'persian': { colors: { primary: '#F5F5F5', secondary: '#E8E8E8', nose: '#FFB6C1' }, earType: 'small', faceType: 'flat' },
  'siamese': { colors: { primary: '#F5DEB3', secondary: '#8B7355', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long' },
  'maine coon': { colors: { primary: '#8B7355', secondary: '#6B5344', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'long' },
  'ragdoll': { colors: { primary: '#F5F5F5', secondary: '#C4B4A0', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'round' },
  'british shorthair': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'small', faceType: 'round' },
  'scottish fold': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'folded', faceType: 'round' },
  'sphynx': { colors: { primary: '#E8D4C4', secondary: '#D8C4B4', nose: '#FFB6C1' }, earType: 'bat', faceType: 'long' },
  'bengal': { colors: { primary: '#D4A574', secondary: '#8B7355', nose: '#FFB6C1' }, earType: 'small', faceType: 'normal' },
  'tuxedo': { colors: { primary: '#1A1A1A', secondary: '#FFFFFF', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal' },
  'black cat': { colors: { primary: '#1A1A1A', secondary: '#0A0A0A', nose: '#333' }, earType: 'pointed', faceType: 'normal' },
  'white cat': { colors: { primary: '#FFFFFF', secondary: '#F5F5F5', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal' },
  'default': { colors: { primary: '#808080', secondary: '#606060', nose: '#FFB6C1' }, earType: 'pointed', faceType: 'normal' },
}

function getBreedTraits(species: string, breed: string | null): BreedTraits {
  const normalizedBreed = breed?.toLowerCase().trim() || 'default'
  if (species === 'dog') return dogBreedTraits[normalizedBreed] || dogBreedTraits['default']
  if (species === 'cat') return catBreedTraits[normalizedBreed] || catBreedTraits['default']
  return { colors: { primary: '#6BB5B5', secondary: '#5AA5A5', nose: '#333' }, earType: 'small', faceType: 'round' }
}

// Cute chibi-style corgi
function CorgiMascot({ colors, isHappy }: { colors: BreedTraits['colors']; isHappy: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Loaf body - the iconic corgi shape */}
      <ellipse cx="50" cy="72" rx="32" ry="16" fill={colors.primary}/>

      {/* White belly */}
      <ellipse cx="50" cy="76" rx="26" ry="10" fill={colors.secondary}/>

      {/* Fluffy butt */}
      <circle cx="80" cy="70" rx="10" ry="12" fill={colors.primary}/>

      {/* Tiny stubby legs - so cute! */}
      <ellipse cx="28" cy="86" rx="6" ry="8" fill={colors.primary}/>
      <ellipse cx="42" cy="86" rx="6" ry="8" fill={colors.primary}/>
      <ellipse cx="58" cy="86" rx="6" ry="8" fill={colors.primary}/>
      <ellipse cx="72" cy="86" rx="6" ry="8" fill={colors.primary}/>
      {/* White paws */}
      <ellipse cx="28" cy="92" rx="5" ry="3" fill={colors.secondary}/>
      <ellipse cx="42" cy="92" rx="5" ry="3" fill={colors.secondary}/>
      <ellipse cx="58" cy="92" rx="5" ry="3" fill={colors.secondary}/>
      <ellipse cx="72" cy="92" rx="5" ry="3" fill={colors.secondary}/>

      {/* Big cute head */}
      <circle cx="26" cy="48" r="26" fill={colors.primary}/>

      {/* White face blaze - down the middle */}
      <ellipse cx="26" cy="55" rx="10" ry="14" fill={colors.secondary}/>
      <ellipse cx="26" cy="38" rx="6" ry="10" fill={colors.secondary}/>

      {/* Cheek fluff */}
      <circle cx="8" cy="52" r="8" fill={colors.accent || colors.primary}/>
      <circle cx="44" cy="52" r="8" fill={colors.accent || colors.primary}/>

      {/* HUGE adorable ears */}
      <ellipse cx="6" cy="28" rx="12" ry="22" fill={colors.primary} transform="rotate(-15 6 28)">
        {isHappy && <animateTransform attributeName="transform" type="rotate" values="-15 6 28;-5 6 28;-15 6 28" dur="0.2s" repeatCount="indefinite"/>}
      </ellipse>
      <ellipse cx="46" cy="28" rx="12" ry="22" fill={colors.primary} transform="rotate(15 46 28)">
        {isHappy && <animateTransform attributeName="transform" type="rotate" values="15 46 28;5 46 28;15 46 28" dur="0.2s" repeatCount="indefinite" begin="0.05s"/>}
      </ellipse>
      {/* Pink inner ears */}
      <ellipse cx="8" cy="28" rx="7" ry="14" fill="#FFB6C1" transform="rotate(-15 8 28)"/>
      <ellipse cx="44" cy="28" rx="7" ry="14" fill="#FFB6C1" transform="rotate(15 44 28)"/>

      {/* Big sparkly eyes */}
      <ellipse cx="18" cy="46" rx="6" ry="7" fill="#333"/>
      <ellipse cx="34" cy="46" rx="6" ry="7" fill="#333"/>
      {/* Eye shine */}
      <circle cx="20" cy="44" r="2.5" fill="white"/>
      <circle cx="36" cy="44" r="2.5" fill="white"/>
      <circle cx="17" cy="48" r="1" fill="white"/>
      <circle cx="33" cy="48" r="1" fill="white"/>

      {/* Cute nose */}
      <ellipse cx="26" cy="58" rx="5" ry="4" fill={colors.nose}/>
      {/* Nose shine */}
      <ellipse cx="24" cy="57" rx="1.5" ry="1" fill="white" opacity="0.5"/>

      {/* Happy mouth */}
      <path
        d={isHappy ? "M16 64 Q26 74 36 64" : "M20 64 Q26 68 32 64"}
        fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Tongue when happy */}
      {isHappy && (
        <ellipse cx="26" cy="70" rx="5" ry="6" fill="#FF8888">
          <animate attributeName="cy" values="70;72;70" dur="0.2s" repeatCount="indefinite"/>
        </ellipse>
      )}

      {/* Blush marks */}
      <ellipse cx="10" cy="56" rx="4" ry="2" fill="#FFB6C1" opacity="0.6"/>
      <ellipse cx="42" cy="56" rx="4" ry="2" fill="#FFB6C1" opacity="0.6"/>
    </svg>
  )
}

// Cute chibi-style dog
function DogMascot({ traits, isHappy }: { traits: BreedTraits; isHappy: boolean }) {
  const { colors, earType, faceType, hasMarkings } = traits

  // Use special corgi mascot
  if (earType === 'corgi') {
    return <CorgiMascot colors={colors} isHappy={isHappy} />
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Round body */}
      <ellipse cx="50" cy="74" rx="28" ry="18" fill={colors.primary}/>

      {/* Tiny legs */}
      <ellipse cx="30" cy="88" rx="7" ry="8" fill={colors.secondary}/>
      <ellipse cx="46" cy="88" rx="7" ry="8" fill={colors.secondary}/>
      <ellipse cx="54" cy="88" rx="7" ry="8" fill={colors.primary}/>
      <ellipse cx="70" cy="88" rx="7" ry="8" fill={colors.primary}/>

      {/* Wagging tail */}
      <ellipse cx="78" cy="68" rx="8" ry="5" fill={colors.primary} transform="rotate(-30 78 68)">
        {isHappy && <animateTransform attributeName="transform" type="rotate" values="-30 78 68;-50 78 68;-30 78 68;-10 78 68;-30 78 68" dur="0.3s" repeatCount="indefinite"/>}
      </ellipse>

      {/* Big cute head */}
      <circle cx="32" cy="45" r="28" fill={colors.primary}/>

      {/* Face markings */}
      {hasMarkings === 'husky' && (
        <ellipse cx="32" cy="52" rx="12" ry="16" fill={colors.secondary}/>
      )}
      {hasMarkings === 'collie' && (
        <ellipse cx="32" cy="55" rx="14" ry="12" fill={colors.secondary}/>
      )}

      {/* Ears */}
      {earType === 'floppy' && (
        <>
          <ellipse cx="10" cy="42" rx="10" ry="16" fill={colors.secondary} transform="rotate(-20 10 42)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="-20 10 42;-10 10 42;-20 10 42" dur="0.3s" repeatCount="indefinite"/>}
          </ellipse>
          <ellipse cx="54" cy="42" rx="10" ry="16" fill={colors.secondary} transform="rotate(20 54 42)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="20 54 42;10 54 42;20 54 42" dur="0.3s" repeatCount="indefinite" begin="0.1s"/>}
          </ellipse>
        </>
      )}
      {earType === 'pointed' && (
        <>
          <ellipse cx="12" cy="24" rx="10" ry="18" fill={colors.secondary} transform="rotate(-10 12 24)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="-10 12 24;-5 12 24;-10 12 24" dur="0.25s" repeatCount="indefinite"/>}
          </ellipse>
          <ellipse cx="52" cy="24" rx="10" ry="18" fill={colors.secondary} transform="rotate(10 52 24)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="10 52 24;5 52 24;10 52 24" dur="0.25s" repeatCount="indefinite" begin="0.08s"/>}
          </ellipse>
          <ellipse cx="14" cy="26" rx="6" ry="12" fill="#FFB6C1" transform="rotate(-10 14 26)"/>
          <ellipse cx="50" cy="26" rx="6" ry="12" fill="#FFB6C1" transform="rotate(10 50 26)"/>
        </>
      )}
      {earType === 'bat' && (
        <>
          <ellipse cx="10" cy="26" rx="12" ry="18" fill={colors.secondary} transform="rotate(-8 10 26)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="-8 10 26;0 10 26;-8 10 26" dur="0.25s" repeatCount="indefinite"/>}
          </ellipse>
          <ellipse cx="54" cy="26" rx="12" ry="18" fill={colors.secondary} transform="rotate(8 54 26)">
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="8 54 26;0 54 26;8 54 26" dur="0.25s" repeatCount="indefinite" begin="0.08s"/>}
          </ellipse>
          <ellipse cx="12" cy="28" rx="8" ry="12" fill="#FFB6C1" transform="rotate(-8 12 28)"/>
          <ellipse cx="52" cy="28" rx="8" ry="12" fill="#FFB6C1" transform="rotate(8 52 28)"/>
        </>
      )}
      {earType === 'folded' && (
        <>
          <ellipse cx="12" cy="34" rx="12" ry="8" fill={colors.secondary} transform="rotate(-25 12 34)"/>
          <ellipse cx="52" cy="34" rx="12" ry="8" fill={colors.secondary} transform="rotate(25 52 34)"/>
        </>
      )}
      {earType === 'small' && (
        <>
          <ellipse cx="16" cy="26" rx="8" ry="10" fill={colors.secondary} transform="rotate(-10 16 26)"/>
          <ellipse cx="48" cy="26" rx="8" ry="10" fill={colors.secondary} transform="rotate(10 48 26)"/>
        </>
      )}

      {/* Snout for certain breeds */}
      {(faceType === 'fox' || faceType === 'long') && (
        <ellipse cx="32" cy="54" rx="10" ry="8" fill={colors.secondary}/>
      )}
      {faceType === 'flat' && (
        <ellipse cx="32" cy="52" rx="14" ry="8" fill={colors.secondary} opacity="0.6"/>
      )}

      {/* Big sparkly eyes */}
      <ellipse cx="24" cy="42" rx="6" ry="7" fill="#333"/>
      <ellipse cx="40" cy="42" rx="6" ry="7" fill="#333"/>
      <circle cx="26" cy="40" r="2.5" fill="white"/>
      <circle cx="42" cy="40" r="2.5" fill="white"/>
      <circle cx="23" cy="44" r="1" fill="white"/>
      <circle cx="39" cy="44" r="1" fill="white"/>

      {/* Cute nose */}
      <ellipse cx="32" cy={faceType === 'flat' ? 52 : 54} rx="5" ry="4" fill={colors.nose}/>
      <ellipse cx="30" cy={faceType === 'flat' ? 51 : 53} rx="1.5" ry="1" fill="white" opacity="0.5"/>

      {/* Mouth */}
      <path
        d={isHappy ? `M22 ${faceType === 'flat' ? 58 : 62} Q32 ${faceType === 'flat' ? 68 : 72} 42 ${faceType === 'flat' ? 58 : 62}` : `M26 ${faceType === 'flat' ? 58 : 60} Q32 ${faceType === 'flat' ? 62 : 64} 38 ${faceType === 'flat' ? 58 : 60}`}
        fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Tongue */}
      {isHappy && (
        <ellipse cx="32" cy={faceType === 'flat' ? 64 : 68} rx="5" ry="5" fill="#FF8888">
          <animate attributeName="cy" values={`${faceType === 'flat' ? 64 : 68};${faceType === 'flat' ? 66 : 70};${faceType === 'flat' ? 64 : 68}`} dur="0.2s" repeatCount="indefinite"/>
        </ellipse>
      )}

      {/* Blush */}
      <ellipse cx="14" cy="50" rx="4" ry="2" fill="#FFB6C1" opacity="0.5"/>
      <ellipse cx="50" cy="50" rx="4" ry="2" fill="#FFB6C1" opacity="0.5"/>
    </svg>
  )
}

// Cute chibi-style cat
function CatMascot({ traits, isHappy }: { traits: BreedTraits; isHappy: boolean }) {
  const { colors, earType, faceType } = traits

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Round body */}
      <ellipse cx="55" cy="72" rx="26" ry="18" fill={colors.primary}/>

      {/* Tiny paws */}
      <ellipse cx="36" cy="86" rx="6" ry="7" fill={colors.primary}/>
      <ellipse cx="50" cy="86" rx="6" ry="7" fill={colors.primary}/>
      <ellipse cx="64" cy="86" rx="6" ry="7" fill={colors.primary}/>
      <ellipse cx="78" cy="86" rx="6" ry="7" fill={colors.primary}/>

      {/* Curly tail */}
      <path
        d="M80 68 Q92 60 88 48 Q85 40 78 42"
        fill="none" stroke={colors.primary} strokeWidth="6" strokeLinecap="round"
      >
        {isHappy && <animate attributeName="d" values="M80 68 Q92 60 88 48 Q85 40 78 42;M80 68 Q95 58 90 45 Q86 38 80 40;M80 68 Q92 60 88 48 Q85 40 78 42" dur="0.4s" repeatCount="indefinite"/>}
      </path>

      {/* Big cute head */}
      <circle cx="34" cy="44" r="28" fill={colors.primary}/>

      {/* Ears */}
      {earType === 'pointed' && (
        <>
          <polygon points="14,28 4,2 32,22" fill={colors.secondary}>
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="0 14 28;-5 14 28;0 14 28" dur="0.4s" repeatCount="indefinite"/>}
          </polygon>
          <polygon points="54,28 64,2 36,22" fill={colors.secondary}>
            {isHappy && <animateTransform attributeName="transform" type="rotate" values="0 54 28;5 54 28;0 54 28" dur="0.4s" repeatCount="indefinite" begin="0.1s"/>}
          </polygon>
          <polygon points="16,28 10,10 28,24" fill="#FFB6C1"/>
          <polygon points="52,28 58,10 40,24" fill="#FFB6C1"/>
        </>
      )}
      {earType === 'folded' && (
        <>
          <ellipse cx="14" cy="32" rx="12" ry="7" fill={colors.secondary} transform="rotate(-20 14 32)"/>
          <ellipse cx="54" cy="32" rx="12" ry="7" fill={colors.secondary} transform="rotate(20 54 32)"/>
        </>
      )}
      {earType === 'small' && (
        <>
          <polygon points="18,32 12,14 30,28" fill={colors.secondary}/>
          <polygon points="50,32 56,14 38,28" fill={colors.secondary}/>
          <polygon points="19,31 14,18 28,28" fill="#FFB6C1"/>
          <polygon points="49,31 54,18 40,28" fill="#FFB6C1"/>
        </>
      )}
      {earType === 'bat' && (
        <>
          <ellipse cx="12" cy="24" rx="12" ry="18" fill={colors.secondary} transform="rotate(-5 12 24)"/>
          <ellipse cx="56" cy="24" rx="12" ry="18" fill={colors.secondary} transform="rotate(5 56 24)"/>
          <ellipse cx="14" cy="26" rx="8" ry="12" fill="#FFB6C1" transform="rotate(-5 14 26)"/>
          <ellipse cx="54" cy="26" rx="8" ry="12" fill="#FFB6C1" transform="rotate(5 54 26)"/>
        </>
      )}

      {/* Big sparkly cat eyes */}
      <ellipse cx="26" cy="42" rx="6" ry="8" fill="#7EC87E"/>
      <ellipse cx="42" cy="42" rx="6" ry="8" fill="#7EC87E"/>
      <ellipse cx="26" cy="42" rx="2" ry={isHappy ? 5 : 4} fill="#333"/>
      <ellipse cx="42" cy="42" rx="2" ry={isHappy ? 5 : 4} fill="#333"/>
      <circle cx="28" cy="40" r="2" fill="white"/>
      <circle cx="44" cy="40" r="2" fill="white"/>

      {/* Cute nose */}
      <polygon points="34,52 30,58 38,58" fill={colors.nose}/>

      {/* Cat mouth */}
      <path d="M30 60 L34 57 L38 60" stroke="#333" strokeWidth="1.5" fill="none"/>
      {isHappy && (
        <path d="M28 62 Q34 68 40 62" stroke="#333" strokeWidth="1.5" fill="none"/>
      )}

      {/* Whiskers */}
      <g stroke="#888" strokeWidth="1">
        <line x1="8" y1="50" x2="22" y2="52"/>
        <line x1="8" y1="54" x2="22" y2="54"/>
        <line x1="8" y1="58" x2="22" y2="56"/>
        <line x1="60" y1="50" x2="46" y2="52"/>
        <line x1="60" y1="54" x2="46" y2="54"/>
        <line x1="60" y1="58" x2="46" y2="56"/>
      </g>

      {/* Blush */}
      <ellipse cx="18" cy="52" rx="4" ry="2" fill="#FFB6C1" opacity="0.5"/>
      <ellipse cx="50" cy="52" rx="4" ry="2" fill="#FFB6C1" opacity="0.5"/>
    </svg>
  )
}

// Cute other pet
function OtherMascot({ isHappy }: { isHappy: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Round body */}
      <ellipse cx="50" cy="70" rx="30" ry="22" fill="#6BB5B5"/>

      {/* Little feet */}
      <ellipse cx="32" cy="88" rx="10" ry="7" fill="#5AA5A5"/>
      <ellipse cx="68" cy="88" rx="10" ry="7" fill="#5AA5A5"/>

      {/* Big head */}
      <circle cx="50" cy="40" r="28" fill="#6BB5B5"/>

      {/* Big eyes */}
      <circle cx="40" cy="38" r="8" fill="white"/>
      <circle cx="60" cy="38" r="8" fill="white"/>
      <circle cx="42" cy="40" r="4" fill="#333">
        {isHappy && <animate attributeName="cy" values="40;38;40" dur="0.4s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="62" cy="40" r="4" fill="#333">
        {isHappy && <animate attributeName="cy" values="40;38;40" dur="0.4s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="43" cy="38" r="2" fill="white"/>
      <circle cx="63" cy="38" r="2" fill="white"/>

      {/* Blush */}
      <ellipse cx="30" cy="48" rx="5" ry="3" fill="#FFB6C1" opacity="0.6"/>
      <ellipse cx="70" cy="48" rx="5" ry="3" fill="#FFB6C1" opacity="0.6"/>

      {/* Mouth */}
      <path
        d={isHappy ? "M40 54 Q50 64 60 54" : "M44 54 Q50 58 56 54"}
        fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"
      />
    </svg>
  )
}

// Actionable tips for users
const MASCOT_TIPS = [
  "Tap 'Vaccinations' to upload records",
  "Add emergency contacts in 'Emergency' tab",
  "Use 'Share' to give sitters access",
  "Upload insurance cards in 'Insurance'",
  "Pull down to refresh any page",
  "Tap 'Calendar' to set vet reminders",
  "Click 'Edit' to update pet details",
  "Add your vet in the 'Vet' section",
  "Use 'Health' to log vet visits",
  "Tap 'Care' to set feeding schedules",
  "Swipe between sections on mobile",
  "Click the photo to change it",
  "Use 'Sitter Info' for care notes",
  "Tap any section badge to see count",
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
  const [tipIndex, setTipIndex] = useState(0)

  const actualSpecies = companion?.state.species || species
  const actualBreed = companion?.state.breed || breed
  const isVisible = companion?.state.isVisible ?? true

  if (!isVisible) return null

  const traits = getBreedTraits(actualSpecies, actualBreed)
  const isHappy = isHovered || showBubble

  const handleClick = () => {
    // Cycle through tips instead of random (avoids repeats)
    const tip = MASCOT_TIPS[tipIndex % MASCOT_TIPS.length]
    setTipIndex(prev => prev + 1)
    setBubbleText(tip)
    setShowBubble(true)
    companion?.celebrate()
  }

  const handleClose = () => {
    setShowBubble(false)
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showBubble && (
        <div className="absolute bottom-full -left-20 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative bg-popover border rounded-lg shadow-lg pl-3 pr-8 py-2 w-[180px]">
            <p className="text-xs font-medium leading-relaxed">{bubbleText}</p>
            <button
              onClick={handleClose}
              className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              aria-label="Close tip"
            >
              <span className="text-sm">×</span>
            </button>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-popover border-r border-b rotate-45"/>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        className={cn(
          "w-12 h-12 transition-all duration-200 cursor-pointer",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
        )}
        aria-label="Click for a tip"
      >
        {actualSpecies === 'dog' && <DogMascot traits={traits} isHappy={isHappy} />}
        {actualSpecies === 'cat' && <CatMascot traits={traits} isHappy={isHappy} />}
        {actualSpecies !== 'dog' && actualSpecies !== 'cat' && <OtherMascot isHappy={isHappy} />}
      </button>
    </div>
  )
}
