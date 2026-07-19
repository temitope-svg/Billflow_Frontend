import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LayoutGrid, Circle, Zap, BookOpen } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/Spinner'
import { TemplateCard } from '../../components/templates/TemplateCard'
import { getDocumentWithDetails, getTemplates } from '../../services/documents'
import { getClient } from '../../services/clients'
import {
  createEmptyDraft,
  draftFromDocument,
  saveDraft,
} from '../../hooks/useDocumentDraft'
import { getDefaultTemplateId } from '../../utils/defaultTemplate'
import { useProfile } from '../../hooks/useProfile'
import type { Client, DocumentType, DocumentWithDetails, StyleTag, Template } from '../../types/database'

const styleFilters: Array<{
  id: 'all' | StyleTag
  label: string
  Icon: typeof LayoutGrid
}> = [
  { id: 'all', label: 'All', Icon: LayoutGrid },
  { id: 'minimal', label: 'Minimal', Icon: Circle },
  { id: 'bold', label: 'Bold', Icon: Zap },
  { id: 'classic', label: 'Classic', Icon: BookOpen },
]

export default function TemplatePickerPage() {
  const { type } = useParams<{ type: DocumentType }>()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get('parentId')
  const clientId = searchParams.get('clientId')
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filter, setFilter] = useState<'all' | StyleTag>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [continuing, setContinuing] = useState(false)

  const documentType = type as DocumentType
  const backTo = clientId ? `/new?clientId=${encodeURIComponent(clientId)}` : '/new'

  useEffect(() => {
    if (!documentType) return
    getTemplates(documentType).then(({ data }) => {
      const list = (data as Template[]) ?? []
      setTemplates(list)
      const defaultId = getDefaultTemplateId(profile, documentType)
      setSelected(defaultId ?? list[0]?.id ?? null)
      setLoading(false)
    })
  }, [documentType, profile])

  const filtered =
    filter === 'all' ? templates : templates.filter((t) => t.style_tag === filter)

  const handleContinue = async () => {
    if (!selected || !documentType) return
    const template = templates.find((t) => t.id === selected)
    setContinuing(true)

    if (parentId) {
      const { data } = await getDocumentWithDetails(parentId)
      if (data) {
        const parent = data as unknown as DocumentWithDetails
        const draft = draftFromDocument(parent, {
          documentType,
          templateId: selected,
          parentId,
        })
        draft.templateName = template?.name
        draft.issueDate = new Date().toISOString().split('T')[0]
        if (documentType === 'receipt') {
          draft.paidDate = parent.paid_date ?? draft.paidDate
          draft.paymentMethod = parent.payment_method ?? draft.paymentMethod
          draft.paymentRef = parent.payment_reference ?? ''
          // Receipts get their own notes — don't carry invoice notes/terms/bank over.
          draft.notes = ''
          draft.terms = ''
          draft.bankName = ''
          draft.accountName = ''
          draft.accountNumber = ''
          draft.sortCode = ''
        }
        saveDraft(draft)
        setContinuing(false)
        navigate(`/new/${documentType}/details`)
        return
      }
    }

    const draft = createEmptyDraft(documentType, selected, {
      vatRate:
        documentType === 'invoice' && profile?.default_vat_rate != null
          ? String(profile.default_vat_rate)
          : '',
    })
    draft.templateName = template?.name

    if (clientId) {
      const { data: clientData } = await getClient(clientId)
      const client = clientData as Client | null
      if (client) {
        draft.clientId = client.id
        draft.clientName = client.name
        draft.clientEmail = client.email ?? ''
        draft.clientPhone = client.phone ?? ''
        draft.clientAddress = client.address ?? ''
      }
    }

    saveDraft(draft)
    setContinuing(false)
    navigate(`/new/${documentType}/details`)
  }

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <BackButton fallback={backTo} />
      <h1 className="text-base font-semibold capitalize">Choose a {documentType} template</h1>
      <p className="text-xs text-slate-500">Step 1 of 3 — Template</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {styleFilters.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-brand bg-indigo-50 font-semibold text-brand'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <f.Icon className={`h-3.5 w-3.5 ${active ? 'text-brand' : 'text-slate-400'}`} />
              {f.label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">No templates in this style.</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              documentType={documentType}
              selected={selected === template.id}
              onSelect={() => setSelected(template.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={() => void handleContinue()} disabled={!selected || continuing}>
          {continuing ? 'Loading…' : 'Use this template →'}
        </Button>
      </div>
    </AppShell>
  )
}
