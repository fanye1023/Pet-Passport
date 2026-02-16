import { ReactNode } from 'react'
import { LucideIcon, PawPrint, FileText, Syringe, Heart, Utensils, Clock, Phone, Shield, Stethoscope, Share2, ClipboardList, Receipt } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: ReactNode
  variant?: 'default' | 'vaccinations' | 'health' | 'food' | 'routine' | 'emergency' | 'insurance' | 'vet' | 'share' | 'documents' | 'pets' | 'sitter-info' | 'expenses'
  petName?: string
  petPhotoUrl?: string | null
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

export function EmptyState({ icon, title, description, action, variant = 'default', petName, petPhotoUrl }: EmptyStateProps) {
  const Icon = icon || variantIcons[variant]
  const colorClass = variantColors[variant]
  const bgColorClass = variantBgColors[variant]
  const hasPetPhoto = petPhotoUrl || petName

  return (
    <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-6">
        {hasPetPhoto ? (
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
