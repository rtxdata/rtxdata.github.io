import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DataProvider, useData } from './DataProvider'
import { addRule } from '@/lib/storage'
import sample from '../test/fixtures/raiff.sample.json'

const BASE = { food: { mcdonald: 'McDonalds' } }

function Probe() {
  const { txns } = useData()
  return <div data-testid="count">{txns.length}</div>
}

function PatternsProbe() {
  const { patterns, reload } = useData()
  return (
    <div>
      <div data-testid="cats">{Object.keys(patterns).sort().join(',')}</div>
      <button onClick={() => { addRule('newcat', 'Foo', 'foomask'); reload() }}>add</button>
    </div>
  )
}

describe('DataProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE) }))
    localStorage.clear()
    localStorage.setItem('Raiff_x.json', JSON.stringify(sample))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('loads transactions from localStorage after fetching patterns', async () => {
    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    )

    await waitFor(() => {
      const count = parseInt(screen.getByTestId('count').textContent ?? '0', 10)
      expect(count).toBeGreaterThan(0)
    })
  })

  it('reload re-reads user rules so new categories appear in pickers', async () => {
    render(
      <DataProvider>
        <PatternsProbe />
      </DataProvider>
    )
    await waitFor(() => expect(screen.getByTestId('cats').textContent).toContain('food'))
    fireEvent.click(screen.getByRole('button', { name: 'add' }))
    await waitFor(() => expect(screen.getByTestId('cats').textContent).toContain('newcat'))
  })
})
