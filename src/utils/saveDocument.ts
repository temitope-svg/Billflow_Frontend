import type { User } from '@supabase/supabase-js'
import { createClient as createClientRecord } from '../services/clients'
import { createDocument, updateDocument, updateDocumentFull, getDocumentWithDetails } from '../services/documents'
import type { DocumentDraft } from '../hooks/useDocumentDraft'
import type { UserProfile } from '../types/database'
import { parseUnitField } from './lineItems'
import { buildPublicSlug } from './publicSlug'

export async function saveDocumentFromDraft(
  draft: DocumentDraft,
  user: User,
  profile: UserProfile | null,
) {
  if (!draft.clientName.trim()) throw new Error('Client name is required')

  let clientId = draft.clientId
  if (!clientId) {
    const { data: newClient, error } = await createClientRecord({
      user_id: user.id,
      name: draft.clientName.trim(),
      email: draft.clientEmail || null,
      phone: draft.clientPhone || null,
      address: draft.clientAddress || null,
    })
    if (error) throw error
    clientId = newClient!.id
  }

  const lineItemsPayload = draft.lineItems
    .filter((i) => i.description.trim())
    .map((item, idx) => {
      const { quantity, unit } = parseUnitField(item.unit)
      const price = parseFloat(item.unitPrice) || 0
      return {
        position: idx + 1,
        description: item.description.trim(),
        quantity,
        unit,
        unit_price: price,
        total_price: quantity * price,
      }
    })

  if (draft.documentType !== 'receipt' && lineItemsPayload.length === 0) {
    throw new Error('Add at least one line item')
  }

  const subtotal = lineItemsPayload.reduce((s, i) => s + i.total_price, 0)
  const discAmt = parseFloat(draft.discountAmount) || 0
  const vatRate = parseFloat(draft.vatRate) || 0
  const afterDiscount = Math.max(0, subtotal - discAmt)
  const vatAmt = afterDiscount * (vatRate / 100)
  const total = afterDiscount + vatAmt

  const documentFields = {
    issue_date: draft.issueDate,
    due_date: draft.dueDate || null,
    valid_until: draft.validUntil || null,
    paid_date: draft.documentType === 'receipt' ? draft.paidDate : null,
    payment_method: draft.documentType === 'receipt' ? draft.paymentMethod : null,
    payment_reference: draft.documentType === 'receipt' ? draft.paymentRef || null : null,
    notes: draft.notes || null,
    terms: draft.terms || null,
    subtotal,
    vat_rate: vatRate || null,
    vat_amount: vatAmt || null,
    discount_amount: discAmt || null,
    total_amount: total,
    use_signature: draft.useSignature,
    is_public: draft.isPublic,
  }

  const bankDetails = draft.bankName.trim()
    ? {
        bank_name: draft.bankName,
        account_name: draft.accountName,
        account_number: draft.accountNumber,
        sort_code: draft.sortCode.trim() || null,
      }
    : undefined

  const recipient = {
    client_id: clientId,
    name: draft.clientName.trim(),
    email: draft.clientEmail || null,
    phone: draft.clientPhone || null,
    address: draft.clientAddress || null,
    tax_id: null,
  }

  if (draft.editDocumentId) {
    const nextStatus = draft.documentType === 'receipt' ? 'issued' : 'sent'
    const { data: existing } = await getDocumentWithDetails(draft.editDocumentId)
    const docNumber = existing?.document_number ?? ''
    const slug = draft.isPublic ? buildPublicSlug(docNumber, draft.editDocumentId) : null
    const { data, error } = await updateDocumentFull(draft.editDocumentId, {
      document: {
        ...documentFields,
        template_id: draft.templateId,
        status: nextStatus,
        public_slug: draft.isPublic ? slug : null,
        is_public: draft.isPublic,
      },
      recipient,
      lineItems: lineItemsPayload,
      bankDetails,
    })
    if (error) throw error
    return data
  }

  const { data, error } = await createDocument({
    document: {
      ...documentFields,
      user_id: user.id,
      template_id: draft.templateId,
      document_type: draft.documentType,
      status: 'draft',
      currency: profile?.currency ?? 'NGN',
      parent_id: null,
      is_public: draft.isPublic,
      public_slug: null,
    },
    sender: {
      business_name: profile?.business_name ?? user.email ?? 'My Business',
      email: profile?.email ?? user.email ?? '',
      address: profile?.address ?? null,
      phone: profile?.phone ?? null,
      logo_url: profile?.logo_url ?? null,
      tax_id: profile?.tax_id ?? null,
      signature_url: profile?.signature_url ?? null,
    },
    recipient,
    lineItems: lineItemsPayload,
    bankDetails,
  })
  if (error) throw error

  const nextStatus = draft.documentType === 'receipt' ? 'issued' : 'sent'
  const slug = draft.isPublic ? buildPublicSlug(data!.document_number, data!.id) : null
  const { data: final, error: updateErr } = await updateDocument(data!.id, {
    status: nextStatus,
    is_public: draft.isPublic,
    public_slug: slug,
    use_signature: draft.useSignature,
  })
  if (updateErr) throw updateErr
  return final
}
