import { describe, it, expect } from 'vitest'
import { parseRaiff, formatDateString } from './parse'
import sample from '../test/fixtures/raiff.sample.json'

describe('formatDateString', () => {
  it('reformats DD.MM.YYYY to ISO', () => {
    expect(formatDateString('18.06.2026 00:00:00')).toBe('2026-06-18')
  })
})

describe('parseRaiff', () => {
  const rows = parseRaiff(sample, 'sample.json')
  it('parses every row', () => { expect(rows.length).toBeGreaterThan(0) })
  it('makes debits negative', () => {
    const ikea = rows.find(r => r.ref.includes('IKEA'))!
    expect(ikea.sum).toBe(-549)
    expect(ikea.rsum).toBe(-549)
    expect(ikea.curr).toBe('RSD')
    expect(ikea.date).toBe('2026-06-18')
  })
  it('makes credits positive (tx[8]==="0")', () => {
    const inc = rows.find(r => r.sum > 0)!
    expect(inc.sum).toBeGreaterThan(0)
  })
  it('normalizes EUR to RSD via rate 117', () => {
    const eur = rows.find(r => r.curr === 'EUR')!
    expect(eur.rsum).toBeCloseTo(eur.sum * 117)
  })
  it('carries the source file key', () => { expect(rows[0].file).toBe('sample.json') })
})
