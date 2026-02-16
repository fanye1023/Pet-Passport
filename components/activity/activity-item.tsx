'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ActivityLogEntry } from '@/lib/types/pet'
import { formatDistanceToNow } from 'date-fns'
import {
  Syringe,
  Heart,
  Calendar,
  FileText,
  Stethoscope,
  Phone,
  Utensils,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  PawPrint,
} from 'lucide-react'

interface ActivityItemProps {
  activity: ActivityLogEntry
  showPet?: boolean
}

const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  vaccination: Syringe,
  health_record: Heart,
  care_event: Calendar,
  document: FileText,
  veterinarian: Stethoscope,
  emergency_contact: Phone,
  food_preferences: Utensils,
  daily_routine: Clock,
  collaborator: Users,
  pet: PawPrint,
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
}

const actionColors: Record<string, string> = {
  created: 'bg-green-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
}

function getActivityDescription(activity: ActivityLogEntry): string {
  const details = activity.details || {}
  const entityType = activity.entity_type.replace(/_/g, ' ')

  let itemName = ''
  if (details.vaccine_name) itemName = details.vaccine_name as string
  else if (details.title) itemName = details.title as string
  else if (details.name) itemName = details.name as string
  else if (details.role) itemName = `with role ${details.role}`

  switch (activity.action) {
    case 'created':
      return `added a ${entityType}${itemName ? `: ${itemName}` : ''}`
    case 'updated':
      return `updated ${entityType}${itemName ? `: ${itemName}` : ''}`
    case 'deleted':
      return `removed a ${entityType}${itemName ? `: ${itemName}` : ''}`
    default:
      return `${activity.action} ${entityType}`
  }
}

function getPetLink(activity: ActivityLogEntry): string {
  const baseUrl = `/pets/${activity.pet_id}`

  switch (activity.entity_type) {
    case 'vaccination':
      return `${baseUrl}/vaccinations`
    case 'health_record':
      return `${baseUrl}/health`
    case 'care_event':
      return `${baseUrl}/calendar`
    case 'veterinarian':
      return `${baseUrl}/vet`
    case 'emergency_contact':
      return `${baseUrl}/emergency`
    case 'food_preferences':
      return `${baseUrl}/care`
    case 'daily_routine':
      return `${baseUrl}/care?tab=routine`
    case 'collaborator':
      return `${baseUrl}/collaborators`
    default:
      return baseUrl
  }
}

export function ActivityItem({ activity, showPet = true }: ActivityItemProps) {
  const EntityIcon = entityIcons[activity.entity_type] || FileText
  const ActionIcon = actionIcons[activity.action] || Pencil
  const actionColor = actionColors[activity.action] || 'bg-gray-500'
  const profile = activity.user_profile
  const pet = activity.pet

  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
      {/* User avatar with action indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {getInitials(profile?.display_name || null)}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          'absolute -bottom-1 -right-1 p-1 rounded-full',
          actionColor
        )}>
          <ActionIcon className="h-2.5 w-2.5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-medium">
              {profile?.display_name || 'Someone'}
            </span>{' '}
            <span className="text-muted-foreground">
              {getActivityDescription(activity)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Pet and entity context */}
        <div className="flex items-center gap-2 mt-1">
          {showPet && pet && (
            <Link
              href={getPetLink(activity)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={pet.photo_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {pet.name[0]}
                </AvatarFallback>
              </Avatar>
              <span>{pet.name}</span>
            </Link>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <EntityIcon className="h-3 w-3" />
            <span className="capitalize">{activity.entity_type.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
