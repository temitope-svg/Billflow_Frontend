import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Globe, Info, Lock, Pencil } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Button } from '../../components/ui/Button'
import { Card, SectionHead } from '../../components/ui/Card'
import { Toggle } from '../../components/ui/Toggle'
import { Modal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import {
  buildPreviewDocFromDraft,
  DocumentHtmlPreview,
} from '../../components/documents/DocumentPreview'
import { SaveShareModal } from '../../components/documents/SaveShareModal'
import { clearDraft, loadDraft, saveDraft } from '../../hooks/useDocumentDraft'
import { useAuth } from '../../context/AuthContext'
import { useProfile, useDateFormat } from '../../hooks/useProfile'
import { useAlertModal } from '../../hooks/useAlertModal'
import { getTemplates } from '../../services/documents'
import { buildDocumentHtml, printDocumentPdf } from '../../services/documentHtml'
import { enrichDocWithProfileLogo } from '../../utils/documentLogo'
import { saveDocumentFromDraft } from '../../utils/saveDocument'
import type { DocumentType, DocumentWithDetails, Template } from '../../types/database'

export default function DocumentPreviewPage() {
  const { type } = useParams<{ type: DocumentType }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile()
  const dateFormat = useDateFormat()
  const { showError, AlertHost } = useAlertModal()
  const [draft, setDraft] = useState(loadDraft())
  const [template, setTemplate] = useState<Template | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocumentWithDetails | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!draft || draft.documentType !== type) {
      navigate(type ? `/new/${type}/details` : '/new', { replace: true })
      return
    }
    getTemplates(draft.documentType).then(({ data }) => {
      const t = (data as Template[])?.find((x) => x.id === draft.templateId) ?? null
      setTemplate(t)
    })
  }, [draft, type, navigate])

  useEffect(() => {
    if (!draft || !template || !profile) {
      setPreviewDoc(null)
      setHtml(null)
      return
    }

    let cancelled = false
    const build = async () => {
      let doc = buildPreviewDocFromDraft(draft, profile, template)
      if (user) doc = await enrichDocWithProfileLogo(doc, user.id)
      if (cancelled) return
      setPreviewDoc(doc)
      setHtml(buildDocumentHtml(doc, dateFormat))
    }
    build()
    return () => {
      cancelled = true
    }
  }, [draft, template, profile, user, dateFormat])

  const updateDraft = (patch: Partial<NonNullable<typeof draft>>) => {
    if (!draft) return
    const next = { ...draft, ...patch }
    setDraft(next)
    saveDraft(next)
  }

  const handleSave = async () => {
    if (!user || !draft) return
    setSaving(true)
    try {
      const doc = await saveDocumentFromDraft(draft, user, profile)
      clearDraft()
      setSavedId(doc!.id)
      setSavedSlug(doc!.public_slug ?? null)
      setShowModal(true)
    } catch (e) {
      showError(
        'Could not save document',
        e instanceof Error ? e.message : 'Something went wrong while saving. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!previewDoc || !user) return
    const enriched = await enrichDocWithProfileLogo(previewDoc, user.id)
    const enrichedHtml = buildDocumentHtml(enriched, dateFormat)
    if (enrichedHtml) printDocumentPdf(enrichedHtml, previewDoc.document_number)
  }

  if (!draft || !type) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Link to={`/new/${type}/details`} className="inline-flex items-center gap-2 text-sm text-slate-500">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <h1 className="text-sm font-semibold capitalize">Preview {type}</h1>
              <p className="text-[10px] text-slate-500">Step 3 of 3 — Preview &amp; save</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-xs" onClick={() => navigate(`/new/${type}/details`)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" className="text-xs" onClick={() => navigate(`/new/${type}/template`)}>
                Change template
              </Button>
            </div>
          </div>

          {html ? <DocumentHtmlPreview html={html} /> : <PageLoader />}
        </div>

        <div className="w-72 shrink-0 space-y-3">
          <Card>
            <SectionHead>Document visibility</SectionHead>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  {draft.isPublic ? <Globe className="h-3.5 w-3.5 text-emerald-600" /> : <Lock className="h-3.5 w-3.5 text-slate-400" />}
                  {draft.isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {draft.isPublic ? 'Anyone with the link can view' : 'Only you can view this'}
                </p>
              </div>
              <Toggle checked={draft.isPublic} onChange={(v) => updateDraft({ isPublic: v })} />
            </div>
            {draft.isPublic && (
              <p className="mt-2 truncate font-mono text-[10px] text-emerald-600">
                Link will be generated on save
              </p>
            )}
            <p className="mt-2 flex gap-1.5 rounded-lg bg-indigo-50 p-2 text-[10px] leading-relaxed text-indigo-800">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Toggle on to generate a public link anyone can open — no account needed.
            </p>
          </Card>

          <Card>
            <SectionHead>Signature</SectionHead>
            <div className="flex items-center justify-between">
              <span className="text-xs">Show on document</span>
              <Toggle checked={draft.useSignature} onChange={(v) => updateDraft({ useSignature: v })} />
            </div>
          </Card>

          <Button fullWidth className="py-2.5" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : `Save ${type}`}
          </Button>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        {previewDoc && savedId && (
          <SaveShareModal
            doc={{ ...previewDoc, id: savedId, is_public: draft.isPublic, public_slug: savedSlug }}
            publicSlug={savedSlug}
            onClose={() => setShowModal(false)}
            onView={() => navigate(`/documents/${savedId}`)}
            onDownload={handleDownload}
          />
        )}
      </Modal>
      {AlertHost}
    </AppShell>
  )
}
