export type DateFormatKey = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parseIso = (iso: string): Date | null => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

const pad = (n: number) => String(n).padStart(2, '0')

export const formatDate = (
  iso: string | null | undefined,
  format: DateFormatKey = 'DD/MM/YYYY',
  empty = '—',
): string => {
  if (!iso) return empty
  const d = parseIso(iso)
  if (!d) return iso

  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = d.getFullYear()

  switch (format) {
    case 'MM/DD/YYYY':
      return `${pad(month)}/${pad(day)}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${pad(month)}-${pad(day)}`
    case 'DD MMM YYYY':
      return `${day} ${MONTH_SHORT[d.getMonth()]} ${year}`
    case 'DD/MM/YYYY':
    default:
      return `${pad(day)}/${pad(month)}/${year}`
  }
}

export const isDateFormatKey = (value: string): value is DateFormatKey =>
  ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'].includes(value)
