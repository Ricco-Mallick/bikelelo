import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BikeCard } from '@/components/catalog/BikeCard'
import { ActiveFilterChips, DEFAULT_FILTERS, FilterRail, type BrowseFilters } from '@/components/catalog/FilterRail'
import { EmptyState } from '@/components/common/EmptyState'
import { useCatalog } from '@/lib/catalog'
import { useStore } from '@/lib/store'

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'cc-desc' | 'mileage-desc'

const POPULARITY = [
  'hero-splendor-plus',
  'honda-activa-6g',
  'honda-shine-125',
  'bajaj-pulsar-150',
  'tvs-jupiter',
  'royal-enfield-classic-350',
  'tvs-raider-125',
  'hero-hf-deluxe',
]

export default function Browse() {
  const { models, brands, brandsBySlug, variantsByModel } = useCatalog()
  const { garage, wishlist, compare, toggleGarage, toggleCompare } = useStore()
  const [params, setParams] = useSearchParams()
  const [sort, setSort] = useState<SortKey>('popular')

  const filters = useMemo<BrowseFilters>(() => {
    const num = (k: string, fallback: number) => {
      const v = Number(params.get(k))
      return Number.isFinite(v) && params.has(k) ? v : fallback
    }
    const list = (k: string) => (params.get(k) ? params.get(k)!.split(',').filter(Boolean) : [])
    return {
      ...DEFAULT_FILTERS,
      q: params.get('q') ?? '',
      brands: list('brand'),
      bodies: list('body'),
      fuels: list('fuel'),
      abs: list('abs'),
      priceMin: num('pmin', DEFAULT_FILTERS.priceMin),
      priceMax: num('pmax', DEFAULT_FILTERS.priceMax),
      ccMin: num('cmin', DEFAULT_FILTERS.ccMin),
      ccMax: num('cmax', DEFAULT_FILTERS.ccMax),
    }
  }, [params])

  function applyFilters(patch: Partial<BrowseFilters>) {
    const next = { ...filters, ...patch }
    const sp = new URLSearchParams()
    if (next.q) sp.set('q', next.q)
    if (next.brands.length) sp.set('brand', next.brands.join(','))
    if (next.bodies.length) sp.set('body', next.bodies.join(','))
    if (next.fuels.length) sp.set('fuel', next.fuels.join(','))
    if (next.abs.length) sp.set('abs', next.abs.join(','))
    if (next.priceMin !== DEFAULT_FILTERS.priceMin) sp.set('pmin', String(next.priceMin))
    if (next.priceMax !== DEFAULT_FILTERS.priceMax) sp.set('pmax', String(next.priceMax))
    if (next.ccMin !== DEFAULT_FILTERS.ccMin) sp.set('cmin', String(next.ccMin))
    if (next.ccMax !== DEFAULT_FILTERS.ccMax) sp.set('cmax', String(next.ccMax))
    setParams(sp, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const rows = models
      .map((model) => {
        const variants = variantsByModel.get(model.slug) ?? []
        const prices = variants.map((v) => v.ex_showroom_inr).filter((p): p is number => typeof p === 'number')
        const minPrice = prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY
        const ccs = variants.map((v) => Number(v.specs.engine_cc)).filter((n) => Number.isFinite(n))
        const mileages = variants.map((v) => Number(v.specs.mileage_kmpl)).filter((n) => Number.isFinite(n))
        const absSet = new Set(variants.map((v) => String(v.specs.abs ?? '')))
        return {
          model,
          variants,
          minPrice,
          maxCc: ccs.length ? Math.max(...ccs) : 0,
          maxMileage: mileages.length ? Math.max(...mileages) : 0,
          absSet,
        }
      })
      .filter(({ model, minPrice, maxCc, absSet }) => {
        if (q) {
          const brand = brandsBySlug.get(model.brand_slug)?.name ?? ''
          if (!`${brand} ${model.name} ${model.body_type} ${model.segment}`.toLowerCase().includes(q)) return false
        }
        if (filters.brands.length && !filters.brands.includes(model.brand_slug)) return false
        if (filters.bodies.length && !filters.bodies.includes(model.body_type)) return false
        if (filters.fuels.length && !filters.fuels.includes(model.fuel_type)) return false
        if (filters.abs.length && !filters.abs.some((a) => [...absSet].some((v) => v.toLowerCase().includes(a.toLowerCase()))))
          return false
        if (minPrice > filters.priceMax) return false
        if (Number.isFinite(minPrice) && minPrice < filters.priceMin && filters.priceMin !== DEFAULT_FILTERS.priceMin) {
          // allow models whose top variant reaches the band
        }
        if (maxCc < filters.ccMin || maxCc > filters.ccMax) return false
        return true
      })

    const rank = (slug: string) => {
      const i = POPULARITY.indexOf(slug)
      return i === -1 ? POPULARITY.length : i
    }
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.minPrice - b.minPrice
        case 'price-desc':
          return b.minPrice - a.minPrice
        case 'cc-desc':
          return b.maxCc - a.maxCc
        case 'mileage-desc':
          return b.maxMileage - a.maxMileage
        default:
          return rank(a.model.slug) - rank(b.model.slug) || a.model.name.localeCompare(b.model.name)
      }
    })
  }, [models, variantsByModel, brandsBySlug, filters, sort])

  const saved = new Set([...garage, ...wishlist])
  const activeCount =
    filters.brands.length + filters.bodies.length + filters.fuels.length + filters.abs.length

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Bikes &amp; scooters</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} of {models.length} models · ex-showroom prices include GST
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterRail filters={filters} brands={brands} onChange={applyFilters} onReset={() => setParams({}, { replace: true })} />
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="size-4" />
                  Filters{activeCount > 0 && ` (${activeCount})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto p-5">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterRail
                  filters={filters}
                  brands={brands}
                  onChange={applyFilters}
                  onReset={() => setParams({}, { replace: true })}
                />
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Sort</span>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="cc-desc">Engine: largest</SelectItem>
                  <SelectItem value="mileage-desc">Mileage: highest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-5">
            <ActiveFilterChips filters={filters} onChange={applyFilters} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No bikes match these filters"
              description="Try widening your price or engine range, or reset the filters."
              action={
                <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(({ model, variants }) => (
                <BikeCard
                  key={model.slug}
                  model={model}
                  brand={brandsBySlug.get(model.brand_slug)}
                  variants={variants}
                  saved={variants.some((v) => saved.has(v.slug))}
                  comparing={variants.some((v) => compare.includes(v.slug))}
                  onToggleSave={() => variants[0] && toggleGarage(variants[0].slug)}
                  onToggleCompare={() => variants[0] && toggleCompare(variants[0].slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
