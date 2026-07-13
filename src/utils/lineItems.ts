export const parseUnitField = (raw: string): { quantity: number; unit: string | null } => {
  const trimmed = raw.trim()
  if (!trimmed) return { quantity: 1, unit: null }
  const asNumber = parseFloat(trimmed)
  if (!Number.isNaN(asNumber) && String(asNumber) === trimmed) {
    return { quantity: asNumber, unit: null }
  }
  return { quantity: 1, unit: trimmed }
}

export const formatUnitField = (unit: string | null, quantity: number): string => {
  if (unit) return unit
  if (quantity !== 1) return String(quantity)
  return ''
}

export const lineItemTotal = (unitField: string, unitPrice: string): number => {
  const { quantity } = parseUnitField(unitField)
  const price = parseFloat(unitPrice) || 0
  return quantity * price
}
