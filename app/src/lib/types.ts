export type FuelType = 'petrol' | 'electric'

export type BodyType =
  | 'commuter'
  | 'scooter'
  | 'sport'
  | 'cruiser'
  | 'adventure'
  | 'cafe-racer'
  | 'electric-scooter'
  | string

export interface Brand {
  slug: string
  name: string
  country: string
  logo_url: string
}

export interface BikeModel {
  slug: string
  brand_slug: string
  name: string
  body_type: BodyType
  fuel_type: FuelType
  segment: string
  launch_year: number
  summary: string
  image_url: string
}

export type SpecValue = string | number | boolean | null

export interface Variant {
  slug: string
  model_slug: string
  name: string
  ex_showroom_inr: number | null
  gst_rate: number | null
  image_url: string
  specs: Record<string, SpecValue>
}

export interface SpecKey {
  key: string
  label: string
  unit: string
  value_type: 'text' | 'number' | 'boolean'
  facet: boolean
  group_name: string
  sort_order: number
}

export interface Retailer {
  slug: string
  name: string
  type: 'marketplace' | 'oem' | 'info' | 'dealer' | 'affiliate'
  base_url: string
  logo_url: string
}

export interface Part {
  slug: string
  name: string
  category: string
  brand_name: string
  image_url: string
  description: string
}

export type FitKind = 'exact' | 'universal' | 'requires-mod'

export interface Fitment {
  part_slug: string
  make_slug: string
  model_slug: string
  variant_slug: string | null
  year_from: number
  year_to: number
  notes: string
  fit: FitKind
}

export interface Catalog {
  generated_at: string
  brands: Brand[]
  models: BikeModel[]
  variants: Variant[]
  spec_keys: SpecKey[]
  retailers: Retailer[]
  parts: Part[]
  fitments: Fitment[]
}

/** A listing is a retailer offer for a variant. Bundled seed uses synthetic offers. */
export interface Listing {
  variant_slug: string
  retailer_slug: string
  url: string
  price_inr: number
  in_stock: boolean
  is_primary: boolean
  last_seen_at: string
}

export interface PricePoint {
  price_inr: number
  recorded_at: string
}

export interface BuildItem {
  part_slug: string
  qty: number
}

export interface Build {
  slug: string
  name: string
  variant_slug: string | null
  items: BuildItem[]
  updated_at: string
}
