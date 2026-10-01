import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Stylised side-profile line art standing in for product photography. The
 * catalogue ships no images (retailer photos are not ours to redistribute), so
 * each body type gets a distinct, recognisable silhouette drawn from the app's
 * own palette instead of an empty grey box.
 */
export function BikeArt({
  body,
  fuel,
  className,
}: {
  body: string
  fuel?: string
  className?: string
}) {
  const shape = SHAPES[body] ?? SHAPES.commuter

  return (
    <svg
      viewBox="0 0 240 140"
      className={cn('size-full', className)}
      role="img"
      aria-label={`${body.replace('-', ' ')} illustration`}
    >
      <defs>
        <radialGradient id="bikeglow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.16" />
          <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="240" height="140" fill="url(#bikeglow)" />

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/55"
      >
        <Wheel cx={shape.wheelRear.cx} cy={shape.wheelRear.cy} r={shape.wheelRear.r} />
        <Wheel cx={shape.wheelFront.cx} cy={shape.wheelFront.cy} r={shape.wheelFront.r} />
        {shape.frame}
      </g>

      <g fill="hsl(var(--brand))" fillOpacity="0.85" stroke="none">
        {shape.bodywork}
      </g>

      {fuel === 'electric' && (
        <path d="M120 40 L110 62 h9 l-4 18 14 -22 h-9 l5 -18 Z" fill="hsl(var(--brand))" stroke="none" />
      )}
    </svg>
  )
}

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill="currentColor" stroke="none" opacity="0.5" />
      <path d={`M${cx - r * 0.7} ${cy} h${r * 1.4} M${cx} ${cy - r * 0.7} v${r * 1.4}`} opacity="0.4" />
    </>
  )
}

interface Shape {
  wheelRear: { cx: number; cy: number; r: number }
  wheelFront: { cx: number; cy: number; r: number }
  frame: ReactNode
  bodywork: ReactNode
}

const SHAPES: Record<string, Shape> = {
  commuter: {
    wheelRear: { cx: 54, cy: 102, r: 24 },
    wheelFront: { cx: 186, cy: 102, r: 24 },
    frame: (
      <>
        <path d="M54 102 L92 74 H148 L186 102" />
        <path d="M148 74 L156 58" />
        <path d="M146 56 L170 50" />
        <path d="M92 74 L54 88" />
      </>
    ),
    bodywork: (
      <>
        <path d="M124 66 h44 v9 h-44 z" opacity="0.9" />
        <path d="M92 70 h34 a4 4 0 0 1 0 10 h-34 a4 4 0 0 1 0 -10 z" />
      </>
    ),
  },
  scooter: {
    wheelRear: { cx: 60, cy: 104, r: 21 },
    wheelFront: { cx: 182, cy: 104, r: 21 },
    frame: (
      <>
        <path d="M60 104 H100 V92 H150 L168 62" />
        <path d="M168 62 H184" />
      </>
    ),
    bodywork: (
      <>
        <path d="M146 92 L162 60 h20 L172 92 z" opacity="0.9" />
        <path d="M96 88 h50 v8 H96 z" opacity="0.9" />
        <path d="M74 74 h40 a6 6 0 0 1 0 12 H74 a6 6 0 0 1 0 -12 z" />
      </>
    ),
  },
  sport: {
    wheelRear: { cx: 52, cy: 102, r: 25 },
    wheelFront: { cx: 188, cy: 102, r: 25 },
    frame: (
      <>
        <path d="M52 102 L96 78 L150 76 L188 102" />
        <path d="M150 76 L162 60" />
        <path d="M156 58 L176 54" />
      </>
    ),
    bodywork: (
      <>
        <path d="M126 70 L178 56 L184 76 L146 88 z" opacity="0.9" />
        <path d="M84 72 q18 -12 36 0 l-4 10 H88 z" />
      </>
    ),
  },
  cruiser: {
    wheelRear: { cx: 50, cy: 104, r: 26 },
    wheelFront: { cx: 192, cy: 104, r: 26 },
    frame: (
      <>
        <path d="M50 104 L94 86 H164 L192 104" />
        <path d="M164 86 L172 58" />
        <path d="M158 56 L184 50" />
        <path d="M126 96 L138 104" />
      </>
    ),
    bodywork: (
      <>
        <path d="M128 78 h48 v10 h-48 z" opacity="0.9" />
        <path d="M92 80 h36 a5 5 0 0 1 0 12 H92 a5 5 0 0 1 0 -12 z" />
      </>
    ),
  },
  adventure: {
    wheelRear: { cx: 54, cy: 100, r: 27 },
    wheelFront: { cx: 188, cy: 100, r: 27 },
    frame: (
      <>
        <path d="M54 100 L96 66 H150 L188 100" />
        <path d="M150 66 L160 46" />
        <path d="M150 44 L176 42" />
        <path d="M170 46 L178 56" />
      </>
    ),
    bodywork: (
      <>
        <path d="M168 78 L196 70 L196 78 L170 86 z" opacity="0.9" />
        <path d="M156 40 L170 30 h8 L170 46 z" opacity="0.9" />
        <path d="M118 60 h40 v12 h-40 z" />
      </>
    ),
  },
  'cafe-racer': {
    wheelRear: { cx: 54, cy: 102, r: 24 },
    wheelFront: { cx: 186, cy: 102, r: 24 },
    frame: (
      <>
        <path d="M54 102 L94 78 H148 L186 102" />
        <path d="M148 78 L158 58" />
        <path d="M152 56 L174 56" />
      </>
    ),
    bodywork: (
      <>
        <path d="M86 76 q20 -16 40 -4 l-2 10 H88 z" />
        <ellipse cx="146" cy="70" rx="18" ry="11" opacity="0.9" />
      </>
    ),
  },
}
