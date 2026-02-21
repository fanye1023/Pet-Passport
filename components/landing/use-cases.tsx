'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { Plane, Dog, Building2, UserCheck } from 'lucide-react'

const useCases = [
  {
    icon: Plane,
    title: 'Going on Vacation',
    recipient: 'Pet Sitter',
    shares: ['Full care instructions', 'Feeding schedule', 'Emergency contacts', 'Vet info'],
    color: 'bg-blue-500',
    lightColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Dog,
    title: 'Daily Walks',
    recipient: 'Dog Walker',
    shares: ['Walk routine', 'Behavioral notes', 'Emergency contact'],
    color: 'bg-green-500',
    lightColor: 'bg-green-500/10',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Building2,
    title: 'Boarding Stay',
    recipient: 'Boarding Facility',
    shares: ['Vaccination records', 'Vet information', 'Medical history'],
    color: 'bg-purple-500',
    lightColor: 'bg-purple-500/10',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: UserCheck,
    title: 'New Caretaker',
    recipient: 'Anyone You Trust',
    shares: ['Choose exactly what to share', 'Set expiration date', 'Revoke anytime'],
    color: 'bg-amber-500',
    lightColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
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
            One Pet, Many Links
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create different share links for different people. Each person sees only what they need.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <div
                key={useCase.title}
                className={`rounded-xl border bg-card p-6 transition-all duration-700 hover:shadow-lg ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${useCase.lightColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${useCase.textColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-1">{useCase.title}</h3>
                <p className={`text-sm font-medium ${useCase.textColor} mb-3`}>
                  For: {useCase.recipient}
                </p>
                <ul className="space-y-1.5">
                  {useCase.shares.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${useCase.color} mt-1.5 flex-shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
