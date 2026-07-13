import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type ClientInsert = Database['public']['Tables']['clients']['Insert']
type ClientUpdate = Database['public']['Tables']['clients']['Update']

// ── Queries ──────────────────────────────────────────────────

export const getClients = async (
  userId: string,
  opts?: { range?: { from: number; to: number }; search?: string },
) => {
  let query = supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  if (opts?.search) query = query.ilike('name', `%${opts.search}%`)
  if (opts?.range) query = query.range(opts.range.from, opts.range.to)

  const { data: clients, error } = await query

  if (error || !clients) return { data: null, error }
  if (clients.length === 0) return { data: [], error: null }

  const { data: counts } = await supabase
    .from('document_recipient')
    .select('client_id, documents!inner(user_id, document_type)')
    .eq('documents.user_id', userId)
    .in('client_id', clients.map(c => c.id))

  const countMap = new Map<string, { docCount: number; docTypes: string[] }>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (counts ?? []) as any[]) {
    const key = row.client_id as string
    const docType = row.documents?.document_type ?? 'invoice'
    const existing = countMap.get(key)
    if (existing) {
      existing.docCount += 1
      existing.docTypes.push(docType)
    } else {
      countMap.set(key, { docCount: 1, docTypes: [docType] })
    }
  }

  const data = clients.map(c => ({
    ...c,
    docCount: countMap.get(c.id)?.docCount ?? 0,
    docTypes: countMap.get(c.id)?.docTypes ?? [],
  }))

  return { data, error: null }
}

export const getClient = (clientId: string) =>
  supabase.from('clients').select('*').eq('id', clientId).single()

export const getClientDocuments = (clientId: string) =>
  supabase
    .from('documents')
    .select(`
      id, document_number, document_type, status, total_amount, currency, issue_date, due_date,
      recipient:document_recipient!inner(client_id)
    `)
    .eq('recipient.client_id', clientId)
    .order('created_at', { ascending: false })

export const findClientMatches = (userId: string, query: string, limit = 5) =>
  supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(limit)

// ── Create / Update / Delete ────────────────────────────────

export const createClient = (payload: ClientInsert) =>
  supabase.from('clients').insert(payload).select().single()

export const updateClient = (clientId: string, updates: ClientUpdate) =>
  supabase.from('clients').update(updates).eq('id', clientId).select().single()

export const deleteClient = (clientId: string) =>
  supabase.from('clients').delete().eq('id', clientId)
