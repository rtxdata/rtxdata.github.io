import type { Transaction } from './types'
import { toRsd } from './rates'

export function formatDateString(raw: string): string {
  const [d, m, y] = raw.split(' ')[0].split('.')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function parseRaiff(blob: unknown, fileKey: string): Transaction[] {
  const data = blob as { transactions?: Record<string, unknown[][]> }
  const out: Transaction[] = []
  const transactions = data.transactions ?? {}
  for (const acc of Object.keys(transactions)) {
    const rows = (transactions[acc]?.[0]?.[1] ?? []) as string[][]
    rows.forEach((tx: string[], i: number) => {
      const curr = tx[2]
      const date = formatDateString(tx[3])
      const ref = tx[6] === tx[14] ? tx[6] : `${tx[6]} ${tx[14]}`
      const sum = tx[8] === '0' ? parseFloat(tx[9]) : -1 * parseFloat(tx[8])
      const id = tx[7] || ''
      out.push({
        key: id || `${acc}:${date}:${i}:${sum}`,
        id, sum, rsum: toRsd(sum, curr), curr,
        kat1: '', kat2: '', date, ts: Date.parse(date),
        type: tx[13], card: tx[5], ref, ref2: tx[11], acc,
        cls: 'consumption', file: fileKey,
      })
    })
  }
  return out
}
