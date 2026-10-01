import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCatalog } from '@/lib/catalog'
import { useStore } from '@/lib/store'

export function CompareTray() {
  const { compare, toggleCompare, clearCompare } = useStore()
  const { variantsBySlug, modelsBySlug, brandsBySlug } = useCatalog()

  if (compare.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-xl border border-border bg-card/95 p-2 pl-3 shadow-2xl backdrop-blur-xl">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Compare {compare.length}/4
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {compare.map((slug) => {
            const variant = variantsBySlug.get(slug)
            const model = variant ? modelsBySlug.get(variant.model_slug) : undefined
            const label = model ? `${brandsBySlug.get(model.brand_slug)?.name ?? ''} ${model.name}`.trim() : slug
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium"
              >
                {label}
                <button onClick={() => toggleCompare(slug)} aria-label={`Remove ${label}`}>
                  <X className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            )
          })}
        </div>
        <Button variant="ghost" size="sm" onClick={clearCompare}>
          Clear
        </Button>
        <Button size="sm" asChild disabled={compare.length < 2}>
          <Link to="/compare">Compare now</Link>
        </Button>
      </div>
    </div>
  )
}
