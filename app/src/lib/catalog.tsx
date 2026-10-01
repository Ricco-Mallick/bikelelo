import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import seedJson from '@/data/catalog.json'
import type { Brand, BikeModel, Catalog, Fitment, Part, Retailer, SpecKey, Variant } from './types'
import { supabase, isSupabaseConfigured } from './supabase'

export const seedCatalog = seedJson as unknown as Catalog

export type DataSource = 'seed' | 'supabase' | 'loading'

interface CatalogIndex {
  catalog: Catalog
  source: DataSource
  brands: Brand[]
  models: BikeModel[]
  variants: Variant[]
  specKeys: SpecKey[]
  retailers: Retailer[]
  parts: Part[]
  fitments: Fitment[]
  brandsBySlug: Map<string, Brand>
  modelsBySlug: Map<string, BikeModel>
  variantsBySlug: Map<string, Variant>
  variantsByModel: Map<string, Variant[]>
  specKeysByKey: Map<string, SpecKey>
  retailersBySlug: Map<string, Retailer>
  partsBySlug: Map<string, Part>
  fitmentsByPart: Map<string, Fitment[]>
}

function indexCatalog(catalog: Catalog): CatalogIndex {
  const brandsBySlug = new Map(catalog.brands.map((b) => [b.slug, b]))
  const modelsBySlug = new Map(catalog.models.map((m) => [m.slug, m]))
  const variantsBySlug = new Map(catalog.variants.map((v) => [v.slug, v]))
  const variantsByModel = new Map<string, Variant[]>()
  for (const v of catalog.variants) {
    const list = variantsByModel.get(v.model_slug)
    if (list) list.push(v)
    else variantsByModel.set(v.model_slug, [v])
  }
  const specKeysByKey = new Map(catalog.spec_keys.map((s) => [s.key, s]))
  const retailersBySlug = new Map(catalog.retailers.map((r) => [r.slug, r]))
  const partsBySlug = new Map(catalog.parts.map((p) => [p.slug, p]))
  const fitmentsByPart = new Map<string, Fitment[]>()
  for (const f of catalog.fitments) {
    const list = fitmentsByPart.get(f.part_slug)
    if (list) list.push(f)
    else fitmentsByPart.set(f.part_slug, [f])
  }
  return {
    catalog,
    source: 'seed',
    brands: catalog.brands,
    models: catalog.models,
    variants: catalog.variants,
    specKeys: catalog.spec_keys,
    retailers: catalog.retailers,
    parts: catalog.parts,
    fitments: catalog.fitments,
    brandsBySlug,
    modelsBySlug,
    variantsBySlug,
    variantsByModel,
    specKeysByKey,
    retailersBySlug,
    partsBySlug,
    fitmentsByPart,
  }
}

const CatalogContext = createContext<CatalogIndex | null>(null)

/**
 * Loads the catalog once. Prefers the live Supabase tables when they are
 * reachable; otherwise serves the bundled snapshot so the static Pages build
 * always works. Falls back silently on any error (missing schema, offline).
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(seedCatalog)
  const [source, setSource] = useState<DataSource>('loading')

  useEffect(() => {
    let alive = true
    async function load() {
      if (!isSupabaseConfigured || !supabase) {
        setSource('seed')
        return
      }
      try {
        const { data, error } = await supabase.from('models').select('slug').limit(1)
        if (error) throw error
        if (!data || data.length === 0) throw new Error('empty')
        const live = await fetchLiveCatalog()
        if (!alive) return
        setCatalog(live)
        setSource('supabase')
      } catch {
        if (alive) setSource('seed')
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => ({ ...indexCatalog(catalog), source }), [catalog, source])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

async function fetchLiveCatalog(): Promise<Catalog> {
  const client = supabase!
  const [brands, models, variants, specKeys, variantSpecs, retailers, parts, fitments] = await Promise.all([
    client.from('brands').select('slug,name,country,logo_url'),
    client.from('models').select('slug,brand_slug,name,body_type,fuel_type,segment,launch_year,summary,image_url'),
    client.from('variants').select('slug,model_slug,name,ex_showroom_inr,gst_rate,image_url'),
    client.from('spec_keys').select('key,label,unit,value_type,facet,group_name,sort_order'),
    client.from('variant_specs').select('variant_slug,spec_key,value_text,value_number,value_bool'),
    client.from('retailers').select('slug,name,type,base_url,logo_url'),
    client.from('parts').select('slug,name,category,brand_name,image_url,description'),
    client.from('fitments').select('part_slug,make_slug,model_slug,variant_slug,year_from,year_to,notes,fit'),
  ])
  const firstError =
    brands.error ?? models.error ?? variants.error ?? specKeys.error ?? variantSpecs.error ?? retailers.error ?? parts.error ?? fitments.error
  if (firstError) throw firstError

  const specsByVariant = new Map<string, Record<string, string | number | boolean | null>>()
  for (const row of variantSpecs.data ?? []) {
    const key = row.variant_slug as string
    const bucket = specsByVariant.get(key) ?? {}
    bucket[row.spec_key as string] = (row.value_number ?? row.value_bool ?? row.value_text ?? null) as
      | string
      | number
      | boolean
      | null
    specsByVariant.set(key, bucket)
  }

  return {
    generated_at: new Date().toISOString(),
    brands: (brands.data ?? []) as Brand[],
    models: (models.data ?? []) as BikeModel[],
    variants: (variants.data ?? []).map((v) => ({
      ...(v as Variant),
      specs: specsByVariant.get(v.slug as string) ?? {},
    })),
    spec_keys: (specKeys.data ?? []) as SpecKey[],
    retailers: (retailers.data ?? []) as Retailer[],
    parts: (parts.data ?? []) as Part[],
    fitments: (fitments.data ?? []) as Fitment[],
  }
}

export function useCatalog(): CatalogIndex {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>')
  return ctx
}

/** Lowest ex-showroom price across a model's variants. */
export function modelPriceRange(variants: Variant[]): [number, number] | null {
  const prices = variants.map((v) => v.ex_showroom_inr).filter((p): p is number => typeof p === 'number')
  if (prices.length === 0) return null
  return [Math.min(...prices), Math.max(...prices)]
}
