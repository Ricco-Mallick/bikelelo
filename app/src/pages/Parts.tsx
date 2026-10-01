import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ShieldCheck, ShieldQuestion, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/common/EmptyState'
import { useCatalog } from '@/lib/catalog'
import { syntheticPartPrice } from '@/lib/pricing'
import { formatINR } from '@/lib/format'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Parts() {
  const { parts, fitmentsByPart, modelsBySlug, brandsBySlug } = useCatalog()
  const [params] = useSearchParams()
  const [category, setCategory] = useState<string>('all')
  const [query, setQuery] = useState('')
  const { builds, addBuildItem } = useStore()

  const modelFilter = params.get('model')
  const filteredModel = modelFilter ? modelsBySlug.get(modelFilter) : undefined

  const categories = useMemo(() => ['all', ...new Set(parts.map((p) => p.category))], [parts])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return parts
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => !q || `${p.name} ${p.brand_name} ${p.category}`.toLowerCase().includes(q))
      .map((part) => {
        const fitment = filteredModel
          ? (fitmentsByPart.get(part.slug) ?? []).find((f) => f.model_slug === filteredModel.slug)
          : undefined
        return { part, fitment, price: syntheticPartPrice(part) }
      })
      .filter((row) => !filteredModel || row.fitment)
      .sort((a, b) => a.price - b.price)
  }, [parts, category, query, filteredModel, fitmentsByPart])

  const latestBuild = builds[0]

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Parts &amp; accessories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filteredModel
            ? `Showing parts that fit the ${brandsBySlug.get(filteredModel.brand_slug)?.name ?? ''} ${filteredModel.name}`
            : `${parts.length} parts across exhausts, tyres, seats, lighting and more`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                category === c
                  ? 'border-brand bg-brand/15 text-foreground'
                  : 'text-muted-foreground hover:border-ring/40 hover:text-foreground',
              )}
            >
              {c.replace('-', ' ')}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parts…"
          className="sm:ml-auto sm:w-56"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Wrench className="size-6" />}
          title="No parts match"
          description="Try another category or clear the search."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map(({ part, fitment, price }) => (
            <article key={part.slug} className="flex flex-col rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Badge variant="secondary" className="capitalize">
                  {part.category.replace('-', ' ')}
                </Badge>
                {fitment ? (
                  fitment.fit === 'exact' ? (
                    <Badge className="gap-1 bg-emerald-500/15 text-emerald-400">
                      <ShieldCheck className="size-3" /> Fits
                    </Badge>
                  ) : fitment.fit === 'universal' ? (
                    <Badge variant="outline">Universal</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-400">
                      Needs mod
                    </Badge>
                  )
                ) : (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <ShieldQuestion className="size-3" /> Check fit
                  </Badge>
                )}
              </div>
              <h3 className="text-sm font-semibold">{part.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{part.brand_name}</p>
              <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{part.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-base font-semibold tabular-nums">{formatINR(price)}</span>
                {latestBuild ? (
                  <Button size="sm" variant="outline" onClick={() => addBuildItem(latestBuild.slug, part.slug)}>
                    <Check className="size-3.5" /> Add
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/build">Start build</Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
