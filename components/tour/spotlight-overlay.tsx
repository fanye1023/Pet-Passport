"use client"

interface SpotlightOverlayProps {
  targetRect: DOMRect | null
  padding?: number
  onClickOutside?: () => void
  /** If true, clicks in spotlight area pass through to the target element */
  allowClickThrough?: boolean
}

export function SpotlightOverlay({
  targetRect,
  padding = 8,
  onClickOutside,
  allowClickThrough = false,
}: SpotlightOverlayProps) {
  if (!targetRect) return null

  // Use viewport coordinates directly since overlay is position:fixed
  const spotlightX = targetRect.left - padding
  const spotlightY = targetRect.top - padding
  const spotlightWidth = targetRect.width + padding * 2
  const spotlightHeight = targetRect.height + padding * 2
  const borderRadius = 8

  // Pulse animation ring dimensions (slightly larger than spotlight)
  const pulseOffset = 4
  const pulseX = spotlightX - pulseOffset
  const pulseY = spotlightY - pulseOffset
  const pulseWidth = spotlightWidth + pulseOffset * 2
  const pulseHeight = spotlightHeight + pulseOffset * 2

  // When allowClickThrough is true, we use 4 separate overlay regions around the spotlight
  // instead of a single overlay with mask, so clicks can pass through to the target
  if (allowClickThrough) {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

    return (
      <>
        <style jsx global>{`
          @keyframes spotlight-pulse {
            0%, 100% {
              opacity: 0.8;
              stroke-width: 2;
            }
            50% {
              opacity: 0.3;
              stroke-width: 4;
            }
          }
          .spotlight-pulse-ring {
            animation: spotlight-pulse 2s ease-in-out infinite;
          }
        `}</style>
        {/* Top region */}
        <div
          className="fixed z-[9998] bg-black/75 pointer-events-auto"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: spotlightY,
          }}
          onClick={onClickOutside}
        />
        {/* Bottom region */}
        <div
          className="fixed z-[9998] bg-black/75 pointer-events-auto"
          style={{
            top: spotlightY + spotlightHeight,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={onClickOutside}
        />
        {/* Left region */}
        <div
          className="fixed z-[9998] bg-black/75 pointer-events-auto"
          style={{
            top: spotlightY,
            left: 0,
            width: spotlightX,
            height: spotlightHeight,
          }}
          onClick={onClickOutside}
        />
        {/* Right region */}
        <div
          className="fixed z-[9998] bg-black/75 pointer-events-auto"
          style={{
            top: spotlightY,
            left: spotlightX + spotlightWidth,
            right: 0,
            height: spotlightHeight,
          }}
          onClick={onClickOutside}
        />
        {/* Pulse ring (pointer-events-none so clicks pass through) */}
        <svg
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{ width: "100vw", height: "100vh" }}
        >
          <rect
            x={pulseX}
            y={pulseY}
            width={pulseWidth}
            height={pulseHeight}
            rx={borderRadius + 2}
            ry={borderRadius + 2}
            fill="none"
            stroke="hsl(var(--primary))"
            className="spotlight-pulse-ring transition-all duration-300 ease-in-out"
          />
        </svg>
      </>
    )
  }

  // Non-interactive: use single SVG with mask (original approach)
  const handleClick = (e: React.MouseEvent) => {
    // Check if click is outside the spotlight area
    const clickX = e.clientX
    const clickY = e.clientY
    const inSpotlight =
      clickX >= targetRect.left - padding &&
      clickX <= targetRect.right + padding &&
      clickY >= targetRect.top - padding &&
      clickY <= targetRect.bottom + padding

    if (!inSpotlight && onClickOutside) {
      onClickOutside()
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes spotlight-pulse {
          0%, 100% {
            opacity: 0.8;
            stroke-width: 2;
          }
          50% {
            opacity: 0.3;
            stroke-width: 4;
          }
        }
        .spotlight-pulse-ring {
          animation: spotlight-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <svg
        className="fixed inset-0 z-[9998] pointer-events-auto cursor-pointer"
        style={{ width: "100vw", height: "100vh" }}
        onClick={handleClick}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlightX}
              y={spotlightY}
              width={spotlightWidth}
              height={spotlightHeight}
              rx={borderRadius}
              ry={borderRadius}
              fill="black"
              className="transition-all duration-300 ease-in-out"
            />
          </mask>
        </defs>
        {/* Dark overlay with spotlight cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
        {/* Pulse animation ring */}
        <rect
          x={pulseX}
          y={pulseY}
          width={pulseWidth}
          height={pulseHeight}
          rx={borderRadius + 2}
          ry={borderRadius + 2}
          fill="none"
          stroke="hsl(var(--primary))"
          className="spotlight-pulse-ring transition-all duration-300 ease-in-out"
        />
      </svg>
    </>
  )
}
