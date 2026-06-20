import { describe, it, expect } from 'vitest'
import { applyFilters, EMPTY_FILTERS } from './useFilters'
import type { Transaction } from '@/lib/types'

const t = (o: Partial<Transaction>): Transaction => ({
  key: Math.random().toString(), id: '', sum: -100, rsum: -100, curr: 'RSD',
  kat1: 'other', kat2: '', date: '2026-06-01', ts: Date.parse('2026-06-01'),
  type: 'POS', card: '', ref: 'shop', ref2: '', acc: 'A', cls: 'consumption',
  file: 'f', ...o,
})

describe('applyFilters', () => {
  it('filters by free text on ref', () => {
    const rows = [t({ ref: 'NETFLIX' }), t({ ref: 'MAXI' })]
    expect(applyFilters(rows, { ...EMPTY_FILTERS, text: 'net' })).toHaveLength(1)
  })

  it('real-spending preset excludes cash and fx', () => {
    const rows = [t({ cls: 'consumption' }), t({ cls: 'cash' }), t({ cls: 'fx' })]
    expect(applyFilters(rows, { ...EMPTY_FILTERS, classes: ['consumption'] })).toHaveLength(1)
  })
})
