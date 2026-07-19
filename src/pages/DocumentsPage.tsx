import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Search, Globe, Lock } from 'lucide-react'
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

const PAGE_SIZE = 10

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
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const filters = typeFilter === 'all' ? undefined : { type: typeFilter }
    getDocuments(user.id, filters).then(({ data }) => {
      setDocs((data as unknown as DocRow[]) ?? [])
      setPage(0)
      setLoading(false)
    })
  }, [user, typeFilter])

  useEffect(() => {
    setPage(0)
  }, [search])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(
      (d) =>
        d.document_number.toLowerCase().includes(q) ||
        d.recipient?.name?.toLowerCase().includes(q),
    )
  }, [docs, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageDocs = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Documents</h1>
        <Button className="text-xs" onClick={() => navigate('/new')}>
          <Plus className="h-3.5 w-3.5" /> New document
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[12rem] max-w-xs flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
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

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2.5">Document</th>
              <th className="px-3 py-2.5">Client</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5 text-right">Amount</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-center">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {pageDocs.map((doc) => {
              const badge = getStatusBadge(doc)
              return (
                <tr
                  key={doc.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/documents/${doc.id}`)
                    }
                  }}
                  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DocumentTypeIcon
                        type={doc.document_type}
                        status={doc.status}
                        dueDate={doc.due_date}
                        size="sm"
                      />
                      <span className="font-medium">{doc.document_number}</span>
                    </div>
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
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">No documents found</p>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="px-2 py-1 text-xs"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <span>
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              className="px-2 py-1 text-xs"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
