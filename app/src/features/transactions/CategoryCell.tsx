import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { categoryOptions, refMatches } from '@/lib/categorize'
import type { Patterns } from '@/lib/categorize'
import type { Transaction } from '@/lib/types'
import { katLabel, displayMerchant, defaultMask } from '@/lib/display'
import { useData } from '@/state/DataProvider'
import { useRules } from '../categorize/useRules'

interface Props {
  row: Transaction
  patterns: Patterns
}

export default function CategoryCell({ row, patterns }: Props) {
  const { txns } = useData()
  const { assign } = useRules()
  const options = categoryOptions(patterns)

  const [open, setOpen] = useState(false)
  const [kat1, setKat1] = useState('')
  const [sub, setSub] = useState('')
  const [mask, setMask] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [newCat, setNewCat] = useState('')

  function handleOpen(o: boolean) {
    setOpen(o)
    if (o) {
      // Seed from the current row; default the subcategory to the cleaned merchant
      // name and the mask to a specific-enough keyword.
      setKat1(row.kat1 === 'other' ? '' : row.kat1)
      setSub(row.kat1 !== 'other' && row.kat2 ? row.kat2 : displayMerchant(row.ref))
      setMask(defaultMask(row.ref))
      setAddingCat(false)
      setNewCat('')
    }
  }

  const count = txns.filter(t => refMatches(t.ref, mask)).length
  const subOptions = options.find(o => o.kat1 === kat1)?.kat2 ?? []
  const canApply = !!kat1 && sub.trim().length > 0 && mask.trim().length > 0
  const isOther = row.kat1 === 'other'

  function apply() {
    if (!canApply) return
    assign(mask.trim(), kat1, sub.trim())
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger className="flex items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-muted">
        <Badge
          variant={isOther ? 'outline' : 'secondary'}
          className={isOther ? 'border-dashed text-muted-foreground' : ''}
        >
          {katLabel(row.kat1)}
        </Badge>
        {row.kat2 && !isOther && <Badge variant="outline">{row.kat2}</Badge>}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80">
        <div>
          <div className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Категория</div>
          <div className="grid grid-cols-2 gap-1">
            {options.map(({ kat1: k }) => (
              <button
                key={k}
                type="button"
                onClick={() => setKat1(k)}
                className={`rounded-md border px-2 py-1 text-left text-xs transition-colors ${
                  k === kat1 ? 'border-brand bg-brand/10 font-medium text-brand' : 'border-border hover:bg-muted'
                }`}
              >
                {katLabel(k)}
              </button>
            ))}
            {/* A freshly-typed custom category (not yet in the classifier) shows selected. */}
            {kat1 && !options.some(o => o.kat1 === kat1) && (
              <button type="button" className="rounded-md border border-brand bg-brand/10 px-2 py-1 text-left text-xs font-medium text-brand">
                {katLabel(kat1)}
              </button>
            )}
            {addingCat ? (
              <input
                autoFocus
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCat.trim()) {
                    setKat1(newCat.trim())
                    setAddingCat(false)
                    setNewCat('')
                  } else if (e.key === 'Escape') {
                    setAddingCat(false)
                    setNewCat('')
                  }
                }}
                placeholder="Название категории"
                className="col-span-2 rounded-md border bg-card px-2 py-1 text-xs shadow-xs focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingCat(true)}
                className="rounded-md border border-dashed px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted"
              >
                + Новая…
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Подкатегория</div>
          <input
            value={sub}
            onChange={e => setSub(e.target.value)}
            placeholder="напр. Авиабилеты"
            className="w-full rounded-md border bg-card px-2.5 py-1.5 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
          {subOptions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {subOptions.slice(0, 10).map(k2 => (
                <button
                  key={k2}
                  type="button"
                  onClick={() => setSub(k2)}
                  className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  {k2}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Маска</div>
          <input
            value={mask}
            onChange={e => setMask(e.target.value)}
            placeholder="ключевое слово или /regex/i"
            className="num w-full rounded-md border bg-card px-2.5 py-1.5 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Подстрока описания или <span className="num">/regex/</span>.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Затронет <span className="num">{count}</span> транз.
          </span>
          <Button size="sm" onClick={apply} disabled={!canApply}>
            Применить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
