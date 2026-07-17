import { useState } from 'react'
import { Check } from 'lucide-react'
import type { DocumentType, Template } from '../../types/database'
import { TemplateMiniPreview } from './TemplateMiniPreview'
import {
  STYLE_TAG_COLORS,
  STYLE_TAG_LABEL,
  getTemplateAccent,
} from './templateStyles'

interface TemplateCardProps {
  template: Template
  documentType: DocumentType
  selected?: boolean
  showDefaultBadge?: boolean
  onSelect: () => void
  disabled?: boolean
}

export function TemplateCard({
  template,
  documentType,
  selected = false,
  showDefaultBadge = false,
  onSelect,
  disabled = false,
}: TemplateCardProps) {
  const [thumbState, setThumbState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const accent = getTemplateAccent(template)
  const tag = template.style_tag ? STYLE_TAG_COLORS[template.style_tag] : null
  const hasThumb = Boolean(template.thumbnail_url) && thumbState !== 'error'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group overflow-hidden rounded-xl border-2 bg-white text-left transition disabled:cursor-wait disabled:opacity-70 ${
        selected
          ? 'border-brand shadow-sm shadow-indigo-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="relative aspect-[210/297] overflow-hidden bg-slate-100">
        {hasThumb ? (
          <img
            src={template.thumbnail_url}
            alt=""
            className={`h-full w-full object-cover object-top transition ${
              thumbState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setThumbState('loaded')}
            onError={() => setThumbState('error')}
          />
        ) : (
          <TemplateMiniPreview template={template} documentType={documentType} />
        )}

        {hasThumb && thumbState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200"
              style={{ borderTopColor: accent }}
            />
          </div>
        )}

        {showDefaultBadge && selected && (
          <span
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ background: accent }}
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            Default
          </span>
        )}

        {!showDefaultBadge && selected && (
          <span
            className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: accent }}
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-2.5 py-2">
        <span className="truncate text-[11px] font-semibold text-slate-800">{template.name}</span>
        {tag && template.style_tag && (
          <span
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold"
            style={{ background: tag.bg, color: tag.fg }}
          >
            {STYLE_TAG_LABEL[template.style_tag]}
          </span>
        )}
      </div>
    </button>
  )
}
