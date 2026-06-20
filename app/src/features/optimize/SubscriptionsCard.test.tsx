import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SubscriptionsCard from './SubscriptionsCard'
import type { Transaction } from '@/lib/types'

const charge = (date: string, rsum: number, ref: string): Transaction => ({
  key: date + ref,
  id: '',
  sum: rsum,
  rsum,
  curr: 'RSD',
  kat1: 'internet',
  kat2: 'Netflix',
  date,
  ts: Date.parse(date),
  type: 'POS',
  card: '',
  ref,
  ref2: '',
  acc: 'A',
  cls: 'consumption',
  file: 'f',
})

const netflixTxns: Transaction[] = [
  charge('2026-01-15', -1100, 'NETFLIX.COM 1'),
  charge('2026-02-15', -1100, 'NETFLIX.COM 2'),
  charge('2026-03-15', -1100, 'NETFLIX.COM 3'),
]

describe('SubscriptionsCard', () => {
  it('renders the headline total and one subscription row', () => {
    render(<SubscriptionsCard txns={netflixTxns} />)

    // Hero headline labels the recurring spend and an annual projection.
    expect(screen.getByText(/регулярные платежи/i)).toBeInTheDocument()
    expect(screen.getByText(/в год/i)).toBeInTheDocument()

    // Table row shows the (cleaned) merchant name.
    expect(screen.getByText(/netflix/i)).toBeInTheDocument()
  })

  it('renders empty state when no subscriptions detected', () => {
    render(<SubscriptionsCard txns={[]} />)
    expect(screen.getByText(/не обнаружено/i)).toBeInTheDocument()
  })
})
