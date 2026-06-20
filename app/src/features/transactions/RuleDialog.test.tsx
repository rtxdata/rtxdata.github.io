import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DataProvider } from '@/state/DataProvider'
import sample from '@/test/fixtures/raiff.sample.json'
import RuleDialog from './RuleDialog'

const BASE = {}

describe('RuleDialog', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE) }))
    localStorage.clear()
    localStorage.setItem('Raiff_x.json', JSON.stringify(sample))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('shows the preview count of matching transactions', async () => {
    // "amazon" matches 1 fixture row
    render(
      <DataProvider>
        <RuleDialog
          open={true}
          merchant="AMAZON PAYMENTS DOO BERLIN"
          substrings={['amazon']}
          kat1="shopping"
          kat2="Amazon"
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
      </DataProvider>
    )

    // Should show "1" in the preview count (strong element)
    // The text is split: <p>Это охватит <strong>1</strong> транзакций...</p>
    // Use a function matcher that checks the full text content of the container
    const el = await screen.findByText(
      (_content, element) => {
        if (!element) return false
        return element.textContent?.includes('1') === true
          && element.textContent?.includes('транзакц') === true
      },
      { selector: 'p' }
    )
    expect(el).toBeInTheDocument()
  })

  it('calls onConfirm when user confirms', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <DataProvider>
        <RuleDialog
          open={true}
          merchant="AMAZON PAYMENTS DOO BERLIN"
          substrings={['amazon']}
          kat1="shopping"
          kat2="Amazon"
          onConfirm={onConfirm}
          onClose={vi.fn()}
        />
      </DataProvider>
    )

    const confirmBtn = await screen.findByRole('button', { name: /подтвердить|confirm|применить/i })
    await user.click(confirmBtn)
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
