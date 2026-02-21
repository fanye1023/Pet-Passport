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
      {/* Custom Pet ShareLink Logo */}
      <div className={cn('relative transition-transform group-hover:scale-105', sizes[size].icon)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Rounded square background */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="10"
            className="fill-primary"
          />
          {/* Share/link icon circle left */}
          <circle
            cx="16"
            cy="24"
            r="6"
            className="fill-white dark:fill-gray-100"
          />
          {/* Share/link icon circle right */}
          <circle
            cx="32"
            cy="24"
            r="6"
            className="fill-white dark:fill-gray-100"
          />
          {/* Connecting line */}
          <rect
            x="16"
            y="22"
            width="16"
            height="4"
            className="fill-white dark:fill-gray-100"
          />
          {/* Paw print on left circle */}
          <g className="fill-primary">
            {/* Main pad */}
            <ellipse cx="16" cy="26" rx="2.5" ry="2" />
            {/* Toe pads */}
            <circle cx="13" cy="22" r="1.2" />
            <circle cx="16" cy="21" r="1.2" />
            <circle cx="19" cy="22" r="1.2" />
          </g>
          {/* Heart on right circle */}
          <path
            d="M32 22.5c-.8-1.5-2.5-2-3.5-1s-.5 2.5.5 3.5l3 3 3-3c1-1 1.5-2.5.5-3.5s-2.7-.5-3.5 1z"
            className="fill-primary"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            'font-bold tracking-tight',
            sizes[size].text,
            'bg-gradient-to-r from-primary via-teal-500 to-primary bg-clip-text text-transparent'
          )}>
            Pet ShareLink
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
      {/* Rounded square background */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        className="fill-primary"
      />
      {/* Share/link icon circle left */}
      <circle
        cx="16"
        cy="24"
        r="6"
        className="fill-white"
      />
      {/* Share/link icon circle right */}
      <circle
        cx="32"
        cy="24"
        r="6"
        className="fill-white"
      />
      {/* Connecting line */}
      <rect
        x="16"
        y="22"
        width="16"
        height="4"
        className="fill-white"
      />
      {/* Paw print on left circle */}
      <g className="fill-primary">
        {/* Main pad */}
        <ellipse cx="16" cy="26" rx="2.5" ry="2" />
        {/* Toe pads */}
        <circle cx="13" cy="22" r="1.2" />
        <circle cx="16" cy="21" r="1.2" />
        <circle cx="19" cy="22" r="1.2" />
      </g>
      {/* Heart on right circle */}
      <path
        d="M32 22.5c-.8-1.5-2.5-2-3.5-1s-.5 2.5.5 3.5l3 3 3-3c1-1 1.5-2.5.5-3.5s-2.7-.5-3.5 1z"
        className="fill-primary"
      />
    </svg>
  )
}
