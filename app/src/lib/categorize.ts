import type { Transaction } from './types'
export type Patterns = Record<string, Record<string, string>>

export function mergeRules(base: Patterns, user: Patterns): Patterns {
  const out: Patterns = {}
  for (const k of new Set([...Object.keys(base), ...Object.keys(user)])) {
    out[k] = { ...(base[k] ?? {}), ...(user[k] ?? {}) }  // user overrides base
  }
  return out
}

/**
 * Does a transaction reference match a mask? A mask wrapped in slashes
 * (`/pattern/flags`) is a regex tested against the original ref; otherwise it's
 * a case-insensitive substring. Invalid regexes never match (rather than throw).
 */
export function refMatches(ref: string, mask: string): boolean {
  const rx = mask.match(/^\/(.+)\/([a-z]*)$/)
  if (rx) {
    try {
      return new RegExp(rx[1], rx[2]).test(ref)
    } catch {
      return false
    }
  }
  return ref.toLowerCase().includes(mask.toLowerCase())
}

export function categorize(ref: string, patterns: Patterns): [string, string] {
  for (const kat1 of Object.keys(patterns)) {
    for (const key of Object.keys(patterns[kat1])) {
      if (refMatches(ref, key)) return [kat1, patterns[kat1][key]]
    }
  }
  return ['other', ref]
}

export function categoryOptions(patterns: Patterns) {
  return Object.keys(patterns).sort().map(kat1 => ({
    kat1,
    kat2: Array.from(new Set(Object.values(patterns[kat1]))).sort(),
  }))
}

export function applyCategories(txns: Transaction[], patterns: Patterns): Transaction[] {
  return txns.map(t => {
    const [kat1, kat2] = categorize(t.ref, patterns)
    return { ...t, kat1, kat2 }
  })
}
