import { useData } from '@/state/DataProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { katLabel } from '@/lib/display'

interface Props {
  open: boolean
  /** Display label for what's being categorized (merchant name or "N получателей"). */
  merchant: string
  /** One or more keyword rules that will be created. */
  substrings: string[]
  kat1: string
  kat2: string
  onConfirm: () => void
  onClose: () => void
}

export default function RuleDialog({ open, merchant, substrings, kat1, kat2, onConfirm, onClose }: Props) {
  const { txns } = useData()
  const lowers = substrings.map(s => s.toLowerCase())
  const count = txns.filter(t => lowers.some(s => t.ref.toLowerCase().includes(s))).length
  const cat = kat2 && kat1 !== 'other' ? `${katLabel(kat1)} · ${kat2}` : katLabel(kat1)
  const many = substrings.length > 1

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{many ? 'Категоризировать выбранное' : 'Создать правило'}</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          Категоризировать «<strong>{merchant}</strong>» как <strong>{cat}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          Затронет <strong className="num">{count}</strong>{' '}
          {many ? `транзакций по ${substrings.length} получателям` : `транзакций с «${substrings[0]}»`}. Правило сохранится для будущих операций.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onConfirm}>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
