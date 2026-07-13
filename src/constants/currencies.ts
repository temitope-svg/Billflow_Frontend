export const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR']

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
}

export const symbolFor = (currency?: string | null) =>
  CURRENCY_SYMBOLS[currency ?? 'NGN'] ?? CURRENCY_SYMBOLS.NGN
