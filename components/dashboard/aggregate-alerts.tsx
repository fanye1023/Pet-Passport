'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { Pet, Vaccination, CareEvent } from '@/lib/types/pet'
import {
  AlertTriangle,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Syringe,
  Stethoscope,
} from 'lucide-react'
import { formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'

interface AggregateAlertsProps {
  pets: Pet[]
  vaccinationsByPet: Map<string, Vaccination[]>
  eventsByPet: Map<string, CareEvent[]>
}

interface AlertGroup {
  type: 'expired' | 'expiring' | 'upcoming'
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  variant: 'destructive' | 'warning' | 'info'
  items: Array<{
    pet: Pet
    records: Array<{
      id: string
      name: string
      date: string
      type: 'vaccination' | 'appointment'
    }>
  }>
}

export function AggregateAlerts({ pets, vaccinationsByPet, eventsByPet }: AggregateAlertsProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())

  const toggleAlert = (type: string) => {
    const newExpanded = new Set(expandedAlerts)
    if (newExpanded.has(type)) {
      newExpanded.delete(type)
    } else {
      newExpanded.add(type)
    }
    setExpandedAlerts(newExpanded)
  }

  // Calculate alerts
  const today = new Date()
  const thirtyDaysFromNow = addDays(today, 30)
  const sevenDaysFromNow = addDays(today, 7)

  const alerts: AlertGroup[] = []

  // Expired vaccinations
  const expiredItems: AlertGroup['items'] = []
  for (const pet of pets) {
    const vaccinations = vaccinationsByPet.get(pet.id) || []
    const expired = vaccinations.filter(v =>
      v.expiration_date && isBefore(new Date(v.expiration_date), today)
    )

    if (expired.length > 0) {
      expiredItems.push({
        pet,
        records: expired.map(v => ({
          id: v.id,
          name: v.vaccine_name,
          date: v.expiration_date!,
          type: 'vaccination' as const
        }))
      })
    }
  }

  if (expiredItems.length > 0) {
    const totalCount = expiredItems.reduce((sum, item) => sum + item.records.length, 0)
    alerts.push({
      type: 'expired',
      icon: AlertTriangle,
      title: `${totalCount} Expired Vaccination${totalCount > 1 ? 's' : ''}`,
      description: `Across ${expiredItems.length} pet${expiredItems.length > 1 ? 's' : ''}`,
      variant: 'destructive',
      items: expiredItems
    })
  }

  // Expiring vaccinations (within 30 days)
  const expiringItems: AlertGroup['items'] = []
  for (const pet of pets) {
    const vaccinations = vaccinationsByPet.get(pet.id) || []
    const expiring = vaccinations.filter(v =>
      v.expiration_date &&
      isAfter(new Date(v.expiration_date), today) &&
      isBefore(new Date(v.expiration_date), thirtyDaysFromNow)
    )

    if (expiring.length > 0) {
      expiringItems.push({
        pet,
        records: expiring.map(v => ({
          id: v.id,
          name: v.vaccine_name,
          date: v.expiration_date!,
          type: 'vaccination' as const
        }))
      })
    }
  }

  if (expiringItems.length > 0) {
    const totalCount = expiringItems.reduce((sum, item) => sum + item.records.length, 0)
    alerts.push({
      type: 'expiring',
      icon: AlertCircle,
      title: `${totalCount} Vaccination${totalCount > 1 ? 's' : ''} Expiring Soon`,
      description: `Across ${expiringItems.length} pet${expiringItems.length > 1 ? 's' : ''} - within 30 days`,
      variant: 'warning',
      items: expiringItems
    })
  }

  // Upcoming appointments (within 7 days)
  const upcomingItems: AlertGroup['items'] = []
  for (const pet of pets) {
    const events = eventsByPet.get(pet.id) || []
    const upcoming = events.filter(e =>
      e.event_type === 'vet_appointment' &&
      e.event_date &&
      isAfter(new Date(e.event_date), today) &&
      isBefore(new Date(e.event_date), sevenDaysFromNow)
    )

    if (upcoming.length > 0) {
      upcomingItems.push({
        pet,
        records: upcoming.map(e => ({
          id: e.id,
          name: e.title,
          date: e.event_date!,
          type: 'appointment' as const
        }))
      })
    }
  }

  if (upcomingItems.length > 0) {
    const totalCount = upcomingItems.reduce((sum, item) => sum + item.records.length, 0)
    alerts.push({
      type: 'upcoming',
      icon: Calendar,
      title: `${totalCount} Upcoming Appointment${totalCount > 1 ? 's' : ''}`,
      description: `Across ${upcomingItems.length} pet${upcomingItems.length > 1 ? 's' : ''} - this week`,
      variant: 'info',
      items: upcomingItems
    })
  }

  if (alerts.length === 0) {
    return null
  }

  const variantStyles = {
    destructive: {
      card: 'border-destructive/50 bg-destructive/5',
      icon: 'text-destructive',
      badge: 'bg-destructive/10 text-destructive'
    },
    warning: {
      card: 'border-amber-500/50 bg-amber-500/5',
      icon: 'text-amber-500',
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    },
    info: {
      card: 'border-blue-500/50 bg-blue-500/5',
      icon: 'text-blue-500',
      badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        Alerts & Reminders
      </h2>

      <div className="grid gap-3">
        {alerts.map((alert) => {
          const isExpanded = expandedAlerts.has(alert.type)
          const styles = variantStyles[alert.variant]
          const Icon = alert.icon

          return (
            <Collapsible key={alert.type} open={isExpanded} onOpenChange={() => toggleAlert(alert.type)}>
              <Card className={cn('border', styles.card)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={cn('h-5 w-5', styles.icon)} />
                        <div>
                          <CardTitle className="text-base">{alert.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3">
                      {alert.items.map((item) => (
                        <div key={item.pet.id} className="pl-8">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={item.pet.photo_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {item.pet.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{item.pet.name}</span>
                          </div>
                          <div className="space-y-1 pl-8">
                            {item.records.map((record) => (
                              <Link
                                key={record.id}
                                href={`/pets/${item.pet.id}/${record.type === 'vaccination' ? 'vaccinations' : 'calendar'}`}
                                className="flex items-center justify-between text-sm hover:underline"
                              >
                                <span className="flex items-center gap-2">
                                  {record.type === 'vaccination' ? (
                                    <Syringe className="h-3 w-3" />
                                  ) : (
                                    <Stethoscope className="h-3 w-3" />
                                  )}
                                  {record.name}
                                </span>
                                <span className={cn('text-xs px-2 py-0.5 rounded-full', styles.badge)}>
                                  {formatDistanceToNow(new Date(record.date), { addSuffix: true })}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}
