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
      <div className="relative mx-auto w-[220px] sm:w-[240px] lg:w-[260px]">
        {/* Phone bezel */}
        <div className="relative rounded-[2rem] bg-gray-900 p-2 shadow-2xl">
          {/* Screen */}
          <div className="relative rounded-[1.5rem] bg-white overflow-hidden aspect-[9/19]">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-5 bg-gray-100 flex items-center justify-center">
              <div className="w-16 h-3 bg-gray-900 rounded-full" />
            </div>

            {/* App content mockup */}
            <div className="pt-6 px-3 pb-3 h-full flex flex-col">
              {/* Pet header */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-lg mb-1">
                  🐕
                </div>
                <p className="font-semibold text-gray-900 text-sm">Buddy</p>
                <p className="text-[10px] text-gray-500">Golden Retriever · 3 years</p>
              </div>

              {/* Info cards */}
              <div className="space-y-1.5 flex-1">
                <div className="rounded-md bg-gray-50 p-2 border border-gray-100">
                  <p className="text-[8px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">Feeding</p>
                  <p className="text-[10px] text-gray-900">8am & 6pm · 1 cup</p>
                </div>
                <div className="rounded-md bg-gray-50 p-2 border border-gray-100">
                  <p className="text-[8px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">Daily Walk</p>
                  <p className="text-[10px] text-gray-900">AM 30min · PM 45min</p>
                </div>
                <div className="rounded-md bg-gray-50 p-2 border border-gray-100">
                  <p className="text-[8px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">Emergency</p>
                  <p className="text-[10px] text-gray-900">Sarah · (555) 123-4567</p>
                </div>
                <div className="rounded-md bg-red-50 p-2 border border-red-100">
                  <p className="text-[8px] font-medium text-red-600 uppercase tracking-wider mb-0.5">Allergies</p>
                  <p className="text-[10px] text-gray-900">Chicken, Grain</p>
                </div>
              </div>

              {/* Emergency button */}
              <div className="mt-2">
                <div className="rounded-md bg-red-500 text-white text-[10px] font-medium py-1.5 text-center">
                  Emergency
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute -left-2 sm:-left-4 top-1/4 bg-white rounded-md shadow-lg px-2 py-1.5 border animate-fade-in">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-green-600" />
            </div>
            <span className="text-[10px] font-medium">Shared with Walker</span>
          </div>
        </div>

        <div className="absolute -right-2 sm:-right-4 top-1/2 bg-white rounded-md shadow-lg px-2 py-1.5 border animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <span className="text-[10px] font-medium">PIN Protected</span>
          </div>
        </div>

        <div className="absolute -left-4 sm:-left-8 bottom-1/4 bg-white rounded-md shadow-lg px-2 py-1.5 border animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-amber-600" />
            </div>
            <span className="text-[10px] font-medium">Expires in 7 days</span>
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
              <Button size="lg" variant="secondary" className="w-full sm:w-auto btn-press border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary font-semibold">
                <Eye className="h-4 w-4 mr-2" />
                See What Your Pet Sitter Sees
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
