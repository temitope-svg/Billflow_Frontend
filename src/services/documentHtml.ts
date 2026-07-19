import type { DocumentWithDetails, LineItem } from '../types/database'
import { getTemplate, getTemplateFragments } from '../pdf-templates/registry'
import { symbolFor } from '../constants/currencies'
import { formatDate, type DateFormatKey } from '../utils/formatDate'
import { resolveLogoUrl } from '../utils/documentLogo'
import { formatUnitField } from '../utils/lineItems'

const formatAmount = (value: number | null): string => (value ?? 0).toFixed(2)

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Renders as a new line only when the value is present — avoids empty Bill To gaps. */
const optionalBrLine = (value: string | null | undefined): string => {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return `<br/>${escapeHtml(trimmed)}`
}

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
      const unitDisplay = formatUnitField(item.unit, item.quantity)
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
  // Bank payment details belong on invoices only — not estimates or receipts.
  if (doc.document_type !== 'invoice' || !doc.bank_details || !doc.template) return ''
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

  const dueDateFormatted = formatDate(doc.due_date, dateFormat, '')
  const validUntilFormatted = formatDate(doc.valid_until, dateFormat, '')

  const values: Record<string, string> = {
    business_name: escapeHtml(doc.sender?.business_name ?? ''),
    business_address: escapeHtml(doc.sender?.address ?? ''),
    business_email: escapeHtml(doc.sender?.email ?? ''),
    business_phone: escapeHtml(doc.sender?.phone ?? ''),
    business_tax_id: escapeHtml(doc.sender?.tax_id ?? ''),
    logo_url: resolveLogoUrl(doc.sender?.logo_url),
    client_name: escapeHtml(doc.recipient?.name ?? ''),
    client_address: optionalBrLine(doc.recipient?.address),
    client_email: optionalBrLine(doc.recipient?.email),
    client_phone: optionalBrLine(doc.recipient?.phone),
    document_number: escapeHtml(doc.document_number),
    document_type: doc.document_type,
    issue_date: formatDate(doc.issue_date, dateFormat, ''),
    due_date: dueDateFormatted,
    due_date_line: dueDateFormatted ? `<br/>Due date: ${dueDateFormatted}` : '',
    due_date_meta: dueDateFormatted
      ? ` &nbsp;&nbsp;|&nbsp;&nbsp; DUE DATE: ${dueDateFormatted}`
      : '',
    valid_until: validUntilFormatted,
    valid_until_line: validUntilFormatted ? `<br/>Valid Until: ${validUntilFormatted}` : '',
    valid_until_meta: validUntilFormatted
      ? ` &nbsp;&nbsp;|&nbsp;&nbsp; VALID UNTIL: ${validUntilFormatted}`
      : '',
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
  // Templates are already full HTML documents.
  const payload = /<html[\s>]/i.test(html)
    ? html
    : `<!DOCTYPE html><html><head><title>${title}</title></head><body>${html}</body></html>`
  printWindow.document.write(payload)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

const waitForImages = (root: ParentNode) =>
  Promise.all(
    Array.from(root.querySelectorAll('img')).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }),
    ),
  )

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

/**
 * Build a PDF blob from document HTML in an off-screen iframe
 * (avoids Tailwind oklch + UI flash).
 */
export const buildDocumentPdfBlob = async (html: string, fileName: string): Promise<File> => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const safeName = fileName.replace(/[^\w.-]+/g, '_') || 'document'
  const documentHtml = /<html[\s>]/i.test(html)
    ? html
    : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#ffffff;">${html}</body></html>`

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.tabIndex = -1
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none;'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument
  if (!iframeDoc) {
    iframe.remove()
    throw new Error('Could not prepare PDF document')
  }

  iframeDoc.open()
  iframeDoc.write(documentHtml)
  iframeDoc.close()

  await waitForImages(iframeDoc)
  await nextFrame()

  const target = (iframeDoc.body.firstElementChild as HTMLElement | null) ?? iframeDoc.body
  const contentHeight = Math.max(target.scrollHeight, iframeDoc.body.scrollHeight, 1123)
  iframe.style.height = `${contentHeight}px`
  await nextFrame()

  if (target.scrollHeight < 8) {
    iframe.remove()
    throw new Error('Document preview was empty — try again')
  }

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: contentHeight,
    })

    const pageWidthMm = 210
    const pageHeightMm = 297
    const marginMm = 8
    const contentWidthMm = pageWidthMm - marginMm * 2
    const imgHeightMm = (canvas.height * contentWidthMm) / canvas.width

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    let heightLeft = imgHeightMm
    let offsetY = marginMm

    pdf.addImage(imgData, 'JPEG', marginMm, offsetY, contentWidthMm, imgHeightMm)
    heightLeft -= pageHeightMm - marginMm * 2

    while (heightLeft > 1) {
      offsetY = marginMm - (imgHeightMm - heightLeft)
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', marginMm, offsetY, contentWidthMm, imgHeightMm)
      heightLeft -= pageHeightMm - marginMm * 2
    }

    const blob = pdf.output('blob')
    return new File([blob], `${safeName}.pdf`, { type: 'application/pdf' })
  } finally {
    iframe.remove()
  }
}

/** Download a real .pdf without touching the app UI. */
export const downloadDocumentHtmlAsPdf = async (html: string, fileName: string) => {
  const file = await buildDocumentPdfBlob(html, fileName)
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}
