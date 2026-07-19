import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CircleCheckBig,
  Copy,
  Eye,
  FileText,
  Globe,
  Lock,
  Pencil,
  Receipt,
  Share2,
  Trash2,
  Ban,
} from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { DocumentHtmlPreview } from '../components/documents/DocumentPreview'
import { ShareDocumentModal } from '../components/documents/ShareDocumentModal'
import { MarkPaidModal } from '../components/documents/MarkPaidModal'
import {
  deleteDocument,
  getChildDocument,
  getDocumentWithDetails,
  updateDocument,
} from '../services/documents'
import { buildDocumentHtml, downloadDocumentHtmlAsPdf } from '../services/documentHtml'
import { enrichDocWithProfileLogo } from '../utils/documentLogo'
import { getStatusBadge } from '../utils/documentStatus'
import { useAuth } from '../context/AuthContext'
import { useDateFormat } from '../hooks/useProfile'
import { useAlertModal } from '../hooks/useAlertModal'
import { draftFromDocument, saveDraft } from '../hooks/useDocumentDraft'
import { buildPublicSlug, publicDocumentUrl } from '../utils/publicSlug'
import type { DocumentWithDetails } from '../types/database'

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const dateFormat = useDateFormat()
  const { showSuccess, showError, askConfirm, AlertHost } = useAlertModal()
  const [doc, setDoc] = useState<DocumentWithDetails | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [showMarkPaid, setShowMarkPaid] = useState(false)
  const [childInvoiceId, setChildInvoiceId] = useState<string | null>(null)
  const [childReceiptId, setChildReceiptId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      const { data } = await getDocumentWithDetails(id)
      if (cancelled) return
      if (!data) {
        setLoading(false)
        return
      }

      let loaded = data as unknown as DocumentWithDetails
      if (user) loaded = await enrichDocWithProfileLogo(loaded, user.id)
      if (cancelled) return

      setDoc(loaded)
      setHtml(buildDocumentHtml(loaded, dateFormat))

      if (loaded.document_type === 'estimate') {
        const { data: child } = await getChildDocument(id, 'invoice')
        if (!cancelled) setChildInvoiceId(child?.id ?? null)
      } else if (loaded.document_type === 'invoice') {
        const { data: child } = await getChildDocument(id, 'receipt')
        if (!cancelled) setChildReceiptId(child?.id ?? null)
      }

      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, user, dateFormat])

  const togglePublic = async () => {
    if (!doc) return
    const next = !doc.is_public
    const slug = next ? buildPublicSlug(doc.document_number, doc.id) : null
    const { data, error } = await updateDocument(doc.id, {
      is_public: next,
      public_slug: slug,
    })
    if (error) {
      showError('Could not update visibility', error.message)
      return
    }
    if (data) {
      setDoc({ ...doc, is_public: next, public_slug: slug })
      showSuccess(
        next ? 'Document is public' : 'Document is private',
        next
          ? 'Anyone with the link can view this document.'
          : 'Only you can view this document now.',
      )
    }
  }

  const handleDownload = async () => {
    if (!html || !doc) return
    setDownloading(true)
    try {
      await downloadDocumentHtmlAsPdf(html, doc.document_number)
    } catch (e) {
      showError(
        'Could not download PDF',
        e instanceof Error ? e.message : 'Something went wrong while generating the PDF.',
      )
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyPublicLink = async () => {
    if (!doc?.public_slug) return
    const url = publicDocumentUrl(doc.public_slug)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      showError('Could not copy link', 'Your browser blocked clipboard access. Copy the link manually.')
    }
  }

  const handleEdit = () => {
    if (!doc) return
    if (!doc.template_id) {
      showError('No template', "This document has no template assigned, so it can't be edited.")
      return
    }
    saveDraft(draftFromDocument(doc, { editDocumentId: doc.id }))
    navigate(`/new/${doc.document_type}/details`)
  }

  const handleDelete = () => {
    if (!doc) return
    askConfirm({
      tone: 'danger',
      title: 'Delete document?',
      message: `Are you sure you want to delete ${doc.document_number}? This cannot be undone.`,
      confirmLabel: 'Delete',
      icon: Trash2,
      onConfirm: async () => {
        const { error } = await deleteDocument(doc.id)
        if (error) {
          showError('Could not delete document', error.message)
          return
        }
        navigate('/documents')
      },
    })
  }

  const handleMarkPaidSuccess = async (updated: DocumentWithDetails) => {
    setDoc(updated)
    setHtml(buildDocumentHtml(updated, dateFormat))
    setShowMarkPaid(false)

    const { data: existingReceipt } = await getChildDocument(updated.id, 'receipt')
    if (existingReceipt?.id) {
      setChildReceiptId(existingReceipt.id)
      navigate(`/documents/${existingReceipt.id}`)
      return
    }
    navigate(`/new/receipt/template?parentId=${updated.id}`)
  }

  if (loading) return <AppShell><PageLoader /></AppShell>
  if (!doc) return <AppShell><p>Document not found</p></AppShell>

  const badge = getStatusBadge(doc)
  const canMarkPaid = doc.document_type === 'invoice' && doc.status !== 'paid'
  const canViewInvoice = doc.document_type === 'estimate' && !!childInvoiceId
  const canConvertToInvoice =
    doc.document_type === 'estimate' && !childInvoiceId && doc.status !== 'cancelled'
  const canViewReceipt = doc.document_type === 'invoice' && doc.status === 'paid' && !!childReceiptId
  const canIssueReceipt = doc.document_type === 'invoice' && doc.status === 'paid' && !childReceiptId
  const canCancel =
    doc.status !== 'cancelled' &&
    doc.status !== 'paid' &&
    doc.document_type !== 'receipt'

  const handleCancel = () => {
    askConfirm({
      tone: 'danger',
      title: 'Cancel document?',
      message: `${doc.document_number} will be marked as cancelled. You can still view it later.`,
      confirmLabel: 'Cancel document',
      icon: Ban,
      onConfirm: async () => {
        const { data, error } = await updateDocument(doc.id, { status: 'cancelled' })
        if (error) {
          showError('Could not cancel document', error.message)
          return
        }
        if (data) {
          const updated = { ...doc, status: 'cancelled' as const }
          setDoc(updated)
          setHtml(buildDocumentHtml(updated, dateFormat))
          showSuccess('Document cancelled', `${doc.document_number} is now cancelled.`)
        }
      },
    })
  }

  return (
    <AppShell>
      <BackButton fallback="/documents" label="Documents" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{doc.document_number}</h1>
          <p className="text-sm text-slate-500">{doc.recipient?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge style={badge} />
          <Button variant="outline" className="text-xs" onClick={handleEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" className="text-xs" onClick={() => setShowShare(true)}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          {canMarkPaid && (
            <Button variant="outline" className="text-xs text-emerald-700" onClick={() => setShowMarkPaid(true)}>
              <CircleCheckBig className="h-3.5 w-3.5" />
              Mark as paid
            </Button>
          )}
          {canConvertToInvoice && (
            <Button
              variant="outline"
              className="text-xs text-brand"
              onClick={() => navigate(`/new/invoice/template?parentId=${doc.id}`)}
            >
              <FileText className="h-3.5 w-3.5" />
              Convert to invoice
            </Button>
          )}
          {canViewInvoice && (
            <Button
              variant="outline"
              className="text-xs text-brand"
              onClick={() => navigate(`/documents/${childInvoiceId}`)}
            >
              <Eye className="h-3.5 w-3.5" />
              View invoice
            </Button>
          )}
          {canIssueReceipt && (
            <Button
              variant="outline"
              className="text-xs text-emerald-700"
              onClick={() => navigate(`/new/receipt/template?parentId=${doc.id}`)}
            >
              <Receipt className="h-3.5 w-3.5" />
              Issue receipt
            </Button>
          )}
          {canViewReceipt && (
            <Button
              variant="outline"
              className="text-xs text-emerald-700"
              onClick={() => navigate(`/documents/${childReceiptId}`)}
            >
              <Eye className="h-3.5 w-3.5" />
              View receipt
            </Button>
          )}
          <Button variant="outline" className="text-xs" onClick={togglePublic}>
            {doc.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {doc.is_public ? 'Public' : 'Make public'}
          </Button>
          <Button className="text-xs" onClick={() => void handleDownload()} disabled={downloading}>
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
          {canCancel && (
            <Button variant="outline" className="text-xs text-amber-700" onClick={handleCancel}>
              <Ban className="h-3.5 w-3.5" />
              Mark cancelled
            </Button>
          )}
          <Button variant="outline" className="text-xs text-red-600" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {doc.is_public && doc.public_slug && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <span className="shrink-0">Public link:</span>
          <a
            href={publicDocumentUrl(doc.public_slug)}
            className="min-w-0 flex-1 truncate font-mono underline"
            target="_blank"
            rel="noreferrer"
          >
            {publicDocumentUrl(doc.public_slug)}
          </a>
          <button
            type="button"
            onClick={() => void handleCopyPublicLink()}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-medium text-emerald-800 transition hover:bg-emerald-100"
            title="Copy link"
            aria-label="Copy public link"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedLink ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {html ? <DocumentHtmlPreview html={html} /> : <p className="text-sm text-slate-400">Could not render preview</p>}

      <Modal open={showShare} onClose={() => setShowShare(false)}>
        <ShareDocumentModal
          doc={doc}
          html={html}
          onClose={() => setShowShare(false)}
          onDownload={() => void handleDownload()}
        />
      </Modal>

      <Modal open={showMarkPaid} onClose={() => setShowMarkPaid(false)}>
        <MarkPaidModal
          doc={doc}
          onClose={() => setShowMarkPaid(false)}
          onSuccess={(updated) => void handleMarkPaidSuccess(updated)}
        />
      </Modal>

      {AlertHost}
    </AppShell>
  )
}
