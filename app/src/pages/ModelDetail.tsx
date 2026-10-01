import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, GitCompareArrows, Heart, Share2, ShieldCheck, Star, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { SpecTable } from '@/components/catalog/SpecTable'
import { PricePanel } from '@/components/catalog/PricePanel'
import { BikeCard } from '@/components/catalog/BikeCard'
import { BikeArt } from '@/components/catalog/BikeArt'
import { creditIsComplete, imageCredit } from '@/lib/images'
import { EmptyState } from '@/components/common/EmptyState'
import { ratingSummary, reviewsFor } from '@/data/reviews'
import { useCatalog, modelPriceRange } from '@/lib/catalog'
import { offersFor, historyFor, bestOffer, preferredOem } from '@/lib/pricing'
import {
  emi,
  formatINR,
  formatINRCompact,
  formatNumber,
  INDIAN_STATES,
  onRoadPrice,
  roadTaxPct,
} from '@/lib/format'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import NotFound from './NotFound'

export default function ModelDetail() {
  const { modelSlug } = useParams<{ modelSlug: string }>()
  const {
    modelsBySlug,
    brandsBySlug,
    variantsByModel,
    retailers,
    retailersBySlug,
    fitmentsByPart,
    partsBySlug,
    models,
    listings: dbListings,
    priceHistory,
  } = useCatalog()
  const { garage, wishlist, compare, toggleGarage, toggleCompare, recordView } = useStore()
  const [variantSlug, setVariantSlug] = useState<string | null>(null)

  const model = modelSlug ? modelsBySlug.get(modelSlug) : undefined
  const variants = model ? variantsByModel.get(model.slug) ?? [] : []

  const active = useMemo(
    () => variants.find((v) => v.slug === variantSlug) ?? variants[0],
    [variants, variantSlug],
  )

  useEffect(() => {
    if (model?.slug) recordView(model.slug)
  }, [model?.slug, recordView])

  if (!model || !active) return <NotFound />

  const brand = brandsBySlug.get(model.brand_slug)
  const { listings, isLive } = offersFor(active, retailers, dbListings, preferredOem(model.brand_slug))
  const history = historyFor(
    active,
    priceHistory.filter((p) => p.variant_slug === active.slug),
    bestOffer(listings),
    isLive,
  )
  const engineCc = Number(active.specs.engine_cc) || null
  const range = modelPriceRange(variants)

  const fittingParts = [...fitmentsByPart.entries()]
    .filter(([, rows]) => rows.some((f) => f.model_slug === model.slug))
    .map(([partSlug, rows]) => ({ part: partsBySlug.get(partSlug), fitment: rows.find((f) => f.model_slug === model.slug) }))
    .filter((x): x is { part: NonNullable<typeof x.part>; fitment: NonNullable<typeof x.fitment> } => Boolean(x.part && x.fitment))

  const similar = models
    .filter((m) => m.slug !== model.slug && (m.body_type === model.body_type || m.segment === model.segment))
    .slice(0, 4)

  const saved = variants.some((v) => garage.includes(v.slug) || wishlist.includes(v.slug))
  const reviews = reviewsFor(model.slug)
  const summary = ratingSummary(reviews)
  const credit = imageCredit(model.slug)

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/bikes" className="transition-colors hover:text-foreground">
          Bikes
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to={`/bikes?brand=${model.brand_slug}`} className="transition-colors hover:text-foreground">
          {brand?.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{model.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr]">
        {/* Left column */}
        <div className="space-y-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {model.body_type.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {model.fuel_type}
              </Badge>
              <Badge variant="outline">{model.segment}</Badge>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{brand?.name}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{model.name}</h1>
                {range && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatINRCompact(range[0])}
                    {range[1] !== range[0] && ` – ${formatINRCompact(range[1])}`} ex-showroom
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={saved ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleGarage(active.slug)}
                  aria-pressed={saved}
                >
                  <Heart className={cn('size-4', saved && 'fill-brand text-brand')} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant={compare.includes(active.slug) ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleCompare(active.slug)}
                  aria-pressed={compare.includes(active.slug)}
                >
                  <GitCompareArrows className={cn('size-4', compare.includes(active.slug) && 'text-brand')} />
                  Compare
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share"
                  onClick={() => void navigator.clipboard?.writeText(window.location.href)}
                >
                  <Share2 className="size-4" />
                </Button>
              </div>
            </div>
            {model.summary && <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">{model.summary}</p>}
          </header>

          {/* Visual */}
          <figure className="space-y-2">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-card">
              {active.image_url || model.image_url ? (
                <img
                  src={active.image_url || model.image_url}
                  alt={`${brand?.name} ${model.name} ${active.name}`}
                  className="size-full object-cover"
                />
              ) : (
                <BikeArt body={model.body_type} fuel={model.fuel_type} />
              )}
            </div>
            <figcaption className="text-[11px] text-muted-foreground">
              {model.image_url && credit && creditIsComplete(credit) ? (
                <>
                  Photo by{' '}
                  <a
                    href={credit.source_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:text-foreground"
                  >
                    {credit.author}
                  </a>{' '}
                  ({credit.license}) via Wikimedia Commons. Illustrations are drawn by BikeLelo.
                </>
              ) : (
                <>Illustration drawn by BikeLelo. No freely-licensed photograph of this model was available.</>
              )}
            </figcaption>
          </figure>

          {/* Variants */}
          {variants.length > 1 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Variants ({variants.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.slug}
                    onClick={() => setVariantSlug(v.slug)}
                    className={cn(
                      'rounded-lg border px-3.5 py-2 text-left text-sm transition-colors',
                      v.slug === active.slug
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-ring/40 hover:bg-accent',
                    )}
                  >
                    <span className="block font-medium">{v.name}</span>
                    <span className="block text-xs text-muted-foreground">{formatINR(v.ex_showroom_inr)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Specs */}
          <section>
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Specifications</h2>
            <SpecTable variant={active} />
          </section>

          {/* Fitment */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Fits this bike</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/parts?model=${model.slug}`}>
                  All parts <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            {fittingParts.length === 0 ? (
              <EmptyState
                icon={<Wrench className="size-6" />}
                title="No accessories listed yet"
                description="Genuine and aftermarket parts for this model are being added."
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {fittingParts.map(({ part, fitment }) => (
                  <li key={part.slug} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{part.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {part.brand_name} · {part.category}
                      </p>
                    </div>
                    <FitBadge fit={fitment.fit} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Reviews */}
          <section>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Owner reviews</h2>
              {summary && (
                <span className="flex items-center gap-1.5 text-sm">
                  <Stars value={summary.average} />
                  <span className="font-medium">{summary.average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({summary.count})</span>
                </span>
              )}
            </div>
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="Owner reviews appear here once riders share them. Reviews are stored in Supabase, so this fills up after the schema is applied."
              />
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={`${r.author_name}-${r.title}`} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold">
                          {r.author_name.slice(0, 1)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{r.author_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.city} · owned {r.months_owned} months
                          </p>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm font-medium">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PricePanel
            listings={listings}
            history={history}
            retailersBySlug={retailersBySlug}
            model={model}
            brand={brand}
            isLive={isLive}
          />
          <OnRoadCalculator exShowroom={active.ex_showroom_inr ?? 0} engineCc={engineCc} fuel={model.fuel_type} />
          <EmiCalculator exShowroom={active.ex_showroom_inr ?? 0} />
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Similar bikes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((m) => {
              const vs = variantsByModel.get(m.slug) ?? []
              return (
                <BikeCard
                  key={m.slug}
                  model={m}
                  brand={brandsBySlug.get(m.brand_slug)}
                  variants={vs}
                  saved={vs.some((v) => garage.includes(v.slug) || wishlist.includes(v.slug))}
                  comparing={vs.some((v) => compare.includes(v.slug))}
                  onToggleSave={() => vs[0] && toggleGarage(vs[0].slug)}
                  onToggleCompare={() => vs[0] && toggleCompare(vs[0].slug)}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function FitBadge({ fit }: { fit: string }) {
  if (fit === 'exact')
    return (
      <Badge className="shrink-0 gap-1 bg-emerald-500/15 text-emerald-400">
        <ShieldCheck className="size-3" /> Fits
      </Badge>
    )
  if (fit === 'universal') return <Badge variant="secondary" className="shrink-0">Universal</Badge>
  return <Badge variant="outline" className="shrink-0 text-amber-400">Needs mod</Badge>
}

/** Read-only star rating with accessible text. */
function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'size-3.5',
            n <= Math.round(value) ? 'fill-brand text-brand' : 'text-border',
          )}
        />
      ))}
    </span>
  )
}

function OnRoadCalculator({
  exShowroom,
  engineCc,
  fuel,
}: {
  exShowroom: number
  engineCc: number | null
  fuel: 'petrol' | 'electric'
}) {
  const [state, setState] = useState<string>('Delhi')
  const pct = roadTaxPct(state, engineCc, fuel)
  const breakdown = onRoadPrice(exShowroom, engineCc, fuel, pct)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">On-road price</h3>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {INDIAN_STATES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <dl className="space-y-2 text-sm">
        <Row label="Ex-showroom" value={formatINR(breakdown.exShowroom)} />
        <Row label={`Road tax (${pct}%)`} value={formatINR(breakdown.roadTax)} />
        <Row label="Registration + HSRP" value={formatINR(breakdown.registration)} />
        <Row label="Insurance (1st yr)" value={formatINR(breakdown.insurance)} />
      </dl>
      <Separator className="my-3" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">On-road estimate</span>
        <span className="text-lg font-semibold tabular-nums">{formatINR(breakdown.total)}</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Indicative only. Actual road tax, registration and insurance vary by state and dealer.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

function EmiCalculator({ exShowroom }: { exShowroom: number }) {
  const [downPct, setDownPct] = useState(15)
  const [months, setMonths] = useState(36)
  const [rate, setRate] = useState(11)

  const principal = Math.max(0, exShowroom * (1 - downPct / 100))
  const monthly = emi(principal, rate, months)
  const totalPayable = monthly * months + exShowroom * (downPct / 100)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">EMI estimate</h3>
      <div className="space-y-4">
        <SliderRow label={`Down payment · ${downPct}% (${formatINR(exShowroom * (downPct / 100))})`}>
          <Slider min={0} max={60} step={5} value={[downPct]} onValueChange={([v]) => setDownPct(v)} />
        </SliderRow>
        <SliderRow label={`Tenure · ${months} months`}>
          <Slider min={12} max={60} step={6} value={[months]} onValueChange={([v]) => setMonths(v)} />
        </SliderRow>
        <SliderRow label={`Interest · ${rate}% p.a.`}>
          <Slider min={7} max={18} step={0.5} value={[rate]} onValueChange={([v]) => setRate(v)} />
        </SliderRow>
      </div>
      <Separator className="my-4" />
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly EMI</p>
          <p className="text-2xl font-semibold tabular-nums">{formatINR(monthly)}</p>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          Total ≈ {formatNumber(totalPayable)}
        </p>
      </div>
    </div>
  )
}

function SliderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}
