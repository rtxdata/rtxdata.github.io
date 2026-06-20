export const fmtMonth = (date: string): string => date.slice(0, 7)
export const fmtRsd = (n: number): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' RSD'
export const fmtNative = (n: number, curr: string): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n) + ' ' + curr

const MON_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** `'2026-06-18'` → `'18 июн'` */
export const fmtDateShort = (date: string): string => {
  const [, m, d] = date.split('-')
  return `${Number(d)} ${MON_SHORT[Number(m) - 1] ?? m}`
}

/** Long account numbers → a recognizable tail, e.g. `'···0835'`. */
export const shortAcc = (acc: string): string => (acc.length > 4 ? '···' + acc.slice(-4) : acc)
