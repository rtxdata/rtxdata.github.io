import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { Transaction } from '@/lib/types'
import { monthlySeries } from '@/lib/aggregate'

const chartConfig: ChartConfig = {
  income: { label: 'Доход', color: 'var(--chart-1)' },
  outflow: { label: 'Расход', color: 'var(--chart-2)' },
  net: { label: 'Баланс', color: 'var(--chart-3)' },
}

const MON = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const monthTick = (m: string) => MON[Number(m.slice(5, 7)) - 1] ?? m

interface MonthlyBarsProps {
  txns: Transaction[]
}

export default function MonthlyBars({ txns }: MonthlyBarsProps) {
  const data = monthlySeries(txns).slice(-12)

  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="month"
          tickFormatter={monthTick}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="outflow" fill="var(--color-outflow)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="net" fill="var(--color-net)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
