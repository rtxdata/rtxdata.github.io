import { describe, it, expect } from 'vitest'
import { defaultMask, katLabel } from './display'

describe('defaultMask', () => {
  it('uses the first word when it is specific enough', () => {
    expect(defaultMask('IKEA SRBIJA DOO')).toBe('ikea')
    expect(defaultMask('Wolt')).toBe('wolt')
  })
  it('extends past a too-short first word to avoid over-matching', () => {
    expect(defaultMask('PR FILIPENKO 218')).toBe('pr filipenko')
    expect(defaultMask('GO SUSHI')).toBe('go sushi')
    expect(defaultMask('KOD DEDA')).toBe('kod deda')
  })
})

describe('katLabel', () => {
  it('localizes known categories and Title-cases unknown ones', () => {
    expect(katLabel('auto')).toBe('Авто')
    expect(katLabel('other')).toBe('Без категории')
    expect(katLabel('Семья')).toBe('Семья')
  })
})
