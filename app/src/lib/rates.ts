export const RATES_RSD: Record<string, number> = { RSD: 1, EUR: 117, USD: 110 }
export function toRsd(sum: number, curr: string): number {
  return sum * (RATES_RSD[curr] ?? 1)
}
