import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select'
import { categoryOptions } from '@/lib/categorize'
import type { Patterns } from '@/lib/categorize'
import type { Transaction } from '@/lib/types'
import { katLabel, defaultMask } from '@/lib/display'
import { useRules } from '../categorize/useRules'
import RuleDialog from './RuleDialog'

interface Props {
  selectedRows: Transaction[]
  patterns: Patterns
  onClear: () => void
}

export default function BulkBar({ selectedRows, patterns, onClear }: Props) {
  const { assignMany } = useRules()
  const [pending, setPending] = useState<{ kat1: string; kat2: string } | null>(null)
  const options = categoryOptions(patterns)

  if (selectedRows.length === 0) return null

  // One keyword rule per distinct selected merchant, so the whole selection is covered.
  const keywords = Array.from(new Set(selectedRows.map(r => defaultMask(r.ref)).filter(Boolean)))
  const label = selectedRows.length === 1 ? selectedRows[0].ref : `${selectedRows.length} операций`

  function handleConfirm() {
    if (!pending) return
    assignMany(keywords, pending.kat1, pending.kat2)
    setPending(null)
    onClear()
  }

  function handleMarkTransfer() {
    assignMany(keywords, 'transfer', 'movement')
    onClear()
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-brand/5 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">
          Выбрано <strong className="num text-foreground">{selectedRows.length}</strong>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Категория</span>
          <Select
            onValueChange={v => {
              const s = v as string | null
              if (s) setPending({ kat1: s.split('/')[0], kat2: s.split('/')[1] })
            }}
          >
            <SelectTrigger size="sm" className="h-7 min-w-36">
              <SelectValue placeholder="Выбрать…" />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ kat1, kat2 }) => (
                <SelectGroup key={kat1}>
                  <SelectLabel>{katLabel(kat1)}</SelectLabel>
                  {kat2.map(k2 => (
                    <SelectItem key={`${kat1}/${k2}`} value={`${kat1}/${k2}`}>
                      {k2}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={handleMarkTransfer}>
          Пометить как перевод
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
          Снять выделение
        </Button>
      </div>

      {pending && (
        <RuleDialog
          open
          merchant={label}
          substrings={keywords}
          kat1={pending.kat1}
          kat2={pending.kat2}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </>
  )
}
