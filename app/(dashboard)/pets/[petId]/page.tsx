import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import {
  Syringe,
  Heart,
  Shield,
  Phone,
  Utensils,
  CalendarDays,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { SpeciesDecoration } from '@/components/ui/species-decoration'

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  const supabase = await createClient()

  // Fetch pet info for species decoration
  const { data: pet } = await supabase
    .from('pets')
    .select('species')
    .eq('id', petId)
    .single()

  // Fetch counts for each section
  const [
    { count: vaccinationRecordCount },
    { count: vaccinationDocCount },
    { count: healthRecordCount },
    { count: healthDocCount },
    { count: insuranceCount },
    { count: vetCount },
    { count: emergencyCount },
    { count: routineCount },
    { count: foodCount },
    { count: careEventCount },
    { count: careInstructionsCount },
    { count: behavioralNotesCount },
  ] = await Promise.all([
    supabase.from('vaccination_records').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('pet_documents').select('*', { count: 'exact', head: true }).eq('pet_id', petId).eq('category', 'vaccination'),
    supabase.from('health_records').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('pet_documents').select('*', { count: 'exact', head: true }).eq('pet_id', petId).eq('category', 'health'),
    supabase.from('pet_insurance').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('veterinarians').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('emergency_contacts').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('daily_routines').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('food_preferences').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('care_events').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('care_instructions').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
    supabase.from('behavioral_notes').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
  ])

  const vaccinationCount = (vaccinationRecordCount ?? 0) + (vaccinationDocCount ?? 0)
  const healthCount = (healthRecordCount ?? 0) + (healthDocCount ?? 0)
  const sitterInfoCount = (careInstructionsCount ?? 0) + (behavioralNotesCount ?? 0)

  const sections = [
    {
      href: `/pets/${petId}/vaccinations`,
      title: 'Vaccinations',
      icon: Syringe,
      count: vaccinationCount ?? 0,
      description: 'Track vaccination records',
      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      span: 'span-4',
    },
    {
      href: `/pets/${petId}/health`,
      title: 'Health Records',
      icon: Heart,
      count: healthCount ?? 0,
      description: 'Medical history and checkups',
      color: 'bg-red-500/20 text-red-600 dark:text-red-400',
      span: 'span-4',
    },
    {
      href: `/pets/${petId}/insurance`,
      title: 'Insurance',
      icon: Shield,
      count: insuranceCount ?? 0,
      description: 'Insurance policy details',
      color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      span: 'span-4',
    },
    {
      href: `/pets/${petId}/calendar`,
      title: 'Care Calendar',
      icon: CalendarDays,
      count: careEventCount ?? 0,
      description: 'Appointments & medications',
      color: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
      span: 'span-6',
    },
    {
      href: `/pets/${petId}/emergency`,
      title: 'Emergency Contacts',
      icon: Phone,
      count: emergencyCount ?? 0,
      description: 'Emergency contact info',
      color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      span: 'span-6',
    },
    {
      href: `/pets/${petId}/care`,
      title: 'Food & Routine',
      icon: Utensils,
      count: (foodCount ?? 0) + (routineCount ?? 0),
      description: 'Food preferences & daily routines',
      color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      span: 'span-6',
    },
    {
      href: `/pets/${petId}/sitter-info`,
      title: 'Sitter Info',
      icon: ClipboardList,
      count: sitterInfoCount,
      description: 'Care instructions & behavioral notes',
      color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      span: 'span-6',
    },
  ]

  return (
    <SpeciesDecoration species={pet?.species || 'other'} intensity="light">
      {/* Bento Grid Layout */}
      <div className="bento-grid">
        {sections.map((section) => (
          <div key={section.href} className={`bento-item ${section.span}`}>
            <Link href={section.href}>
              <div className="glass-card rounded-2xl p-5 h-full card-interactive group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${section.color} transition-transform group-hover:scale-110`}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {section.title}
                        <Badge
                          variant={section.count > 0 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {section.count}
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </SpeciesDecoration>
  )
}
