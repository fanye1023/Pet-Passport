'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
  href?: string
}

export function Logo({ className, size = 'default', showText = true, href = '/' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    default: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  }

  const logoContent = (
    <div className={cn('flex items-center gap-2 group', className)}>
      {/* Custom Pet Passport Logo */}
      <div className={cn('relative transition-transform group-hover:scale-105', sizes[size].icon)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Passport book shape */}
          <rect
            x="6"
            y="4"
            width="36"
            height="40"
            rx="4"
            className="fill-primary"
          />
          {/* Passport spine detail */}
          <rect
            x="6"
            y="4"
            width="4"
            height="40"
            rx="2"
            className="fill-primary/80"
          />
          {/* Inner page effect */}
          <rect
            x="12"
            y="8"
            width="26"
            height="32"
            rx="2"
            className="fill-white dark:fill-gray-100"
          />
          {/* Paw print */}
          <g className="fill-primary">
            {/* Main pad */}
            <ellipse cx="25" cy="28" rx="6" ry="5" />
            {/* Toe pads */}
            <circle cx="18" cy="20" r="3" />
            <circle cx="25" cy="17" r="3" />
            <circle cx="32" cy="20" r="3" />
          </g>
          {/* Decorative lines (like passport text) */}
          <rect x="15" y="36" width="12" height="1.5" rx="0.75" className="fill-primary/30" />
          <rect x="15" y="39" width="8" height="1.5" rx="0.75" className="fill-primary/30" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            'font-bold tracking-tight',
            sizes[size].text,
            'bg-gradient-to-r from-primary via-teal-500 to-primary bg-clip-text text-transparent'
          )}>
            Pet Passport
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

// Simplified icon-only version for favicons, app icons, etc.
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-8 h-8', className)}
    >
      {/* Passport book shape */}
      <rect
        x="6"
        y="4"
        width="36"
        height="40"
        rx="4"
        className="fill-primary"
      />
      {/* Passport spine detail */}
      <rect
        x="6"
        y="4"
        width="4"
        height="40"
        rx="2"
        className="fill-primary/80"
      />
      {/* Inner page effect */}
      <rect
        x="12"
        y="8"
        width="26"
        height="32"
        rx="2"
        className="fill-white"
      />
      {/* Paw print */}
      <g className="fill-primary">
        {/* Main pad */}
        <ellipse cx="25" cy="28" rx="6" ry="5" />
        {/* Toe pads */}
        <circle cx="18" cy="20" r="3" />
        <circle cx="25" cy="17" r="3" />
        <circle cx="32" cy="20" r="3" />
      </g>
      {/* Decorative lines */}
      <rect x="15" y="36" width="12" height="1.5" rx="0.75" className="fill-primary/30" />
      <rect x="15" y="39" width="8" height="1.5" rx="0.75" className="fill-primary/30" />
    </svg>
  )
}
