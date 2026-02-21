'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { Plane, Dog, Building2, Stethoscope } from 'lucide-react'

const useCases = [
  {
    icon: Dog,
    title: 'Dog Walkers',
    description: 'Share walking routines, behavioral notes, and your emergency contact.',
  },
  {
    icon: Plane,
    title: 'Pet Sitters',
    description: 'Full care instructions, feeding schedules, and vet information.',
  },
  {
    icon: Building2,
    title: 'Boarding Facilities',
    description: 'Vaccination records, medical history, and dietary requirements.',
  },
  {
    icon: Stethoscope,
    title: 'Veterinarians',
    description: 'Complete health records, insurance details, and past treatments.',
  },
]

export function UseCases() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-20 lg:py-28">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm font-medium text-primary mb-3">Use Cases</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Perfect for any caregiver
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create different links for different people. Each person sees only what they need.
          </p>
        </div>

        <div
          className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <div
                key={useCase.title}
                className="text-center"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
