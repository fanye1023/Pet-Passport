'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '1 pet profile',
      '3 share links',
      '2 collaborators',
      'Health records & vaccinations',
      'Emergency contacts',
      'Food & routine tracking',
      'AI document extraction',
    ],
    cta: 'Get Started Free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    yearlyPrice: '$49/year (save 18%)',
    description: 'For families with multiple pets',
    features: [
      'Unlimited pet profiles',
      'Unlimited share links',
      'Unlimited collaborators',
      'Calendar sync (Google, Apple, Outlook)',
      'SMS reminders for appointments',
      'Priority support',
    ],
    cta: 'Coming Soon',
    href: '/signup',
    highlighted: true,
    comingSoon: true,
  },
]

export function Pricing() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.05)

  return (
    <section id="pricing" className="border-t">
      <div className="container mx-auto px-4 py-20 lg:py-28">
      <div
        ref={headerRef}
        className={`text-center mb-16 transition-all duration-700 ${
          headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="text-sm font-medium text-primary mb-3">Pricing</p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free, upgrade when you need more.
        </p>
      </div>

      <div
        ref={gridRef}
        className={`grid gap-8 md:grid-cols-2 max-w-3xl mx-auto transition-all duration-700 ${
          gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col card-hover ${tier.highlighted ? 'border-primary shadow-xl scale-105 bg-gradient-to-b from-primary/5 to-transparent' : ''}`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-teal-500 text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-muted-foreground">{tier.period}</span>
                )}
              </div>
              {tier.yearlyPrice && (
                <p className="text-xs text-muted-foreground mt-1">{tier.yearlyPrice}</p>
              )}
              <CardDescription className="mt-2">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier.comingSoon ? (
                <Button
                  className="w-full"
                  variant="default"
                  disabled
                >
                  {tier.cta}
                </Button>
              ) : (
                <Link href={tier.href} className="w-full">
                  <Button
                    className="w-full btn-press"
                    variant={tier.highlighted ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      </div>
    </section>
  )
}
