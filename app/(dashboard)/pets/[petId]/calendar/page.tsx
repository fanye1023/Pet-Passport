'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CareCalendar } from '@/components/calendar/care-calendar'
import { CalendarFeedManager } from '@/components/calendar/calendar-feed-manager'
import { Separator } from '@/components/ui/separator'

export default function CalendarPage() {
  const params = useParams()
  const petId = params.petId as string
  const [petName, setPetName] = useState<string>('')

  useEffect(() => {
    const fetchPetName = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('pets')
        .select('name')
        .eq('id', petId)
        .single()
      if (data) {
        setPetName(data.name)
      }
    }
    fetchPetName()
  }, [petId])

  return (
    <div className="space-y-6">
      <CareCalendar petId={petId} />
      <Separator />
      <CalendarFeedManager petId={petId} petName={petName} />
    </div>
  )
}
