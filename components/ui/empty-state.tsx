'use client'

import { ReactNode } from 'react'
import { LucideIcon, PawPrint, FileText, Syringe, Heart, Utensils, Clock, Phone, Shield, Stethoscope, Share2, ClipboardList, Receipt, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AnimatedMascot } from '@/components/ui/animated-mascot'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: ReactNode
  variant?: 'default' | 'vaccinations' | 'health' | 'food' | 'routine' | 'emergency' | 'insurance' | 'vet' | 'share' | 'documents' | 'pets' | 'sitter-info' | 'expenses'
  petName?: string
  petPhotoUrl?: string | null
  useIllustration?: boolean
  showMascot?: boolean
  petSpecies?: string
}

const variantIcons: Record<string, LucideIcon> = {
  default: FileText,
  vaccinations: Syringe,
  health: Heart,
  food: Utensils,
  routine: Clock,
  emergency: Phone,
  insurance: Shield,
  vet: Stethoscope,
  share: Share2,
  documents: FileText,
  pets: PawPrint,
  'sitter-info': ClipboardList,
  expenses: Receipt,
}

const variantColors: Record<string, string> = {
  default: 'text-muted-foreground',
  vaccinations: 'text-blue-500',
  health: 'text-red-400',
  food: 'text-orange-500',
  routine: 'text-purple-500',
  emergency: 'text-red-500',
  insurance: 'text-green-500',
  vet: 'text-teal-500',
  share: 'text-indigo-500',
  documents: 'text-amber-500',
  pets: 'text-primary',
  'sitter-info': 'text-cyan-500',
  expenses: 'text-emerald-500',
}

const variantBgColors: Record<string, string> = {
  default: 'bg-muted/50',
  vaccinations: 'bg-blue-500/10',
  health: 'bg-red-400/10',
  food: 'bg-orange-500/10',
  routine: 'bg-purple-500/10',
  emergency: 'bg-red-500/10',
  insurance: 'bg-green-500/10',
  vet: 'bg-teal-500/10',
  share: 'bg-indigo-500/10',
  documents: 'bg-amber-500/10',
  pets: 'bg-primary/10',
  'sitter-info': 'bg-cyan-500/10',
  expenses: 'bg-emerald-500/10',
}

