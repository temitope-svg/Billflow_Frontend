import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Card, SectionHead } from '../../components/ui/Card'
import { DocumentMiniPreview } from '../../components/documents/DocumentPreview'
import {
  emptyLineItem,
  loadDraft,
  saveDraft,
  type DocumentDraft,
} from '../../hooks/useDocumentDraft'
import { useProfile } from '../../hooks/useProfile'
import { symbolFor } from '../../constants/currencies'
import { lineItemTotal } from '../../utils/lineItems'
import type { DocumentType } from '../../types/database'

export default function DocumentDetailsPage() {
  const { type } = useParams<{ type: DocumentType }>()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [draft, setDraft] = useState<DocumentDraft | null>(null)

  useEffect(() => {
    const existing = loadDraft()
    if (existing && existing.documentType === type) {
      setDraft(existing)
      return
    }
    if (type) navigate(`/new/${type}/template`, { replace: true })
  }, [type, navigate])

  if (!draft || !type) return null

  const update = (patch: Partial<DocumentDraft>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    saveDraft(next)
  }

  const updateItem = (id: string, field: 'description' | 'unit' | 'unitPrice', value: string) => {
    update({
      lineItems: draft.lineItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    })
  }

  const symbol = symbolFor(profile?.currency)

  return (
    <AppShell>
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <Link
            to={`/new/${type}/template`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-sm font-semibold capitalize">{type} details</h1>
          <p className="mb-4 text-[10px] text-slate-500">Step 2 of 3 — Details</p>

          <Card className="mb-3">
            <SectionHead badge={<span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] text-indigo-800">auto-filled</span>}>
              From
            </SectionHead>
            <p className="text-sm">{profile?.business_name ?? 'Your business'}</p>
          </Card>

          <Card className="mb-3">
            <SectionHead>To</SectionHead>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Client name" value={draft.clientName} onChange={(e) => update({ clientName: e.target.value })} />
              <Input label="Email" type="email" value={draft.clientEmail} onChange={(e) => update({ clientEmail: e.target.value })} />
              <Input label="Phone" value={draft.clientPhone} onChange={(e) => update({ clientPhone: e.target.value })} />
              <Input label="Address" value={draft.clientAddress} onChange={(e) => update({ clientAddress: e.target.value })} />
            </div>
          </Card>

          <Card className="mb-3">
            <SectionHead>Document info</SectionHead>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Issue date" type="date" value={draft.issueDate} onChange={(e) => update({ issueDate: e.target.value })} />
              {type !== 'receipt' && (
                <Input
                  label={type === 'estimate' ? 'Valid until' : 'Due date'}
                  type="date"
                  value={type === 'estimate' ? draft.validUntil : draft.dueDate}
                  onChange={(e) =>
                    update(type === 'estimate' ? { validUntil: e.target.value } : { dueDate: e.target.value })
                  }
                />
              )}
            </div>
            <Textarea label="Payment terms" value={draft.terms} onChange={(e) => update({ terms: e.target.value })} rows={2} className="mt-3" />
          </Card>

          <Card className="mb-3">
            <SectionHead>Line items</SectionHead>
            <div className="space-y-2">
              {draft.lineItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                    <button type="button" onClick={() => update({ lineItems: draft.lineItems.filter((i) => i.id !== item.id) })} className="ml-2 text-slate-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Qty / unit" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} />
                    <Input placeholder="Unit price" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} />
                    <div className="flex items-center justify-end text-xs font-medium text-brand">
                      {symbol}
                      {lineItemTotal(item.unit, item.unitPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => update({ lineItems: [...draft.lineItems, emptyLineItem()] })}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs text-brand"
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </button>
          </Card>

          <Card>
            <SectionHead>Tax &amp; discount</SectionHead>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="VAT (%)" value={draft.vatRate} onChange={(e) => update({ vatRate: e.target.value })} />
              <Input label={`Discount (${symbol})`} value={draft.discountAmount} onChange={(e) => update({ discountAmount: e.target.value })} />
            </div>
          </Card>
        </div>

        <div className="hidden w-72 shrink-0 lg:block">
          <p className="mb-2 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">Live preview</p>
          <DocumentMiniPreview draft={draft} businessName={profile?.business_name ?? ''} />
          <p className="mt-2 rounded-lg bg-indigo-50 p-2.5 text-[10px] leading-relaxed text-indigo-800">
            Updates live as you type
          </p>
          <Button fullWidth className="mt-3" onClick={() => navigate(`/new/${type}/preview`)}>
            Continue to preview →
          </Button>
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <Button fullWidth onClick={() => navigate(`/new/${type}/preview`)}>
          Continue to preview →
        </Button>
      </div>
    </AppShell>
  )
}
