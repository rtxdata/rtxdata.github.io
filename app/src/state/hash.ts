import { useCallback, useEffect, useState } from 'react'

// The URL hash is shared state: filters, the active tab, and sort all live in it.
// Each concern reads/patches only its own keys so they never clobber each other.

export function readHash(): URLSearchParams {
  const raw = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash
  return new URLSearchParams(raw)
}

function writeHash(p: URLSearchParams) {
  const s = p.toString()
  // replaceState (not location.hash =) so state changes don't spam browser history.
  history.replaceState(null, '', s ? `#${s}` : location.pathname + location.search)
}

/** Set/remove a subset of hash params, preserving the rest. Empty/null removes the key. */
export function patchHash(updates: Record<string, string | null>) {
  const p = readHash()
  for (const [k, v] of Object.entries(updates)) {
    if (v === null || v === '') p.delete(k)
    else p.set(k, v)
  }
  writeHash(p)
}

/** A single hash param as state. The default value is kept out of the URL (clean URLs). */
export function useHashParam(key: string, fallback: string): [string, (v: string) => void] {
  const [val, setVal] = useState<string>(() => readHash().get(key) ?? fallback)

  const set = useCallback(
    (v: string) => {
      setVal(v)
      patchHash({ [key]: v === fallback ? null : v })
    },
    [key, fallback],
  )

  useEffect(() => {
    const onHash = () => setVal(readHash().get(key) ?? fallback)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [key, fallback])

  return [val, set]
}
