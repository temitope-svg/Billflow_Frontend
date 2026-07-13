import type { DocumentWithDetails, LineItem } from '../types/database'
import { getTemplate, getTemplateFragments } from '../pdf-templates/registry'
import { symbolFor } from '../constants/currencies'
import { formatDate, type DateFormatKey } from '../utils/formatDate'
import { resolveLogoUrl } from '../utils/documentLogo'

const formatAmount = (value: number | null): string => (value ?? 0).toFixed(2)

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const fillPlaceholders = (html: string, values: Record<string, string>): string =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.split(`{{${key}}}`).join(value),
    html,
  )

const lineItemCell = (value: string, borderColor: string, align: 'left' | 'right'): string =>
  `<td style="padding:10px 8px; border-bottom:1px solid ${borderColor}; text-align:${align};">${value}</td>`

const buildLineItemsRows = (items: LineItem[], currencySymbol: string, borderColor: string): string =>
  [...items]
    .sort((a, b) => a.position - b.position)
    .map((item) => {
      const unitDisplay = item.unit?.trim() || (item.quantity !== 1 ? String(item.quantity) : '')
      return (
        '<tr>' +
        lineItemCell(escapeHtml(item.description), borderColor, 'left') +
        lineItemCell(escapeHtml(unitDisplay), borderColor, 'left') +
        lineItemCell(`${currencySymbol}${formatAmount(item.unit_price)}`, borderColor, 'right') +
        lineItemCell(`${currencySymbol}${formatAmount(item.total_price)}`, borderColor, 'right') +
        '</tr>'
      )
    })
    .join('')

const buildSignatureBlock = (doc: DocumentWithDetails): string => {
  if (!doc.use_signature || !doc.sender?.signature_url || !doc.template) return ''
  const fragments = getTemplateFragments(doc.template.name)
  if (!fragments) return ''
  return fragments.signatureBlockHtml.split('{{signature_url}}').join(doc.sender.signature_url)
}

const buildBankDetailsBlock = (doc: DocumentWithDetails): string => {
  if (doc.document_type === 'estimate' || !doc.bank_details || !doc.template) return ''
  const fragments = getTemplateFragments(doc.template.name)
  if (!fragments) return ''
  return fillPlaceholders(fragments.bankDetailsBlockHtml, {
    bank_name: escapeHtml(doc.bank_details.bank_name),
    account_name: escapeHtml(doc.bank_details.account_name),
    account_number: escapeHtml(doc.bank_details.account_number),
  })
}

export const buildDocumentHtml = (
  doc: DocumentWithDetails,
  dateFormat: DateFormatKey = 'DD/MM/YYYY',
): string | null => {
  if (!doc.template) return null

  const template = getTemplate(doc.template.name, doc.document_type)
  if (!template) return null

  const currencySymbol = symbolFor(doc.currency)

  const values: Record<string, string> = {
    business_name: escapeHtml(doc.sender?.business_name ?? ''),
    business_address: escapeHtml(doc.sender?.address ?? ''),
    business_email: escapeHtml(doc.sender?.email ?? ''),
    business_phone: escapeHtml(doc.sender?.phone ?? ''),
    business_tax_id: escapeHtml(doc.sender?.tax_id ?? ''),
    logo_url: resolveLogoUrl(doc.sender?.logo_url),
    client_name: escapeHtml(doc.recipient?.name ?? ''),
    client_address: escapeHtml(doc.recipient?.address ?? ''),
    client_email: escapeHtml(doc.recipient?.email ?? ''),
    client_phone: escapeHtml(doc.recipient?.phone ?? ''),
    document_number: escapeHtml(doc.document_number),
    document_type: doc.document_type,
    issue_date: formatDate(doc.issue_date, dateFormat, ''),
    due_date: formatDate(doc.due_date, dateFormat, ''),
    valid_until: formatDate(doc.valid_until, dateFormat, ''),
    paid_date: formatDate(doc.paid_date, dateFormat, ''),
    terms: escapeHtml(doc.terms ?? ''),
    notes: escapeHtml(doc.notes ?? ''),
    payment_method: escapeHtml(doc.payment_method ?? ''),
    payment_reference: escapeHtml(doc.payment_reference ?? ''),
    subtotal: formatAmount(doc.subtotal),
    discount_amount: formatAmount(doc.discount_amount),
    vat_rate: doc.vat_rate != null ? String(doc.vat_rate) : '0',
    vat_amount: formatAmount(doc.vat_amount),
    total_amount: formatAmount(doc.total_amount),
    currency: currencySymbol,
    line_items_rows: buildLineItemsRows(doc.line_items, currencySymbol, template.layoutConfig.borderColor),
    signature_block: buildSignatureBlock(doc),
    bank_details_block: buildBankDetailsBlock(doc),
  }

  return fillPlaceholders(template.html, values)
}

export const printDocumentPdf = (html: string, title: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title></head><body>${html}</body></html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

export const downloadDocumentHtmlAsPdf = async (html: string, fileName: string) => {
  printDocumentPdf(html, fileName)
}
