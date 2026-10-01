import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BikeArt } from '@/components/catalog/BikeArt'
import { useCatalog, modelPriceRange } from '@/lib/catalog'
import { formatINRCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BikeModel, Variant } from '@/lib/types'

type Use = 'city' | 'family' | 'highway' | 'fun' | 'rough'

const USES: { id: Use; label: string; hint: string }[] = [
  { id: 'city', label: 'Daily city commute', hint: 'Traffic, short trips, low running cost' },
  { id: 'family', label: 'Family errands', hint: 'Scooter convenience, easy to park' },
  { id: 'highway', label: 'Highway touring', hint: 'Stability and comfort over distance' },
  { id: 'fun', label: 'Weekend fun', hint: 'Performance and sharper handling' },
  { id: 'rough', label: 'Rough roads and trails', hint: 'Clearance and suspension travel' },
]

const PRIORITIES = [
  { id: 'mileage', label: 'Low running cost' },
  { id: 'safety', label: 'Best safety (ABS)' },
  { id: 'light', label: 'Easy to handle' },
  { id: 'power', label: 'More performance' },
  { id: 'electric', label: 'Electric' },
] as const

type Priority = (typeof PRIORITIES)[number]['id']

const BUDGET_BANDS = [
  { label: 'Under ₹1 lakh', max: 100000 },
  { label: '₹1 to 1.5 lakh', max: 150000 },
  { label: '₹1.5 to 2.5 lakh', max: 250000 },
  { label: '₹2.5 lakh and above', max: Number.POSITIVE_INFINITY },
]

const STEPS = ['Your riding', 'Your budget', 'Your priorities']

interface Scored {
  model: BikeModel
  variants: Variant[]
  minPrice: number
  score: number
  reasons: string[]
}