// Cute SVG illustrations for each variant
const illustrations: Record<string, ReactNode> = {
  vaccinations: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Syringe */}
      <g transform="translate(25, 15) rotate(-30)">
        <rect x="10" y="25" width="50" height="16" rx="3" className="fill-blue-100 stroke-blue-400" strokeWidth="2" />
        <rect x="60" y="22" width="15" height="22" rx="2" className="fill-blue-200 stroke-blue-400" strokeWidth="2" />
        <rect x="75" y="28" width="20" height="10" rx="2" className="fill-blue-300" />
        <circle cx="18" cy="33" r="2.5" className="fill-blue-300" />
        <circle cx="28" cy="33" r="2.5" className="fill-blue-300" />
        <circle cx="38" cy="33" r="2.5" className="fill-blue-300" />
      </g>
      {/* Shield with check */}
      <g transform="translate(65, 50)">
        <path d="M20 5 L35 12 L35 30 C35 42 20 50 20 50 C20 50 5 42 5 30 L5 12 Z"
          className="fill-green-100 stroke-green-500" strokeWidth="2" />
        <path d="M12 28 L18 34 L30 22" className="stroke-green-500" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Sparkles */}
      <circle cx="20" cy="25" r="3" className="fill-yellow-300">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="35" r="2" className="fill-yellow-300">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),

  health: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Clipboard */}
      <rect x="30" y="10" width="60" height="80" rx="6" className="fill-white stroke-gray-300" strokeWidth="2" />
      <rect x="45" y="3" width="30" height="14" rx="3" className="fill-red-100 stroke-red-300" strokeWidth="2" />
      {/* Lines */}
      <line x1="40" y1="35" x2="80" y2="35" className="stroke-gray-200" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="50" x2="75" y2="50" className="stroke-gray-200" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="65" x2="70" y2="65" className="stroke-gray-200" strokeWidth="3" strokeLinecap="round" />
      {/* Heart */}
      <g transform="translate(60, 70)">
        <path d="M12 6 C12 3, 8 0, 4 3 C0 6, 0 9, 12 18 C24 9, 24 6, 20 3 C16 0, 12 3, 12 6"
          className="fill-red-400">
          <animate attributeName="transform" values="scale(1);scale(1.15);scale(1)" dur="1s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Paw print */}
      <g transform="translate(8, 60)" className="fill-primary/20">
        <ellipse cx="10" cy="15" rx="5" ry="6" />
        <circle cx="4" cy="6" r="3" />
        <circle cx="10" cy="3" r="3" />
        <circle cx="16" cy="6" r="3" />
      </g>
    </svg>
  ),

  food: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Bowl */}
      <ellipse cx="60" cy="75" rx="40" ry="10" className="fill-primary/20" />
      <path d="M20 65 Q20 85 60 85 Q100 85 100 65 L95 50 Q60 60 25 50 Z"
        className="fill-primary/30 stroke-primary" strokeWidth="2" />
      <ellipse cx="60" cy="50" rx="35" ry="10" className="fill-amber-100 stroke-amber-300" strokeWidth="2" />
      {/* Kibble */}
      <ellipse cx="50" cy="48" rx="6" ry="4" className="fill-amber-400" />
      <ellipse cx="65" cy="46" rx="5" ry="3" className="fill-amber-400" />
      <ellipse cx="55" cy="52" rx="5" ry="3" className="fill-amber-400" />
      <ellipse cx="72" cy="50" rx="5" ry="3" className="fill-amber-400" />
      {/* Steam */}
      <g className="text-gray-300">
        <path d="M45 35 Q50 25 45 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" values="M45 35 Q50 25 45 15;M45 35 Q40 25 45 15;M45 35 Q50 25 45 15" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M60 30 Q65 20 60 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" values="M60 30 Q65 20 60 10;M60 30 Q55 20 60 10;M60 30 Q65 20 60 10" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </path>
        <path d="M75 35 Q80 25 75 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="d" values="M75 35 Q80 25 75 15;M75 35 Q70 25 75 15;M75 35 Q80 25 75 15" dur="2s" repeatCount="indefinite" begin="0.6s" />
        </path>
      </g>
    </svg>
  ),

  routine: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Clock */}
      <circle cx="60" cy="50" r="35" className="fill-white stroke-purple-200" strokeWidth="3" />
      <circle cx="60" cy="50" r="30" className="fill-purple-50" />
      {/* Clock markers */}
      {[0, 90, 180, 270].map((angle, i) => (
        <line
          key={i}
          x1={60 + 24 * Math.cos((angle - 90) * Math.PI / 180)}
          y1={50 + 24 * Math.sin((angle - 90) * Math.PI / 180)}
          x2={60 + 28 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={50 + 28 * Math.sin((angle - 90) * Math.PI / 180)}
          className="stroke-purple-300"
          strokeWidth="2"
        />
      ))}
      {/* Hands */}
      <line x1="60" y1="50" x2="60" y2="28" className="stroke-purple-500" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 60 50" to="360 60 50" dur="10s" repeatCount="indefinite" />
      </line>
      <line x1="60" y1="50" x2="75" y2="50" className="stroke-purple-400" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="50" r="3" className="fill-purple-500" />
      {/* Sun */}
      <g transform="translate(10, 10)">
        <circle cx="12" cy="12" r="8" className="fill-yellow-300" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1={12 + 10 * Math.cos(angle * Math.PI / 180)}
            y1={12 + 10 * Math.sin(angle * Math.PI / 180)}
            x2={12 + 14 * Math.cos(angle * Math.PI / 180)}
            y2={12 + 14 * Math.sin(angle * Math.PI / 180)}
            className="stroke-yellow-400"
            strokeWidth="2"
          />
        ))}
      </g>
      {/* Moon */}
      <g transform="translate(90, 70)">
        <circle cx="12" cy="12" r="8" className="fill-indigo-200" />
        <circle cx="16" cy="10" r="6" className="fill-white" />
      </g>
    </svg>
  ),

  emergency: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Phone */}
      <rect x="40" y="10" width="40" height="70" rx="6" className="fill-gray-800" />
      <rect x="44" y="18" width="32" height="50" rx="2" className="fill-red-100" />
      {/* Contact on screen */}
      <circle cx="60" cy="35" r="10" className="fill-red-200" />
      <circle cx="60" cy="32" r="5" className="fill-white" />
      <path d="M52 45 Q60 52 68 45" className="fill-white" />
      {/* Ring effect */}
      <circle cx="60" cy="45" r="35" className="fill-none stroke-red-300" strokeWidth="2" opacity="0.5">
        <animate attributeName="r" values="35;45;35" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Hearts */}
      <text x="15" y="35" className="text-base">❤️</text>
      <text x="95" y="65" className="text-sm">❤️</text>
    </svg>
  ),

  insurance: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M60 10 L95 25 L95 55 C95 75 60 90 60 90 C60 90 25 75 25 55 L25 25 Z"
        className="fill-green-50 stroke-green-400" strokeWidth="2" />
      {/* Paw in shield */}
      <g transform="translate(40, 30)">
        <ellipse cx="20" cy="28" rx="12" ry="15" className="fill-green-200" />
        <circle cx="8" cy="14" r="7" className="fill-green-200" />
        <circle cx="20" cy="8" r="7" className="fill-green-200" />
        <circle cx="32" cy="14" r="7" className="fill-green-200" />
      </g>
      {/* Sparkles */}
      <text x="95" y="30" className="text-sm">⭐</text>
      <text x="15" y="50" className="text-xs">⭐</text>
    </svg>
  ),

  vet: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Stethoscope */}
      <path d="M40 30 Q30 30 30 45 L30 60" className="fill-none stroke-teal-400" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 30 Q90 30 90 45 L90 60" className="fill-none stroke-teal-400" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 60 Q30 80 60 80 Q90 80 90 60" className="fill-none stroke-teal-400" strokeWidth="4" />
      <circle cx="60" cy="80" r="12" className="fill-teal-100 stroke-teal-400" strokeWidth="3" />
      <circle cx="60" cy="80" r="6" className="fill-teal-300" />
      {/* Ear pieces */}
      <circle cx="40" cy="25" r="6" className="fill-teal-200 stroke-teal-400" strokeWidth="2" />
      <circle cx="80" cy="25" r="6" className="fill-teal-200 stroke-teal-400" strokeWidth="2" />
      {/* Cross */}
      <g transform="translate(50, 10)">
        <rect x="6" y="0" width="8" height="20" rx="1" className="fill-red-400" />
        <rect x="0" y="6" width="20" height="8" rx="1" className="fill-red-400" />
      </g>
    </svg>
  ),

  documents: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Folder */}
      <path d="M15 35 L15 85 L105 85 L105 35 L65 35 L55 22 L15 22 Z"
        className="fill-amber-100 stroke-amber-300" strokeWidth="2" />
      {/* Papers */}
      <rect x="30" y="28" width="40" height="50" rx="2" className="fill-white stroke-gray-200" strokeWidth="1" transform="rotate(-5 50 55)" />
      <rect x="45" y="25" width="40" height="50" rx="2" className="fill-white stroke-gray-200" strokeWidth="1" transform="rotate(3 65 50)" />
      {/* Lines */}
      <g transform="rotate(3 65 50)">
        <line x1="52" y1="38" x2="78" y2="38" className="stroke-gray-200" strokeWidth="2" />
        <line x1="52" y1="48" x2="75" y2="48" className="stroke-gray-200" strokeWidth="2" />
        <line x1="52" y1="58" x2="70" y2="58" className="stroke-gray-200" strokeWidth="2" />
      </g>
    </svg>
  ),

  pets: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* House */}
      <path d="M60 15 L100 45 L100 85 L20 85 L20 45 Z" className="fill-primary/10 stroke-primary/30" strokeWidth="2" />
      <rect x="30" y="45" width="60" height="40" className="fill-white" />
      {/* Door */}
      <rect x="48" y="55" width="24" height="30" rx="2" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <circle cx="66" cy="70" r="2" className="fill-primary" />
      {/* Window */}
      <rect x="35" y="55" width="12" height="12" rx="1" className="fill-sky-100 stroke-sky-300" strokeWidth="1.5" />
      {/* Paw prints */}
      <g className="fill-primary/20">
        <ellipse cx="30" cy="92" rx="4" ry="2.5" transform="rotate(-20 30 92)" />
        <ellipse cx="45" cy="95" rx="3" ry="2" transform="rotate(10 45 95)" />
      </g>
      {/* Heart */}
      <g transform="translate(52, 3)">
        <path d="M8 4 C8 2, 5 0, 2.5 2.5 C0 5, 0 7, 8 13 C16 7, 16 5, 13.5 2.5 C11 0, 8 2, 8 4"
          className="fill-red-400">
          <animate attributeName="transform" values="scale(1);scale(1.1);scale(1)" dur="1.5s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  ),

  'sitter-info': (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Clipboard */}
      <rect x="30" y="10" width="60" height="75" rx="5" className="fill-white stroke-cyan-300" strokeWidth="2" />
      <rect x="42" y="5" width="36" height="12" rx="3" className="fill-cyan-100 stroke-cyan-300" strokeWidth="2" />
      {/* Checklist */}
      <g className="fill-cyan-400">
        <rect x="38" y="28" width="10" height="10" rx="2" className="fill-cyan-100 stroke-cyan-300" strokeWidth="1.5" />
        <path d="M40 33 L43 36 L47 30" className="stroke-cyan-500" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <line x1="52" y1="33" x2="80" y2="33" className="stroke-gray-200" strokeWidth="2" strokeLinecap="round" />

      <g className="fill-cyan-400">
        <rect x="38" y="45" width="10" height="10" rx="2" className="fill-cyan-100 stroke-cyan-300" strokeWidth="1.5" />
        <path d="M40 50 L43 53 L47 47" className="stroke-cyan-500" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <line x1="52" y1="50" x2="75" y2="50" className="stroke-gray-200" strokeWidth="2" strokeLinecap="round" />

      <rect x="38" y="62" width="10" height="10" rx="2" className="fill-cyan-50 stroke-cyan-200" strokeWidth="1.5" />
      <line x1="52" y1="67" x2="70" y2="67" className="stroke-gray-200" strokeWidth="2" strokeLinecap="round" />

      {/* Paw */}
      <g transform="translate(85, 65)" className="fill-primary/30">
        <ellipse cx="10" cy="15" rx="6" ry="8" />
        <circle cx="3" cy="6" r="4" />
        <circle cx="10" cy="2" r="4" />
        <circle cx="17" cy="6" r="4" />
      </g>
    </svg>
  ),

  expenses: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Receipt */}
      <path d="M30 10 L30 85 L35 80 L40 85 L45 80 L50 85 L55 80 L60 85 L65 80 L70 85 L75 80 L80 85 L85 80 L90 85 L90 10 Z"
        className="fill-white stroke-emerald-300" strokeWidth="2" />
      {/* Lines */}
      <line x1="40" y1="25" x2="80" y2="25" className="stroke-gray-200" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="38" x2="75" y2="38" className="stroke-gray-200" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="51" x2="70" y2="51" className="stroke-gray-200" strokeWidth="2" strokeLinecap="round" />
      {/* Total */}
      <line x1="40" y1="65" x2="80" y2="65" className="stroke-emerald-300" strokeWidth="2" strokeLinecap="round" />
      <text x="45" y="78" className="fill-emerald-500 text-xs font-bold">$</text>
      {/* Coins */}
      <circle cx="100" cy="70" r="12" className="fill-yellow-300 stroke-yellow-400" strokeWidth="2" />
      <text x="96" y="75" className="fill-yellow-600 text-xs font-bold">$</text>
      <circle cx="95" cy="82" r="10" className="fill-yellow-200 stroke-yellow-300" strokeWidth="2" />
    </svg>
  ),

  share: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Central node */}
      <circle cx="60" cy="50" r="15" className="fill-indigo-100 stroke-indigo-400" strokeWidth="2" />
      <circle cx="60" cy="50" r="8" className="fill-indigo-300" />
      {/* Connected nodes */}
      <circle cx="25" cy="30" r="10" className="fill-purple-100 stroke-purple-300" strokeWidth="2" />
      <circle cx="95" cy="30" r="10" className="fill-pink-100 stroke-pink-300" strokeWidth="2" />
      <circle cx="25" cy="75" r="10" className="fill-blue-100 stroke-blue-300" strokeWidth="2" />
      <circle cx="95" cy="75" r="10" className="fill-teal-100 stroke-teal-300" strokeWidth="2" />
      {/* Lines */}
      <line x1="45" y1="42" x2="33" y2="35" className="stroke-indigo-200" strokeWidth="2" />
      <line x1="75" y1="42" x2="87" y2="35" className="stroke-indigo-200" strokeWidth="2" />
      <line x1="45" y1="58" x2="33" y2="70" className="stroke-indigo-200" strokeWidth="2" />
      <line x1="75" y1="58" x2="87" y2="70" className="stroke-indigo-200" strokeWidth="2" />
      {/* Paw in center */}
      <g transform="translate(52, 42)" className="fill-indigo-500">
        <ellipse cx="8" cy="10" rx="4" ry="5" />
        <circle cx="3" cy="4" r="2.5" />
        <circle cx="8" cy="2" r="2.5" />
        <circle cx="13" cy="4" r="2.5" />
      </g>
    </svg>
  ),

  default: (
    <svg viewBox="0 0 120 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Large paw print */}
      <g transform="translate(30, 15)">
        <ellipse cx="30" cy="50" rx="22" ry="28" className="fill-primary/15" />
        <circle cx="12" cy="22" r="13" className="fill-primary/15" />
        <circle cx="30" cy="12" r="13" className="fill-primary/15" />
        <circle cx="48" cy="22" r="13" className="fill-primary/15" />
      </g>
      {/* Sparkles */}
      <circle cx="15" cy="30" r="4" className="fill-yellow-300">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="50" r="3" className="fill-yellow-300">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="95" cy="85" r="2.5" className="fill-yellow-300">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="25" cy="90" r="3" className="fill-yellow-300">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="1s" />
      </circle>
    </svg>
  ),
}

