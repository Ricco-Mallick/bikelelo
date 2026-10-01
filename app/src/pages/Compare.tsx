import { Link } from 'react-router-dom'
import { GitCompareArrows, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { useCatalog } from '@/lib/catalog'
import { formatINR, formatNumber } from '@/lib/format'
import { syntheticListings, bestOffer, preferredOem } from '@/lib/pricing'
import { useStore } from '@/lib/store'

export default function Compare() {
  const { variantsBySlug, modelsBySlug, brandsBySlug, specKeysByKey, retailers, retailersBySlug } = useCatalog()
  const { compare, toggleCompare, clearCompare } = useStore()

  const variants = compare.map((slug) => variantsBySlug.get(slug)).filter((v): v is NonNullable<typeof v> => Boolean(v))

  if (variants.length < 2) {
    return (
      <div className="container py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">Compare bikes</h1>
        <EmptyState
          icon={<GitCompareArrows className="size-7" />}
          title="Add at least two bikes"
          description="Open any bike and tap Compare to line up to four side by side."
          action={
            <Button asChild>
              <Link to="/bikes">Browse bikes</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const rows = new Map<string, { label: string; unit: string; values: (number | string | null)[] }>()
  for (const v of variants) {
    for (const [key, raw] of Object.entries(v.specs)) {
      const meta = specKeysByKey.get(key)
      const row = rows.get(key) ?? { label: meta?.label ?? key, unit: meta?.unit ?? '', values: [] }
      row.values.push(raw as number | string | null)
      rows.set(key, row)
    }
  }
  const orderedKeys = [...rows.keys()].sort(
    (a, b) => (specKeysByKey.get(a)?.sort_order ?? 999) - (specKeysByKey.get(b)?.sort_order ?? 999),
  )

  const offersFor = (v: (typeof variants)[number]) => {
    const m = modelsBySlug.get(v.model_slug)
    return syntheticListings(v, retailers, m ? preferredOem(m.brand_slug) : undefined)
  }

  const bestPriceIndex = variants.reduce(
    (best, v, i) => {
      const p = bestOffer(offersFor(v))?.price_inr ?? Infinity
      return p < best.price ? { price: p, index: i } : best
    },
    { price: Infinity, index: -1 },
  )

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Compare</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearCompare}>
            Clear all
          </Button>
          <Button size="sm" asChild disabled={variants.length >= 4}>
            <Link to="/bikes">
              <Plus className="size-4" /> Add bike
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px] bg-card" />
              {variants.map((v) => {
                const model = modelsBySlug.get(v.model_slug)
                const brand = model ? brandsBySlug.get(model.brand_slug) : undefined
                return (
                  <TableHead key={v.slug} className="min-w-[200px] bg-card">
                    <div className="flex items-start justify-between gap-2 py-1">
                      <Link to={`/bikes/${model?.slug}`} className="group">
                        <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {brand?.name}
                        </span>
                        <span className="block text-sm font-semibold text-foreground group-hover:text-brand">
                          {model?.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">{v.name}</span>
                      </Link>
                      <button onClick={() => toggleCompare(v.slug)} aria-label="Remove">
                        <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Ex-showroom</TableCell>
              {variants.map((v, i) => (
                <TableCell key={v.slug}>
                  <span className="font-semibold tabular-nums">{formatINR(v.ex_showroom_inr)}</span>
                  {i === bestPriceIndex.index && (
                    <Badge className="ml-2 bg-emerald-500/15 text-emerald-400">Lowest</Badge>
                  )}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Best offer</TableCell>
              {variants.map((v) => {
                const offer = bestOffer(offersFor(v))
                return (
                  <TableCell key={v.slug} className="text-sm">
                    {offer ? (
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="text-brand hover:underline"
                      >
                        {retailersBySlug.get(offer.retailer_slug)?.name ?? offer.retailer_slug}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
            {orderedKeys.map((key) => {
              const row = rows.get(key)!
              const numeric = row.values.filter((v) => typeof v === 'number') as number[]
              const max = numeric.length ? Math.max(...numeric) : null
              const min = numeric.length ? Math.min(...numeric) : null
              const lowerIsBetter = /weight|price|time/.test(key)
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium text-muted-foreground">
                    {row.label}
                    {row.unit && <span className="ml-1 text-xs">({row.unit})</span>}
                  </TableCell>
                  {row.values.map((value, i) => {
                    const isBest =
                      typeof value === 'number' &&
                      (lowerIsBetter ? value === min : value === max) &&
                      min !== max
                    return (
                      <TableCell key={i} className={isBest ? 'font-semibold text-emerald-400' : ''}>
                        {typeof value === 'number' ? formatNumber(value, Number.isInteger(value) ? 0 : 1) : value ?? '—'}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
