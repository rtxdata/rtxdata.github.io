import { useState, useCallback, useEffect } from 'react'
import type { Filters, Transaction, TxnClass } from '@/lib/types'
import { readHash, patchHash } from './hash'

export const EMPTY_FILTERS: Filters = {
  text: '',
  cats: [],
  accs: [],
  currs: [],
  types: [],
  classes: [],
  minRsd: null,
  maxRsd: null,
  from: null,
  to: null,
}

export const REAL_SPENDING_FILTER: Filters = {
  ...EMPTY_FILTERS,
  classes: ['consumption'],
}

export function applyFilters(txns: Transaction[], f: Filters): Transaction[] {
  return txns.filter(t => {
    if (f.text && !t.ref.toLowerCase().includes(f.text.toLowerCase())) return false
    if (f.cats.length > 0 && !f.cats.includes(t.kat1)) return false
    if (f.accs.length > 0 && !f.accs.includes(t.acc)) return false
    if (f.currs.length > 0 && !f.currs.includes(t.curr)) return false
    if (f.types.length > 0 && !f.types.includes(t.type)) return false
    if (f.classes.length > 0 && !f.classes.includes(t.cls)) return false
    if (f.minRsd !== null && Math.abs(t.rsum) < f.minRsd) return false
    if (f.maxRsd !== null && Math.abs(t.rsum) > f.maxRsd) return false
    if (f.from !== null && t.date < f.from) return false
    if (f.to !== null && t.date > f.to) return false
    return true
  })
}

// --- URL hash serialization ---
//
// Spending mode is encoded for clean URLs: real-spending (the default) is absent,
// "all movements" is `mv=1`, and any custom class set is `classes=<joined>`.

function filtersToParams(f: Filters): Record<string, string | null> {
  const isReal = f.classes.length === 1 && f.classes[0] === 'consumption'
  const isAll = f.classes.length === 0
  return {
    text: f.text || null,
    cats: f.cats.length ? f.cats.join(',') : null,
    accs: f.accs.length ? f.accs.join(',') : null,
    currs: f.currs.length ? f.currs.join(',') : null,
    types: f.types.length ? f.types.join(',') : null,
    mv: isAll ? '1' : null,
    classes: !isReal && !isAll ? f.classes.join(',') : null,
    min: f.minRsd !== null ? String(f.minRsd) : null,
    max: f.maxRsd !== null ? String(f.maxRsd) : null,
    from: f.from,
    to: f.to,
  }
}

function hashToFilters(p: URLSearchParams): Filters {
  const list = (k: string) => { const v = p.get(k); return v ? v.split(',').filter(Boolean) : [] }
  const num = (k: string) => { const v = p.get(k); if (v === null) return null; const n = Number(v); return isNaN(n) ? null : n }

  let classes: TxnClass[]
  if (p.get('mv') === '1') classes = []
  else if (p.get('classes')) classes = p.get('classes')!.split(',').filter(Boolean) as TxnClass[]
  else classes = ['consumption'] // default: real spending

  return {
    text: p.get('text') ?? '',
    cats: list('cats'),
    accs: list('accs'),
    currs: list('currs'),
    types: list('types'),
    classes,
    minRsd: num('min'),
    maxRsd: num('max'),
    from: p.get('from'),
    to: p.get('to'),
  }
}

export function useFilters() {
  const [filters, setFiltersState] = useState<Filters>(() => hashToFilters(readHash()))

  const setFilters = useCallback((next: Filters) => {
    setFiltersState(next)
    patchHash(filtersToParams(next))
  }, [])

  const reset = useCallback(() => {
    setFilters({ ...REAL_SPENDING_FILTER })
  }, [setFilters])

  // Keep in sync with external hash changes (manual URL edits, back/forward).
  useEffect(() => {
    const onHash = () => setFiltersState(hashToFilters(readHash()))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return { filters, setFilters, reset }
}
