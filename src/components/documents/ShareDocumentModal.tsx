import { Copy, Download, Mail, MessageCircle, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import type { DocumentWithDetails } from '../../types/database'
import { symbolFor } from '../../constants/currencies'
import { publicDocumentUrl } from '../../utils/publicSlug'

interface ShareDocumentModalProps {
  doc: DocumentWithDetails
  onClose: () => void
  onDownload: () => void
}

export function ShareDocumentModal({ doc, onClose, onDownload }: ShareDocumentModalProps) {
  const symbol = symbolFor(doc.currency)
  const link = doc.is_public && doc.public_slug ? publicDocumentUrl(doc.public_slug) : ''
  const shareText = `${doc.document_number} — ${doc.recipient?.name ?? ''} — ${symbol}${doc.total_amount.toLocaleString()}`

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
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
      <h2 className="text-base font-semibold text-slate-900">Share {doc.document_number}</h2>
      <p className="mt-1 text-xs text-slate-500">
        {doc.recipient?.name} · {symbol}
        {doc.total_amount.toLocaleString()}
      </p>

      {link ? (
        <div className="mt-5 text-left">
          <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            Shareable link
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="flex-1 truncate font-mono text-xs text-brand">{link}</span>
            <Button variant="outline" className="px-2 py-1 text-[10px]" onClick={copyLink}>
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-left text-[11px] text-amber-800">
          Make this document public to get a shareable link. You can still share the PDF or a message below.
        </p>
      )}

      <div className="mt-4 space-y-2 text-left">
        <ShareRow
          icon={Download}
          iconBg="bg-indigo-50"
          iconColor="text-brand"
          title="Download PDF"
          onClick={onDownload}
        />
        <ShareRow
          icon={MessageCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="Share via WhatsApp"
          onClick={shareWhatsApp}
        />
        <ShareRow
          icon={Mail}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          title="Share via Gmail"
          onClick={shareEmail}
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <Button variant="outline" fullWidth onClick={onClose}>
          Close
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
