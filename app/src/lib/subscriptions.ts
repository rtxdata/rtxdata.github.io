import type { Transaction, Subscription } from './types'

const DAY = 86_400_000
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function normalizeMerchant(ref: string): string {
  return ref.toLowerCase()
    .replace(/[#*].*$/, '')           // drop trailing ref-id segments
    .replace(/\b\d[\d.\-/]*\b/g, '')  // drop number/date tokens
    .replace(/[^a-zа-я ]/gi, ' ')     // drop punctuation
    .replace(/\s+/g, ' ').trim()
}

function addDays(date: string, n: number): string {
  return new Date(Date.parse(date) + n * DAY).toISOString().slice(0, 10)
}

function cadenceFor(days: number): Subscription['cadence'] | null {
  if (days >= 6 && days <= 8) return 'weekly'
  if (days >= 26 && days <= 33) return 'monthly'
  if (days >= 350 && days <= 380) return 'annual'
  return null
}

export function detectSubscriptions(txns: Transaction[]): Subscription[] {
  const groups = new Map<string, Transaction[]>()
  for (const t of txns) {
    if (t.cls !== 'consumption' || t.rsum >= 0) continue
    const k = normalizeMerchant(t.ref)
    if (!k) continue
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(t)
  }
  const out: Subscription[] = []
  for (const [, rows] of groups) {
    if (rows.length < 3) continue
    const sorted = rows.sort((a, b) => a.ts - b.ts)
    const amts = sorted.map(r => Math.abs(r.rsum))
    const medAmt = median(amts)
    if (amts.some(a => Math.abs(a - medAmt) / medAmt > 0.1)) continue
    const gaps: number[] = []
    for (let i = 1; i < sorted.length; i++) gaps.push((sorted[i].ts - sorted[i - 1].ts) / DAY)
    const medGap = median(gaps)
    const cadence = cadenceFor(medGap)
    if (!cadence) continue
    const last = sorted[sorted.length - 1]
    const monthlyRsd = cadence === 'monthly' ? medAmt
      : cadence === 'weekly' ? (medAmt * 52) / 12 : medAmt / 12
    out.push({
      merchant: normalizeMerchant(last.ref), cadence, amountRsd: medAmt, monthlyRsd,
      count: sorted.length, lastDate: last.date, nextExpected: addDays(last.date, Math.round(medGap)),
      kat1: last.kat1, kat2: last.kat2,
    })
  }
  return out.sort((a, b) => b.monthlyRsd - a.monthlyRsd)
}

export const totalMonthly = (subs: Subscription[]) => subs.reduce((s, x) => s + x.monthlyRsd, 0)
