import type { ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINRCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Brand } from '@/lib/types'

export interface BrowseFilters {
  q: string
  brands: string[]
  bodies: string[]
  fuels: string[]
  abs: string[]
  priceMin: number
  priceMax: number
  ccMin: number
  ccMax: number
}

export const PRICE_BOUNDS = [30000, 800000] as const
export const CC_BOUNDS = [0, 700] as const

export const DEFAULT_FILTERS: BrowseFilters = {
  q: '',
  brands: [],
  bodies: [],
  fuels: [],
  abs: [],
  priceMin: PRICE_BOUNDS[0],
  priceMax: PRICE_BOUNDS[1],
  ccMin: CC_BOUNDS[0],
  ccMax: CC_BOUNDS[1],
}

export const BODY_TYPES = ['commuter', 'scooter', 'sport', 'cruiser', 'adventure', 'cafe-racer'] as const

interface FilterRailProps {
  filters: BrowseFilters
  brands: Brand[]
  onChange: (patch: Partial<BrowseFilters>) => void
  onReset: () => void
  className?: string
}

export function FilterRail({ filters, brands, onChange, onReset, className }: FilterRailProps) {
  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <FilterGroup title="Brand">
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.brands.includes(b.slug)}
                onCheckedChange={() => onChange({ brands: toggleIn(filters.brands, b.slug) })}
              />
              <span className="text-foreground/90">{b.name}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price (ex-showroom)">
        <Slider
          min={PRICE_BOUNDS[0]}
          max={PRICE_BOUNDS[1]}
          step={5000}
          value={[filters.priceMin, filters.priceMax]}
          onValueChange={([min, max]) => onChange({ priceMin: min, priceMax: max })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatINRCompact(filters.priceMin)}</span>
          <span>{formatINRCompact(filters.priceMax)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Engine">
        <Slider
          min={CC_BOUNDS[0]}
          max={CC_BOUNDS[1]}
          step={10}
          value={[filters.ccMin, filters.ccMax]}
          onValueChange={([min, max]) => onChange({ ccMin: min, ccMax: max })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{filters.ccMin} cc</span>
          <span>{filters.ccMax} cc</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Body type">
        <div className="flex flex-wrap gap-2">
          {BODY_TYPES.map((body) => (
            <button
              key={body}
              onClick={() => onChange({ bodies: toggleIn(filters.bodies, body) })}
              className={cn(
                'rounded-full border border-border px-3 py-1 text-xs font-medium capitalize transition-colors',
                filters.bodies.includes(body)
                  ? 'border-brand bg-brand/15 text-foreground'
                  : 'text-muted-foreground hover:border-ring/40 hover:text-foreground',
              )}
            >
              {body.replace('-', ' ')}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Fuel">
        <div className="flex gap-2">
          {(['petrol', 'electric'] as const).map((fuel) => (
            <button
              key={fuel}
              onClick={() => onChange({ fuels: toggleIn(filters.fuels, fuel) })}
              className={cn(
                'rounded-full border border-border px-3 py-1 text-xs font-medium capitalize transition-colors',
                filters.fuels.includes(fuel)
                  ? 'border-brand bg-brand/15 text-foreground'
                  : 'text-muted-foreground hover:border-ring/40 hover:text-foreground',
              )}
            >
              {fuel}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Braking">
        <div className="flex flex-wrap gap-2">
          {['ABS', 'CBS'].map((item) => (
            <button
              key={item}
              onClick={() => onChange({ abs: toggleIn(filters.abs, item) })}
              className={cn(
                'rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors',
                filters.abs.includes(item)
                  ? 'border-brand bg-brand/15 text-foreground'
                  : 'text-muted-foreground hover:border-ring/40 hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

export function ActiveFilterChips({ filters, onChange }: { filters: BrowseFilters; onChange: (p: Partial<BrowseFilters>) => void }) {
  const chips: { key: string; label: string; clear: () => void }[] = []
  filters.brands.forEach((b) => chips.push({ key: `b-${b}`, label: b, clear: () => onChange({ brands: filters.brands.filter((x) => x !== b) }) }))
  filters.bodies.forEach((b) => chips.push({ key: `t-${b}`, label: b, clear: () => onChange({ bodies: filters.bodies.filter((x) => x !== b) }) }))
  filters.fuels.forEach((f) => chips.push({ key: `f-${f}`, label: f, clear: () => onChange({ fuels: filters.fuels.filter((x) => x !== f) }) }))
  filters.abs.forEach((a) => chips.push({ key: `a-${a}`, label: a, clear: () => onChange({ abs: filters.abs.filter((x) => x !== a) }) }))
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.key} onClick={c.clear}>
          <Badge variant="secondary" className="gap-1 capitalize">
            {c.label}
            <span aria-hidden className="text-muted-foreground">
              ×
            </span>
          </Badge>
        </button>
      ))}
    </div>
  )
}
