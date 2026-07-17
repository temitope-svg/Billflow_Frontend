import { useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { DocumentWithDetails } from '../../types/database'
import { symbolFor } from '../../constants/currencies'
import { markDocumentPaid } from '../../services/documents'

const PAYMENT_METHODS = ['Bank transfer', 'Cash', 'POS', 'Cheque'] as const

interface MarkPaidModalProps {
  doc: DocumentWithDetails
  onClose: () => void
  onSuccess: (updated: DocumentWithDetails) => void
}

export function MarkPaidModal({ doc, onClose, onSuccess }: MarkPaidModalProps) {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState<string>('Bank transfer')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const symbol = symbolFor(doc.currency)
  const subtitle = `${doc.document_number} · ${doc.recipient?.name ?? '—'} · ${symbol}${doc.total_amount.toLocaleString()}`

  const handleConfirm = async () => {
    setSaving(true)
    setError(null)
    const { data, error: err } = await markDocumentPaid(
      doc.id,
      paidDate,
      method,
      reference.trim() || undefined,
    )
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onSuccess({
      ...doc,
      ...(data ?? {}),
      status: 'paid',
      paid_date: paidDate,
      payment_method: method,
      payment_reference: reference.trim() || null,
    })
  }

  return (
    <div className="p-6 pt-8">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
          {symbol}
        </div>
        <h2 className="text-base font-semibold text-slate-900">Confirm payment</h2>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-4 text-left">
        <Input
          label="Date paid"
          type="date"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
        />

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-700">Payment method</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => {
              const active = method === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-brand bg-indigo-50 text-indigo-800'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        <Input
          label="Reference no. (optional)"
          placeholder="e.g. TRX-00456789"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <div className="flex gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-left">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-xs leading-relaxed text-emerald-800">
            After confirming, you&apos;ll be taken to choose a{' '}
            <span className="font-semibold">receipt</span> template to review before saving.
          </p>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
        <Button fullWidth onClick={handleConfirm} disabled={saving || !paidDate}>
          {saving ? 'Saving…' : 'Confirm & generate receipt'}
        </Button>
        <Button variant="outline" fullWidth onClick={onClose} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
