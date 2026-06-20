import type { Transaction } from '@/lib/types'
import { fmtRsd } from '@/lib/format'

interface Props {
  rows: Transaction[]
}

function Stat({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`num text-lg leading-none font-semibold ${tone}`}>{value}</span>
    </div>
  )
}

export default function ResultKpis({ rows }: Props) {
  const count = rows.length
  const total = rows.reduce((s, r) => s + r.rsum, 0)
  const avg = count > 0 ? total / count : 0

  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
      <Stat label="Операций" value={count.toLocaleString('ru-RU')} />
      <Stat label="Сумма" value={fmtRsd(total)} tone={total > 0 ? 'text-pos' : ''} />
      <Stat label="Средний чек" value={fmtRsd(avg)} />
    </div>
  )
}
