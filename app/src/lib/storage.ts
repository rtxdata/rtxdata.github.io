import type { Transaction } from './types'
import { parseRaiff } from './parse'
import { applyCategories, mergeRules, type Patterns } from './categorize'
import { classify } from './classify'

const RULES_KEY = 'rtx_rules'

export function readBlobs() {
  return Object.keys(localStorage).filter(k => k.endsWith('.json'))
    .map(key => { try { return { key, blob: JSON.parse(localStorage[key]) } } catch { return null } })
    .filter((x): x is { key: string; blob: unknown } => x !== null)
}

export function readRules(): Patterns {
  try { return JSON.parse(localStorage[RULES_KEY] ?? '{}') } catch { return {} }
}
export function writeRules(p: Patterns) { localStorage[RULES_KEY] = JSON.stringify(p) }

// Regex masks (`/…/flags`) keep their case; plain substrings are lowercased.
const normalizeMask = (m: string) => (m.trim().startsWith('/') ? m.trim() : m.toLowerCase().trim())

export function addRule(kat1: string, kat2: string, mask: string): Patterns {
  const user = readRules()
  user[kat1] = { ...(user[kat1] ?? {}), [normalizeMask(mask)]: kat2 }
  writeRules(user)
  return user
}

export function deleteRule(kat1: string, mask: string): Patterns {
  const user = readRules()
  if (user[kat1]) {
    delete user[kat1][mask]
    if (Object.keys(user[kat1]).length === 0) delete user[kat1]
  }
  writeRules(user)
  return user
}

/** Replace one rule (mask/category/subcategory may all change). */
export function updateRule(
  oldKat1: string,
  oldMask: string,
  next: { kat1: string; mask: string; kat2: string },
): Patterns {
  const user = readRules()
  if (user[oldKat1]) {
    delete user[oldKat1][oldMask]
    if (Object.keys(user[oldKat1]).length === 0) delete user[oldKat1]
  }
  user[next.kat1] = { ...(user[next.kat1] ?? {}), [normalizeMask(next.mask)]: next.kat2 }
  writeRules(user)
  return user
}

export function loadAll(base: Patterns): Transaction[] {
  const merged = mergeRules(base, readRules())
  const raw = readBlobs().flatMap(({ key, blob }) => parseRaiff(blob, key))
  const seen = new Set<string>()
  const deduped = raw.filter(t => {
    if (!t.id) return true
    if (seen.has(t.id)) return false
    seen.add(t.id); return true
  })
  return classify(applyCategories(deduped, merged))
}
