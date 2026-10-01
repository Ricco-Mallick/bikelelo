import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2', className)} aria-label="BikeLelo home">
      <span className="relative grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <circle cx="5.5" cy="16.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18.5" cy="16.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M5.5 16.5 9 9h4l2.5 7.5M13 9h3l2 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">
        Bike<span className="text-brand">Lelo</span>
      </span>
    </Link>
  )
}
