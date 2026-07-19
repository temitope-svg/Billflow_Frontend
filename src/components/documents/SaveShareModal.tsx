import { useState } from 'react'
import { Check, Copy, Download, Mail, MessageCircle, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import type { DocumentWithDetails } from '../../types/database'
import { symbolFor } from '../../constants/currencies'
import { formatDate } from '../../utils/formatDate'
import { publicDocumentUrl } from '../../utils/publicSlug'

interface SaveShareModalProps {
  doc: DocumentWithDetails
  html: string | null
  publicSlug?: string | null
  onClose: () => void
  onView: () => void
  onDownload: () => void
}

export function SaveShareModal({
  doc,
  publicSlug,
  onClose,
  onView,
  onDownload,
}: SaveShareModalProps) {
  const symbol = symbolFor(doc.currency)
  const link = publicSlug ? publicDocumentUrl(publicSlug) : ''
  const shareText = `${doc.document_number} — ${doc.recipient?.name ?? ''} — ${symbol}${doc.total_amount.toLocaleString()}`
  const [copiedLink, setCopiedLink] = useState(false)

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    window.setTimeout(() => setCopiedLink(false), 2000)
  }

  const shareWhatsApp = () => {
    const body = link ? `${shareText}\n${link}` : shareText
    window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, '_blank')
  }

  const shareEmail = () => {
    const body = link ? `${shareText}\n${link}` : shareText
    window.location.href = `mailto:?subject=${encodeURIComponent(doc.document_number)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="p-6 pt-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
        <Check className="h-6 w-6 text-brand" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">{doc.document_number} saved</h2>
      <p className="mt-1 text-xs text-slate-500">
        {doc.recipient?.name} · {symbol}
        {doc.total_amount.toLocaleString()}
        {doc.due_date ? ` · Due ${formatDate(doc.due_date)}` : ''}
      </p>
      {doc.is_public && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
          Public
        </span>
      )}

      {link && (
        <div className="mt-5 text-left">
          <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            Shareable link
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="flex-1 truncate font-mono text-xs text-brand">{link}</span>
            <Button variant="outline" className="px-2 py-1 text-[10px]" onClick={() => void copyLink()}>
              <Copy className="h-3 w-3" />
              {copiedLink ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2 text-left">
        <ShareRow icon={Download} iconBg="bg-indigo-50" iconColor="text-brand" title="Download PDF" onClick={onDownload} />
        <ShareRow icon={MessageCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Share via WhatsApp" onClick={shareWhatsApp} />
        <ShareRow icon={Mail} iconBg="bg-red-50" iconColor="text-red-500" title="Share via Gmail" onClick={shareEmail} />
      </div>

      <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
        <Button variant="outline" fullWidth onClick={onClose}>
          Close
        </Button>
        <Button fullWidth onClick={onView}>
          View document
        </Button>
      </div>
    </div>
  )
}

function ShareRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  onClick,
}: {
  icon: typeof Download
  iconBg: string
  iconColor: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:bg-white"
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <span className="flex-1 text-xs font-medium text-slate-900">{title}</span>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  )
}
