import { useMemo, useState } from 'react'
import type { Transaction } from '@/lib/types'
import { normalizeMerchant } from '@/lib/subscriptions'
import { displayMerchant, katLabel } from '@/lib/display'
import { fmtRsd } from '@/lib/format'

interface Props {
  rows: Transaction[]
  onSelect: (txns: Transaction[]) => void
}

type SortKey = 'count' | 'sum'

interface Group {
  name: string
  count: number
  sum: number
  cats: Set<string>
  txns: Transaction[]
}

export default function MerchantGroups({ rows, onSelect }: Props) {
  const [sort, setSort] = useState<SortKey>('count')

  const groups = useMemo(() => {
    const map = new Map<string, Group>()
    for (const t of rows) {
      const key = normalizeMerchant(t.ref) || t.ref.toLowerCase()
      let g = map.get(key)
      if (!g) {
        g = { name: displayMerchant(t.ref), count: 0, sum: 0, cats: new Set(), txns: [] }
        map.set(key, g)
      }
      g.count++
      g.sum += t.rsum
      g.cats.add(t.kat1)
      g.txns.push(t)
    }
    return [...map.values()].sort((a, b) =>
      sort === 'count' ? b.count - a.count : Math.abs(b.sum) - Math.abs(a.sum),
    )
  }, [rows, sort])

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Получатель</th>
            <th
              onClick={() => setSort('count')}
              className={`cursor-pointer px-3 py-2 text-right font-medium select-none hover:text-foreground ${sort === 'count' ? 'text-foreground' : ''}`}
            >
              Операций{sort === 'count' ? ' ↓' : ''}
            </th>
            <th
              onClick={() => setSort('sum')}
              className={`cursor-pointer px-3 py-2 text-right font-medium select-none hover:text-foreground ${sort === 'sum' ? 'text-foreground' : ''}`}
            >
              Сумма{sort === 'sum' ? ' ↓' : ''}
            </th>
            <th className="px-3 py-2 text-left font-medium">Категория</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => (
            <tr
              key={i}
              onClick={() => onSelect(g.txns)}
              className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
            >
              <td className="max-w-[22rem] truncate px-3 py-2 font-medium">{g.name}</td>
              <td className="num px-3 py-2 text-right">{g.count}</td>
              <td className="num px-3 py-2 text-right">{fmtRsd(g.sum)}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {g.cats.size === 1 ? katLabel([...g.cats][0]) : 'разное'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
