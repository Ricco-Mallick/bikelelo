import type { BikeModel, Brand, Retailer } from './types'

export type LinkKind = 'official' | 'search' | 'browse'

export interface OfferTarget {
  url: string
  kind: LinkKind
  action: string
}

const enc = encodeURIComponent

/**
 * Where a retailer link should actually go. Each destination was checked
 * against the live site: BikeDekho, ZigWheels and 91Wheels expose no public
 * search route (those URLs 404), so they fall back to their bikes index rather
 * than sending people to a dead page.
 */
export function retailerTarget(retailer: Retailer, model?: BikeModel, brand?: Brand): OfferTarget {
  const query = [brand?.name, model?.name].filter(Boolean).join(' ').trim()

  switch (retailer.slug) {
    case 'flipkart':
      return { url: `https://www.flipkart.com/search?q=${enc(query)}`, kind: 'search', action: 'Search Flipkart' }
    case 'amazon-india':
      return { url: `https://www.amazon.in/s?k=${enc(query)}`, kind: 'search', action: 'Search Amazon' }
    case 'bikes4sale':
      return { url: `https://www.bikes4sale.in/search?q=${enc(query)}`, kind: 'search', action: 'Search Bikes4Sale' }
    case 'bikedekho':
      return { url: 'https://www.bikedekho.com/new-bikes', kind: 'browse', action: 'Specs on BikeDekho' }
    case 'zigwheels':
      return { url: 'https://www.zigwheels.com/bikes', kind: 'browse', action: 'Specs on ZigWheels' }
    case '91wheels':
      return { url: 'https://www.91wheels.com/bikes', kind: 'browse', action: 'Specs on 91Wheels' }
    case 'royal-enfield-oem':
      return { url: 'https://www.royalenfield.com/in/en/home/', kind: 'official', action: 'Official store' }
    default:
      return {
        url: retailer.base_url || '/',
        kind: retailer.type === 'oem' ? 'official' : retailer.type === 'info' ? 'browse' : 'search',
        action: retailer.type === 'oem' ? 'Official store' : 'Visit site',
      }
  }
}

/** Short, honest descriptor shown under a retailer name. */
export function kindLabel(kind: LinkKind): string {
  if (kind === 'official') return 'Buy direct from the maker'
  if (kind === 'browse') return 'Specs & reviews, not a store'
  return 'Opens the retailer’s search'
}
