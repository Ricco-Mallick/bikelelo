import { Link } from 'react-router-dom'
import { GitCompareArrows, Heart, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BikeArt } from './BikeArt'
import { cn } from '@/lib/utils'
import { formatINRCompact } from '@/lib/format'
import { modelPriceRange } from '@/lib/catalog'
import type { BikeModel, Brand, Variant } from '@/lib/types'

interface BikeCardProps {
  model: BikeModel
  brand?: Brand
  variants: Variant[]
  saved: boolean
  comparing: boolean
  onToggleSave: () => void
  onToggleCompare: () => void
}

export function BikeCard({
  model,
  brand,
  variants,
  saved,
  comparing,
  onToggleSave,
  onToggleCompare,
}: BikeCardProps) {
  const range = modelPriceRange(variants)
  const hero = variants[0]
  const cc = hero?.specs.engine_cc
  const mileage = hero?.specs.mileage_kmpl
  const abs = hero?.specs.abs

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-ring/40">
      <Link to={`/bikes/${model.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {model.image_url ? (
            <img
              src={model.image_url}
              alt={`${brand?.name ?? ''} ${model.name}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <BikeArt body={model.body_type} fuel={model.fuel_type} className="p-2" />
          )}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge variant="secondary" className="capitalize backdrop-blur">
              {model.body_type.replace('-', ' ')}
            </Badge>
            {model.fuel_type === 'electric' && (
              <Badge className="gap-1 bg-brand text-brand-foreground">
                <Zap className="size-3" /> EV
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{brand?.name}</p>
            <h3 className="mt-0.5 line-clamp-1 text-base font-semibold">{model.name}</h3>
          </div>

          <dl className="grid grid-cols-3 gap-2 text-xs">
            <Spec label="Engine" value={cc ? `${cc} cc` : '—'} />
            <Spec label="Mileage" value={mileage ? `${mileage} kmpl` : '—'} />
            <Spec label="Brakes" value={abs ? String(abs) : '—'} />
          </dl>

          <div className="mt-auto flex items-end justify-between pt-1">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Ex-showroom</p>
              <p className="text-lg font-semibold tracking-tight">
                {range ? formatINRCompact(range[0]) : '—'}
                {range && range[1] !== range[0] && (
                  <span className="text-sm font-normal text-muted-foreground"> – {formatINRCompact(range[1])}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          className="size-8 backdrop-blur"
          onClick={onToggleSave}
          aria-label={saved ? 'Remove from garage' : 'Save to garage'}
          aria-pressed={saved}
        >
          <Heart className={cn('size-4', saved && 'fill-brand text-brand')} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="size-8 backdrop-blur"
          onClick={onToggleCompare}
          aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
          aria-pressed={comparing}
        >
          <GitCompareArrows className={cn('size-4', comparing && 'text-brand')} />
        </Button>
      </div>
    </article>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}

