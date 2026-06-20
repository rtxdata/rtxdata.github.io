import { coverage } from '@/lib/aggregate'
import type { Transaction } from '@/lib/types'

interface Props {
  txns: Transaction[]
}

export default function CoverageBar({ txns }: Props) {
  const { pct, otherCount } = coverage(txns)
  const pctRounded = Math.round(pct * 100)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Категоризировано <span className="num font-medium text-foreground">{pctRounded}%</span> трат
        </span>
        <span>
          <span className="num">{otherCount.toLocaleString('ru-RU')}</span> без категории
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${pctRounded}%` }}
        />
      </div>
    </div>
  )
}
