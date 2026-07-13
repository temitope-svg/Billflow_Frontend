import type { DocumentWithDetails } from '../../types/database'
import { symbolFor } from '../../constants/currencies'
import { formatDate } from '../../utils/formatDate'
import type { DateFormatKey } from '../../utils/formatDate'
import { lineItemTotal } from '../../utils/lineItems'
import type { DocumentDraft } from '../../hooks/useDocumentDraft'

export function DocumentMiniPreview({
  draft,
  businessName,
  documentNumber = 'DRAFT',
  dateFormat = 'DD/MM/YYYY',
}: {
  draft: DocumentDraft
  businessName: string
  documentNumber?: string
  dateFormat?: DateFormatKey
}) {
  const symbol = symbolFor()
  const subtotal = draft.lineItems.reduce(
    (sum, item) => sum + lineItemTotal(item.unit, item.unitPrice),
    0,
  )
  const discount = parseFloat(draft.discountAmount) || 0
  const vatRate = parseFloat(draft.vatRate) || 0
  const afterDiscount = Math.max(0, subtotal - discount)
  const vatAmount = afterDiscount * (vatRate / 100)
  const total = afterDiscount + vatAmount

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs">
      <div className="mb-2 flex justify-between">
        <div>
          <div className="mb-1 h-5 w-5 rounded bg-brand" />
          <div className="font-semibold text-slate-900">{businessName || 'Your business'}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-brand uppercase">{draft.documentType}</div>
          <div className="text-slate-400">{documentNumber}</div>
        </div>
      </div>
      <hr className="my-2 border-slate-200" />
      <div className="text-slate-400">Bill to</div>
      <div className={draft.clientName ? 'text-slate-900' : 'italic text-slate-300'}>
        {draft.clientName || 'Not filled yet'}
      </div>
      <hr className="my-2 border-slate-200" />
      {draft.lineItems
        .filter((i) => i.description)
        .map((item) => (
          <div key={item.id} className="flex justify-between text-slate-900">
            <span>{item.description}</span>
            <span>
              {symbol}
              {lineItemTotal(item.unit, item.unitPrice).toLocaleString()}
            </span>
          </div>
        ))}
      <hr className="my-2 border-slate-200" />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-brand">
          {symbol}
          {total.toLocaleString()}
        </span>
      </div>
      {draft.issueDate && (
        <div className="mt-2 text-[10px] text-slate-400">
          Issued {formatDate(draft.issueDate, dateFormat)}
        </div>
      )}
    </div>
  )
}

export function DocumentHtmlPreview({ html }: { html: string }) {
  return (
    <div className="overflow-hidden rounded-lg bg-slate-200 p-6">
      <div
        className="mx-auto max-w-[480px] overflow-hidden rounded bg-white shadow-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function buildPreviewDocFromDraft(
  draft: DocumentDraft,
  profile: {
    business_name: string | null
    logo_url: string | null
    address: string | null
    phone: string | null
    email: string
    tax_id: string | null
    signature_url: string | null
    currency: string
  },
  template: { id: string; name: string },
  documentNumber = 'PREVIEW',
): DocumentWithDetails {
  const subtotal = draft.lineItems.reduce(
    (sum, item) => sum + lineItemTotal(item.unit, item.unitPrice),
    0,
  )
  const discount = parseFloat(draft.discountAmount) || 0
  const vatRate = parseFloat(draft.vatRate) || 0
  const afterDiscount = Math.max(0, subtotal - discount)
  const vatAmount = afterDiscount * (vatRate / 100)
  const total = afterDiscount + vatAmount

  return {
    id: 'preview',
    user_id: '',
    document_type: draft.documentType,
    status: 'draft',
    document_number: documentNumber,
    template_id: template.id,
    parent_id: null,
    issue_date: draft.issueDate,
    due_date: draft.dueDate || null,
    valid_until: draft.validUntil || null,
    paid_date: draft.paidDate || null,
    payment_method: draft.paymentMethod || null,
    payment_reference: draft.paymentRef || null,
    notes: draft.notes || null,
    terms: draft.terms || null,
    subtotal,
    discount_amount: discount || null,
    vat_rate: vatRate || null,
    vat_amount: vatAmount || null,
    total_amount: total,
    currency: profile.currency,
    use_signature: draft.useSignature,
    pdf_url: null,
    is_public: draft.isPublic,
    public_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    template: template as DocumentWithDetails['template'],
    sender: {
      id: 'preview',
      document_id: 'preview',
      business_name: profile.business_name ?? '',
      logo_url: profile.logo_url,
      address: profile.address,
      phone: profile.phone,
      email: profile.email,
      tax_id: profile.tax_id,
      signature_url: profile.signature_url,
    },
    recipient: {
      id: 'preview',
      document_id: 'preview',
      client_id: draft.clientId,
      name: draft.clientName,
      email: draft.clientEmail || null,
      phone: draft.clientPhone || null,
      address: draft.clientAddress || null,
      tax_id: null,
    },
    line_items: draft.lineItems
      .filter((i) => i.description.trim())
      .map((item, index) => {
        const { quantity, unit } = (() => {
          const trimmed = item.unit.trim()
          if (!trimmed) return { quantity: 1, unit: null as string | null }
          const asNumber = parseFloat(trimmed)
          if (!Number.isNaN(asNumber) && String(asNumber) === trimmed) {
            return { quantity: asNumber, unit: null }
          }
          return { quantity: 1, unit: trimmed }
        })()
        const unitPrice = parseFloat(item.unitPrice) || 0
        return {
          id: item.id,
          document_id: 'preview',
          position: index,
          description: item.description,
          quantity,
          unit,
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
        }
      }),
    bank_details:
      draft.bankName && draft.accountNumber
        ? {
            id: 'preview',
            document_id: 'preview',
            bank_name: draft.bankName,
            account_name: draft.accountName,
            account_number: draft.accountNumber,
            sort_code: draft.sortCode || null,
          }
        : null,
  }
}
