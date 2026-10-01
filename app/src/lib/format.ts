const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** ₹ with Indian digit grouping, e.g. 212900 -> ₹2,12,900 */
export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return inr.format(value)
}

/** Compact Indian money, e.g. 1,25,000 -> ₹1.25 L, 3,50,00,000 -> ₹3.5 Cr */
export function formatINRCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2).replace(/\.00$/, '')} Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2).replace(/\.00$/, '')} L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return formatINR(value)
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value)
}

/** Relative "updated" label from an ISO timestamp. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(1, Math.round((Date.now() - then) / 1000))
  const table: [number, string][] = [
    [60, 's'],
    [3600, 'm'],
    [86400, 'h'],
    [2592000, 'd'],
    [31536000, 'mo'],
  ]
  if (secs < 60) return `${secs}s ago`
  for (let i = 1; i < table.length; i++) {
    if (secs < table[i][0]) return `${Math.round(secs / table[i - 1][0])}${table[i][1]} ago`
  }
  return `${Math.round(secs / 31536000)}y ago`
}

/**
 * Indicative on-road price. Ex-showroom already includes GST; add state road tax
 * (slab by engine capacity), registration + HSRP, and first-year insurance.
 */
export function onRoadPrice(
  exShowroom: number,
  engineCc: number | null,
  fuel: 'petrol' | 'electric',
  roadTaxPct: number,
): { exShowroom: number; roadTax: number; registration: number; insurance: number; total: number } {
  const roadTax = Math.round((exShowroom * roadTaxPct) / 100)
  const registration = 1500
  const insuranceBase = fuel === 'electric' ? 0.02 : 0.055
  const insurance = Math.round(exShowroom * insuranceBase + (engineCc && engineCc > 350 ? 1200 : 800))
  return {
    exShowroom,
    roadTax,
    registration,
    insurance,
    total: exShowroom + roadTax + registration + insurance,
  }
}

/** Reducing-balance EMI. ratePct is annual. */
export function emi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRatePct / 12 / 100
  if (r === 0) return Math.round(principal / months)
  const f = Math.pow(1 + r, months)
  return Math.round((principal * r * f) / (f - 1))
}

export const INDIAN_STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh',
  'West Bengal', 'Rajasthan', 'Telangana', 'Kerala', 'Madhya Pradesh', 'Punjab',
  'Haryana', 'Bihar', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Goa',
  'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 'Chandigarh', 'Puducherry',
] as const

export type IndianState = (typeof INDIAN_STATES)[number]

/** Approximate two-wheeler road-tax % by state and engine slab (indicative only). */
export function roadTaxPct(state: string, engineCc: number | null, fuel: 'petrol' | 'electric'): number {
  const cc = engineCc ?? 0
  if (fuel === 'electric') return state === 'Delhi' ? 0 : 6
  const slab = cc <= 150 ? 'small' : cc <= 350 ? 'mid' : 'large'
  const table: Record<string, [number, number, number]> = {
    Delhi: [8, 8, 12],
    Maharashtra: [10, 11, 12],
    Karnataka: [10, 12, 18],
    'Tamil Nadu': [8, 10, 12],
    Gujarat: [6, 6, 6],
    'Uttar Pradesh': [7, 9, 10],
    'West Bengal': [8, 9, 10],
    Rajasthan: [8, 10, 12],
    Telangana: [9, 11, 14],
    Kerala: [8, 10, 20],
    'Madhya Pradesh': [7, 8, 10],
    Punjab: [8, 9, 11],
    Haryana: [7, 8, 10],
    Bihar: [8, 9, 12],
    Odisha: [7, 8, 10],
    Assam: [8, 9, 10],
    Jharkhand: [6, 7, 9],
    Chhattisgarh: [8, 9, 10],
    Goa: [9, 11, 12],
    Uttarakhand: [8, 9, 11],
    'Himachal Pradesh': [7, 8, 10],
    'Jammu & Kashmir': [7, 8, 10],
    Chandigarh: [8, 9, 10],
    Puducherry: [6, 7, 8],
  }
  const row = table[state] ?? [8, 9, 12]
  return slab === 'small' ? row[0] : slab === 'mid' ? row[1] : row[2]
}
