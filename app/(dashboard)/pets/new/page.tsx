'use client'

import { useSearchParams } from 'next/navigation'
import { PetForm } from '@/components/pets/pet-form'
import { Card, CardContent } from '@/components/ui/card'
import { PartyPopper } from 'lucide-react'

export default function NewPetPage() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'

  return (
    <div className="flex flex-col items-center gap-6">
      {isWelcome && (
        <Card className="w-full max-w-md border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <PartyPopper className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Welcome to Pet Passport!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Let&apos;s get started by adding your first pet. You can add their basic info now and complete their profile later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <PetForm />
    </div>
  )
}
