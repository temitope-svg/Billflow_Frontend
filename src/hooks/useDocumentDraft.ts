import type { DocumentType, DocumentWithDetails } from '../types/database'
import { formatUnitField } from '../utils/lineItems'

export interface LineItemDraft {
  id: string
  description: string
  unit: string
  unitPrice: string
}

export interface DocumentDraft {
  documentType: DocumentType
  templateId: string
  templateName?: string
  editDocumentId?: string
  /** Parent document when converting (estimate→invoice or invoice→receipt). */
  parentId?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientId: string | null
  issueDate: string
  dueDate: string
  validUntil: string
  paidDate: string
  paymentMethod: string
  paymentRef: string
  terms: string
  notes: string
  vatRate: string
  discountAmount: string
  bankName: string
  accountName: string
  accountNumber: string
  sortCode: string
  lineItems: LineItemDraft[]
  useSignature: boolean
  isPublic: boolean
}

const STORAGE_KEY = 'billflow_create_draft'

export const emptyLineItem = (): LineItemDraft => ({
  id: crypto.randomUUID(),
  description: '',
  unit: '',
  unitPrice: '',
})

export const createEmptyDraft = (
  documentType: DocumentType,
  templateId: string,
  defaults?: { vatRate?: string | null },
): DocumentDraft => ({
  documentType,
  templateId,
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  clientId: null,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  validUntil: '',
  paidDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Bank transfer',
  paymentRef: '',
  terms: '',
  notes: '',
  vatRate:
    defaults?.vatRate != null && defaults.vatRate !== ''
      ? String(defaults.vatRate)
      : '',
  discountAmount: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  sortCode: '',
  lineItems: [emptyLineItem()],
  useSignature: true,
  isPublic: false,
})

export const loadDraft = (): DocumentDraft | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DocumentDraft) : null
  } catch {
    return null
  }
}

export const saveDraft = (draft: DocumentDraft) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export const clearDraft = () => sessionStorage.removeItem(STORAGE_KEY)

/** Seed a create-flow draft from an existing document (edit or convert). */
export const draftFromDocument = (
  doc: DocumentWithDetails,
  options?: {
    documentType?: DocumentType
    templateId?: string
    editDocumentId?: string
    parentId?: string
  },
): DocumentDraft => {
  const documentType = options?.documentType ?? doc.document_type
  const items = [...(doc.line_items ?? [])].sort((a, b) => a.position - b.position)
  const bank = doc.bank_details

  return {
    documentType,
    templateId: options?.templateId ?? doc.template_id ?? '',
    templateName: doc.template?.name,
    editDocumentId: options?.editDocumentId,
    parentId: options?.parentId,
    clientName: doc.recipient?.name ?? '',
    clientEmail: doc.recipient?.email ?? '',
    clientPhone: doc.recipient?.phone ?? '',
    clientAddress: doc.recipient?.address ?? '',
    clientId: doc.recipient?.client_id ?? null,
    issueDate: doc.issue_date ?? new Date().toISOString().split('T')[0],
    dueDate: doc.due_date ?? '',
    validUntil: doc.valid_until ?? '',
    paidDate: doc.paid_date ?? new Date().toISOString().split('T')[0],
    paymentMethod: doc.payment_method ?? 'Bank transfer',
    paymentRef: doc.payment_reference ?? '',
    terms: doc.terms ?? '',
    notes: doc.notes ?? '',
    vatRate: doc.vat_rate != null ? String(doc.vat_rate) : '',
    discountAmount: doc.discount_amount ? String(doc.discount_amount) : '',
    bankName: bank?.bank_name ?? '',
    accountName: bank?.account_name ?? '',
    accountNumber: bank?.account_number ?? '',
    sortCode: bank?.sort_code ?? '',
    lineItems:
      items.length > 0
        ? items.map((li) => ({
            id: li.id,
            description: li.description,
            unit: formatUnitField(li.unit, li.quantity),
            unitPrice: String(li.unit_price),
          }))
        : [emptyLineItem()],
    useSignature: doc.use_signature ?? true,
    isPublic: doc.is_public ?? false,
  }
}
