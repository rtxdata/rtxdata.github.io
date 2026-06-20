import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DataProvider } from '@/state/DataProvider'
import OverviewTab from './OverviewTab'

// Two months of fixture data so prevMonth comparison works
const twoMonthFixture = {
  transactions: {
    acc1: [[null, [
      // May income
      ['', '941', 'RSD', '15.05.2026 12:00:00', '15.05.2026 12:00:00', '9999', 'PLATA', 'tx01', '0', '80000', '', 'r01', 'ref#tx01', 'Credit', 'PLATA', ''],
      // May consumption
      ['', '941', 'RSD', '20.05.2026 12:00:00', '20.05.2026 12:00:00', '9999', 'LIDL SRBIJA', 'tx02', '3000', '0', '', 'r02', 'ref#tx02', 'POS', 'LIDL SRBIJA', ''],
      // June income (larger month)
      ['', '941', 'RSD', '05.06.2026 12:00:00', '05.06.2026 12:00:00', '9999', 'PLATA', 'tx03', '0', '100000', '', 'r03', 'ref#tx03', 'Credit', 'PLATA', ''],
      // June consumption
      ['', '941', 'RSD', '10.06.2026 12:00:00', '10.06.2026 12:00:00', '9999', 'LIDL SRBIJA', 'tx04', '5000', '0', '', 'r04', 'ref#tx04', 'POS', 'LIDL SRBIJA', ''],
      ['', '941', 'RSD', '12.06.2026 12:00:00', '12.06.2026 12:00:00', '9999', 'MCDONALD', 'tx05', '2000', '0', '', 'r05', 'ref#tx05', 'POS', 'MCDONALD', ''],
    ]]]
  }
}

const BASE = { food: { lidl: 'food', mcdonald: 'food' } }

describe('OverviewTab', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(BASE) }))
    localStorage.clear()
    localStorage.setItem('Raiff_test.json', JSON.stringify(twoMonthFixture))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('renders all four KPI labels', async () => {
    render(
      <DataProvider>
        <OverviewTab />
      </DataProvider>
    )

    // Labels like Доход/Расход/Баланс also appear in the chart legend, so allow >1.
    await waitFor(() => {
      expect(screen.getAllByText(/доход/i).length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText(/расход|траты/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/баланс|нетто/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/сбереж/i)).toBeInTheDocument()
  })

  it('shows the selected month outflow value', async () => {
    render(
      <DataProvider>
        <OverviewTab />
      </DataProvider>
    )

    // Select June explicitly (the default opens on the latest COMPLETE month).
    const monthSelect = await screen.findByLabelText('Месяц')
    fireEvent.change(monthSelect, { target: { value: '2026-06' } })

    // June outflow = 5000 + 2000 = 7000 RSD → formatted as "7 000 RSD"
    await waitFor(() => {
      const rsds = screen.getAllByText(/7\s*000\s*RSD|7\.000\s*RSD/)
      expect(rsds.length).toBeGreaterThan(0)
    })
  })

  it('renders the movers section', async () => {
    render(
      <DataProvider>
        <OverviewTab />
      </DataProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/что изменилось|движение/i)).toBeInTheDocument()
    })
  })
})
