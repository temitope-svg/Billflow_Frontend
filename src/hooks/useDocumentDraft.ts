import type { DocumentType } from '../types/database'

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

export const createEmptyDraft = (documentType: DocumentType, templateId: string): DocumentDraft => ({
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
  vatRate: '',
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
