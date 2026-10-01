import { HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GLOSSARY } from '@/lib/glossary'
import { cn } from '@/lib/utils'

/**
 * Inline "what does this mean?" affordance. Looks a key up in the glossary so
 * explanations stay in one place instead of being sprinkled through the UI.
 */
export function InfoTip({ termKey, className }: { termKey: string; className?: string }) {
  const entry = GLOSSARY[termKey]
  if (!entry) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`What does ${entry.term} mean?`}
          className={cn(
            'inline-flex shrink-0 items-center text-muted-foreground transition-colors hover:text-brand',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            className,
          )}
        >
          <HelpCircle className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 text-sm">
        <p className="font-medium">{entry.term}</p>
        <p className="mt-1.5 text-muted-foreground">{entry.short}</p>
        {entry.detail && <p className="mt-2 text-xs leading-relaxed text-muted-foreground/90">{entry.detail}</p>}
      </PopoverContent>
    </Popover>
  )
}
