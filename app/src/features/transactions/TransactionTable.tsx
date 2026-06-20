import { useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Transaction } from '@/lib/types'
import type { Patterns } from '@/lib/categorize'
import { fmtRsd, fmtNative, fmtDateShort, shortAcc } from '@/lib/format'
import { katLabel, clsLabel, MOVEMENT_CLASSES } from '@/lib/display'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import CategoryCell from './CategoryCell'

interface Props {
  rows: Transaction[]
  patterns?: Patterns
  onSelectionChange?: (selected: Transaction[]) => void
}

function makeColumns(patterns: Patterns): ColumnDef<Transaction>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={v => table.toggleAllRowsSelected(!!v)}
          aria-label="Выбрать все"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
          aria-label="Выбрать строку"
        />
      ),
      size: 40,
      enableSorting: false,
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Дата',
      cell: info => (
        <span className="num whitespace-nowrap text-muted-foreground">
          {fmtDateShort(info.getValue<string>())}
        </span>
      ),
      size: 84,
    },
    {
      id: 'ref',
      accessorKey: 'ref',
      header: 'Получатель',
      cell: info => (
        <span className="block max-w-[22rem] truncate" title={info.getValue<string>()}>
          {info.getValue<string>()}
        </span>
      ),
      size: 240,
    },
    {
      id: 'category',
      header: 'Категория',
      accessorFn: row => `${row.kat1}/${row.kat2}`,
      cell: info => {
        const row = info.row.original
        if (Object.keys(patterns).length === 0) {
          return (
            <span className="flex gap-1">
              <Badge variant="secondary">{katLabel(row.kat1)}</Badge>
              {row.kat2 && <Badge variant="outline">{row.kat2}</Badge>}
            </span>
          )
        }
        return <CategoryCell row={row} patterns={patterns} />
      },
      enableSorting: true,
      size: 200,
    },
    {
      id: 'amount',
      header: 'Сумма',
      accessorKey: 'rsum',
      cell: info => {
        const row = info.row.original
        const positive = row.rsum > 0
        return (
          <span className="flex flex-col items-end leading-tight">
            <span className={`num ${positive ? 'text-pos' : ''}`}>{fmtNative(row.sum, row.curr)}</span>
            {row.curr !== 'RSD' && (
              <span className="num text-xs text-muted-foreground">{fmtRsd(row.rsum)}</span>
            )}
          </span>
        )
      },
      size: 132,
    },
    {
      id: 'acc',
      accessorKey: 'acc',
      header: 'Счёт',
      cell: info => <span className="num text-muted-foreground">{shortAcc(info.getValue<string>())}</span>,
      size: 84,
    },
    {
      id: 'cls',
      accessorKey: 'cls',
      header: 'Класс',
      cell: info => {
        const cls = info.getValue<string>()
        const ghost = MOVEMENT_CLASSES.has(cls)
        return (
          <Badge variant="outline" className={ghost ? 'border-movement/30 text-movement' : ''}>
            {clsLabel(cls)}
          </Badge>
        )
      },
      size: 110,
    },
  ]
}

const ROW_HEIGHT = 48

export default function TransactionTable({ rows, patterns = {}, onSelectionChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = makeColumns(patterns)

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: updater => {
      setRowSelection(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (onSelectionChange) {
          const selectedRows = Object.keys(next)
            .filter(id => next[id])
            .map(id => rows[parseInt(id, 10)])
            .filter((r): r is Transaction => r !== undefined)
          onSelectionChange(selectedRows)
        }
        return next
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  })

  const tableRows = table.getRowModel().rows

  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalHeight = virtualizer.getTotalSize()

  return (
    <div
      ref={scrollRef}
      style={{ height: '70vh', overflow: 'auto' }}
      className="rounded-md border"
    >
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => {
                const alignRight = h.column.id === 'amount'
                const sortable = h.column.getCanSort()
                return (
                  <th
                    key={h.id}
                    style={{ width: h.column.getSize() }}
                    className={`whitespace-nowrap border-b px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase select-none ${alignRight ? 'text-right' : 'text-left'} ${sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                    onClick={sortable ? h.column.getToggleSortingHandler() : undefined}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' && ' ↑'}
                    {h.column.getIsSorted() === 'desc' && ' ↓'}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {/* Top spacer */}
          {virtualItems.length > 0 && virtualItems[0].start > 0 && (
            <tr style={{ height: virtualItems[0].start }}>
              <td colSpan={columns.length} />
            </tr>
          )}
          {virtualItems.map(vRow => {
            const row = tableRows[vRow.index]
            return (
              <tr
                key={row.id}
                style={{ height: vRow.size }}
                className={`border-b hover:bg-muted/40 ${row.getIsSelected() ? 'bg-muted/60' : ''}`}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 align-middle ${cell.column.id === 'amount' ? 'text-right' : ''}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
          {/* Bottom spacer */}
          {virtualItems.length > 0 && (() => {
            const last = virtualItems[virtualItems.length - 1]
            const remaining = totalHeight - last.end
            return remaining > 0 ? (
              <tr style={{ height: remaining }}>
                <td colSpan={columns.length} />
              </tr>
            ) : null
          })()}
        </tbody>
      </table>
    </div>
  )
}
