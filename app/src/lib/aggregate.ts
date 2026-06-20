import type { Transaction } from './types'
import { fmtMonth } from './format'

const isMonth = (t: Transaction, m: string) => fmtMonth(t.date) === m
const consumption = (txns: Transaction[]) => txns.filter(t => t.cls === 'consumption')

export function cashFlow(txns: Transaction[], month: string) {
  const m = txns.filter(t => isMonth(t, month))
  const income = m.filter(t => t.cls === 'income').reduce((s, t) => s + t.rsum, 0)
  const outflow = consumption(m).reduce((s, t) => s + Math.abs(t.rsum), 0)
  const net = income - outflow
  return { income, outflow, net, savingsRate: income ? net / income : 0 }
}

export function byCategory(txns: Transaction[]) {
  const map = new Map<string, number>()
  for (const t of consumption(txns)) map.set(t.kat1, (map.get(t.kat1) ?? 0) + Math.abs(t.rsum))
  return [...map].map(([kat1, total]) => ({ kat1, total })).sort((a, b) => b.total - a.total)
}

export function monthlySeries(txns: Transaction[]) {
  const map = new Map<string, { income: number; outflow: number }>()
  for (const t of txns) {
    const m = fmtMonth(t.date)
    const e = map.get(m) ?? { income: 0, outflow: 0 }
    if (t.cls === 'income') e.income += t.rsum
    else if (t.cls === 'consumption') e.outflow += Math.abs(t.rsum)
    map.set(m, e)
  }
  return [...map]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, e]) => ({ month, ...e, net: e.income - e.outflow }))
}

export function coverage(txns: Transaction[]) {
  const c = consumption(txns)
  const total = c.reduce((s, t) => s + Math.abs(t.rsum), 0)
  const other = c.filter(t => t.kat1 === 'other')
  const otherRsd = other.reduce((s, t) => s + Math.abs(t.rsum), 0)
  return {
    pct: total ? (total - otherRsd) / total : 0,
    categorizedRsd: total - otherRsd,
    otherRsd,
    otherCount: other.length,
  }
}

export function biggestMovers(txns: Transaction[], month: string) {
  const prev = prevMonth(month)
  const sumByCat = (m: string) => {
    const map = new Map<string, number>()
    for (const t of consumption(txns).filter(t => fmtMonth(t.date) === m))
      map.set(t.kat1, (map.get(t.kat1) ?? 0) + Math.abs(t.rsum))
    return map
  }
  const cur = sumByCat(month),
    pre = sumByCat(prev)
  const cats = new Set([...cur.keys(), ...pre.keys()])
  return [...cats]
    .map(kat1 => ({ kat1, delta: (cur.get(kat1) ?? 0) - (pre.get(kat1) ?? 0) }))
    .sort((a, b) => b.delta - a.delta)
}

/** Monthly consumption spend for one category, across the full data span (gaps = 0). */
export function categoryMonthly(txns: Transaction[], kat1: string) {
  const months = monthlySeries(txns).map(s => s.month)
  const map = new Map<string, number>()
  for (const t of consumption(txns)) {
    if (t.kat1 !== kat1) continue
    const m = fmtMonth(t.date)
    map.set(m, (map.get(m) ?? 0) + Math.abs(t.rsum))
  }
  return months.map(month => ({ month, total: map.get(month) ?? 0 }))
}

/** Subcategory (kat2) totals within one category, descending. */
export function subTotals(txns: Transaction[], kat1: string) {
  const map = new Map<string, number>()
  for (const t of consumption(txns)) {
    if (t.kat1 !== kat1) continue
    map.set(t.kat2, (map.get(t.kat2) ?? 0) + Math.abs(t.rsum))
  }
  return [...map].map(([kat2, total]) => ({ kat2, total })).sort((a, b) => b.total - a.total)
}

export function prevMonth(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(Date.UTC(y, mo - 2, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
