import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCatalog, modelPriceRange } from '@/lib/catalog'
import { formatINRCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { models, brandsBySlug, variantsByModel } = useCatalog()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return models.slice(0, 6)
    return models
      .filter((m) => {
        const brand = brandsBySlug.get(m.brand_slug)?.name ?? ''
        return `${brand} ${m.name} ${m.body_type} ${m.segment}`.toLowerCase().includes(q)
      })
      .slice(0, 8)
  }, [query, models, brandsBySlug])

  function go(slug: string) {
    onOpenChange(false)
    navigate(`/bikes/${slug}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Search bikes</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Splendor, Activa, Classic 350…"
            className="h-14 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No bikes match “{query}”.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((m) => {
                const range = modelPriceRange(variantsByModel.get(m.slug) ?? [])
                return (
                  <li key={m.slug}>
                    <button
                      onClick={() => go(m.slug)}
                      className={cn(
                        'flex w-full items-center justify-between gap-4 rounded-md px-3 py-2.5 text-left',
                        'transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {brandsBySlug.get(m.brand_slug)?.name} {m.name}
                        </span>
                        <span className="block truncate text-xs capitalize text-muted-foreground">
                          {m.body_type.replace('-', ' ')} · {m.segment}
                        </span>
                      </span>
                      {range && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                          {formatINRCompact(range[0])}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
