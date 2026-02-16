'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  left: number
  color: string
  delay: number
  size: number
  rotation: number
}

interface ConfettiProps {
  trigger: boolean
  intensity?: 'low' | 'medium' | 'high'
  onComplete?: () => void
}

const COLORS = [
  '#4ECDC4', // Teal (primary)
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#95E1D3', // Mint
  '#F38181', // Pink
  '#AA96DA', // Lavender
]

export function Confetti({ trigger, intensity = 'medium', onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  const pieceCount = intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 100
  const duration = intensity === 'high' ? 4000 : 2500

  useEffect(() => {
    if (trigger) {
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        size: intensity === 'high' ? 10 + Math.random() * 10 : 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      }))
      setPieces(newPieces)

      const timer = setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [trigger, pieceCount, duration, intensity, onComplete])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute confetti-piece"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