export default function FindBike() {
  const { models, variantsByModel, brandsBySlug } = useCatalog()
  const [step, setStep] = useState(0)
  const [use, setUse] = useState<Use | null>(null)
  const [budgetIdx, setBudgetIdx] = useState<number | null>(null)
  const [priorities, setPriorities] = useState<Priority[]>([])

  const results = useMemo<Scored[]>(() => {
    if (use === null || budgetIdx === null) return []
    const budget = BUDGET_BANDS[budgetIdx].max

    return models
      .map((model) => {
        const variants = variantsByModel.get(model.slug) ?? []
        const range = modelPriceRange(variants)
        if (!range || range[0] > budget) return null
        const hero = variants[0]
        const cc = Number(hero?.specs.engine_cc ?? 0)
        const mileage = Number(hero?.specs.mileage_kmpl ?? 0)
        const weight = Number(hero?.specs.kerb_weight_kg ?? 0)
        const power = Number(hero?.specs.power_ps ?? 0)
        const abs = String(hero?.specs.abs ?? '')
        const electric = model.fuel_type === 'electric'

        let score = 0
        const reasons: string[] = []
        const body = model.body_type

        if (use === 'city' && (body === 'commuter' || body === 'scooter')) score += 3
        if (use === 'family' && body === 'scooter') score += 4
        if (use === 'highway' && (body === 'cruiser' || cc >= 200)) score += 3
        if (use === 'fun' && (body === 'sport' || body === 'cafe-racer')) score += 4
        if (use === 'rough' && body === 'adventure') score += 5
        if (range[0] <= budget * 0.75) score += 1

        for (const p of priorities) {
          if (p === 'mileage' && (mileage >= 55 || electric)) {
            score += 3
            reasons.push(electric ? 'Electric, so very low running cost' : `Claimed ${mileage} kmpl`)
          }
          if (p === 'safety' && /abs/i.test(abs) && !/cbs/i.test(abs)) {
            score += 3
            reasons.push('ABS braking')
          }
          if (p === 'light' && weight > 0 && weight <= 125) {
            score += 3
            reasons.push(`Light at ${weight} kg`)
          }
          if (p === 'power' && power >= 18) {
            score += 2
            reasons.push(`${power} PS on tap`)
          }
          if (p === 'electric' && electric) {
            score += 5
            reasons.push('Fully electric')
          }
          if (p === 'electric' && !electric) score -= 4
        }

        if (use === 'city' && mileage >= 55 && !electric && !priorities.includes('mileage')) {
          reasons.push(`Claimed ${mileage} kmpl`)
        }
        if (use === 'family') reasons.push('Step-through scooter')

        return { model, variants, minPrice: range[0], score, reasons: [...new Set(reasons)].slice(0, 3) }
      })
      .filter((r): r is Scored => r !== null && r.score > 0)
      .sort((a, b) => b.score - a.score || a.minPrice - b.minPrice)
      .slice(0, 6)
  }, [models, variantsByModel, use, budgetIdx, priorities])

  return (
    <div className="container py-10">
      <header className="max-w-2xl">
        <Badge variant="secondary" className="mb-4 gap-1">
          <Sparkles className="size-3" /> Recommender
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Find my bike</h1>
        <p className="mt-2 text-muted-foreground">
          Three quick questions and BikeLelo ranks the catalogue for you. Nothing is saved until you choose to.
        </p>
      </header>

      <ol className="mt-8 flex flex-wrap items-center gap-3 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-6 place-items-center rounded-full border text-xs font-medium',
                i < step
                  ? 'border-brand bg-brand text-brand-foreground'
                  : i === step
                    ? 'border-brand text-brand'
                    : 'border-border text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className={i === step ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 hidden h-px w-8 bg-border sm:block" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="space-y-6">
          {step === 0 && (
            <OptionGrid
              options={USES.map((u) => ({ id: u.id, label: u.label, hint: u.hint }))}
              selected={use}
              onSelect={(id) => setUse(id as Use)}
            />
          )}
          {step === 1 && (
            <OptionGrid
              options={BUDGET_BANDS.map((b, i) => ({ id: String(i), label: b.label }))}
              selected={budgetIdx === null ? null : String(budgetIdx)}
              onSelect={(id) => setBudgetIdx(Number(id))}
            />
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Pick as many as you like, or skip.</p>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => {
                  const on = priorities.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPriorities((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm transition-colors',
                        on ? 'border-brand bg-brand/15' : 'border-border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button
              disabled={(step === 0 && !use) || (step === 1 && budgetIdx === null)}
              onClick={() => setStep((s) => Math.min(2, s + 1))}
            >
              {step === 2 ? 'Show results' : 'Next'} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div>
          {results.length === 0 ? (
            <div className="grid h-full min-h-[240px] place-items-center rounded-xl border border-dashed border-border p-8 text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                Answer the questions and your matches will appear here, ranked by how well they fit.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {results.map(({ model, variants, minPrice, reasons }, i) => (
                <li
                  key={model.slug}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/40"
                >
                  <div className="hidden size-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:block">
                    {model.image_url ? (
                      <img
                        src={model.image_url}
                        alt={`${brandsBySlug.get(model.brand_slug)?.name ?? ''} ${model.name}`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <BikeArt body={model.body_type} fuel={model.fuel_type} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {brandsBySlug.get(model.brand_slug)?.name}
                        </p>
                        <h3 className="truncate font-semibold">{model.name}</h3>
                      </div>
                      {i === 0 && <Badge className="shrink-0 bg-brand text-brand-foreground">Best match</Badge>}
                    </div>
                    <p className="mt-1 text-sm font-medium">{formatINRCompact(minPrice)} onwards</p>
                    {reasons.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {reasons.map((r) => (
                          <li key={r}>
                            <Badge variant="secondary" className="font-normal">
                              {r}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/bikes/${model.slug}`}>
                          View {variants.length} variant{variants.length === 1 ? '' : 's'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function OptionGrid({
  options,
  selected,
  onSelect,
}: {
  options: { id: string; label: string; hint?: string }[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          className={cn(
            'rounded-xl border p-4 text-left transition-colors',
            selected === o.id ? 'border-brand bg-brand/10' : 'border-border hover:border-ring/40 hover:bg-accent',
          )}
        >
          <span className="block text-sm font-medium">{o.label}</span>
          {o.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{o.hint}</span>}
        </button>
      ))}
    </div>
  )
}
