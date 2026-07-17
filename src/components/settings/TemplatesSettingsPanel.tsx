import { useMemo, useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { Spinner } from '../ui/Spinner'
import { TemplateCard } from '../templates/TemplateCard'
import { defaultTemplateFieldFor } from '../../utils/defaultTemplate'
import type { DocumentType, Template, UserProfile } from '../../types/database'

const TYPE_TABS: { key: DocumentType; label: string }[] = [
  { key: 'invoice', label: 'Invoices' },
  { key: 'estimate', label: 'Estimates' },
  { key: 'receipt', label: 'Receipts' },
]

interface TemplatesSettingsPanelProps {
  templates: Record<DocumentType, Template[]>
  form: Partial<UserProfile>
  saving: boolean
  onSetDefault: (docType: DocumentType, templateId: string) => void
}

export function TemplatesSettingsPanel({
  templates,
  form,
  saving,
  onSetDefault,
}: TemplatesSettingsPanelProps) {
  const [activeType, setActiveType] = useState<DocumentType>('invoice')

  const list = templates[activeType]
  const defaultId = form[defaultTemplateFieldFor(activeType)] ?? null
  const defaultTemplate = useMemo(
    () => list.find((t) => t.id === defaultId) ?? null,
    [list, defaultId],
  )

  return (
    <>
      <h2 className="text-sm font-semibold">Templates</h2>
      <p className="mb-4 text-xs text-slate-500">
        Choose the design pre-selected when you create a new document.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => {
          const active = activeType === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveType(t.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-brand bg-indigo-50 font-semibold text-brand'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {defaultTemplate && (
        <p className="mb-3 text-[11px] text-slate-400">
          Default for new {activeType}s:{' '}
          <span className="font-medium text-slate-600">{defaultTemplate.name}</span>
        </p>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
          <LayoutTemplate className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No templates available</p>
          <p className="mt-1 text-xs text-slate-400">Check back once designs are published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              documentType={activeType}
              selected={defaultId === template.id}
              showDefaultBadge
              disabled={saving}
              onSelect={() => onSetDefault(activeType, template.id)}
            />
          ))}
        </div>
      )}

      {saving && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Spinner className="h-3.5 w-3.5" />
          Updating default…
        </div>
      )}
    </>
  )
}
