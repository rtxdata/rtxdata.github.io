export type Currency = 'RSD' | 'EUR' | 'USD'
export type TxnClass = 'consumption' | 'fx' | 'cash' | 'crypto' | 'transfer' | 'income'

export interface Transaction {
  key: string        // stable React key (id when present, else composite)
  id: string         // tx[7]
  sum: number        // signed, native currency
  rsum: number       // signed, normalized to RSD
  curr: string       // tx[2]
  kat1: string       // derived category (lowercase slug or 'other')
  kat2: string       // derived subcategory
  date: string       // 'YYYY-MM-DD'
  ts: number         // epoch ms (for sort/interval math)
  type: string       // raw bank type code (tx[13])
  card: string       // tx[5]
  ref: string        // merchant/description
  ref2: string       // tx[11]
  acc: string        // account number
  cls: TxnClass      // derived (Task 7)
  file: string       // source localStorage key
}

export interface Subscription {
  merchant: string       // normalized display name
  cadence: 'weekly' | 'monthly' | 'annual'
  amountRsd: number      // typical absolute charge in RSD
  monthlyRsd: number     // amortized monthly cost
  count: number
  lastDate: string
  nextExpected: string
  kat1: string
  kat2: string
}

export interface Filters {
  text: string
  cats: string[]          // kat1 values; '' means 'other'
  accs: string[]
  currs: string[]
  types: string[]
  classes: TxnClass[]     // empty = all
  minRsd: number | null
  maxRsd: number | null
  from: string | null     // 'YYYY-MM-DD'
  to: string | null
}
