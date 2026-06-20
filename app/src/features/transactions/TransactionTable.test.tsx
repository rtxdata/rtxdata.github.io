import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Transaction } from '@/lib/types'
import TransactionTable from './TransactionTable'
import ResultKpis from './ResultKpis'

// jsdom gives 0×0 bounding boxes; virtualizer won't render rows unless we lie about size
const origGetBoundingClientRect = Element.prototype.getBoundingClientRect

beforeAll(() => {
  Element.prototype.getBoundingClientRect = () => ({
    width: 800, height: 600,
    top: 0, left: 0, right: 800, bottom: 600,
    x: 0, y: 0,
    toJSON() { return this },
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 600 })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 600 })
})

afterAll(() => {
  Element.prototype.getBoundingClientRect = origGetBoundingClientRect
})

const makeRow = (o: Partial<Transaction>): Transaction => ({
  key: Math.random().toString(), id: '', sum: -1000, rsum: -1000, curr: 'RSD',
  kat1: 'food', kat2: 'cafe', date: '2026-01-15', ts: Date.parse('2026-01-15'),
  type: 'POS', card: '', ref: 'McDonalds', ref2: '', acc: '1234', cls: 'consumption',
  file: 'f', ...o,
})

const rows: Transaction[] = [
  makeRow({ key: '1', ref: 'McDonalds', rsum: -1500, curr: 'RSD' }),
  makeRow({ key: '2', ref: 'Starbucks', rsum: -800, curr: 'EUR', sum: -8 }),
  makeRow({ key: '3', ref: 'Netflix', rsum: -2000, curr: 'RSD' }),
]

describe('TransactionTable', () => {
  it('renders merchant ref text for visible rows', () => {
    render(<TransactionTable rows={rows} />)
    expect(screen.getByText('McDonalds')).toBeInTheDocument()
  })

  it('renders an RSD-formatted amount and EUR native amount', () => {
    render(<TransactionTable rows={rows} />)
    // fmtRsd(-1500) → '-1 500 RSD' (Intl ru-RU grouping)
    const rsds = screen.getAllByText(/RSD/)
    expect(rsds.length).toBeGreaterThan(0)
    // row with curr:'EUR' should show fmtNative(-8, 'EUR') — an EUR-formatted string
    const eurs = screen.getAllByText(/EUR/)
    expect(eurs.length).toBeGreaterThan(0)
  })
})

describe('ResultKpis', () => {
  it('shows count equal to number of rows', () => {
    render(<ResultKpis rows={rows} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows sum label', () => {
    render(<ResultKpis rows={rows} />)
    const rsds = screen.getAllByText(/RSD/)
    expect(rsds.length).toBeGreaterThan(0)
  })
})
