import type { DocumentStatus, DocumentType } from '../types/database'

export type DisplayStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'issued' | 'cancelled'

export interface StatusBadgeStyle {
  bg: string
  text: string
  label: string
  className: string
}

export const STATUS_BADGE: Record<DisplayStatus, StatusBadgeStyle> = {
  draft: { bg: '#F1F5F9', text: '#64748B', label: 'Draft', className: 'bg-slate-100 text-slate-500' },
  sent: { bg: '#EEF2FF', text: '#4F46E5', label: 'Sent', className: 'bg-indigo-50 text-indigo-600' },
  paid: { bg: '#D1FAE5', text: '#065F46', label: 'Paid', className: 'bg-emerald-100 text-emerald-800' },
  overdue: { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue', className: 'bg-red-100 text-red-800' },
  issued: { bg: '#D1FAE5', text: '#065F46', label: 'Issued', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { bg: '#F1F5F9', text: '#94A3B8', label: 'Cancelled', className: 'bg-slate-100 text-slate-400' },
}

const isPastDue = (dueDate: string): boolean => {
  const due = new Date(`${dueDate}T23:59:59`)
  return !Number.isNaN(due.getTime()) && due < new Date()
}

export const getDisplayStatus = (doc: {
  document_type: DocumentType
  status: DocumentStatus
  due_date?: string | null
}): DisplayStatus => {
  if (
    doc.document_type === 'invoice' &&
    doc.status === 'sent' &&
    doc.due_date &&
    isPastDue(doc.due_date)
  ) {
    return 'overdue'
  }
  if (doc.status === 'cancelled') return 'cancelled'
  if (doc.status === 'paid') return 'paid'
  if (doc.status === 'issued') return 'issued'
  if (doc.status === 'draft') return 'draft'
  return 'sent'
}

export const getStatusBadge = (doc: {
  document_type: DocumentType
  status: DocumentStatus
  due_date?: string | null
}): StatusBadgeStyle => STATUS_BADGE[getDisplayStatus(doc)]
