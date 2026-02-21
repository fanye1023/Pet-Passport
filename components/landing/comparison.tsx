'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { Check, X, Lock, Clock, Eye, Share2 } from 'lucide-react'

const features = [
  {
    feature: 'Store pet health records',
    others: true,
    petPassport: true,
  },
  {
    feature: 'Share with specific people',
    others: false,
    petPassport: true,
  },
  {
    feature: 'Control what each person sees',
    others: false,
    petPassport: true,
  },
  {
    feature: 'PIN-protected links',
    others: false,
    petPassport: true,
  },
  {
    feature: 'Auto-expiring access',
    others: false,
    petPassport: true,
  },
  {
    feature: 'Revoke access anytime',
    others: false,
    petPassport: true,
  },
]

const highlights = [
  {
    icon: Share2,
    title: 'Share Without Oversharing',
    description: 'Your dog walker doesn\'t need your insurance info. Your pet sitter doesn\'t need vaccination dates. Share exactly what each person needs.',
  },
  {
    icon: Lock,
    title: 'PIN Protection',
    description: 'Add a PIN code to sensitive links. Even if someone finds the URL, they can\'t access it without the code.',
  },
  {
    icon: Clock,
    title: 'Auto-Expiring Links',
    description: 'Set links to expire after your trip, after a week, or never. You decide how long access lasts.',
  },
  {
    icon: Eye,
    title: 'Always Up to Date',
    description: 'Update your pet\'s info once, and everyone with access sees the latest version. No need to re-share.',
  },
]

export function Comparison() {
  const { ref: tableRef, isVisible: tableVisible } = useScrollAnimation()
  const { ref: highlightsRef, isVisible: highlightsVisible } = useScrollAnimation()

  return (
    <section className="bg-muted/30">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div
          ref={tableRef}
          className={`text-center mb-12 transition-all duration-700 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Not Just Storage. Smart Sharing.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Other apps store your pet's data. Pet Passport lets you share it securely.
          </p>
        </div>

        {/* Comparison Table */}
        <div
          className={`max-w-2xl mx-auto mb-16 transition-all duration-700 delay-100 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="rounded-xl border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/50 border-b">
              <div className="p-4 font-medium text-sm">Feature</div>
              <div className="p-4 font-medium text-sm text-center border-l">Other Apps</div>
              <div className="p-4 font-medium text-sm text-center border-l bg-primary/5 text-primary">Pet Passport</div>
            </div>

            {/* Table Body */}
            {features.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${index !== features.length - 1 ? 'border-b' : ''}`}
              >
                <div className="p-4 text-sm">{row.feature}</div>
                <div className="p-4 flex items-center justify-center border-l">
                  {row.others ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="p-4 flex items-center justify-center border-l bg-primary/5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Grid */}
        <div
          ref={highlightsRef}
          className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ${
            highlightsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {highlights.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="text-center"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
