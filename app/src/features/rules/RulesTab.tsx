import { Fragment, useMemo, useState } from 'react'
import { useData } from '@/state/DataProvider'
import { useHashParam } from '@/state/hash'
import { readRules, updateRule, deleteRule } from '@/lib/storage'
import { refMatches, type Patterns } from '@/lib/categorize'
import { katLabel } from '@/lib/display'
import { fmtRsd, fmtDateShort } from '@/lib/format'
import { Card } from '@/components/ui/card'

interface Rule {
  kat1: string
  mask: string
  kat2: string
}

type SortKey = 'mask' | 'cat' | 'count' | 'total'

function flatten(p: Patterns): Rule[] {
  const out: Rule[] = []
  for (const k1 of Object.keys(p)) for (const mask of Object.keys(p[k1])) out.push({ kat1: k1, mask, kat2: p[k1][mask] })
  return out
}

export default function RulesTab() {
  const { txns, reload } = useData()
  const [rules, setRules] = useState<Rule[]>(() => flatten(readRules()))
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  // Sort lives in the URL (e.g. #tab=rules&sort=count.desc); default total desc.
  const [sortParam, setSortParam] = useHashParam('sort', 'total.desc')
  const [sortKey, sortDir] = sortParam.split('.') as [SortKey, 'asc' | 'desc']

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortParam(`${k}.${sortDir === 'asc' ? 'desc' : 'asc'}`)
    else setSortParam(`${k}.${k === 'mask' || k === 'cat' ? 'asc' : 'desc'}`)
  }

  const rows = useMemo(
    () =>
      rules.map(r => {
        const key = `${r.kat1}::${r.mask}`
        const value = edits[key] ?? r.mask // live-edited input value (mask = the stored key)
        const matched = txns.filter(t => t.rsum < 0 && refMatches(t.ref, value))
        return { kat1: r.kat1, kat2: r.kat2, mask: r.mask, key, value, edited: value !== r.mask, count: matched.length, total: matched.reduce((s, t) => s + Math.abs(t.rsum), 0), matched }
      }),
    [rules, txns, edits],
  )

  const sorted = useMemo(() => {
    const sgn = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      let c = 0
      if (sortKey === 'count') c = a.count - b.count
      else if (sortKey === 'mask') c = a.value.localeCompare(b.value)
      else if (sortKey === 'cat') c = (a.kat1 + a.kat2).localeCompare(b.kat1 + b.kat2)
      else c = a.total - b.total
      return c * sgn || a.value.localeCompare(b.value)
    })
  }, [rows, sortKey, sortDir])

  function saveMask(r: { kat1: string; mask: string; kat2: string; key: string; value: string; edited: boolean }) {
    if (!r.edited || !r.value.trim()) {
      setEdits(e => { const c = { ...e }; delete c[r.key]; return c })
      return
    }
    updateRule(r.kat1, r.mask, { kat1: r.kat1, mask: r.value.trim(), kat2: r.kat2 })
    setEdits(e => { const c = { ...e }; delete c[r.key]; return c })
    setRules(flatten(readRules()))
    reload()
  }

  function remove(kat1: string, mask: string) {
    deleteRule(kat1, mask)
    setRules(flatten(readRules()))
    reload()
  }

  if (rules.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium">У вас пока нет своих правил</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Правила появляются, когда вы присваиваете категории операциям. Здесь их можно отредактировать или удалить.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Ваши правила категоризации, по охвату. Слишком общая маска (вроде «pr» или «go») ловит лишнее — уточните её или
        удалите. Маска — это подстрока описания операции или <span className="num">/regex/</span>.
      </p>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-xs tracking-wide text-muted-foreground uppercase">
              {(
                [
                  ['mask', 'Маска', false],
                  ['cat', 'Категория', false],
                  ['count', 'Операций', true],
                  ['total', 'Сумма', true],
                ] as [SortKey, string, boolean][]
              ).map(([k, label, right]) => (
                <th
                  key={k}
                  onClick={() => toggleSort(k)}
                  className={`cursor-pointer px-3 py-2 font-medium select-none hover:text-foreground ${right ? 'text-right' : 'text-left'} ${sortKey === k ? 'text-foreground' : ''}`}
                >
                  {label}
                  {sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <Fragment key={r.key}>
                <tr className="border-b">
                  <td className="px-3 py-1.5">
                    <input
                      value={r.value}
                      onChange={e => setEdits(prev => ({ ...prev, [r.key]: e.target.value }))}
                      onBlur={() => saveMask(r)}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                      className={`num w-44 rounded-md border bg-card px-2 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none ${r.edited ? 'border-brand' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    {katLabel(r.kat1)}
                    {r.kat2 && r.kat1 !== 'other' && <span className="text-muted-foreground"> · {r.kat2}</span>}
                  </td>
                  <td className="num px-3 py-1.5 text-right">{r.count}</td>
                  <td className="num px-3 py-1.5 text-right">{fmtRsd(r.total)}</td>
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <button onClick={() => setExpanded(expanded === r.key ? null : r.key)} className="text-xs text-brand hover:underline">
                      {expanded === r.key ? 'Скрыть' : 'Что внутри'}
                    </button>
                    <button onClick={() => remove(r.kat1, r.mask)} className="ml-3 text-xs text-neg hover:underline">
                      Удалить
                    </button>
                  </td>
                </tr>
                {expanded === r.key && (
                  <tr className="border-b bg-muted/30">
                    <td colSpan={5} className="px-3 py-2">
                      {r.matched.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Ничего не совпадает.</p>
                      ) : (
                        <ul className="flex flex-col gap-0.5">
                          {r.matched.slice(0, 25).map(t => (
                            <li key={t.key} className="flex items-center justify-between gap-4 text-xs">
                              <span className="min-w-0 truncate">
                                <span className="num text-muted-foreground">{fmtDateShort(t.date)}</span> · {t.ref}
                              </span>
                              <span className="num shrink-0 text-muted-foreground">{fmtRsd(t.rsum)}</span>
                            </li>
                          ))}
                          {r.matched.length > 25 && (
                            <li className="text-xs text-muted-foreground">…ещё {r.matched.length - 25}</li>
                          )}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
