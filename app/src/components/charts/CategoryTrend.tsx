import { BarChart, Bar, XAxis, CartesianGrid, ReferenceLine } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

const config: ChartConfig = { total: { label: 'Расход', color: 'var(--chart-2)' } }
const MON = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const monthTick = (m: string) => MON[Number(m.slice(5, 7)) - 1] ?? m

interface Props {
  data: { month: string; total: number }[]
  avg: number
}

export default function CategoryTrend({ data, avg }: Props) {
  return (
    <ChartContainer config={config} className="h-60 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tickFormatter={monthTick} tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine y={avg} stroke="var(--color-movement)" strokeDasharray="4 4" strokeWidth={1.5} />
        <Bar dataKey="total" fill="var(--color-total)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
