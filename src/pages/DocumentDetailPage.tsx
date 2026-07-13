import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Globe, Lock } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import { DocumentHtmlPreview } from '../components/documents/DocumentPreview'
import { getDocumentWithDetails, updateDocument } from '../services/documents'
import { buildDocumentHtml, printDocumentPdf } from '../services/documentHtml'
import { enrichDocWithProfileLogo } from '../utils/documentLogo'
import { getStatusBadge } from '../utils/documentStatus'
import { useAuth } from '../context/AuthContext'
import { useDateFormat } from '../hooks/useProfile'
import { buildPublicSlug, publicDocumentUrl } from '../utils/publicSlug'
import type { DocumentWithDetails } from '../types/database'

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const dateFormat = useDateFormat()
  const [doc, setDoc] = useState<DocumentWithDetails | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    if (!error && data) {
      setDoc({ ...doc, is_public: next, public_slug: slug })
    }
  }

  const handleDownload = () => {
    if (html && doc) printDocumentPdf(html, doc.document_number)
  }

  if (loading) return <AppShell><PageLoader /></AppShell>
  if (!doc) return <AppShell><p>Document not found</p></AppShell>

  const badge = getStatusBadge(doc)

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
        <div className="flex items-center gap-2">
          <Badge style={badge} />
          <Button variant="outline" className="text-xs" onClick={togglePublic}>
            {doc.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {doc.is_public ? 'Public' : 'Make public'}
          </Button>
          <Button className="text-xs" onClick={handleDownload}>Download PDF</Button>
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
    </AppShell>
  )
}
