import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINR, formatINRCompact, timeAgo } from '@/lib/format'
import { bestOffer, priceDelta } from '@/lib/pricing'
import { kindLabel, retailerTarget } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { BikeModel, Brand, Listing, PricePoint, Retailer } from '@/lib/types'

interface PricePanelProps {
  listings: Listing[]
  history: PricePoint[]
  retailersBySlug: Map<string, Retailer>
  model?: BikeModel
  brand?: Brand
  /** True when offers come from real database listings rather than estimates. */
  isLive?: boolean
}

export function PricePanel({ listings, history, retailersBySlug, model, brand, isLive = false }: PricePanelProps) {
  const best = bestOffer(listings)
  const delta = priceDelta(history)
  const dropping = delta < -0.5

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Best price today</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{formatINR(best?.price_inr)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {best ? `at ${retailersBySlug.get(best.retailer_slug)?.name ?? best.retailer_slug}` : 'No live offers yet'}
              {best && isLive && ` · checked ${timeAgo(best.last_seen_at)}`}
            </p>
          </div>
          {history.length > 1 && (
            <Badge variant={dropping ? 'default' : 'secondary'} className={cn('gap-1', dropping && 'bg-emerald-500 text-white')}>
              {dropping ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}% / 180d
            </Badge>
          )}
        </div>

        <div className="mt-5 space-y-2">
          {listings.map((offer) => {
            const retailer = retailersBySlug.get(offer.retailer_slug)
            const isBest = offer === best
            const target = retailer
              ? retailerTarget(retailer, model, brand)
              : { url: offer.url, kind: 'search' as const, action: 'Visit site' }
            return (
              <div
                key={`${offer.retailer_slug}-${offer.price_inr}`}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                  isBest ? 'border-brand/50 bg-brand/5' : 'border-border',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{retailer?.name ?? offer.retailer_slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {kindLabel(target.kind)}
                    {isBest && ' · lowest'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">{formatINR(offer.price_inr)}</span>
                  <Button variant="outline" size="sm" asChild disabled={!offer.in_stock}>
                    <a href={target.url} target="_blank" rel="noopener noreferrer nofollow sponsored">
                      {target.action} <ExternalLink className="size-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {isLive ? (
            <>
              Offers are refreshed from public retailer listings by a scheduled scraper. We may earn a commission when
              you buy through these links, which never changes the price you pay.
            </>
          ) : (
            <>
              No live retailer prices for this variant yet, so the figures above are indicative estimates based on the
              official ex-showroom price. Sizes and stock may differ at the retailer.
            </>
          )}
        </p>
      </div>

      {history.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Price trend</h3>
            <span className="text-xs text-muted-foreground">Last 180 days</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="recorded_at"
                  tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { month: 'short' })}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  domain={['dataMin - 4000', 'dataMax + 4000']}
                  tickFormatter={(v: number) => formatINRCompact(v)}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <RTooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => new Date(v as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  formatter={(value) => [formatINR(Number(value)), 'Price'] as [string, string]}
                />
                <Area
                  type="monotone"
                  dataKey="price_inr"
                  stroke="hsl(var(--brand))"
                  strokeWidth={2}
                  fill="url(#priceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
