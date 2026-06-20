import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DataProvider, useData } from '@/state/DataProvider'
import { readRules } from '@/lib/storage'
import sample from '@/test/fixtures/raiff.sample.json'
import { useRules } from './useRules'

const BASE = { streaming: { netflix: 'Netflix' } }

describe('useRules', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE) }))
    localStorage.clear()
    localStorage.setItem('Raiff_x.json', JSON.stringify(sample))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('assign persists rule and returns matching count', async () => {
    const { result } = renderHook(() => ({ rules: useRules(), data: useData() }), {
      wrapper: DataProvider,
    })

    // Wait for the provider's async load (fetch patterns -> loadAll) to populate
    // txns. Without this, assign's preview count is computed against an empty
    // txns array and intermittently returns 0 (the flake).
    await waitFor(() => expect(result.current.data.txns.length).toBeGreaterThan(0))

    let count = 0
    await act(async () => {
      // "ikea" matches 1 fixture row: "IKEA SRBIJA DOO BEOGRAD"
      count = result.current.rules.assign('ikea', 'home', 'IKEA')
    })

    expect(readRules()).toMatchObject({ home: { ikea: 'IKEA' } })
    expect(count).toBe(1)
  })
})
