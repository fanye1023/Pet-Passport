'use client'

import Link from 'next/link'
import { PartyPopper, Home, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PetMascot } from '../pet-mascot'

interface StepCompleteProps {
  petId: string
  petName: string
  petSpecies: string
  completedSteps: number[]
  totalSteps: number
}

export function StepComplete({
  petId,
  petName,
  petSpecies,
  completedSteps,
  totalSteps,
}: StepCompleteProps) {
  const completedCount = completedSteps.length
  const skippedCount = totalSteps - completedCount

  return (
    <div className="animate-fade-in text-center space-y-6">
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pt-8 pb-4">
          <div className="flex justify-center mb-4">
            <PetMascot species={petSpecies} mood="celebrating" size="lg" />
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {petName}&apos;s Profile is Set Up!
          </h2>

          <p className="text-muted-foreground">
            {completedCount === totalSteps
              ? 'Amazing! You completed all the steps.'
              : `You completed ${completedCount} of ${totalSteps} steps.`}
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Summary */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completedCount}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            {skippedCount > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{skippedCount}</div>
                <div className="text-muted-foreground">Skipped</div>
              </div>
            )}
          </div>

          {skippedCount > 0 && (
            <p className="text-sm text-muted-foreground">
              You can always add more info later from {petName}&apos;s profile.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full btn-press">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href={`/pets/${petId}`} className="flex-1">
              <Button className="w-full btn-press">
                <PawPrint className="w-4 h-4 mr-2" />
                View {petName}&apos;s Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
