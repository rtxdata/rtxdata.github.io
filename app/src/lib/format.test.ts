import { describe, it, expect } from 'vitest'
import { fmtMonth } from './format'
describe('fmtMonth', () => {
  it('slices YYYY-MM', () => { expect(fmtMonth('2026-06-18')).toBe('2026-06') })
})
