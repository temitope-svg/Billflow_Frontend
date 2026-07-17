import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { getClient, getClientDocuments, deleteClient } from '../services/clients'
import { formatDate } from '../utils/formatDate'
import { useDateFormat } from '../hooks/useProfile'
import { useAlertModal } from '../hooks/useAlertModal'
import { symbolFor } from '../constants/currencies'
import type { Client } from '../types/database'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dateFormat = useDateFormat()
  const { showError, askConfirm, AlertHost } = useAlertModal()
  const [client, setClient] = useState<Client | null>(null)
  const [docs, setDocs] = useState<Array<{ id: string; document_number: string; total_amount: number; currency: string; issue_date: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getClient(id), getClientDocuments(id)]).then(([clientRes, docsRes]) => {
      setClient(clientRes.data as Client | null)
      setDocs((docsRes.data as typeof docs) ?? [])
      setLoading(false)
    })
  }, [id])

  const handleDelete = () => {
    if (!id) return
    askConfirm({
      tone: 'danger',
      title: 'Delete client?',
      message: 'This client will be removed. Documents linked to them are not deleted.',
      confirmLabel: 'Delete client',
      icon: Trash2,
      onConfirm: async () => {
        const { error } = await deleteClient(id)
        if (error) {
          showError('Could not delete client', error.message)
          return
        }
        navigate('/clients')
      },
    })
  }

  if (loading) return <AppShell><PageLoader /></AppShell>
  if (!client) return <AppShell><p>Client not found</p></AppShell>

  return (
    <AppShell>
      <Link to="/clients" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{client.name}</h1>
          <p className="text-sm text-slate-500">{client.email ?? client.phone ?? 'No contact info'}</p>
          {client.address && <p className="mt-1 text-xs text-slate-400">{client.address}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs" onClick={() => navigate(`/clients/${id}/edit`)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" className="text-xs text-red-600" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <h2 className="mb-2 text-sm font-semibold">Documents</h2>
      <div className="rounded-xl border border-slate-200 bg-white">
        {docs.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No documents for this client</p>
        ) : (
          docs.map((doc) => (
            <Link
              key={doc.id}
              to={`/documents/${doc.id}`}
              className="flex items-center justify-between border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
            >
              <span className="text-sm font-medium">{doc.document_number}</span>
              <span className="text-xs text-slate-500">
                {formatDate(doc.issue_date, dateFormat)} · {symbolFor(doc.currency)}{doc.total_amount.toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>
      {AlertHost}
    </AppShell>
  )
}
