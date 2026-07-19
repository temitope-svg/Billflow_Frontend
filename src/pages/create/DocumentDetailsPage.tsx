import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Trash2, Users } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { BackButton } from '../../components/ui/BackButton'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Card, SectionHead } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { BusinessProfileSetupModal } from '../../components/profile/BusinessProfileSetupModal'
import { DocumentMiniPreview } from '../../components/documents/DocumentPreview'
import {
  emptyLineItem,
  loadDraft,
  saveDraft,
  type DocumentDraft,
} from '../../hooks/useDocumentDraft'
import { useProfile, useDateFormat } from '../../hooks/useProfile'
import { useAuth } from '../../context/AuthContext'
import { findClientMatches, getClients } from '../../services/clients'
import { symbolFor } from '../../constants/currencies'
import { hasNoLeadingNumber, hasTextBeforeNumber, lineItemTotal } from '../../utils/lineItems'
import { isBusinessProfileComplete, markProfilePromptShownThisLogin } from '../../utils/profilePrompt'
import type { Client, DocumentType } from '../../types/database'

const PAYMENT_METHODS = ['Bank transfer', 'Cash', 'POS', 'Cheque'] as const

function AutoBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-800">
      {label}
    </span>
  )
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={accent ? 'font-semibold text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className={accent ? 'text-base font-semibold text-brand' : 'text-slate-900'}>{value}</span>
    </div>
  )
}

