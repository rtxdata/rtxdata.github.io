import { detectSubscriptions, totalMonthly } from '@/lib/subscriptions'
import { fmtRsd } from '@/lib/format'
import { displayMerchant } from '@/lib/display'
import type { Transaction, Subscription } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

const CADENCE_LABEL: Record<Subscription['cadence'], string> = {
  weekly: 'еженедельно',
  monthly: 'ежемесячно',
  annual: 'ежегодно',
}

interface Props {
  txns: Transaction[]
}

export default function SubscriptionsCard({ txns }: Props) {
  const subs = detectSubscriptions(txns)
  const total = totalMonthly(subs)

  if (subs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium">Регулярных платежей не обнаружено</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Появятся, когда наберётся хотя бы три повторяющихся списания у одного получателя.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero: the single number worth seeing — committed monthly spend. */}
      <Card className="gap-1 p-6">
        <div className="text-sm text-muted-foreground">Регулярные платежи</div>
        <div className="num text-4xl leading-none font-semibold">
          {fmtRsd(total)}
          <span className="ml-1 text-xl font-normal text-muted-foreground">/мес</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {subs.length} {subs.length === 1 ? 'подписка' : 'подписок'} · ≈ <span className="num">{fmtRsd(total * 12)}</span> в год
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Получатель</TableHead>
              <TableHead>Периодичность</TableHead>
              <TableHead className="text-right">Списание</TableHead>
              <TableHead className="text-right">В месяц</TableHead>
              <TableHead>Последнее</TableHead>
              <TableHead>Ожидается</TableHead>
              <TableHead className="text-right">Раз</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.map((sub) => (
              <TableRow key={sub.merchant + sub.cadence}>
                <TableCell className="font-medium">{displayMerchant(sub.merchant)}</TableCell>
                <TableCell className="text-muted-foreground">{CADENCE_LABEL[sub.cadence]}</TableCell>
                <TableCell className="num text-right">{fmtRsd(sub.amountRsd)}</TableCell>
                <TableCell className="num text-right font-medium">{fmtRsd(sub.monthlyRsd)}</TableCell>
                <TableCell className="num text-muted-foreground">{sub.lastDate}</TableCell>
                <TableCell className="num text-muted-foreground">{sub.nextExpected}</TableCell>
                <TableCell className="num text-right text-muted-foreground">{sub.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground">
        Определяется эвристически по повторяющимся спискам — возможны неточности.
      </p>
    </div>
  )
}
