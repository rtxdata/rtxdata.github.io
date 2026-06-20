import type { Transaction, TxnClass } from './types'

export const REAL_SPENDING: TxnClass[] = ['consumption']
const DAY = 86_400_000

function baseClass(t: Transaction): TxnClass {
  const ref = t.ref.toLowerCase()
  const type = t.type
  if (type === 'ExchBuy' || type === 'ExchSell' || ref.includes('menjacnica')) return 'fx'
  if (ref.includes('binance') || ref.includes('bifinity')) return 'crypto'
  if (type === 'ATM' || type === 'MobCash' || type.toLowerCase().includes('cash')
      || ref.includes('atm') || ref.includes('bankomat')) return 'cash'
  // NB: 'PR' is a bill/utility/tax payment (always outgoing) — it is consumption,
  // not income. Tagging it income corrupts cash-flow (negative income, broken savings rate).
  if (type === 'Income' || type === 'IncomeCash' || t.rsum > 0) return 'income'
  return 'consumption'
}

export function classify(txns: Transaction[]): Transaction[] {
  const out = txns.map(t => ({ ...t, cls: baseClass(t) }))
  // pair internal transfers: opposite sign, equal abs(rsum), different acc, within 1 day
  const candidates = out.filter(t => t.cls === 'consumption' || t.cls === 'income')
  const used = new Set<string>()
  for (const a of candidates) {
    if (used.has(a.key) || a.rsum >= 0) continue
    const match = candidates.find(b =>
      !used.has(b.key) && b.key !== a.key && b.acc !== a.acc &&
      Math.abs(b.rsum + a.rsum) < 1 && Math.abs(b.ts - a.ts) <= DAY)
    if (match) {
      a.cls = 'transfer'; match.cls = 'transfer'
      used.add(a.key); used.add(match.key)
    }
  }
  return out
}