// Map variants to mascot moods
const variantMoods: Record<string, 'idle' | 'happy' | 'thinking' | 'sleeping'> = {
  default: 'thinking',
  vaccinations: 'thinking',
  health: 'thinking',
  food: 'happy',
  routine: 'idle',
  emergency: 'thinking',
  insurance: 'thinking',
  vet: 'thinking',
  share: 'happy',
  documents: 'thinking',
  pets: 'happy',
  'sitter-info': 'thinking',
  expenses: 'thinking',
}

export function EmptyState({ icon, title, description, action, variant = 'default', petName, petPhotoUrl, useIllustration = true, showMascot = false, petSpecies }: EmptyStateProps) {
  const Icon = icon || variantIcons[variant]
  const colorClass = variantColors[variant]
  const bgColorClass = variantBgColors[variant]
  const hasPetPhoto = petPhotoUrl || petName
  const illustration = illustrations[variant] || illustrations.default
  const mascotMood = variantMoods[variant] || 'thinking'

  return (
    <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="relative mb-6">
        {showMascot && petSpecies ? (
          // Show animated mascot
          <div className="mb-2">
            <AnimatedMascot species={petSpecies} mood={mascotMood} size="lg" />
          </div>
        ) : useIllustration ? (
          // Show SVG illustration
          <div className="w-32 h-24 mb-2">
            {illustration}
          </div>
        ) : hasPetPhoto ? (
          // Show pet photo with icon overlay
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-white/50 dark:ring-white/10 shadow-lg">
              <AvatarImage src={petPhotoUrl || undefined} alt={petName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl">
                {petName ? petName[0].toUpperCase() : <PawPrint className="h-10 w-10 text-primary/60" />}
              </AvatarFallback>
            </Avatar>
            {/* Icon badge */}
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${bgColorClass} flex items-center justify-center ring-2 ring-white dark:ring-gray-900`}>
              <Icon className={`h-4 w-4 ${colorClass}`} />
            </div>
          </div>
        ) : (
          // Default icon display
          <>
            <div className={`w-20 h-20 rounded-full ${bgColorClass} glass-subtle flex items-center justify-center`}>
              <Icon className={`h-10 w-10 ${colorClass}`} />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/20" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-primary/10" />
          </>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}

// Compact inline empty state for smaller areas
export function EmptyStateInline({
  icon,
  message,
  action,
}: {
  icon?: ReactNode
  message: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-fade-in">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="btn-press">
          <Plus className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
