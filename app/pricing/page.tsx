import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, ArrowRight, Sparkles } from 'lucide-react'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started with one pet',
    features: [
      { name: '1 pet profile', included: true },
      { name: '3 share links', included: true },
      { name: '2 collaborators per pet', included: true },
      { name: 'Health records & vaccinations', included: true },
      { name: 'Emergency contacts', included: true },
      { name: 'Food & routine tracking', included: true },
      { name: 'AI document extraction', included: true },
      { name: 'PIN-protected links', included: true },
      { name: 'Expiring share links', included: true },
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
      { name: 'Unlimited pet profiles', included: true },
      { name: 'Unlimited share links', included: true },
      { name: 'Unlimited collaborators', included: true },
      { name: 'Health records & vaccinations', included: true },
      { name: 'Emergency contacts', included: true },
      { name: 'Food & routine tracking', included: true },
      { name: 'AI document extraction', included: true },
      { name: 'PIN-protected links', included: true },
      { name: 'Expiring share links', included: true },
      { name: 'Calendar sync (Google, Apple, Outlook)', included: true, premium: true },
      { name: 'SMS reminders for appointments', included: true, premium: true },
      { name: 'Priority support', included: true, premium: true },
    ],
    cta: 'Coming Soon',
    href: '/signup',
    highlighted: true,
    comingSoon: true,
  },
]

const comparisonFeatures = [
  { feature: 'Pet profiles', free: '1', premium: 'Unlimited' },
  { feature: 'Share links per pet', free: '3', premium: 'Unlimited' },
  { feature: 'Collaborators per pet', free: '2', premium: 'Unlimited' },
  { feature: 'Health records', free: true, premium: true },
  { feature: 'Vaccination tracking', free: true, premium: true },
  { feature: 'Emergency contacts', free: true, premium: true },
  { feature: 'Food & routine info', free: true, premium: true },
  { feature: 'AI document extraction', free: true, premium: true },
  { feature: 'PIN-protected links', free: true, premium: true },
  { feature: 'Auto-expiring links', free: true, premium: true },
  { feature: 'Revoke access anytime', free: true, premium: true },
  { feature: 'Calendar sync', free: false, premium: true },
  { feature: 'SMS reminders', free: false, premium: true },
  { feature: 'Priority support', free: false, premium: true },
]

const faqs = [
  {
    question: 'Is the free plan really free forever?',
    answer: 'Yes! The free plan includes everything you need for one pet with no time limits or hidden fees. Use it as long as you want.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Absolutely. Upgrade to Premium whenever you need more pets or features, and you can cancel anytime. Your data stays safe.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data is never deleted. If you downgrade and exceed the free tier limits, you\'ll keep read access to everything but won\'t be able to add new pets or links until you\'re within limits.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If Premium isn\'t right for you, just let us know.',
  },
  {
    question: 'When will Premium be available?',
    answer: 'Premium is coming soon! Start with the free plan now and you\'ll be notified when Premium launches.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24 text-center">
          <p className="text-sm font-medium text-primary mb-3">Pricing</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free with everything you need for one pet. Upgrade to Premium when your family grows.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${tier.highlighted ? 'border-primary shadow-xl scale-105 bg-gradient-to-b from-primary/5 to-transparent' : ''}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-teal-500 text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  {tier.yearlyPrice && (
                    <p className="text-sm text-muted-foreground mt-1">{tier.yearlyPrice}</p>
                  )}
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        <Check className={`h-5 w-5 flex-shrink-0 ${'premium' in feature && feature.premium ? 'text-amber-500' : 'text-primary'}`} />
                        <span className="text-sm">
                          {feature.name}
                          {'premium' in feature && feature.premium && (
                            <Sparkles className="inline ml-1 h-3 w-3 text-amber-500" />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
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
                        className="w-full"
                        variant={tier.highlighted ? 'default' : 'outline'}
                      >
                        {tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Compare plans
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                See exactly what's included in each plan
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="rounded-xl border bg-card overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-muted/50 border-b">
                  <div className="p-4 font-semibold">Feature</div>
                  <div className="p-4 font-semibold text-center border-l">Free</div>
                  <div className="p-4 font-semibold text-center border-l bg-primary/5 text-primary">Premium</div>
                </div>

                {/* Table Body */}
                {comparisonFeatures.map((row, index) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-3 ${index !== comparisonFeatures.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="p-4 text-sm font-medium">{row.feature}</div>
                    <div className="p-4 flex items-center justify-center border-l">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/40" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{row.free}</span>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-center border-l bg-primary/5">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="w-5 h-5 text-primary" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/40" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-primary">{row.premium}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Everything you need to know about our pricing
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 lg:py-20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your free account and start sharing your pet's info safely today.
            </p>
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
