import { describe, it, expect } from 'vitest'
import { cashFlow, coverage, categoryMonthly, subTotals } from './aggregate'
import type { Transaction } from './types'

const t = (o: Partial<Transaction>): Transaction => ({
  key: Math.random().toString(),
  id: '',
  sum: 0,
  rsum: 0,
  curr: 'RSD',
  kat1: 'other',
  kat2: '',
  date: '2026-06-01',
  ts: 0,
  type: 'POS',
  card: '',
  ref: '',
  ref2: '',
  acc: 'A',
  cls: 'consumption',
  file: 'f',
  ...o,
})

describe('cashFlow', () => {
  it('nets income and outflow for the month', () => {
    const r = cashFlow(
      [
        t({ rsum: 1000, cls: 'income', date: '2026-06-02' }),
        t({ rsum: -400, cls: 'consumption', date: '2026-06-03' }),
        t({ rsum: -9999, cls: 'cash', date: '2026-06-03' }), // excluded
      ],
      '2026-06',
    )
    expect(r.income).toBe(1000)
    expect(r.outflow).toBe(400)
    expect(r.net).toBe(600)
    expect(r.savingsRate).toBeCloseTo(0.6)
  })
})

describe('coverage', () => {
  it('is the categorized share of consumption value', () => {
    const r = coverage([t({ rsum: -100, kat1: 'food' }), t({ rsum: -900, kat1: 'other' })])
    expect(r.pct).toBeCloseTo(0.1)
    expect(r.otherCount).toBe(1)
  })
})

describe('categoryMonthly', () => {
  it('returns monthly totals for one category across the data span', () => {
    const rows = [
      t({ rsum: -100, kat1: 'food', date: '2026-01-05' }),
      t({ rsum: -50, kat1: 'food', date: '2026-02-05' }),
      t({ rsum: -999, kat1: 'taxi', date: '2026-02-05' }), // other category, extends span
    ]
    expect(categoryMonthly(rows, 'food')).toEqual([
      { month: '2026-01', total: 100 },
      { month: '2026-02', total: 50 },
    ])
  })
})

describe('subTotals', () => {
  it('sums kat2 within a category, descending', () => {
    const rows = [
      t({ rsum: -100, kat1: 'food', kat2: 'McDonalds' }),
      t({ rsum: -300, kat1: 'food', kat2: 'KFC' }),
      t({ rsum: -999, kat1: 'taxi', kat2: 'Uber' }),
    ]
    expect(subTotals(rows, 'food')).toEqual([
      { kat2: 'KFC', total: 300 },
      { kat2: 'McDonalds', total: 100 },
    ])
  })
})
