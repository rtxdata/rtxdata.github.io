// Human-facing labels for the raw category slugs and noisy bank merchant strings.

const KAT_LABEL: Record<string, string> = {
  food: 'Еда и кафе',
  auto: 'Авто',
  supermarket: 'Супермаркеты',
  internet: 'Связь и подписки',
  store: 'Магазины',
  taxi: 'Такси',
  travel: 'Поездки',
  health: 'Здоровье',
  entertainment: 'Развлечения',
  clothes: 'Одежда',
  electronics: 'Электроника',
  service: 'Услуги',
  finance: 'Финансы',
  business: 'Бизнес',
  transfer: 'Переводы',
  other: 'Без категории',
}

/** Display label for a top-level category (kat1). Falls back to Title Case. */
export function katLabel(kat1: string): string {
  if (KAT_LABEL[kat1]) return KAT_LABEL[kat1]
  return kat1 ? kat1.charAt(0).toUpperCase() + kat1.slice(1) : '—'
}

// Transaction class — money-movement classes are visually recessive ("ghosted").
const CLS_LABEL: Record<string, string> = {
  consumption: 'Траты',
  income: 'Доход',
  cash: 'Наличные',
  fx: 'Обмен валют',
  crypto: 'Крипто',
  transfer: 'Перевод',
}
export const clsLabel = (cls: string): string => CLS_LABEL[cls] ?? cls
export const MOVEMENT_CLASSES = new Set(['cash', 'fx', 'crypto', 'transfer'])

/**
 * A sensible default matching mask for a merchant ref: the first word, but
 * extended to two words when the first is too short (≤3 chars like "go", "pr",
 * "kod"), which would otherwise over-match hundreds of unrelated transactions.
 */
export function defaultMask(ref: string): string {
  const words = ref.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ref.toLowerCase()
  if (words[0].length >= 4 || words.length === 1) return words[0]
  return words.slice(0, 2).join(' ')
}

// Address / legal-form / billing-boilerplate tokens that carry no merchant identity.
const NOISE = new Set([
  'd', 'o', 'a', 'doo', 'dooel', 'ad', 'sz', 'beograd', 'srb', 'srbija',
  'uplata', 'po', 'ra', 'unu', 'racunu', 'rn', 'br',
])

/**
 * Turn a normalized/raw bank merchant string into something readable:
 * drop legal-form & address noise, keep the first few identity words, Title Case.
 * e.g. "orion telekom d o o beograd uplata po ra unu" -> "Orion Telekom".
 */
export function displayMerchant(s: string): string {
  const tokens = s
    .toLowerCase()
    .replace(/[#*].*$/, '')
    .replace(/[^a-zа-я0-9 ]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const kept = tokens.filter((w) => !NOISE.has(w))
  const picked = (kept.length ? kept : tokens).slice(0, 3)
  if (picked.length === 0) return s
  return picked.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
