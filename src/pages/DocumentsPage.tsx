import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Globe, Lock, MoreHorizontal } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { DocumentTypeIcon } from '../components/documents/DocumentTypeIcon'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { getDocuments } from '../services/documents'
import { symbolFor } from '../constants/currencies'
import { getStatusBadge } from '../utils/documentStatus'
import { formatDate } from '../utils/formatDate'
import { useDateFormat } from '../hooks/useProfile'
import type { DocumentStatus, DocumentType } from '../types/database'

type DocRow = {
  id: string
  document_number: string
  document_type: DocumentType
  status: DocumentStatus
  total_amount: number
  currency: string
  issue_date: string
  due_date?: string | null
  is_public?: boolean
  recipient: { name: string } | null
}

const typeFilters: Array<{ id: 'all' | DocumentType; label: string }> = [
  { id: 'all', label: 'All types' },
  { id: 'estimate', label: 'Estimates' },
  { id: 'invoice', label: 'Invoices' },
  { id: 'receipt', label: 'Receipts' },
]

export default function DocumentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dateFormat = useDateFormat()
  const [docs, setDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>('all')

  useEffect(() => {
    if (!user) return
    const filters = typeFilter === 'all' ? undefined : { type: typeFilter }
    getDocuments(user.id, filters).then(({ data }) => {
      setDocs((data as unknown as DocRow[]) ?? [])
      setLoading(false)
    })
  }, [user, typeFilter])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(
      (d) =>
        d.document_number.toLowerCase().includes(q) ||
        d.recipient?.name?.toLowerCase().includes(q),
    )
  }, [docs, search])

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Documents</h1>
        <Button className="text-xs" onClick={() => navigate('/new')}>
          <Plus className="h-3.5 w-3.5" /> New document
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex max-w-xs flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="flex-1 bg-transparent text-xs outline-none"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {typeFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setTypeFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${typeFilter === f.id ? 'bg-brand text-white' : 'border border-slate-200 bg-white text-slate-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2.5">Document</th>
              <th className="px-3 py-2.5">Client</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5 text-right">Amount</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-center">Visibility</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const badge = getStatusBadge(doc)
              return (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/documents/${doc.id}`} className="flex items-center gap-2">
                      <DocumentTypeIcon
                        type={doc.document_type}
                        status={doc.status}
                        dueDate={doc.due_date}
                        size="sm"
                      />
                      <span className="font-medium">{doc.document_number}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{doc.recipient?.name ?? '—'}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{formatDate(doc.issue_date, dateFormat)}</td>
                  <td className="px-3 py-3 text-right font-medium">
                    {symbolFor(doc.currency)}{doc.total_amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center"><Badge style={badge} /></td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] ${doc.is_public ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {doc.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {doc.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    <MoreHorizontal className="inline h-4 w-4" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">No documents found</p>
        )}
      </div>
    </AppShell>
  )
}
