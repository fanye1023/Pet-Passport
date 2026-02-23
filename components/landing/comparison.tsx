'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { Check, X } from 'lucide-react'

const features = [
  {
    feature: 'Store pet health records',
    others: true,
    petShareLink: true,
  },
  {
    feature: 'Share with specific people',
    others: false,
    petShareLink: true,
  },
  {
    feature: 'Control what each person sees',
    others: false,
    petShareLink: true,
  },
  {
    feature: 'PIN-protected links',
    others: false,
    petShareLink: true,
  },
  {
    feature: 'Auto-expiring access',
    others: false,
    petShareLink: true,
  },
  {
    feature: 'Revoke access anytime',
    others: false,
    petShareLink: true,
  },
]

export function Comparison() {
  const { ref: tableRef, isVisible: tableVisible } = useScrollAnimation()

  return (
    <section className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-20 lg:py-28">
        {/* Header */}
        <div
          ref={tableRef}
          className={`text-center mb-16 transition-all duration-700 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm font-medium text-primary mb-3">Why Pet ShareLink</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Not just storage. Smart sharing.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Other apps store your pet's data. Pet ShareLink lets you share it securely.
          </p>
        </div>

        {/* Comparison Table */}
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 delay-100 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="rounded-xl border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/50 border-b">
              <div className="p-4 font-medium text-sm">Feature</div>
              <div className="p-4 font-medium text-sm text-center border-l">Other Apps</div>
              <div className="p-4 font-medium text-sm text-center border-l bg-primary/5 text-primary">Pet ShareLink</div>
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

      </div>
    </section>
  )
}
