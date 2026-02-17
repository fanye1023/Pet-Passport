'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OnboardingPromptProps {
  petId: string
  petName: string
}

export function OnboardingPrompt({ petId, petName }: OnboardingPromptProps) {
  const pathname = usePathname()
  const [showPrompt, setShowPrompt] = useState(false)
  const [completionPercent, setCompletionPercent] = useState(0)

  useEffect(() => {
    async function checkOnboardingStatus() {
      const supabase = createClient()

      // Check onboarding_progress table
      const { data: progress } = await supabase
        .from('onboarding_progress')
        .select('is_completed, completed_steps, skipped_steps')
        .eq('pet_id', petId)
        .single()

      // If marked as completed, don't show prompt
      if (progress?.is_completed) {
        setShowPrompt(false)
        return
      }

      // Check actual data to determine completion
      const [
        { count: vetCount },
        { count: vaccinationCount },
        { count: vaccinationDocCount },
        { count: emergencyCount },
        { count: foodCount },
        { count: routineCount },
        { count: insuranceCount },
      ] = await Promise.all([
        supabase.from('veterinarians').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('vaccination_records').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('pet_documents').select('*', { count: 'exact', head: true }).eq('pet_id', petId).eq('category', 'vaccination'),
        supabase.from('emergency_contacts').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('food_preferences').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('daily_routines').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
        supabase.from('pet_insurance').select('*', { count: 'exact', head: true }).eq('pet_id', petId),
      ])

      // Count completed sections
      let completed = 0
      const total = 6
      if ((vetCount ?? 0) > 0) completed++
      if ((vaccinationCount ?? 0) + (vaccinationDocCount ?? 0) > 0) completed++
      if ((emergencyCount ?? 0) > 0) completed++
      if ((foodCount ?? 0) > 0) completed++
      if ((routineCount ?? 0) > 0) completed++
      if ((insuranceCount ?? 0) > 0) completed++

      const percent = Math.round((completed / total) * 100)
      setCompletionPercent(percent)

      // Show prompt if not all sections are complete
      if (completed < total) {
        setShowPrompt(true)
      }
    }

    checkOnboardingStatus()
  }, [petId])

  // Don't show on the onboarding page itself
  if (!showPrompt || pathname?.includes('/onboarding')) return null

  return (
    <div className="glass-card rounded-xl p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {petName}&apos;s profile is {completionPercent}% complete
            </p>
            <p className="text-xs text-muted-foreground">
              Add more info to help sitters and vets care for {petName}
            </p>
          </div>
        </div>
        <Link href={`/pets/${petId}/onboarding`}>
          <Button size="sm" className="btn-press whitespace-nowrap">
            Complete Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}
