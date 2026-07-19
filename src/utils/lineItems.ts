/** Leading quantity at the start of the Unit field (e.g. "2weeks", "2.5 kg", "4"). */
const LEADING_QTY_RE = /^(\d+(?:\.\d+)?)\s*(.*)$/

/** Parse the single "Unit" field into DB quantity + unit label. */
export const parseUnitField = (raw: string): { quantity: number; unit: string | null } => {
  const trimmed = raw.trim()
  if (!trimmed) return { quantity: 1, unit: null }

  const match = trimmed.match(LEADING_QTY_RE)
  if (match) {
    const quantity = parseFloat(match[1])
    const rest = match[2].trim()
    return { quantity, unit: rest || null }
  }

  return { quantity: 1, unit: trimmed }
}

/** Display value for the Unit input when loading an existing line item. */
export const formatUnitField = (unit: string | null, quantity: number): string => {
  if (unit) return `${quantity} ${unit}`
  if (quantity !== 1) return String(quantity)
  return ''
}

export const lineItemTotal = (unitField: string, unitPrice: string): number => {
  const { quantity } = parseUnitField(unitField)
  const price = parseFloat(unitPrice) || 0
  return quantity * price
}

/** True when a value has a number, but text comes before it (e.g. "weeks2", "$100"). */
export const hasTextBeforeNumber = (value: string): boolean => {
  const trimmed = value.trim()
  if (!trimmed) return false
  return /\d/.test(trimmed) && !/^\d/.test(trimmed)
}

/** True when the value is non-empty but does not start with a number (e.g. "$2.5", "abc"). */
export const hasNoLeadingNumber = (value: string): boolean =>
  value.trim() !== '' && Number.isNaN(parseFloat(value.trim()))
