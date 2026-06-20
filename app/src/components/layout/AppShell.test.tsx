import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DataProvider } from '@/state/DataProvider'
import AppShell from './AppShell'
import sample from '../../test/fixtures/raiff.sample.json'

const BASE = { food: { mcdonald: 'McDonalds' } }

describe('AppShell', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE) }))
    localStorage.clear()
    localStorage.setItem('Raiff_x.json', JSON.stringify(sample))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('renders all three tab triggers when data is loaded', async () => {
    render(
      <DataProvider>
        <AppShell />
      </DataProvider>
    )

    await screen.findByRole('tab', { name: /обзор/i })
    await screen.findByRole('tab', { name: /транзакц/i })
    await screen.findByRole('tab', { name: /оптимиз/i })
  })

  it('switches to Transactions tab and shows its content', async () => {
    const user = userEvent.setup()

    render(
      <DataProvider>
        <AppShell />
      </DataProvider>
    )

    const txnsTab = await screen.findByRole('tab', { name: /транзакц/i })
    await user.click(txnsTab)

    // The Transactions panel shows the real-spending toggle (unique to this tab).
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /реальные траты/i })).toBeInTheDocument()
    })
  })
})
