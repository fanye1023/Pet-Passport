'use client'

import { useSearchParams } from 'next/navigation'
import { PetForm } from '@/components/pets/pet-form'
import { Card, CardContent } from '@/components/ui/card'
import { Stethoscope, Syringe, Phone, Utensils, Clock, Shield, CheckCircle2 } from 'lucide-react'

const SETUP_STEPS = [
  { icon: Stethoscope, label: 'Vet info' },
  { icon: Syringe, label: 'Vaccines' },
  { icon: Phone, label: 'Emergency contacts' },
  { icon: Utensils, label: 'Food & diet' },
  { icon: Clock, label: 'Daily routine' },
  { icon: Shield, label: 'Insurance' },
]

export default function NewPetPage() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'

  return (
    <div className="flex flex-col items-center gap-6">
      {isWelcome && (
        <Card className="w-full max-w-md border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
          <CardContent className="pt-6 pb-5">
            {/* Greeting */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2 animate-bounce">🐾</div>
              <h2 className="text-xl font-bold">Welcome to Pet Passport!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Let&apos;s create a profile for your furry friend
              </p>
            </div>

            {/* What you'll set up */}
            <div className="bg-muted/30 rounded-lg p-3 mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                After adding your pet, you can set up:
              </p>
              <div className="flex flex-wrap gap-2">
                {SETUP_STEPS.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-1.5 text-xs bg-background/80 rounded-full px-2 py-1"
                  >
                    <step.icon className="h-3 w-3 text-primary" />
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <PetForm />
    </div>
  )
}
