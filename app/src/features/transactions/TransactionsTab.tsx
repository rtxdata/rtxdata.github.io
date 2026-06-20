import { useState } from 'react'
import { useData } from '@/state/DataProvider'
import { useFilters, applyFilters } from '@/state/useFilters'
import type { Transaction } from '@/lib/types'
import FilterRail from './FilterRail'
import ResultKpis from './ResultKpis'
import TransactionTable from './TransactionTable'
import MerchantGroups from './MerchantGroups'
import BulkBar from './BulkBar'
import CoverageBar from '../categorize/CoverageBar'

export default function TransactionsTab() {
  const { txns, patterns } = useData()
  const { filters, setFilters } = useFilters()
  const filtered = applyFilters(txns, filters)
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([])
  const [view, setView] = useState<'list' | 'merchants'>('list')

  return (
    <div className="flex flex-col gap-5">
      <CoverageBar txns={txns} />
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <FilterRail txns={txns} filters={filters} setFilters={setFilters} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <ResultKpis rows={filtered} />
            <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${view === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Список
              </button>
              <button
                type="button"
                onClick={() => setView('merchants')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${view === 'merchants' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                По получателям
              </button>
            </div>
          </div>

          {selectedRows.length > 0 && (
            <BulkBar selectedRows={selectedRows} patterns={patterns} onClear={() => setSelectedRows([])} />
          )}

          {view === 'list' ? (
            <TransactionTable rows={filtered} patterns={patterns} onSelectionChange={setSelectedRows} />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Нажмите на получателя, чтобы выбрать все его операции и присвоить категорию.
              </p>
              <MerchantGroups rows={filtered} onSelect={setSelectedRows} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