export default function DocumentDetailsPage() {
  const { type } = useParams<{ type: DocumentType }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const dateFormat = useDateFormat()
  const [draft, setDraft] = useState<DocumentDraft | null>(null)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)

  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([])
  const [showClientPicker, setShowClientPicker] = useState(false)
  const [allClients, setAllClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [clientPickerSearch, setClientPickerSearch] = useState('')
  const [dueDateError, setDueDateError] = useState('')

  useEffect(() => {
    const existing = loadDraft()
    if (existing && existing.documentType === type) {
      setDraft(existing)
      return
    }
    if (type) navigate(`/new/${type}/template`, { replace: true })
  }, [type, navigate])

  useEffect(() => {
    if (profileLoading || !user) return
    if (isBusinessProfileComplete(profile)) {
      setShowProfilePrompt(false)
      return
    }
    markProfilePromptShownThisLogin(user.id)
    setShowProfilePrompt(true)
  }, [profile, profileLoading, user])

  useEffect(() => {
    if (!user || !draft || draft.clientId || draft.clientName.trim().length < 2) {
      setClientSuggestions([])
      return
    }
    const timeout = setTimeout(async () => {
      const { data } = await findClientMatches(user.id, draft.clientName.trim())
      setClientSuggestions(data ?? [])
    }, 300)
    return () => clearTimeout(timeout)
  }, [user, draft?.clientName, draft?.clientId])

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

  const pickClient = (client: Client) => {
    update({
      clientName: client.name,
      clientEmail: client.email ?? '',
      clientPhone: client.phone ?? '',
      clientAddress: client.address ?? '',
      clientId: client.id,
    })
    setClientSuggestions([])
  }

  const onChangeClientName = (value: string) => {
    update({ clientName: value, clientId: null })
  }

  const openClientPicker = async () => {
    setShowClientPicker(true)
    if (!user || allClients.length > 0) return
    setLoadingClients(true)
    const { data } = await getClients(user.id)
    if (data) setAllClients(data)
    setLoadingClients(false)
  }

  const selectFromPicker = (client: Client) => {
    pickClient(client)
    setShowClientPicker(false)
    setClientPickerSearch('')
  }

  const filteredPickerClients = clientPickerSearch.trim()
    ? allClients.filter((c) =>
        c.name.toLowerCase().includes(clientPickerSearch.trim().toLowerCase()),
      )
    : allClients

  const symbol = symbolFor(profile?.currency)
  const formatCurrency = (n: number) =>
    `${symbol}${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

  const subtotal = draft.lineItems.reduce(
    (sum, item) => sum + lineItemTotal(item.unit, item.unitPrice),
    0,
  )
  const vatAmt = subtotal * ((parseFloat(draft.vatRate) || 0) / 100)
  const discAmt = parseFloat(draft.discountAmount) || 0
  const total = subtotal + vatAmt - discAmt

  const goToPreview = () => {
    if (type === 'invoice' && !draft.dueDate) {
      setDueDateError('Due date is required')
      return
    }
    setDueDateError('')
    if (!isBusinessProfileComplete(profile)) {
      setShowProfilePrompt(true)
      return
    }
    navigate(`/new/${type}/preview`)
  }

  return (
    <AppShell>
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <BackButton
            fallback={
              draft?.editDocumentId
                ? `/documents/${draft.editDocumentId}`
                : `/new/${type}/template`
            }
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500"
          />
          <h1 className="text-sm font-semibold capitalize">{type} details</h1>
          <p className="mb-4 text-[10px] text-slate-500">Step 2 of 3 — Details</p>

          {/* FROM */}
          <Card className="mb-3">
            <SectionHead badge={<AutoBadge label="auto-filled" />}>From business profile</SectionHead>
            <p className="text-sm text-slate-900">{profile?.business_name ?? 'Your business'}</p>
            {(profile?.address || profile?.email) && (
              <p className="mt-1 text-xs text-slate-500">
                {[profile.address, profile.email].filter(Boolean).join(' · ')}
              </p>
            )}
          </Card>

          {/* TO */}
          <Card className="mb-3">
            <SectionHead>To (client)</SectionHead>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Client name</label>
              <button
                type="button"
                onClick={openClientPicker}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand"
              >
                <Users className="h-3 w-3" />
                Choose existing
              </button>
            </div>
            <Input
              placeholder="Client name"
              value={draft.clientName}
              onChange={(e) => onChangeClientName(e.target.value)}
            />
            {clientSuggestions.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {clientSuggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickClient(c)}
                    className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                    {c.email && <p className="text-[11px] text-slate-500">{c.email}</p>}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={draft.clientEmail}
                onChange={(e) => update({ clientEmail: e.target.value })}
              />
              <Input
                label="Phone"
                value={draft.clientPhone}
                onChange={(e) => update({ clientPhone: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address"
                  value={draft.clientAddress}
                  onChange={(e) => update({ clientAddress: e.target.value })}
                  placeholder="Address (optional)"
                />
              </div>
            </div>
          </Card>

          {/* DOCUMENT INFO */}
          <Card className="mb-3">
            <SectionHead>Document info</SectionHead>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Issue date"
                type="date"
                value={draft.issueDate}
                onChange={(e) => update({ issueDate: e.target.value })}
              />
              {type === 'invoice' && (
                <Input
                  label="Due date *"
                  type="date"
                  required
                  value={draft.dueDate}
                  error={dueDateError}
                  onChange={(e) => {
                    setDueDateError('')
                    update({ dueDate: e.target.value })
                  }}
                />
              )}
              {type === 'estimate' && (
                <Input
                  label="Valid until"
                  type="date"
                  value={draft.validUntil}
                  onChange={(e) => update({ validUntil: e.target.value })}
                />
              )}
            </div>
          </Card>

          {/* PAYMENT (receipt only) */}
          {type === 'receipt' && (
            <Card className="mb-3">
              <SectionHead>Payment details</SectionHead>
              <Input
                label="Date paid"
                type="date"
                value={draft.paidDate}
                onChange={(e) => update({ paidDate: e.target.value })}
              />
              <p className="mt-3 mb-1.5 text-xs font-medium text-slate-700">Method</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const active = draft.paymentMethod === method
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => update({ paymentMethod: method })}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-brand bg-indigo-50 font-semibold text-indigo-800'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  )
                })}
              </div>
              <Input
                label="Reference / transaction no."
                placeholder="e.g. TRX-00123456"
                value={draft.paymentRef}
                onChange={(e) => update({ paymentRef: e.target.value })}
              />
            </Card>
          )}

          {/* LINE ITEMS */}
          <Card className="mb-3">
            <SectionHead>Line items</SectionHead>
            <div className="space-y-2">
              {draft.lineItems.map((item, idx) => {
                const unitBad = hasTextBeforeNumber(item.unit)
                const priceBad = hasNoLeadingNumber(item.unitPrice)
                return (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Input
                        placeholder={`Item ${idx + 1} description`}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                      {draft.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              lineItems: draft.lineItems.filter((i) => i.id !== item.id),
                            })
                          }
                          className="shrink-0 text-slate-400 hover:text-slate-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Unit"
                        placeholder="e.g. 4, kg, hrs"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        error={unitBad ? 'Start with a number (e.g. 2 weeks)' : undefined}
                      />
                      <div>
                        <Input
                          label="Unit price"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                          error={priceBad ? 'Start with a number' : undefined}
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-700">Total</p>
                        <div className="flex h-[42px] items-center justify-end rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-brand">
                          {item.unit || item.unitPrice
                            ? `${symbol}${lineItemTotal(item.unit, item.unitPrice).toLocaleString()}`
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => update({ lineItems: [...draft.lineItems, emptyLineItem()] })}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-semibold text-brand"
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </button>
          </Card>

          {/* TAX & DISCOUNT (invoice only) */}
          {type === 'invoice' && (
            <Card className="mb-3">
              <SectionHead>Tax &amp; discount</SectionHead>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="VAT (%)"
                  placeholder="0.00"
                  value={draft.vatRate}
                  onChange={(e) => update({ vatRate: e.target.value })}
                />
                <Input
                  label={`Discount (${symbol})`}
                  placeholder="0.00"
                  value={draft.discountAmount}
                  onChange={(e) => update({ discountAmount: e.target.value })}
                />
              </div>
            </Card>
          )}

          {/* BANK DETAILS (invoice only) */}
          {type === 'invoice' && (
            <Card className="mb-3">
              <SectionHead>Bank details</SectionHead>
              <div className="space-y-3">
                <Input
                  label="Bank name"
                  placeholder="e.g. Zenith Bank"
                  value={draft.bankName}
                  onChange={(e) => update({ bankName: e.target.value })}
                />
                <Input
                  label="Account name"
                  placeholder="Account name"
                  value={draft.accountName}
                  onChange={(e) => update({ accountName: e.target.value })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Account no."
                    placeholder="0123456789"
                    value={draft.accountNumber}
                    onChange={(e) => update({ accountNumber: e.target.value })}
                  />
                  <Input
                    label="Sort code (optional)"
                    placeholder="00-00-00"
                    value={draft.sortCode}
                    onChange={(e) => update({ sortCode: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SUMMARY */}
          <Card className="mb-3">
            <SectionHead>Summary</SectionHead>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
              {draft.vatRate ? (
                <SummaryRow label={`VAT (${draft.vatRate}%)`} value={formatCurrency(vatAmt)} />
              ) : null}
              {draft.discountAmount ? (
                <SummaryRow label="Discount" value={`-${formatCurrency(discAmt)}`} />
              ) : null}
              <div className="my-1 border-t border-slate-200" />
              <SummaryRow
                label={type === 'receipt' ? 'Amount paid' : 'Total'}
                value={formatCurrency(total)}
                accent
              />
            </div>
          </Card>

          {/* NOTES */}
          <Card className="mb-3">
            <SectionHead>Notes</SectionHead>
            <Textarea
              placeholder={
                type === 'receipt'
                  ? 'Thank you message or notes...'
                  : 'Add a note for your client...'
              }
              value={draft.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
            />
          </Card>

          {/* TERMS (non-receipt) */}
          {type !== 'receipt' && (
            <Card className="mb-3">
              <SectionHead>Terms &amp; conditions</SectionHead>
              <Textarea
                placeholder="Payment terms, late fees, warranty..."
                value={draft.terms}
                onChange={(e) => update({ terms: e.target.value })}
                rows={3}
              />
            </Card>
          )}
        </div>

        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-4">
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Live preview
            </p>
            <DocumentMiniPreview
              draft={draft}
              businessName={profile?.business_name ?? ''}
              logoUrl={profile?.logo_url}
              currency={profile?.currency}
              dateFormat={dateFormat}
            />
            <p className="mt-2 rounded-lg bg-indigo-50 p-2.5 text-[10px] leading-relaxed text-indigo-800">
              Updates live as you type
            </p>
            <Button fullWidth className="mt-3 capitalize" onClick={goToPreview}>
              Preview {type}
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Button fullWidth className="capitalize" onClick={goToPreview}>
          Preview {type}
        </Button>
      </div>

      <Modal open={showClientPicker} onClose={() => setShowClientPicker(false)}>
        <div className="p-5 pt-6">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Choose a client</h2>
          <div className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search clients…"
              value={clientPickerSearch}
              onChange={(e) => setClientPickerSearch(e.target.value)}
              autoFocus
            />
          </div>
          {loadingClients ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
          ) : filteredPickerClients.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {allClients.length === 0 ? 'No saved clients yet' : 'No matches'}
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {filteredPickerClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectFromPicker(c)}
                  className="block w-full border-b border-slate-100 px-1 py-3 text-left last:border-0 hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <BusinessProfileSetupModal
        open={showProfilePrompt}
        onSkip={() => setShowProfilePrompt(false)}
        onClose={() => setShowProfilePrompt(false)}
        title="Please fill your business profile"
        description={`Please set up your business name and logo before creating this ${type}. We'll auto-fill them on every estimate, invoice and receipt.`}
      />
    </AppShell>
  )
}
