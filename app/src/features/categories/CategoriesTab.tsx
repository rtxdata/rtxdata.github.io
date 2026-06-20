import { useMemo, useState } from 'react'
import { useData } from '@/state/DataProvider'
import { byCategory, categoryMonthly, subTotals } from '@/lib/aggregate'
import { fmtRsd } from '@/lib/format'
import { katLabel, displayMerchant } from '@/lib/display'
import { Card } from '@/components/ui/card'
import CategoryTrend from '@/components/charts/CategoryTrend'

export default function CategoriesTab() {
  const { txns } = useData()
  const totals = useMemo(() => byCategory(txns), [txns])
  const [picked, setPicked] = useState<string>('')
  const active = picked || totals[0]?.kat1 || ''

  const series = useMemo(() => categoryMonthly(txns, active), [txns, active])
  const subs = useMemo(() => subTotals(txns, active), [txns, active])

  if (totals.length === 0) {
    return <div className="text-muted-foreground">Нет трат для разбивки по категориям</div>
  }

  const sum = series.reduce((s, x) => s + x.total, 0)
  const avg = series.length ? sum / series.length : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1.5">
        {totals.map(({ kat1 }) => (
          <button
            key={kat1}
            type="button"
            onClick={() => setPicked(kat1)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              kat1 === active ? 'border-brand bg-brand/10 font-medium text-brand' : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {katLabel(kat1)}
          </button>
        ))}
      </div>

      <Card className="gap-1 p-6">
        <div className="text-sm text-muted-foreground">В среднем на «{katLabel(active)}»</div>
        <div className="num text-4xl leading-none font-semibold">
          {fmtRsd(avg)}
          <span className="ml-1 text-xl font-normal text-muted-foreground">/мес</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Всего <span className="num">{fmtRsd(sum)}</span> за {series.length} мес
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Расход по месяцам · среднее — пунктиром</h3>
        <CategoryTrend data={series} avg={avg} />
      </section>

      {subs.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {active === 'other' ? 'Крупнейшие получатели' : 'Подкатегории'}
          </h3>
          <ul className="divide-y rounded-lg border bg-card">
            {subs.slice(0, 12).map(({ kat2, total }) => (
              <li key={kat2} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate">{active === 'other' ? displayMerchant(kat2) : kat2}</span>
                <span className="num shrink-0 font-medium">{fmtRsd(total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
