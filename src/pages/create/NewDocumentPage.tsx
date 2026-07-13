import { useNavigate } from 'react-router-dom'
import { ClipboardList, FileText, Receipt } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import type { DocumentType } from '../../types/database'

const types: Array<{ type: DocumentType; label: string; desc: string; icon: typeof FileText }> = [
  { type: 'estimate', label: 'Estimate', desc: 'Quote a job before it starts', icon: ClipboardList },
  { type: 'invoice', label: 'Invoice', desc: 'Bill a client for your work', icon: FileText },
  { type: 'receipt', label: 'Receipt', desc: 'Confirm a payment was received', icon: Receipt },
]

export default function NewDocumentPage() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <h1 className="mb-2 text-lg font-semibold">Create new document</h1>
      <p className="mb-6 text-sm text-slate-500">Choose a document type to get started</p>
      <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
        {types.map(({ type, label, desc, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => navigate(`/new/${type}/template`)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand hover:shadow-sm"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Icon className="h-5 w-5 text-brand" />
            </div>
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </button>
        ))}
      </div>
    </AppShell>
  )
}
