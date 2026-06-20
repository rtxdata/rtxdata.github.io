import { useState, useEffect, type ReactNode } from 'react'
import { useData } from '@/state/DataProvider'
import { categoryOptions } from '@/lib/categorize'
import { katLabel } from '@/lib/display'
import { shortAcc } from '@/lib/format'
import type { Filters, Transaction } from '@/lib/types'

const TYPE_BUCKETS: { label: string; codes: string[] }[] = [
  { label: 'Покупки', codes: ['POS'] },
  { label: 'Переводы', codes: ['PmtDom'] },
  { label: 'Наличные', codes: ['ATM', 'MobCash'] },
  { label: 'Обмен', codes: ['ExchBuy', 'ExchSell'] },
  { label: 'Доходы', codes: ['Income', 'IncomeCash', 'PR'] },
]

const isoDate = (d: Date) => d.toISOString().slice(0, 10)
const startOfMonth = (d: Date) => isoDate(new Date(d.getFullYear(), d.getMonth(), 1))
const endOfMonth = (d: Date) => isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
const monthsAgo = (n: number) => {
  const now = new Date()
  return isoDate(new Date(now.getFullYear(), now.getMonth() - n + 1, 1))
}

const DATE_PRESETS = [
  { label: 'Этот месяц', preset: () => { const now = new Date(); return { from: startOfMonth(now), to: isoDate(now) } } },
  { label: 'Прошлый', preset: () => { const now = new Date(); const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1); return { from: startOfMonth(prev), to: endOfMonth(prev) } } },
  { label: '3 мес', preset: () => ({ from: monthsAgo(3), to: isoDate(new Date()) }) },
  { label: '6 мес', preset: () => ({ from: monthsAgo(6), to: isoDate(new Date()) }) },
  { label: '12 мес', preset: () => ({ from: monthsAgo(12), to: isoDate(new Date()) }) },
]

interface Props {
  txns: Transaction[]
  filters: Filters
  setFilters: (f: Filters) => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">{title}</div>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
        active ? 'border-brand bg-brand/10 font-medium text-brand' : 'border-border text-muted-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

const inputCls =
  'w-full rounded-md border bg-card px-2.5 py-1.5 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none'

export default function FilterRail({ txns, filters, setFilters }: Props) {
  const { patterns } = useData()
  const cats = categoryOptions(patterns)

  const [localText, setLocalText] = useState(filters.text)
  useEffect(() => { setLocalText(filters.text) }, [filters.text])

  const distinctAccs = Array.from(new Set(txns.map((t) => t.acc))).sort()
  const distinctCurrs = Array.from(new Set(txns.map((t) => t.curr))).sort()

  const toggleListItem = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  const isBucketActive = (codes: string[]) => codes.every((c) => filters.types.includes(c))
  const toggleBucket = (codes: string[]) =>
    setFilters(
      isBucketActive(codes)
        ? { ...filters, types: filters.types.filter((t) => !codes.includes(t)) }
        : { ...filters, types: Array.from(new Set([...filters.types, ...codes])) },
    )

  const realSpending = filters.classes.includes('consumption')

  return (
    <div className="flex flex-col gap-5 text-sm">
      {/* Signature: the real-spending / money-movement split, made tactile. */}
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setFilters({ ...filters, classes: ['consumption'] })}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${realSpending ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Реальные траты
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, classes: [] })}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${!realSpending ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Все движения
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {realSpending ? 'Без обменов валют, снятий и переводов.' : 'Включая обмены, наличные и крипто.'}
        </p>
      </div>

      <Section title="Поиск">
        <input
          type="text"
          placeholder="Поиск по получателю"
          value={localText}
          onChange={(e) => { setLocalText(e.target.value); setFilters({ ...filters, text: e.target.value }) }}
          className={inputCls}
        />
      </Section>

      <Section title="Категория">
        <div className="flex flex-col gap-0.5">
          {cats.map(({ kat1 }) => (
            <label key={kat1} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted">
              <input
                type="checkbox"
                checked={filters.cats.includes(kat1)}
                onChange={() => setFilters({ ...filters, cats: toggleListItem(filters.cats, kat1) })}
                className="accent-brand"
              />
              {katLabel(kat1)}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted">
            <input
              type="checkbox"
              checked={filters.cats.includes('other')}
              onChange={() => setFilters({ ...filters, cats: toggleListItem(filters.cats, 'other') })}
              className="accent-brand"
            />
            <span className="text-muted-foreground">Без категории</span>
          </label>
        </div>
      </Section>

      {distinctAccs.length > 0 && (
        <Section title="Счёт">
          <div className="flex flex-wrap gap-1.5">
            {distinctAccs.map((acc) => (
              <Chip key={acc} active={filters.accs.includes(acc)} onClick={() => setFilters({ ...filters, accs: toggleListItem(filters.accs, acc) })}>
                <span className="num">{shortAcc(acc)}</span>
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {distinctCurrs.length > 0 && (
        <Section title="Валюта">
          <div className="flex flex-wrap gap-1.5">
            {distinctCurrs.map((curr) => (
              <Chip key={curr} active={filters.currs.includes(curr)} onClick={() => setFilters({ ...filters, currs: toggleListItem(filters.currs, curr) })}>
                {curr}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      <Section title="Тип операции">
        <div className="flex flex-wrap gap-1.5">
          {TYPE_BUCKETS.map(({ label, codes }) => (
            <Chip key={label} active={isBucketActive(codes)} onClick={() => toggleBucket(codes)}>
              {label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Сумма, RSD">
        <div className="flex items-center gap-2">
          <input type="number" placeholder="от" value={filters.minRsd ?? ''} onChange={(e) => setFilters({ ...filters, minRsd: e.target.value ? Number(e.target.value) : null })} className={`${inputCls} num`} />
          <span className="text-muted-foreground">—</span>
          <input type="number" placeholder="до" value={filters.maxRsd ?? ''} onChange={(e) => setFilters({ ...filters, maxRsd: e.target.value ? Number(e.target.value) : null })} className={`${inputCls} num`} />
        </div>
      </Section>

      <Section title="Период">
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRESETS.map(({ label, preset }) => (
            <Chip key={label} active={false} onClick={() => { const { from, to } = preset(); setFilters({ ...filters, from, to }) }}>
              {label}
            </Chip>
          ))}
          {(filters.from || filters.to) && (
            <button type="button" onClick={() => setFilters({ ...filters, from: null, to: null })} className="rounded-full px-2.5 py-1 text-xs text-neg hover:underline">
              Сбросить
            </button>
          )}
        </div>
        {(filters.from || filters.to) && (
          <div className="num mt-1 text-xs text-muted-foreground">
            {filters.from ?? '…'} — {filters.to ?? '…'}
          </div>
        )}
      </Section>
    </div>
  )
}
