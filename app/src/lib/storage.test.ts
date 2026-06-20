import { describe, it, expect, beforeEach } from 'vitest'
import { addRule, readRules, loadAll, updateRule, deleteRule } from './storage'
import sample from '../test/fixtures/raiff.sample.json'

beforeEach(() => { localStorage.clear() })

describe('rules', () => {
  it('persists lowercased substrings', () => {
    addRule('food', 'KFC', 'AMREST-KFC')
    expect(readRules()).toEqual({ food: { 'amrest-kfc': 'KFC' } })
  })
  it('keeps regex masks case-sensitive', () => {
    addRule('food', 'KFC', '/AMREST-KFC/i')
    expect(readRules()).toEqual({ food: { '/AMREST-KFC/i': 'KFC' } })
  })
  it('updateRule replaces the mask and drops the old key', () => {
    addRule('travel', 'Pr Filipenko', 'pr')
    updateRule('travel', 'pr', { kat1: 'travel', mask: 'pr filipenko', kat2: 'Pr Filipenko' })
    expect(readRules()).toEqual({ travel: { 'pr filipenko': 'Pr Filipenko' } })
  })
  it('deleteRule removes a rule (and an emptied category)', () => {
    addRule('travel', 'Pr Filipenko', 'pr')
    deleteRule('travel', 'pr')
    expect(readRules()).toEqual({})
  })
})
describe('loadAll', () => {
  it('parses, categorizes, and classifies localStorage blobs', () => {
    localStorage.setItem('Raiff_x.json', JSON.stringify(sample))
    const rows = loadAll({ food: { 'mcdonald': 'McDonalds' } })
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every(r => r.cls !== undefined)).toBe(true)
  })
})
