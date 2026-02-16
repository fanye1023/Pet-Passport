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
      'Basic health records',
      'Vaccination tracking',
      'Email reminders',
    ],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For pet owners who travel',
    features: [
      'Up to 5 pet profiles',
      'Complete health records',
      'International travel documents',
      'Priority support',
      'Document sharing',
      'SMS reminders',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For breeders & organizations',
    features: [
      'Unlimited pet profiles',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
    ],
    cta: 'Contact Sales',
    href: '#',
    highlighted: false,
  },
]

export function Pricing() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.05)

  return (
    <section id="pricing" className="container mx-auto px-4 py-24 bg-muted/30">
      <div
        ref={headerRef}
        className={`text-center mb-16 transition-all duration-700 ${
          headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include our core features.
        </p>
      </div>

      <div
        ref={gridRef}
        className={`grid gap-8 md:grid-cols-3 max-w-5xl mx-auto transition-all duration-700 ${
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
              <Link href={tier.href} className="w-full">
                <Button
                  className="w-full btn-press"
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  {tier.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
