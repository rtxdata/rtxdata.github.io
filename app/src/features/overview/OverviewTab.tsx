import { useMemo, useState } from 'react'
import { useData } from '@/state/DataProvider'
import { cashFlow, monthlySeries, biggestMovers, prevMonth } from '@/lib/aggregate'
import { fmtRsd } from '@/lib/format'
import { katLabel } from '@/lib/display'
import KpiCard from '@/components/charts/KpiCard'
import MonthlyBars from '@/components/charts/MonthlyBars'

// A month is "partial" if it's the most recent month and the latest transaction
// in the data falls before that month's last day (e.g. an export taken mid-June).
function lastDayOfMonth(month: string): number {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export default function OverviewTab() {
  const { txns } = useData()

  const series = useMemo(() => monthlySeries(txns), [txns])
  const maxDate = useMemo(() => txns.reduce((m, t) => (t.date > m ? t.date : m), ''), [txns])

  const latestMonth = series.length ? series[series.length - 1].month : ''
  const partialMonth = useMemo(() => {
    if (!latestMonth || maxDate.slice(0, 7) !== latestMonth) return ''
    return Number(maxDate.slice(8, 10)) < lastDayOfMonth(latestMonth) ? latestMonth : ''
  }, [latestMonth, maxDate])

  // Default to the latest COMPLETE month so a mid-month export doesn't open on a
  // scary half-finished month (0 income, huge negative net).
  const defaultMonth =
    partialMonth && series.length > 1 ? series[series.length - 2].month : latestMonth

  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const effectiveMonth = selectedMonth || defaultMonth
  const months = useMemo(() => series.map((s) => s.month), [series])

  const zero = { income: 0, outflow: 0, net: 0, savingsRate: 0 }
  const current = useMemo(() => (effectiveMonth ? cashFlow(txns, effectiveMonth) : zero), [txns, effectiveMonth])
  const prior = useMemo(() => (effectiveMonth ? cashFlow(txns, prevMonth(effectiveMonth)) : zero), [txns, effectiveMonth])
  const movers = useMemo(() => (effectiveMonth ? biggestMovers(txns, effectiveMonth).slice(0, 4) : []), [txns, effectiveMonth])

  if (txns.length === 0) {
    return <div className="text-muted-foreground">Нет данных</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Месяц</span>
        <select
          aria-label="Месяц"
          value={effectiveMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="num h-8 rounded-md border bg-card px-2.5 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
              {m === partialMonth ? '  · неполный' : ''}
            </option>
          ))}
        </select>
        {effectiveMonth === partialMonth && (
          <span className="rounded-full bg-movement/15 px-2 py-0.5 text-xs font-medium text-movement">
            Неполный месяц
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Доход" value={fmtRsd(current.income)} delta={current.income - prior.income} deltaFormatted={fmtRsd(Math.abs(current.income - prior.income))} />
        <KpiCard label="Расход" value={fmtRsd(current.outflow)} delta={current.outflow - prior.outflow} positiveIsGood={false} deltaFormatted={fmtRsd(Math.abs(current.outflow - prior.outflow))} />
        <KpiCard label="Баланс" value={fmtRsd(current.net)} delta={current.net - prior.net} deltaFormatted={fmtRsd(Math.abs(current.net - prior.net))} />
        <KpiCard label="Норма сбережений" value={`${(current.savingsRate * 100).toFixed(0)}%`} delta={current.savingsRate - prior.savingsRate} deltaFormatted={`${Math.abs((current.savingsRate - prior.savingsRate) * 100).toFixed(0)} п.п.`} />
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Доходы и расходы по месяцам</h3>
        <MonthlyBars txns={txns} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Что изменилось <span className="text-muted-foreground/60">· к {prevMonth(effectiveMonth)}</span>
        </h3>
        {movers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных за предыдущий месяц</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {movers.map(({ kat1, delta }) => (
              <li key={kat1} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium">{katLabel(kat1)}</span>
                <span className={`num font-medium ${delta > 0 ? 'text-neg' : 'text-pos'}`}>
                  {delta > 0 ? '+' : '−'}
                  {fmtRsd(Math.abs(delta))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
