'use client'

import { ReactNode } from 'react'
import { PawPrint } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-teal-500/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Floating paw prints */}
        <div className="absolute top-[10%] left-[5%] text-primary/10 animate-float-slow">
          <PawPrint className="h-16 w-16 rotate-[-15deg]" />
        </div>
        <div className="absolute top-[20%] right-[10%] text-teal-500/10 animate-float-medium">
          <PawPrint className="h-12 w-12 rotate-[20deg]" />
        </div>
        <div className="absolute bottom-[30%] left-[8%] text-primary/8 animate-float-fast">
          <PawPrint className="h-10 w-10 rotate-[10deg]" />
        </div>
        <div className="absolute bottom-[15%] right-[15%] text-teal-500/8 animate-float-slow">
          <PawPrint className="h-14 w-14 rotate-[-25deg]" />
        </div>
        <div className="absolute top-[50%] right-[5%] text-primary/5 animate-float-medium">
          <PawPrint className="h-20 w-20 rotate-[5deg]" />
        </div>
        <div className="absolute top-[70%] left-[15%] text-teal-500/5 animate-float-fast">
          <PawPrint className="h-8 w-8 rotate-[-10deg]" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        {/* Header with logo */}
        <header className="pt-6 pb-4 px-4 flex justify-center">
          <Logo href="/" />
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
