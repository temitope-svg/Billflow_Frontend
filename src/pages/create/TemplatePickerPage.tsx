import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Button } from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/Spinner'
import { getTemplates } from '../../services/documents'
import { createEmptyDraft, saveDraft } from '../../hooks/useDocumentDraft'
import { getDefaultTemplateId } from '../../utils/defaultTemplate'
import { useProfile } from '../../hooks/useProfile'
import type { DocumentType, StyleTag, Template } from '../../types/database'

const styleFilters: Array<{ id: 'all' | StyleTag; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'classic', label: 'Classic' },
]

const previewColors: Record<string, { bg: string; accent: string; text: string }> = {
  minimal: { bg: '#EEF2FF', accent: '#4F46E5', text: '#3730A3' },
  bold: { bg: '#1E293B', accent: '#4F46E5', text: '#94A3B8' },
  classic: { bg: '#F8FAFC', accent: '#0F172A', text: '#0F172A' },
}

export default function TemplatePickerPage() {
  const { type } = useParams<{ type: DocumentType }>()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filter, setFilter] = useState<'all' | StyleTag>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const documentType = type as DocumentType

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

  const handleContinue = () => {
    if (!selected || !documentType) return
    const template = templates.find((t) => t.id === selected)
    const draft = createEmptyDraft(documentType, selected)
    draft.templateName = template?.name
    saveDraft(draft)
    navigate(`/new/${documentType}/details`)
  }

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <Link
        to="/new"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-base font-semibold capitalize">Choose a {documentType} template</h1>
      <p className="text-xs text-slate-500">Step 1 of 3 — Template</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {styleFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${filter === f.id ? 'bg-brand text-white' : 'border border-slate-200 bg-white text-slate-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((template) => {
          const colors = previewColors[template.style_tag ?? 'minimal'] ?? previewColors.minimal
          const isSelected = selected === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelected(template.id)}
              className={`overflow-hidden rounded-xl border-2 bg-white text-left transition ${isSelected ? 'border-brand' : 'border-slate-200'}`}
            >
              <div
                className="flex min-h-[130px] flex-col gap-1 p-4"
                style={{ background: colors.bg }}
              >
                <div className="mb-1 flex justify-between">
                  <div className="h-5 w-5 rounded" style={{ background: colors.accent }} />
                  <span className="text-[9px] font-semibold uppercase" style={{ color: colors.text }}>
                    {documentType}
                  </span>
                </div>
                {[70, 50, 100, 100].map((w) => (
                  <div
                    key={w}
                    className="h-1 rounded"
                    style={{ width: `${w}%`, background: `${colors.accent}33` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs font-medium">
                {template.name}
                {isSelected && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue}>Use this template →</Button>
      </div>
    </AppShell>
  )
}
