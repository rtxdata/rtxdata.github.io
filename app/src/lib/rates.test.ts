import { describe, it, expect } from 'vitest'
import { toRsd } from './rates'
describe('toRsd', () => {
  it('passes RSD through', () => { expect(toRsd(-100, 'RSD')).toBe(-100) })
  it('converts EUR at 117', () => { expect(toRsd(-10, 'EUR')).toBe(-1170) })
  it('defaults unknown currency to 1x', () => { expect(toRsd(-5, 'GBP')).toBe(-5) })
})
