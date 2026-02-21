'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, Shield, Clock, Eye } from 'lucide-react'

const DEMO_URL = '/share/demo-buddy-golden'

function ProductMockup() {
  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="relative mx-auto w-[280px] sm:w-[320px] lg:w-[360px]">
        {/* Phone bezel */}
        <div className="relative rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl">
          {/* Screen */}
          <div className="relative rounded-[2rem] bg-white overflow-hidden aspect-[9/19]">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 flex items-center justify-center">
              <div className="w-20 h-4 bg-gray-900 rounded-full" />
            </div>

            {/* App content mockup */}
            <div className="pt-8 px-4 pb-4 h-full flex flex-col">
              {/* Pet header */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-2xl mb-2">
                  🐕
                </div>
                <p className="font-semibold text-gray-900">Buddy</p>
                <p className="text-xs text-gray-500">Golden Retriever · 3 years</p>
              </div>

              {/* Info cards */}
              <div className="space-y-2 flex-1">
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Feeding</p>
                  <p className="text-xs text-gray-900">8am & 6pm · Blue Buffalo 1 cup</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Daily Walk</p>
                  <p className="text-xs text-gray-900">Morning 30min · Evening 45min</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Emergency Contact</p>
                  <p className="text-xs text-gray-900">Sarah Johnson · (555) 123-4567</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                  <p className="text-[10px] font-medium text-red-600 uppercase tracking-wider mb-1">Allergies</p>
                  <p className="text-xs text-gray-900">Chicken, Grain</p>
                </div>
              </div>

              {/* Emergency button */}
              <div className="mt-3">
                <div className="rounded-lg bg-red-500 text-white text-xs font-medium py-2 text-center">
                  Emergency
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute -left-4 top-1/4 bg-white rounded-lg shadow-lg px-3 py-2 border animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-xs font-medium">Shared with Walker</span>
          </div>
        </div>

        <div className="absolute -right-4 top-1/2 bg-white rounded-lg shadow-lg px-3 py-2 border animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-xs font-medium">PIN Protected</span>
          </div>
        </div>

        <div className="absolute -left-8 bottom-1/4 bg-white rounded-lg shadow-lg px-3 py-2 border animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-3 h-3 text-amber-600" />
            </div>
            <span className="text-xs font-medium">Expires in 7 days</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-20 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        {/* Left column - Text content */}
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit text-sm font-medium">
            Free to use · No credit card required
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Share your pet's info{' '}
            <span className="text-primary">safely</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-[540px] leading-relaxed">
            Create shareable links with your pet's care instructions, emergency contacts,
            and health records. Control exactly what each person can see.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={DEMO_URL}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                <Eye className="mr-2 h-4 w-4" />
                View Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>PIN protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Expiring links</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Revoke anytime</span>
            </div>
          </div>
        </div>

        {/* Right column - Product mockup */}
        <div className="relative flex justify-center lg:justify-end">
          <ProductMockup />
        </div>
      </div>
    </section>
  )
}
