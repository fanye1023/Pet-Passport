'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Globe, Sparkles, Eye } from 'lucide-react'

// Demo pet profile URL - update this when you have a demo pet
const DEMO_URL = '/share/demo-buddy-golden'

function AnimatedDogPassport() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-300 animate-float"
            style={{
              left: `${15 + i * 18}%`,
              top: `${5 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
              fontSize: `${10 + (i % 3) * 4}px`,
            }}
          >
            ♥
          </div>
        ))}
      </div>

      {/* Passport */}
      <div className="absolute right-4 top-4 lg:right-8 lg:top-6 animate-float-slow z-10">
        <div className="relative">
          <div className="w-20 h-28 lg:w-28 lg:h-38 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg shadow-xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
            <div className="absolute inset-2 border border-teal-300/30 rounded flex flex-col items-center justify-center">
              <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full border-2 border-teal-200/50 flex items-center justify-center mb-1">
                <svg viewBox="0 0 24 24" className="w-4 h-4 lg:w-6 lg:h-6 text-teal-100" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="text-[6px] lg:text-[8px] text-teal-100 font-semibold tracking-wider">PET PASSPORT</div>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 lg:w-12 lg:h-12 rounded-full border-2 border-dashed border-green-500/70 flex items-center justify-center animate-pulse-slow bg-white/80">
            <span className="text-[5px] lg:text-[7px] text-green-600 font-bold">APPROVED</span>
          </div>
        </div>
      </div>

      {/* Dogs container */}
      <div className="flex items-end gap-4 lg:gap-6">

        {/* Corgi - left side, more realistic */}
        <div className="relative animate-bounce-gentle">
          <svg viewBox="0 0 150 130" className="w-36 h-32 lg:w-48 lg:h-42">
            {/* Shadow */}
            <ellipse cx="75" cy="125" rx="40" ry="6" className="fill-black/10" />

            {/* Back leg */}
            <ellipse cx="105" cy="108" rx="12" ry="10" className="fill-amber-500" />
            <ellipse cx="108" cy="118" rx="10" ry="6" className="fill-amber-100" />

            {/* Body - long and sturdy */}
            <ellipse cx="75" cy="88" rx="45" ry="28" className="fill-amber-500" />

            {/* White underbelly */}
            <ellipse cx="60" cy="95" rx="30" ry="18" className="fill-amber-50" />

            {/* Rear fluff */}
            <ellipse cx="118" cy="82" rx="16" ry="18" className="fill-amber-400" />

            {/* Front legs - short */}
            <rect x="38" y="100" width="14" height="20" rx="7" className="fill-amber-500" />
            <rect x="56" y="100" width="14" height="20" rx="7" className="fill-amber-500" />
            <ellipse cx="45" cy="122" rx="9" ry="5" className="fill-amber-100" />
            <ellipse cx="63" cy="122" rx="9" ry="5" className="fill-amber-100" />

            {/* Neck */}
            <ellipse cx="38" cy="72" rx="18" ry="20" className="fill-amber-500" />

            {/* Head - wedge shaped */}
            <ellipse cx="35" cy="50" rx="28" ry="26" className="fill-amber-500" />

            {/* Muzzle */}
            <ellipse cx="28" cy="58" rx="16" ry="14" className="fill-amber-400" />
            <ellipse cx="26" cy="62" rx="12" ry="10" className="fill-amber-50" />

            {/* Ears - rounded, upright corgi ears */}
            <ellipse cx="18" cy="28" rx="12" ry="18" className="fill-amber-500" />
            <ellipse cx="52" cy="28" rx="12" ry="18" className="fill-amber-500" />
            <ellipse cx="18" cy="30" rx="8" ry="12" className="fill-amber-300" />
            <ellipse cx="52" cy="30" rx="8" ry="12" className="fill-amber-300" />

            {/* Eyes - natural looking */}
            <ellipse cx="26" cy="48" rx="5" ry="6" className="fill-amber-900" />
            <ellipse cx="44" cy="48" rx="5" ry="6" className="fill-amber-900" />
            <circle cx="27" cy="46" r="2" className="fill-white" opacity="0.8" />
            <circle cx="45" cy="46" r="2" className="fill-white" opacity="0.8" />

            {/* Nose */}
            <ellipse cx="18" cy="62" rx="6" ry="5" className="fill-stone-900" />
            <ellipse cx="17" cy="61" rx="2" ry="1.5" className="fill-stone-700" />

            {/* Mouth line */}
            <path d="M 18 67 L 18 72 Q 26 78 34 72" stroke="#713f12" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Subtle smile - tongue */}
            <ellipse cx="26" cy="76" rx="5" ry="6" className="fill-pink-400" />

            {/* Collar */}
            <path d="M 25 82 Q 40 88 55 82" stroke="#0d9488" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="40" cy="86" r="3" className="fill-yellow-500" />
            <circle cx="40" cy="86" r="1.5" className="fill-yellow-300" />

            {/* Tail nub */}
            <ellipse cx="132" cy="75" rx="6" ry="10" className="fill-amber-400 animate-wag-tail" style={{ transformOrigin: '126px 80px' }} />
          </svg>
        </div>

        {/* Dachshund - right side, more realistic */}
        <div className="relative animate-bounce-gentle" style={{ animationDelay: '0.3s' }}>
          <svg viewBox="0 0 180 110" className="w-40 h-26 lg:w-56 lg:h-36">
            {/* Shadow */}
            <ellipse cx="95" cy="105" rx="50" ry="5" className="fill-black/10" />

            {/* Long body */}
            <ellipse cx="95" cy="65" rx="58" ry="22" className="fill-stone-800" />

            {/* Shading on body */}
            <ellipse cx="95" cy="72" rx="52" ry="15" className="fill-stone-700" />

            {/* Chest area */}
            <ellipse cx="42" cy="65" rx="18" ry="20" className="fill-stone-800" />

            {/* Back legs */}
            <rect x="125" y="78" width="11" height="18" rx="5" className="fill-stone-800" />
            <rect x="140" y="78" width="11" height="18" rx="5" className="fill-stone-800" />
            <ellipse cx="130" cy="98" rx="7" ry="4" className="fill-stone-900" />
            <ellipse cx="146" cy="98" rx="7" ry="4" className="fill-stone-900" />

            {/* Front legs */}
            <rect x="32" y="78" width="11" height="18" rx="5" className="fill-stone-800" />
            <rect x="48" y="78" width="11" height="18" rx="5" className="fill-stone-800" />
            <ellipse cx="38" cy="98" rx="7" ry="4" className="fill-stone-900" />
            <ellipse cx="54" cy="98" rx="7" ry="4" className="fill-stone-900" />

            {/* Neck */}
            <ellipse cx="35" cy="52" rx="14" ry="16" className="fill-stone-800" />

            {/* Head */}
            <ellipse cx="28" cy="38" rx="18" ry="18" className="fill-stone-800" />

            {/* Long snout */}
            <ellipse cx="16" cy="44" rx="12" ry="10" className="fill-stone-700" />
            <ellipse cx="14" cy="46" rx="8" ry="7" className="fill-stone-600" />

            {/* Floppy ears - soft and droopy */}
            <ellipse cx="40" cy="32" rx="10" ry="16" className="fill-stone-900" transform="rotate(25 40 32)" />
            <ellipse cx="16" cy="28" rx="9" ry="14" className="fill-stone-900" transform="rotate(-20 16 28)" />
            <ellipse cx="39" cy="34" rx="6" ry="10" className="fill-stone-700" transform="rotate(25 39 34)" />
            <ellipse cx="17" cy="30" rx="5" ry="9" className="fill-stone-700" transform="rotate(-20 17 30)" />

            {/* Eyes - warm brown */}
            <ellipse cx="24" cy="36" rx="4" ry="5" className="fill-amber-950" />
            <ellipse cx="36" cy="38" rx="4" ry="5" className="fill-amber-950" />
            <circle cx="25" cy="35" r="1.5" className="fill-white" opacity="0.7" />
            <circle cx="37" cy="37" r="1.5" className="fill-white" opacity="0.7" />

            {/* Eyebrow markings - tan points */}
            <ellipse cx="24" cy="32" rx="5" ry="2" className="fill-amber-600" />
            <ellipse cx="36" cy="34" rx="5" ry="2" className="fill-amber-600" />

            {/* Nose */}
            <ellipse cx="8" cy="46" rx="5" ry="4" className="fill-stone-900" />
            <ellipse cx="7" cy="45" rx="1.5" ry="1" className="fill-stone-700" />

            {/* Mouth */}
            <path d="M 8 50 L 12 54 Q 22 58 30 54" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Tongue */}
            <ellipse cx="20" cy="58" rx="4" ry="5" className="fill-pink-400" />

            {/* Collar */}
            <path d="M 28 58 Q 42 64 56 58" stroke="#dc2626" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="62" r="3" className="fill-yellow-500" />
            <circle cx="42" cy="62" r="1.5" className="fill-yellow-300" />

            {/* Tail - long and curved */}
            <path d="M 153 60 Q 168 52 172 38" stroke="#44403c" strokeWidth="5" strokeLinecap="round" fill="none" className="animate-wag-tail" style={{ transformOrigin: '153px 60px' }} />
          </svg>
        </div>
      </div>

      {/* Paw prints trail */}
      <div className="absolute bottom-2 left-2 flex gap-3 opacity-30">
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="w-5 h-5 text-primary animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
            <path fill="currentColor" d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm3.5 4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
          </svg>
        ))}
      </div>

      {/* Sparkles */}
      <Sparkles className="absolute top-6 left-1/4 w-5 h-5 text-yellow-400 animate-pulse" />
      <Sparkles className="absolute top-1/3 right-1/4 w-4 h-4 text-teal-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <Sparkles className="absolute bottom-1/4 left-1/3 w-4 h-4 text-pink-400 animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        <div className="flex flex-col gap-6 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your pet&apos;s digital passport for a{' '}
            <span className="text-primary">seamless journey</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px]">
            Keep all your pet&apos;s health records and vaccinations in one secure place.
            Share instantly with vets, dog walkers, sitters, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto btn-press">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto btn-press">
                Login
              </Button>
            </Link>
            {DEMO_URL && (
              <Link href={DEMO_URL} target="_blank">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto btn-press">
                  <Eye className="h-4 w-4 mr-2" />
                  See Live Demo
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Share Anywhere</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent p-4 lg:p-8">
            <div className="relative h-full w-full rounded-xl bg-card/80 backdrop-blur border shadow-2xl overflow-hidden">
              <AnimatedDogPassport />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
