import { supabase } from '../lib/supabase'
import type {
  DocumentType,
  DocumentStatus,
  Database,
} from '../types/database'

type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentUpdate = Database['public']['Tables']['documents']['Update']
type SenderInsert = Database['public']['Tables']['document_sender']['Insert']
type RecipientInsert = Database['public']['Tables']['document_recipient']['Insert']
type LineItemInsert = Database['public']['Tables']['line_items']['Insert']
type BankDetailsInsert = Database['public']['Tables']['bank_details']['Insert']

// ── Queries ──────────────────────────────────────────────────

export const getDocuments = (
  userId: string,
  filters?: { type?: DocumentType; status?: DocumentStatus },
  range?: { from: number; to: number },
) => {
  let query = supabase
    .from('documents')
    .select(`
      *,
      recipient:document_recipient(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('document_type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (range) query = query.range(range.from, range.to)

  return query
}

export const getDocumentWithDetails = (documentId: string) =>
  supabase
    .from('documents')
    .select(`
      *,
      template:templates(*),
      sender:document_sender(*),
      recipient:document_recipient(*),
      line_items(*),
      bank_details(*)
    `)
    .eq('id', documentId)
    .single()

/** Child document created from a parent (e.g. estimate → invoice, invoice → receipt). */
export const getChildDocument = (parentId: string, documentType: DocumentType) =>
  supabase
    .from('documents')
    .select('id, document_number, document_type, status')
    .eq('parent_id', parentId)
    .eq('document_type', documentType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

// ── Document number ──────────────────────────────────────────

export const getNextDocumentNumber = (userId: string, type: DocumentType) =>
  supabase.rpc('get_next_document_number', { p_user_id: userId, p_type: type })

// ── Create ───────────────────────────────────────────────────

export interface CreateDocumentPayload {
  document: Omit<DocumentInsert, 'document_number'>
  sender: Omit<SenderInsert, 'document_id'>
  recipient: Omit<RecipientInsert, 'document_id'>
  lineItems: Omit<LineItemInsert, 'document_id'>[]
  bankDetails?: Omit<BankDetailsInsert, 'document_id'>
}

export const createDocument = async (payload: CreateDocumentPayload) => {
  const { document, sender, recipient, lineItems, bankDetails } = payload

  // 1. Get next document number atomically
  const { data: docNumber, error: numErr } = await getNextDocumentNumber(
    document.user_id,
    document.document_type,
  )
  if (numErr) return { data: null, error: numErr }

  // 2. Insert document
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ ...document, document_number: docNumber! })
    .select()
    .single()
  if (docErr) return { data: null, error: docErr }

  const docId = doc.id

  // 3. Insert related rows in parallel
  const results = await Promise.all([
    supabase.from('document_sender').insert({ ...sender, document_id: docId }),
    supabase.from('document_recipient').insert({ ...recipient, document_id: docId }),
    supabase.from('line_items').insert(lineItems.map(item => ({ ...item, document_id: docId }))),
    ...(bankDetails
      ? [supabase.from('bank_details').insert({ ...bankDetails, document_id: docId })]
      : []),
  ])
  const insertError = results.find((r) => r.error)
  if (insertError) return { data: null, error: insertError.error }

  return { data: doc, error: null }
}

// ── Convert (Estimate → Invoice → Receipt) ───────────────────

export const convertDocument = async (
  parentId: string,
  newDocument: Omit<DocumentInsert, 'document_number'>,
) => {
  // 1. Get next number for new type
  const { data: docNumber, error: numErr } = await getNextDocumentNumber(
    newDocument.user_id,
    newDocument.document_type,
  )
  if (numErr) return { data: null, error: numErr }

  // 2. Insert new document
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ ...newDocument, document_number: docNumber!, parent_id: parentId })
    .select()
    .single()
  if (docErr) return { data: null, error: docErr }

  // 3. Clone children (line_items, recipient, bank_details) via DB function
  const { error: cloneErr } = await supabase.rpc('clone_document_children', {
    p_parent_id: parentId,
    p_new_id: doc.id,
  })
  if (cloneErr) return { data: null, error: cloneErr }

  // clone_document_children does NOT copy document_sender, so without this the
  // converted doc renders with no business info/logo (which shows up as a dark
  // empty logo tile on dark-header templates). Copy the parent's sender snapshot
  // across. Idempotent: skip if a sender already exists for the new doc.
  const { error: senderErr } = await cloneDocumentSender(parentId, doc.id)
  if (senderErr) return { data: null, error: senderErr }

  return { data: doc, error: null }
}

const cloneDocumentSender = async (parentId: string, newId: string) => {
  const { data: existing } = await supabase
    .from('document_sender')
    .select('id')
    .eq('document_id', newId)
    .maybeSingle()
  if (existing) return { error: null }

  const { data: parentSender, error: fetchErr } = await supabase
    .from('document_sender')
    .select('*')
    .eq('document_id', parentId)
    .maybeSingle()
  if (fetchErr) return { error: fetchErr }
  if (!parentSender) return { error: null }

  const {
    id: _id,
    document_id: _documentId,
    created_at: _createdAt,
    ...senderFields
  } = parentSender as SenderInsert & { id?: string; created_at?: string }

  const { error: insertErr } = await supabase
    .from('document_sender')
    .insert({ ...senderFields, document_id: newId })
  return { error: insertErr }
}

// ── Update ───────────────────────────────────────────────────

export const updateDocument = (documentId: string, updates: DocumentUpdate) =>
  supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single()

export const updateDocumentSenderLogo = (documentId: string, logoUrl: string | null) =>
  supabase
    .from('document_sender')
    .update({ logo_url: logoUrl })
    .eq('document_id', documentId)

// Full edit of an existing document — replaces its recipient, line items,
// and bank details wholesale rather than trying to diff them, since the
// edit form doesn't track which rows are new/changed/removed.
export interface UpdateDocumentFullPayload {
  document: DocumentUpdate
  recipient: Omit<RecipientInsert, 'document_id'>
  lineItems: Omit<LineItemInsert, 'document_id'>[]
  bankDetails?: Omit<BankDetailsInsert, 'document_id'>
}

export const updateDocumentFull = async (documentId: string, payload: UpdateDocumentFullPayload) => {
  const { document, recipient, lineItems, bankDetails } = payload

  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .update(document)
    .eq('id', documentId)
    .select()
    .single()
  if (docErr) return { data: null, error: docErr }

  const [recipientRes, lineItemsDeleteRes, bankDeleteRes] = await Promise.all([
    supabase.from('document_recipient').update({
      client_id: recipient.client_id,
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone,
      address: recipient.address,
      tax_id: recipient.tax_id,
    }).eq('document_id', documentId),
    supabase.from('line_items').delete().eq('document_id', documentId),
    supabase.from('bank_details').delete().eq('document_id', documentId),
  ])
  if (recipientRes.error) return { data: null, error: recipientRes.error }
  if (lineItemsDeleteRes.error) return { data: null, error: lineItemsDeleteRes.error }
  if (bankDeleteRes.error) return { data: null, error: bankDeleteRes.error }

  const results = await Promise.all([
    supabase.from('line_items').insert(lineItems.map(item => ({ ...item, document_id: documentId }))),
    ...(bankDetails
      ? [supabase.from('bank_details').insert({ ...bankDetails, document_id: documentId })]
      : []),
  ])
  const insertError = results.find((r) => r.error)
  if (insertError) return { data: null, error: insertError.error }

  return { data: doc, error: null }
}

export const markDocumentPaid = (
  documentId: string,
  paidDate: string,
  paymentMethod: string,
  paymentReference?: string,
) =>
  updateDocument(documentId, {
    status: 'paid',
    paid_date: paidDate,
    payment_method: paymentMethod,
    payment_reference: paymentReference ?? null,
  })

export const savePdfUrl = (documentId: string, pdfUrl: string) =>
  updateDocument(documentId, { pdf_url: pdfUrl })

// ── Delete ───────────────────────────────────────────────────

export const deleteDocument = (documentId: string) =>
  supabase.from('documents').delete().eq('id', documentId)

// ── Dashboard queries ─────────────────────────────────────────

export const getRecentDocuments = (userId: string, limit = 5) =>
  supabase
    .from('documents')
    .select(`
      id, document_number, document_type, status, total_amount, currency, issue_date, due_date,
      recipient:document_recipient(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

export const getMonthlyStats = (userId: string) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  return supabase
    .from('documents')
    .select('document_type, status, total_amount')
    .eq('user_id', userId)
    .gte('issue_date', startOfMonth)
}

// ── Templates ────────────────────────────────────────────────

export const getTemplates = (type: DocumentType) =>
  supabase
    .from('templates')
    .select('*')
    .eq('document_type', type)
    .eq('is_active', true)
    .order('sort_order')

export const getPublicDocumentBySlug = (slug: string) =>
  supabase
    .from('documents')
    .select(`
      *,
      template:templates(*),
      sender:document_sender(*),
      recipient:document_recipient(*),
      line_items(*),
      bank_details(*)
    `)
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()
