import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DataProvider } from '@/state/DataProvider'
import type { Transaction, Filters } from '@/lib/types'
import { EMPTY_FILTERS } from '@/state/useFilters'
import FilterRail from './FilterRail'

const BASE_PATTERNS = { food: { mcdonald: 'McDonalds' } }

const makeRow = (o: Partial<Transaction> = {}): Transaction => ({
  key: Math.random().toString(), id: '', sum: -1000, rsum: -1000, curr: 'RSD',
  kat1: 'food', kat2: 'cafe', date: '2026-01-15', ts: Date.parse('2026-01-15'),
  type: 'POS', card: '', ref: 'McDonalds', ref2: '', acc: 'ACC123', cls: 'consumption',
  file: 'f', ...o,
})

const mockTxns: Transaction[] = [
  makeRow({ key: '1', ref: 'MAXI supermarket', acc: 'ACC123', curr: 'RSD' }),
  makeRow({ key: '2', ref: 'Netflix', acc: 'ACC456', curr: 'EUR' }),
]

function Wrapper({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>
}

describe('FilterRail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE_PATTERNS) }))
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('calls setFilters with text when user types in the search input', async () => {
    const user = userEvent.setup()
    const setFilters = vi.fn()

    render(
      <Wrapper>
        <FilterRail txns={mockTxns} filters={EMPTY_FILTERS} setFilters={setFilters} />
      </Wrapper>
    )

    const searchInput = screen.getByPlaceholderText(/поиск/i)
    await user.type(searchInput, 'maxi')

    const lastCall = setFilters.mock.calls[setFilters.mock.calls.length - 1]?.[0] as Filters
    expect(lastCall).toBeDefined()
    expect(lastCall.text).toBe('maxi')
  })
})

describe('SpendingToggle', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE_PATTERNS) }))
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('calls setFilters with classes=[] when "Все движения" is clicked', async () => {
    const user = userEvent.setup()
    const setFilters = vi.fn()
    const filters: Filters = { ...EMPTY_FILTERS, classes: ['consumption'] }

    render(
      <Wrapper>
        <FilterRail txns={mockTxns} filters={filters} setFilters={setFilters} />
      </Wrapper>
    )

    const allMovementsBtn = screen.getByRole('button', { name: /все движения/i })
    await user.click(allMovementsBtn)

    const lastCall = setFilters.mock.calls[setFilters.mock.calls.length - 1]?.[0] as Filters
    expect(lastCall).toBeDefined()
    expect(lastCall.classes).toEqual([])
  })

  it('preserves other filters when toggling spending mode', async () => {
    const user = userEvent.setup()
    const setFilters = vi.fn()
    const filters: Filters = { ...EMPTY_FILTERS, text: 'maxi', classes: [] }

    render(
      <Wrapper>
        <FilterRail txns={mockTxns} filters={filters} setFilters={setFilters} />
      </Wrapper>
    )

    const realSpendingBtn = screen.getByRole('button', { name: /реальные траты/i })
    await user.click(realSpendingBtn)

    const lastCall = setFilters.mock.calls[setFilters.mock.calls.length - 1]?.[0] as Filters
    expect(lastCall).toBeDefined()
    expect(lastCall.classes).toEqual(['consumption'])
    expect(lastCall.text).toBe('maxi')
  })
})
