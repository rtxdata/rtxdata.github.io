import { useData } from '@/state/DataProvider'
import { addRule } from '@/lib/storage'
import { refMatches } from '@/lib/categorize'

export function useRules() {
  const { txns, reload } = useData()

  function assign(mask: string, kat1: string, kat2: string): number {
    return assignMany([mask], kat1, kat2)
  }

  /** Create a rule for each mask (deduped), then re-derive. Returns match count. */
  function assignMany(masks: string[], kat1: string, kat2: string): number {
    const uniq = Array.from(new Set(masks.map(m => m.trim()).filter(Boolean)))
    uniq.forEach(m => addRule(kat1, kat2, m))
    reload()
    return txns.filter(t => uniq.some(m => refMatches(t.ref, m))).length
  }

  return { assign, assignMany }
}
