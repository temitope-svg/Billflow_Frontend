import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CircleCheckBig,
  Globe,
  Lock,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { DocumentHtmlPreview } from '../components/documents/DocumentPreview'
import { ShareDocumentModal } from '../components/documents/ShareDocumentModal'
import { MarkPaidModal } from '../components/documents/MarkPaidModal'
import {
  deleteDocument,
  getDocumentWithDetails,
  updateDocument,
} from '../services/documents'
import { buildDocumentHtml, printDocumentPdf } from '../services/documentHtml'
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

  useEffect(() => {
    if (!id) return
    getDocumentWithDetails(id).then(async ({ data }) => {
      if (!data) {
        setLoading(false)
        return
      }
      let loaded = data as unknown as DocumentWithDetails
      if (user) loaded = await enrichDocWithProfileLogo(loaded, user.id)
      setDoc(loaded)
      setHtml(buildDocumentHtml(loaded, dateFormat))
      setLoading(false)
    })
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

  const handleDownload = () => {
    if (html && doc) printDocumentPdf(html, doc.document_number)
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

  const handleMarkPaidSuccess = (updated: DocumentWithDetails) => {
    setDoc(updated)
    setHtml(buildDocumentHtml(updated, dateFormat))
    setShowMarkPaid(false)
    navigate(`/new/receipt/template?parentId=${updated.id}`)
  }

  if (loading) return <AppShell><PageLoader /></AppShell>
  if (!doc) return <AppShell><p>Document not found</p></AppShell>

  const badge = getStatusBadge(doc)
  const canMarkPaid = doc.document_type === 'invoice' && doc.status !== 'paid'

  return (
    <AppShell>
      <Link to="/documents" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Documents
      </Link>
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
          <Button variant="outline" className="text-xs" onClick={togglePublic}>
            {doc.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {doc.is_public ? 'Public' : 'Make public'}
          </Button>
          <Button className="text-xs" onClick={handleDownload}>Download PDF</Button>
          <Button variant="outline" className="text-xs text-red-600" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {doc.is_public && doc.public_slug && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Public link:{' '}
          <a href={publicDocumentUrl(doc.public_slug)} className="font-mono underline" target="_blank" rel="noreferrer">
            {publicDocumentUrl(doc.public_slug)}
          </a>
        </div>
      )}

      {html ? <DocumentHtmlPreview html={html} /> : <p className="text-sm text-slate-400">Could not render preview</p>}

      <Modal open={showShare} onClose={() => setShowShare(false)}>
        <ShareDocumentModal
          doc={doc}
          onClose={() => setShowShare(false)}
          onDownload={handleDownload}
        />
      </Modal>

      <Modal open={showMarkPaid} onClose={() => setShowMarkPaid(false)}>
        <MarkPaidModal
          doc={doc}
          onClose={() => setShowMarkPaid(false)}
          onSuccess={handleMarkPaidSuccess}
        />
      </Modal>

      {AlertHost}
    </AppShell>
  )
}
