import type { Listing, Part, PricePoint, Retailer, Variant } from './types'

/** FNV-1a — stable per-slug seed so synthetic offers don't change between renders. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const OFFERABLE: Retailer['type'][] = ['marketplace', 'oem', 'dealer', 'affiliate']

/** Brands with their own official online store, used to show an OEM offer. */
const OEM_BY_BRAND: Record<string, string> = {
  bajaj: 'bajaj-auto-oem',
  'royal-enfield': 'royal-enfield-oem',
  ather: 'ather-energy-oem',
}

export function preferredOem(brandSlug: string): string | undefined {
  return OEM_BY_BRAND[brandSlug]
}

/**
 * Synthetic retailer offers for the bundled demo. Live data replaces these with
 * real `listings` rows once the Supabase schema is applied.
 */
export function syntheticListings(variant: Variant, retailers: Retailer[], preferred?: string): Listing[] {
  const base = variant.ex_showroom_inr
  if (!base) return []
  // An OEM store only ever sells its own brand, so drop every other OEM.
  const candidates = retailers.filter(
    (r) => OFFERABLE.includes(r.type) && (r.type !== 'oem' || r.slug === preferred),
  )
  if (candidates.length === 0) return []
  const rand = mulberry32(hash(variant.slug))
  const official = preferred ? candidates.filter((r) => r.slug === preferred) : []
  const rest = candidates.filter((r) => r.slug !== preferred).sort(() => rand() - 0.5)
  const picked = [...official, ...rest].slice(0, 3)
  const now = new Date().toISOString()
  const offers = picked.map((retailer, i) => {
    const spread = 1 + (rand() - 0.45) * 0.06
    // An OEM store sells at the official ex-showroom price, not a marked-up one.
    const price = retailer.slug === preferred ? base : Math.round((base * spread) / 100) * 100
    return {
      variant_slug: variant.slug,
      retailer_slug: retailer.slug,
      url: `${retailer.base_url}/search?q=${encodeURIComponent(variant.name)}`,
      price_inr: price,
      in_stock: rand() > 0.12,
      is_primary: i === 0,
      last_seen_at: now,
    } satisfies Listing
  })
  offers.sort((a, b) => a.price_inr - b.price_inr)
  return offers.map((o, i) => ({ ...o, is_primary: i === 0 }))
}

/** 180-day synthetic price history ending at the current best price. */
export function syntheticPriceHistory(variant: Variant, listing: Listing | undefined): PricePoint[] {
  const end = listing?.price_inr ?? variant.ex_showroom_inr
  if (!end) return []
  const rand = mulberry32(hash(variant.slug + ':hist'))
  const points: PricePoint[] = []
  const days = 180
  let drift = 1 + (rand() - 0.4) * 0.05
  for (let d = days; d >= 0; d -= 15) {
    drift += (1 - drift) * 0.35 + (rand() - 0.5) * 0.012
    const price = Math.round((end * drift) / 100) * 100
    points.push({
      price_inr: price,
      recorded_at: new Date(Date.now() - d * 86400000).toISOString(),
    })
  }
  points[points.length - 1] = { price_inr: end, recorded_at: new Date().toISOString() }
  return points
}

export function bestOffer(listings: Listing[]): Listing | undefined {
  return [...listings].filter((l) => l.in_stock).sort((a, b) => a.price_inr - b.price_inr)[0] ?? listings[0]
}

export function priceDelta(points: PricePoint[]): number {
  if (points.length < 2) return 0
  const first = points[0].price_inr
  const last = points[points.length - 1].price_inr
  return first === 0 ? 0 : ((last - first) / first) * 100
}

/** Indicative market price per accessory category (INR). */
const CATEGORY_PRICE: Record<string, [number, number]> = {
  exhaust: [3500, 45000],
  tyres: [1800, 12000],
  seats: [1500, 9000],
  luggage: [1200, 15000],
  lights: [800, 12000],
  'crash-guards': [900, 5000],
  mirrors: [400, 3500],
  'air-filter': [700, 6000],
  ecu: [8000, 35000],
  suspension: [4000, 60000],
}

export function syntheticPartPrice(part: Part): number {
  const [lo, hi] = CATEGORY_PRICE[part.category] ?? [500, 12000]
  const rand = mulberry32(hash(part.slug))
  return Math.round((lo + rand() * (hi - lo)) / 100) * 100
}
