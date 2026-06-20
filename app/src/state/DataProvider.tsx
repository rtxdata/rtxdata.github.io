import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Transaction } from '@/lib/types'
import { mergeRules, type Patterns } from '@/lib/categorize'
import { loadAll, readRules } from '@/lib/storage'

interface Ctx {
  txns: Transaction[]
  /** Merged base + user rules — what pickers and the rules editor read. */
  patterns: Patterns
  /** Re-derive everything from the shipped base + current user rules in localStorage. */
  reload: () => void
}
const DataCtx = createContext<Ctx | null>(null)

export const useData = () => {
  const c = useContext(DataCtx)
  if (!c) throw new Error('useData outside provider')
  return c
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [base, setBase] = useState<Patterns>({})
  const [patterns, setPatterns] = useState<Patterns>({})
  const [txns, setTxns] = useState<Transaction[]>([])

  // Re-derive from the shipped base merged with the latest user rules in localStorage.
  const apply = useCallback((b: Patterns) => {
    setPatterns(mergeRules(b, readRules()))
    setTxns(loadAll(b))
  }, [])

  const reload = useCallback(() => apply(base), [apply, base])

  useEffect(() => {
    fetch('/patterns.json')
      .then(r => r.json())
      .then((p: Patterns) => {
        setBase(p)
        apply(p)
      })
  }, [apply])

  useEffect(() => {
    const handler = () => apply(base)
    window.addEventListener('localStorageUpdate', handler)
    return () => window.removeEventListener('localStorageUpdate', handler)
  }, [apply, base])

  return <DataCtx.Provider value={{ txns, patterns, reload }}>{children}</DataCtx.Provider>
}
