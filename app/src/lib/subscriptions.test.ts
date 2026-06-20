import { describe, it, expect } from 'vitest'
import { detectSubscriptions, normalizeMerchant, totalMonthly } from './subscriptions'
import type { Transaction } from './types'

const charge = (date: string, rsum: number, ref: string): Transaction => ({
  key: date + ref, id: '', sum: rsum, rsum, curr: 'RSD', kat1: 'internet', kat2: 'Netflix',
  date, ts: Date.parse(date), type: 'POS', card: '', ref, ref2: '', acc: 'A',
  cls: 'consumption', file: 'f',
})

describe('normalizeMerchant', () => {
  it('strips trailing ids/digits', () => {
    expect(normalizeMerchant('NETFLIX.COM 12345')).toBe(normalizeMerchant('NETFLIX.COM 99887'))
  })
})

describe('detectSubscriptions', () => {
  it('flags a stable monthly charge', () => {
    const subs = detectSubscriptions([
      charge('2026-01-15', -1100, 'NETFLIX.COM 1'),
      charge('2026-02-15', -1100, 'NETFLIX.COM 2'),
      charge('2026-03-15', -1150, 'NETFLIX.COM 3'),
    ])
    expect(subs).toHaveLength(1)
    expect(subs[0].cadence).toBe('monthly')
    expect(subs[0].monthlyRsd).toBeCloseTo(1100, 0) // median of [1100,1100,1150]
    expect(subs[0].nextExpected).toBe('2026-04-14') // +30d from last (median gap 29.5 -> 30)
  })
  it('ignores one-off and irregular spend', () => {
    expect(detectSubscriptions([
      charge('2026-01-01', -500, 'RANDOM A'),
      charge('2026-01-09', -9000, 'RANDOM B'),
    ])).toHaveLength(0)
  })
})

describe('totalMonthly', () => {
  it('sums amortized cost', () => {
    expect(totalMonthly([
      { merchant: 'x', cadence: 'monthly', amountRsd: 1000, monthlyRsd: 1000, count: 3,
        lastDate: '2026-03-01', nextExpected: '2026-03-31', kat1: 'internet', kat2: '' },
    ])).toBe(1000)
  })
})
