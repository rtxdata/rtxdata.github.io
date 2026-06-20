import { describe, it, expect } from 'vitest'
import { classify } from './classify'
import type { Transaction } from './types'

const t = (over: Partial<Transaction>): Transaction => ({
  key: Math.random().toString(), id: '', sum: -100, rsum: -100, curr: 'RSD',
  kat1: 'other', kat2: '', date: '2026-06-01', ts: Date.parse('2026-06-01'),
  type: 'POS', card: '', ref: 'shop', ref2: '', acc: 'A', cls: 'consumption',
  file: 'f', ...over,
})

describe('classify', () => {
  it('POS is consumption', () => {
    expect(classify([t({ type: 'POS' })])[0].cls).toBe('consumption')
  })
  it('ExchBuy/ExchSell and menjacnica are fx', () => {
    expect(classify([t({ type: 'ExchBuy' })])[0].cls).toBe('fx')
    expect(classify([t({ type: 'POS', ref: 'menjacnica kupovina' })])[0].cls).toBe('fx')
  })
  it('ATM and bankomat are cash', () => {
    expect(classify([t({ type: 'ATM' })])[0].cls).toBe('cash')
    expect(classify([t({ type: 'Other', ref: 'Smart ATM Isplata' })])[0].cls).toBe('cash')
  })
  it('binance/bifinity is crypto', () => {
    expect(classify([t({ ref: 'BIFINITY LTU' })])[0].cls).toBe('crypto')
  })
  it('positive Income is income', () => {
    expect(classify([t({ type: 'Income', sum: 500, rsum: 500 })])[0].cls).toBe('income')
  })
  it('negative PR (bill/utility/tax payment) is consumption, not income', () => {
    expect(classify([t({ type: 'PR', sum: -3811, rsum: -3811, ref: 'Telekom Srbija' })])[0].cls).toBe('consumption')
  })
  it('pairs opposite-sign cross-account transfers', () => {
    const out = classify([
      t({ type: 'PmtDom', sum: -5000, rsum: -5000, acc: 'A', date: '2026-06-10', ts: Date.parse('2026-06-10') }),
      t({ type: 'PmtDom', sum: 5000, rsum: 5000, acc: 'B', date: '2026-06-10', ts: Date.parse('2026-06-10') }),
    ])
    expect(out.every(r => r.cls === 'transfer')).toBe(true)
  })
})
