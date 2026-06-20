export interface KpiCardProps {
  /** Label shown above the value */
  label: string
  /** Pre-formatted primary value */
  value: string
  /** Signed change vs prior period (the metric's actual movement) */
  delta?: number
  /** Pre-formatted absolute delta string (the sign is added from `delta`) */
  deltaFormatted?: string
  /** Whether an increase is good (green). Spending: false. Default: true. */
  positiveIsGood?: boolean
}

export default function KpiCard({ label, value, delta, deltaFormatted, positiveIsGood = true }: KpiCardProps) {
  const d = delta ?? 0
  const good = d === 0 ? null : (d > 0) === positiveIsGood
  const tone = good === null ? 'text-muted-foreground' : good ? 'text-pos' : 'text-neg'
  const sign = d > 0 ? '+' : d < 0 ? '−' : ''
  const showDelta = delta !== undefined || deltaFormatted !== undefined

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-xs">
      <div className="text-xs font-medium tracking-wide text-muted-foreground">{label}</div>
      <div className="num text-2xl leading-none font-semibold">{value}</div>
      {showDelta && (
        <div className={`num text-xs ${tone}`}>
          {sign}
          {deltaFormatted ?? String(Math.abs(d))}
        </div>
      )}
    </div>
  )
}
