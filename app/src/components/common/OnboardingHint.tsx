import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const KEY = 'bikelelo.hintdismissed.v1'

/** One-time, dismissible orientation card for first-time visitors. */
export function OnboardingHint() {
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1',
  )

  if (dismissed) return null

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* private mode — hide for this session only */
    }
    setDismissed(true)
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-brand/40 bg-brand/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <Compass className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed">
          <span className="font-medium">New here?</span> Browse bikes, compare up to four side by side, then open the
          configurator to add parts that are checked against your exact model.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link to="/guide" onClick={dismiss}>
            Read the guide
          </Link>
        </Button>
        <Button size="icon" variant="ghost" aria-label="Dismiss" onClick={dismiss}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
