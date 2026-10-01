import { useMemo } from 'react'
import { useCatalog } from '@/lib/catalog'
import { InfoTip } from '@/components/common/InfoTip'
import type { Variant } from '@/lib/types'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export function SpecTable({ variant, className }: { variant: Variant; className?: string }) {
  const { specKeysByKey } = useCatalog()

  const groups = useMemo(() => {
    const buckets = new Map<string, { key: string; label: string; value: string }[]>()
    for (const [key, raw] of Object.entries(variant.specs)) {
      if (raw === null || raw === undefined || raw === '') continue
      const meta = specKeysByKey.get(key)
      const label = meta?.label ?? key.replace(/_/g, ' ')
      const unit = meta?.unit ?? ''
      const value =
        typeof raw === 'number' ? `${formatNumber(raw, Number.isInteger(raw) ? 0 : 2)}${unit ? ` ${unit}` : ''}` : String(raw)
      const group = meta?.group_name ?? 'General'
      const bucket = buckets.get(group) ?? []
      bucket.push({ key, label, value })
      buckets.set(group, bucket)
    }
    const order = ['Engine', 'Performance', 'Dimensions', 'Brakes & Tyres', 'Electric', 'General']
    return [...buckets.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
  }, [variant, specKeysByKey])

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">Specifications for this variant are being compiled.</p>
  }

  return (
    <div className={cn('grid gap-6 sm:grid-cols-2', className)}>
      {groups.map(([group, rows]) => (
        <section key={group} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand">{group}</h3>
          <dl className="divide-y divide-border rounded-lg border border-border">
            {rows.map((row) => (
              <div key={row.key} className="flex items-baseline justify-between gap-4 px-3 py-2.5 text-sm">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  {row.label}
                  <InfoTip termKey={row.key} />
                </dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
