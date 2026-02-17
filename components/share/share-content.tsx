'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  PawPrint,
  Syringe,
  Heart,
  Shield,
  Stethoscope,
  Phone,
  Utensils,
  Clock,
  Mail,
  MapPin,
  FileText,
  ShoppingCart,
  ExternalLink,
  Key,
  Package,
  Wifi,
  AlertTriangle,
  ClipboardList,
  Brain,
} from 'lucide-react'

import {
  getAmazonSearchUrl,
  getChewySearchUrl,
  getPetcoSearchUrl,
  getPetSmartSearchUrl,
  timeOfDayLabels,
  timeOfDayOrder,
  timeOfDayRanges,
  routineIcons,
} from '@/lib/constants'
import { SharedPetData } from '@/lib/types/pet'
import { EmergencyBanner } from '@/components/share/emergency-banner'
import { PrintButton } from '@/components/share/print-button'
import { ShareStickyHeader } from '@/components/share/share-sticky-header'
import { BrandLogo } from '@/components/food/brand-logo'

interface ShareContentProps {
  data: SharedPetData
}

export function ShareContent({ data }: ShareContentProps) {
  const { pet, vaccinations, health_records, insurance, veterinarians, emergency_contacts, food_preferences, daily_routines, care_instructions, behavioral_notes, visibility } = data
  const documents = data.documents || []

  const vaccinationDocs = documents.filter(d => d.category === 'vaccination')
  const healthDocs = documents.filter(d => d.category === 'health')
  const insuranceDocs = documents.filter(d => d.category === 'insurance')

  const age = pet.birthday
    ? (() => {
        const [year, month, day] = pet.birthday!.split('-')
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      })()
    : null

  const formatTime = (time: string | null) => {
    if (!time) return ''
    if (timeOfDayLabels[time]) return timeOfDayLabels[time]
    return time
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky header for scrolling */}
      <ShareStickyHeader
        petName={pet.name}
        petPhotoUrl={pet.photo_url}
        breed={pet.breed}
        species={pet.species}
        birthday={pet.birthday}
      />

      {/* Hero section with blurred pet photo background */}
      <div className="relative overflow-hidden">
        {/* Blurred background image */}
        {pet.photo_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pet.photo_url})` }}
          >
            <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-black/50 via-black/40 to-background" />
          </div>
        )}
        {/* Fallback gradient when no photo */}
        {!pet.photo_url && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        )}

        <div className="relative container mx-auto max-w-5xl pt-8 pb-12 px-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 ring-4 ring-white/50 shadow-2xl">
              <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                <PawPrint className="h-16 w-16 text-primary/60" />
              </AvatarFallback>
            </Avatar>
            <h1 className={`text-4xl font-bold mt-4 ${pet.photo_url ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : ''}`}>{pet.name}</h1>
            <p className={`text-lg mt-1 ${pet.photo_url ? 'text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-muted-foreground'}`}>
              {pet.breed ? `${pet.breed} ` : ''}{pet.species}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {age !== null && (
                <Badge variant="secondary" className="bg-white/80 dark:bg-white/20 backdrop-blur-sm text-foreground">
                  {age === 0 ? '< 1 year old' : `${age} year${age !== 1 ? 's' : ''} old`}
                </Badge>
              )}
              {pet.birthday && (
                <Badge variant="outline" className="bg-white/80 dark:bg-white/20 backdrop-blur-sm border-white/50 dark:border-white/30 text-foreground">
                  Birthday: {formatDate(pet.birthday)}
                </Badge>
              )}
              {pet.microchip_number && (
                <Badge variant="outline" className="bg-white/80 dark:bg-white/20 backdrop-blur-sm border-white/50 dark:border-white/30 text-foreground">
                  Microchip: {pet.microchip_number}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl py-6 px-4 bento-grid-share">

        {/* Emergency Contacts - Show first for sitters */}
        {visibility.emergency_contacts && emergency_contacts && emergency_contacts.length > 0 && (
          <div className="span-6">
          <Card className="border-destructive/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {emergency_contacts.map((contact) => (
                  <div key={contact.id} className="space-y-1">
                    <p className="font-medium">{contact.name}</p>
                    {contact.relationship && (
                      <Badge variant="secondary" className="text-xs">
                        {contact.relationship}
                      </Badge>
                    )}
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                        {contact.phone}
                      </a>
                    </p>
                    {contact.email && (
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </p>
                    )}
                    {contact.notes && (
                      <p className="text-sm text-muted-foreground">{contact.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Veterinarians */}
        {visibility.vet_info && veterinarians && veterinarians.length > 0 && (
          <div className="span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Veterinarians
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {veterinarians.map((vet) => (
                  <div key={vet.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{vet.clinic_name}</p>
                      {vet.is_primary && <Badge>Primary</Badge>}
                    </div>
                    {vet.name && (
                      <p className="text-sm text-muted-foreground">{vet.name}</p>
                    )}
                    {vet.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${vet.phone}`} className="text-primary hover:underline">
                          {vet.phone}
                        </a>
                      </p>
                    )}
                    {vet.address && (
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {vet.address}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Care Instructions */}
        {visibility.care_instructions && care_instructions && (
          care_instructions.house_access ||
          care_instructions.food_storage ||
          care_instructions.supplies_location ||
          care_instructions.wifi_and_alarm ||
          care_instructions.other_notes
        ) && (
          <div className="span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Care Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {care_instructions.house_access && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Key className="h-4 w-4 text-amber-500" />
                    House Access
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">{care_instructions.house_access}</p>
                </div>
              )}
              {care_instructions.food_storage && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4 text-orange-500" />
                    Food Storage
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">{care_instructions.food_storage}</p>
                </div>
              )}
              {care_instructions.supplies_location && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-red-500" />
                    Supplies Location
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">{care_instructions.supplies_location}</p>
                </div>
              )}
              {care_instructions.wifi_and_alarm && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Wifi className="h-4 w-4 text-blue-500" />
                    WiFi & Alarm
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">{care_instructions.wifi_and_alarm}</p>
                </div>
              )}
              {care_instructions.other_notes && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Other Notes
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">{care_instructions.other_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {/* Behavioral Notes */}
        {visibility.behavioral_notes && behavioral_notes && (
          behavioral_notes.known_commands ||
          behavioral_notes.fears_and_triggers ||
          behavioral_notes.socialization ||
          behavioral_notes.temperament ||
          behavioral_notes.additional_notes
        ) && (
          <div className="span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Behavioral Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {behavioral_notes.temperament && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Temperament</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{behavioral_notes.temperament}</p>
                </div>
              )}
              {behavioral_notes.known_commands && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Known Commands</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{behavioral_notes.known_commands}</p>
                </div>
              )}
              {behavioral_notes.fears_and_triggers && (
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Fears & Triggers
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{behavioral_notes.fears_and_triggers}</p>
                </div>
              )}
              {behavioral_notes.socialization && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Socialization</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{behavioral_notes.socialization}</p>
                </div>
              )}
              {behavioral_notes.additional_notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Additional Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{behavioral_notes.additional_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {/* Food & Diet */}
        {visibility.food && food_preferences && (Array.isArray(food_preferences) ? food_preferences.length > 0 : true) && (() => {
          const allFoods = Array.isArray(food_preferences) ? food_preferences : [food_preferences]

          const timeSlotMap = new Map<string, typeof allFoods>()
          const freeFeedingFoods: typeof allFoods = []

          for (const food of allFoods) {
            if (food.feeding_frequency === 'Free feeding') {
              freeFeedingFoods.push(food)
            } else if (food.meal_times && food.meal_times.length > 0) {
              for (const slot of food.meal_times) {
                if (!timeSlotMap.has(slot)) timeSlotMap.set(slot, [])
                timeSlotMap.get(slot)!.push(food)
              }
            }
          }

          // Helper to parse time strings like "7:00 AM" or "18:00" to minutes since midnight
          const parseTimeToMinutes = (time: string): number => {
            // Handle predefined slots first
            if (timeOfDayOrder[time] !== undefined) {
              return timeOfDayOrder[time] * 100 // Convert order to pseudo-minutes
            }

            // Handle "HH:MM AM/PM" format
            const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
            if (amPmMatch) {
              let hours = parseInt(amPmMatch[1])
              const minutes = parseInt(amPmMatch[2])
              const isPM = amPmMatch[3].toUpperCase() === 'PM'
              if (isPM && hours !== 12) hours += 12
              if (!isPM && hours === 12) hours = 0
              return hours * 60 + minutes
            }

            // Handle "HH:MM" 24-hour format
            const h24Match = time.match(/^(\d{1,2}):(\d{2})$/)
            if (h24Match) {
              return parseInt(h24Match[1]) * 60 + parseInt(h24Match[2])
            }

            return 9999 // Unknown format, put at end
          }

          const sortedSlots = Array.from(timeSlotMap.entries()).sort(([a], [b]) => {
            return parseTimeToMinutes(a) - parseTimeToMinutes(b)
          })

          const hasMealSchedule = sortedSlots.length > 0 || freeFeedingFoods.length > 0

          return (
            <div className="span-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Food & Diet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasMealSchedule && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Meal Schedule</p>
                    {sortedSlots.map(([slot, slotFoods]) => {
                      const label = timeOfDayLabels[slot] || slot
                      const range = timeOfDayRanges[slot]
                      return (
                        <div key={slot} className="rounded-lg border p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span>🍽️</span>
                            <span className="font-medium">{label} Meal</span>
                            {range && <span className="text-sm text-muted-foreground">· {range}</span>}
                          </div>
                          {slotFoods.map((food) => (
                            <div key={food.id} className="flex items-center justify-between gap-2 pl-6">
                              <div className="flex items-center gap-2 min-w-0">
                                {food.brand_domain && (
                                  <BrandLogo domain={food.brand_domain} brandName={food.brand || undefined} size={20} containerClassName="w-5 h-5 bg-white rounded border flex items-center justify-center overflow-hidden flex-shrink-0" />
                                )}
                                <span className="text-sm truncate">{food.brand || 'Unnamed'}</span>
                                {food.food_type && <Badge variant="secondary" className="text-xs">{food.food_type}</Badge>}
                              </div>
                              {food.portion_size && <span className="text-sm text-muted-foreground whitespace-nowrap">{food.portion_size}</span>}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                    {freeFeedingFoods.length > 0 && (
                      <div className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span>🍽️</span>
                          <span className="font-medium">Available All Day</span>
                        </div>
                        {freeFeedingFoods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between gap-2 pl-6">
                            <div className="flex items-center gap-2 min-w-0">
                              {food.brand_domain && (
                                <BrandLogo domain={food.brand_domain} brandName={food.brand || undefined} size={20} containerClassName="w-5 h-5 bg-white rounded border flex items-center justify-center overflow-hidden flex-shrink-0" />
                              )}
                              <span className="text-sm truncate">{food.brand || 'Unnamed'}</span>
                              {food.food_type && <Badge variant="secondary" className="text-xs">{food.food_type}</Badge>}
                            </div>
                            {food.portion_size && <span className="text-sm text-muted-foreground whitespace-nowrap">{food.portion_size}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {hasMealSchedule && <Separator />}
                <div className="space-y-4">
                  {!hasMealSchedule && <p className="text-sm font-medium text-muted-foreground">Food Items</p>}
                  {hasMealSchedule && <p className="text-sm font-medium text-muted-foreground">Food Details</p>}
                  {allFoods.map((food, index) => (
                    <div key={food.id || index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-1 space-y-2">
                        {food.brand && <p className="font-medium">{food.brand}</p>}
                        {food.product_variant && (
                          <p className="text-sm"><span className="text-muted-foreground">Variant:</span> {food.product_variant}</p>
                        )}
                        {food.food_type && (
                          <p className="text-sm"><span className="text-muted-foreground">Type:</span> {food.food_type}</p>
                        )}
                        {food.portion_size && (
                          <p className="text-sm"><span className="text-muted-foreground">Portion:</span> {food.portion_size}</p>
                        )}
                        {food.feeding_frequency && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Schedule:</span>{' '}
                            {food.meal_times && food.meal_times.length > 0
                              ? food.meal_times.map(t => timeOfDayLabels[t] || t).join(', ')
                              : food.feeding_frequency}
                          </p>
                        )}
                        {food.notes && <p className="text-sm text-muted-foreground">{food.notes}</p>}
                        {food.brand && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            <a href={getAmazonSearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#FF9900] text-black hover:bg-[#e88a00] transition-all"><ShoppingCart className="h-3 w-3" />Amazon</a>
                            <a href={getChewySearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#1C49C2] text-white hover:bg-[#153a9e] transition-all"><ShoppingCart className="h-3 w-3" />Chewy</a>
                            <a href={getPetcoSearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#0057A6] text-white hover:bg-[#004785] transition-all"><ShoppingCart className="h-3 w-3" />Petco</a>
                            <a href={getPetSmartSearchUrl(food.brand, food.product_variant || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#E31837] text-white hover:bg-[#c7142f] transition-all"><ShoppingCart className="h-3 w-3" />PetSmart</a>
                          </div>
                        )}
                      </div>
                      {food.brand_domain && (
                        <BrandLogo domain={food.brand_domain} brandName={food.brand || undefined} size={64} containerClassName="w-20 h-20 bg-white rounded-lg border flex items-center justify-center p-2 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          )
        })()}

        {/* Daily Routine */}
        {visibility.routines && daily_routines && daily_routines.length > 0 && (
          <div className="span-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Routine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...daily_routines]
                  .sort((a, b) => {
                    const orderA = timeOfDayOrder[a.time_of_day || ''] ?? 99
                    const orderB = timeOfDayOrder[b.time_of_day || ''] ?? 99
                    return orderA - orderB
                  })
                  .map((routine) => (
                  <div key={routine.id} className="flex gap-4 items-start">
                    <div className="text-2xl">
                      {routineIcons[routine.routine_type] || '📋'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium capitalize">{routine.routine_type}</p>
                        {routine.time_of_day && (
                          <Badge variant="outline">
                            {formatTime(routine.time_of_day)}
                          </Badge>
                        )}
                        {routine.duration_minutes && (
                          <Badge variant="secondary">{routine.duration_minutes} min</Badge>
                        )}
                      </div>
                      {routine.description && (
                        <p className="text-sm text-muted-foreground mt-1">{routine.description}</p>
                      )}
                      {routine.days_of_week && routine.days_of_week.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {routine.days_of_week.map((day) => (
                            <Badge key={day} variant="outline" className="capitalize text-xs">
                              {day.slice(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {routine.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{routine.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Vaccinations */}
        {visibility.vaccinations && (vaccinations?.length > 0 || vaccinationDocs.length > 0) && (
          <div className="span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5" />
                Vaccinations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaccinationDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  {vaccinationDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.notes && <p className="text-xs text-muted-foreground">{doc.notes}</p>}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}

              {vaccinations && vaccinations.length > 0 && (
                <div className="space-y-3">
                  {vaccinationDocs.length > 0 && <p className="text-sm font-medium text-muted-foreground">Individual Records</p>}
                  {vaccinations.map((vax) => (
                    <div key={vax.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vax.vaccine_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(vax.administered_date)}
                        </p>
                        {vax.document_url && (
                          <a
                            href={vax.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <FileText className="h-3 w-3" />
                            View Certificate
                          </a>
                        )}
                      </div>
                      {vax.expiration_date && (
                        <Badge
                          variant={
                            new Date(vax.expiration_date) < new Date()
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {new Date(vax.expiration_date) < new Date()
                            ? 'Expired'
                            : `Exp: ${formatDate(vax.expiration_date)}`}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {/* Health Records */}
        {visibility.health_records && (health_records?.length > 0 || healthDocs.length > 0) && (
          <div className="span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  {healthDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.notes && <p className="text-xs text-muted-foreground">{doc.notes}</p>}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}

              {health_records && health_records.length > 0 && (
                <div className="space-y-3">
                  {healthDocs.length > 0 && <p className="text-sm font-medium text-muted-foreground">Individual Records</p>}
                  {health_records.map((record) => (
                    <div key={record.id}>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{record.title}</p>
                        <Badge variant="secondary">{record.record_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.record_date)}
                      </p>
                      {record.description && (
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      )}
                      {record.document_url && (
                        <a
                          href={record.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                        >
                          <FileText className="h-3 w-3" />
                          View Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {/* Insurance */}
        {visibility.insurance && (insurance || insuranceDocs.length > 0) && (
          <div className="span-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insurance && (
                <div className="space-y-2">
                  <p className="font-medium">{insurance.provider_name}</p>
                  {insurance.policy_number && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Policy #:</span> {insurance.policy_number}
                    </p>
                  )}
                  {insurance.contact_phone && (
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${insurance.contact_phone}`} className="text-primary hover:underline">
                        {insurance.contact_phone}
                      </a>
                    </p>
                  )}
                  {insurance.document_url && (
                    <a
                      href={insurance.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Policy Document
                    </a>
                  )}
                </div>
              )}

              {insuranceDocs.length > 0 && (
                <div className="space-y-2">
                  {insurance && <p className="text-sm font-medium text-muted-foreground">Additional Documents</p>}
                  {insuranceDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.notes && <p className="text-xs text-muted-foreground">{doc.notes}</p>}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {/* Footer */}
        <div className="span-full flex flex-col items-center gap-3 py-4 print:hidden">
          <PrintButton />
          <p className="text-sm text-muted-foreground">Shared via Pet Passport</p>
        </div>
      </div>

      {/* Emergency Banner */}
      <EmergencyBanner
        emergencyContacts={emergency_contacts || []}
        veterinarians={veterinarians || []}
        petName={pet.name}
      />
    </div>
  )
}
