import { describe, it, expect } from 'vitest'
import { categorize, mergeRules, categoryOptions, refMatches } from './categorize'

describe('refMatches', () => {
  it('matches a case-insensitive substring', () => {
    expect(refMatches('IKEA SRBIJA', 'ikea')).toBe(true)
    expect(refMatches('IKEA SRBIJA', 'maxi')).toBe(false)
  })
  it('matches a /regex/ mask with flags', () => {
    expect(refMatches('PR FILIPENKO 218', '/pr filipenko/i')).toBe(true)
    expect(refMatches('PR DRUGO', '/pr filipenko/i')).toBe(false)
    expect(refMatches('GO SUSHI', '/^go sushi/i')).toBe(true)
  })
  it('treats an invalid regex as non-matching (no throw)', () => {
    expect(refMatches('anything', '/(/')).toBe(false)
  })
})

const base = { food: { 'mcdonald': 'McDonalds' }, internet: { 'netflix': 'Netflix' } }

describe('categorize', () => {
  it('matches a base substring (case-insensitive)', () => {
    expect(categorize('POS MCDONALDS BEOGRAD', base)).toEqual(['food', 'McDonalds'])
  })
  it('falls back to other', () => {
    expect(categorize('UNKNOWN SHOP', base)).toEqual(['other', 'UNKNOWN SHOP'])
  })
})

describe('mergeRules', () => {
  it('user rules win and extend', () => {
    const merged = mergeRules(base, { food: { 'kfc': 'KFC' } })
    expect(categorize('KFC SRB', merged)).toEqual(['food', 'KFC'])
    expect(categorize('netflix.com', merged)).toEqual(['internet', 'Netflix'])
  })
})

describe('categoryOptions', () => {
  it('lists kat1 with their kat2 values sorted', () => {
    const opts = categoryOptions(base)
    expect(opts.map(o => o.kat1)).toContain('food')
  })
})
