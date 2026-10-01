import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Check, Plus, Share2, Trash2, Wrench, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/common/EmptyState'
import { useCatalog } from '@/lib/catalog'
import { syntheticPartPrice } from '@/lib/pricing'
import { formatINR } from '@/lib/format'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Fitment, Part } from '@/lib/types'

export default function Configurator() {
  const { buildSlug } = useParams<{ buildSlug: string }>()
  const { builds, saveBuild, deleteBuild, addBuildItem, removeBuildItem } = useStore()
  const { variantsBySlug, modelsBySlug, brandsBySlug, parts, fitmentsByPart } = useCatalog()
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')

  const build = buildSlug ? builds.find((b) => b.slug === buildSlug) : undefined

  function createBuild() {
    const slug = `build-${Date.now().toString(36)}`
    saveBuild({ slug, name: 'My build', variant_slug: null, items: [] })
    navigate(`/build/${slug}`)
  }

  if (!buildSlug) {
    return (
      <div className="container py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Configurator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a bike, add parts, and BikeLelo checks every fitment against your model.
            </p>
          </div>
          <Button onClick={createBuild}>
            <Plus className="size-4" /> New build
          </Button>
        </div>
        {builds.length === 0 ? (
          <EmptyState
            icon={<Wrench className="size-7" />}
            title="No builds yet"
            description="Start a build to add a bike and accessories, with live compatibility checks."
            action={<Button onClick={createBuild}>Start your first build</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((b) => (
              <Link
                key={b.slug}
                to={`/build/${b.slug}`}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/40"
              >
                <h3 className="font-semibold">{b.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {b.items.length} part{b.items.length === 1 ? '' : 's'} ·{' '}
                  {b.variant_slug ? variantsBySlug.get(b.variant_slug)?.name ?? 'bike' : 'no bike yet'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!build) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Build not found"
          description="This build lives in another browser, or was deleted."
          action={
            <Button onClick={() => navigate('/build')}>Back to configurator</Button>
          }
        />
      </div>
    )
  }

  const variant = build.variant_slug ? variantsBySlug.get(build.variant_slug) : undefined
  const model = variant ? modelsBySlug.get(variant.model_slug) : undefined

  const categories = ['all', ...new Set(parts.map((p) => p.category))]
  const visibleParts = parts.filter((p) => category === 'all' || p.category === category)

  const items = build.items
    .map((item) => {
      const part = parts.find((p) => p.slug === item.part_slug)
      if (!part) return null
      const fitment = model ? (fitmentsByPart.get(part.slug) ?? []).find((f) => f.model_slug === model.slug) : undefined
      return { item, part, price: syntheticPartPrice(part), fitment }
    })
    .filter((x): x is { item: typeof build.items[number]; part: Part; price: number; fitment: Fitment | undefined } => Boolean(x))

  const partsTotal = items.reduce((sum, x) => sum + x.price * x.item.qty, 0)
  const bikeTotal = variant?.ex_showroom_inr ?? 0
  const total = partsTotal + bikeTotal
  const issues = items.filter((x) => x.fitment && x.fitment.fit === 'requires-mod')

  const bikeOptions = [...variantsBySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to builds">
          <Link to="/build">
            <X className="size-4" />
          </Link>
        </Button>
        <Input
          value={build.name}
          onChange={(e) => saveBuild({ ...build, name: e.target.value })}
          className="max-w-xs border-0 bg-transparent px-2 text-lg font-semibold shadow-none focus-visible:ring-0"
          aria-label="Build name"
        />
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void navigator.clipboard?.writeText(window.location.href)}
          >
            <Share2 className="size-4" /> Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              deleteBuild(build.slug)
              navigate('/build')
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Base bike */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Base bike</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={build.variant_slug ?? ''}
                onValueChange={(v) => saveBuild({ ...build, variant_slug: v })}
              >
                <SelectTrigger className="sm:max-w-md">
                  <SelectValue placeholder="Choose a bike variant…" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {bikeOptions.map((v) => {
                    const m = modelsBySlug.get(v.model_slug)
                    const b = m ? brandsBySlug.get(m.brand_slug) : undefined
                    return (
                      <SelectItem key={v.slug} value={v.slug}>
                        {b?.name} {m?.name} · {v.name} — {formatINR(v.ex_showroom_inr)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {model && (
                <Button variant="outline" asChild>
                  <Link to={`/bikes/${model.slug}`}>View bike</Link>
                </Button>
              )}
            </div>
          </section>

          {/* Parts */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add parts</h2>
            <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
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
            <ul className="divide-y divide-border rounded-xl border border-border">
              {visibleParts.map((part) => {
                const fitment = model ? (fitmentsByPart.get(part.slug) ?? []).find((f) => f.model_slug === model.slug) : undefined
                const added = build.items.some((i) => i.part_slug === part.slug)
                return (
                  <li key={part.slug} className="flex items-center gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{part.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {part.brand_name} · {formatINR(syntheticPartPrice(part))}
                      </p>
                    </div>
                    {model && (
                      <FitPill fitment={fitment} />
                    )}
                    <Button
                      size="sm"
                      variant={added ? 'secondary' : 'outline'}
                      onClick={() => addBuildItem(build.slug, part.slug)}
                    >
                      {added ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                      {added ? 'Added' : 'Add'}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Your build</h2>
            {!variant && <p className="mt-2 text-sm text-muted-foreground">Choose a base bike to begin.</p>}

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {model ? `${brandsBySlug.get(model.brand_slug)?.name} ${model.name}` : 'Base bike'}
                </span>
                <span className="tabular-nums">{variant ? formatINR(bikeTotal) : '—'}</span>
              </div>
              {items.length > 0 && (
                <>
                  <Separator />
                  <ul className="space-y-2">
                    {items.map(({ item, part, price, fitment }) => (
                      <li key={part.slug} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-muted-foreground">
                          {part.name}
                          {item.qty > 1 && ` ×${item.qty}`}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="tabular-nums">{formatINR(price * item.qty)}</span>
                          <button
                            onClick={() => removeBuildItem(build.slug, part.slug)}
                            aria-label={`Remove ${part.name}`}
                          >
                            <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                          </button>
                          {fitment?.fit === 'requires-mod' && <AlertTriangle className="size-3.5 text-amber-400" />}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Build total</span>
              <span className="text-xl font-semibold tabular-nums">{formatINR(total)}</span>
            </div>

            {issues.length > 0 && (
              <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  {issues.length} part{issues.length === 1 ? '' : 's'} may need modification to fit. Check the notes on
                  the bike page.
                </p>
              </div>
            )}

            <Button className="mt-5 w-full" disabled={!variant}>
              <Wrench className="size-4" /> Save &amp; share build
            </Button>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Builds are stored locally for now. Sign in and apply the Supabase schema to sync and share across devices.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function FitPill({ fitment }: { fitment: Fitment | undefined }) {
  if (!fitment) return <Badge variant="outline" className="shrink-0 text-muted-foreground">Check fit</Badge>
  if (fitment.fit === 'exact') return <Badge className="shrink-0 bg-emerald-500/15 text-emerald-400">Fits</Badge>
  if (fitment.fit === 'universal') return <Badge variant="secondary" className="shrink-0">Universal</Badge>
  return <Badge variant="outline" className="shrink-0 text-amber-400">Needs mod</Badge>
}
