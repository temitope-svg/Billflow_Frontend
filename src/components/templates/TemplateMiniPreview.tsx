import type { DocumentType, Template } from '../../types/database'
import { previewPaletteFor } from './templateStyles'

const DOC_LABEL: Record<DocumentType, string> = {
  estimate: 'Estimate',
  invoice: 'Invoice',
  receipt: 'Receipt',
}

/** Style-aware miniature of a document — used when thumbnails are missing. */
export function TemplateMiniPreview({
  template,
  documentType,
}: {
  template: Template
  documentType: DocumentType
}) {
  const p = previewPaletteFor(template)
  const label = DOC_LABEL[documentType]
  const style = template.style_tag ?? 'minimal'

  if (style === 'bold') {
    return (
      <div className="flex h-full flex-col gap-1.5 p-2.5" style={{ background: p.page }}>
        <div
          className="flex items-start justify-between rounded-lg px-2 py-2"
          style={{ background: p.accent }}
        >
          <div className="h-4 w-4 rounded bg-white/90" />
          <div className="text-right">
            <div className="text-[7px] font-bold tracking-wider text-white uppercase">{label}</div>
            <div className="mt-0.5 h-1 w-8 rounded bg-white/40" />
          </div>
        </div>
        <div className="rounded-md px-2 py-1.5" style={{ background: p.panel }}>
          <div className="mb-1 text-[6px] font-bold tracking-wide uppercase" style={{ color: p.accent }}>
            Bill to
          </div>
          <div className="h-1 w-3/4 rounded" style={{ background: `${p.ink}33` }} />
          <div className="mt-1 h-1 w-1/2 rounded" style={{ background: `${p.ink}22` }} />
        </div>
        <LineRows accent={p.accent} ink={p.ink} />
        <TotalRow accent={p.accent} ink={p.ink} />
      </div>
    )
  }

  if (style === 'classic') {
    return (
      <div className="flex h-full flex-col gap-1.5 p-2.5" style={{ background: p.page }}>
        <div className="border p-1" style={{ borderColor: p.accent }}>
          <div className="border px-2 py-1.5 text-center" style={{ borderColor: p.accent }}>
            <div className="mx-auto mb-1 h-2.5 w-8 rounded-sm" style={{ background: p.accent }} />
            <div className="text-[7px] font-bold tracking-wide uppercase" style={{ color: p.ink }}>
              Your business
            </div>
          </div>
        </div>
        <div className="text-center text-[8px] font-bold tracking-[0.2em] uppercase" style={{ color: p.ink }}>
          {label}
        </div>
        <div className="border-b pb-1" style={{ borderColor: `${p.accent}66` }}>
          <div className="mx-auto h-1 w-4/5 rounded" style={{ background: `${p.ink}22` }} />
        </div>
        <div>
          <div className="mb-1 text-[6px] font-bold tracking-wide uppercase" style={{ color: p.ink }}>
            Bill to
          </div>
          <div className="h-1 w-2/3 rounded" style={{ background: `${p.ink}33` }} />
        </div>
        <LineRows accent={p.accent} ink={p.ink} bordered />
        <TotalRow accent={p.accent} ink={p.ink} />
      </div>
    )
  }

  // minimal / slate
  return (
    <div className="flex h-full flex-col" style={{ background: p.page }}>
      <div className="h-1 w-full shrink-0" style={{ background: p.accent }} />
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <div className="flex items-start justify-between">
          <div className="h-5 w-5 rounded" style={{ background: p.ink }} />
          <div className="text-right">
            <div className="text-[8px] font-light tracking-[0.18em] uppercase" style={{ color: p.ink }}>
              {label}
            </div>
            <div className="mt-1 h-1 w-10 rounded" style={{ background: `${p.muted}44` }} />
          </div>
        </div>
        <div className="mt-1">
          <div className="mb-1 text-[6px] font-bold tracking-wide uppercase" style={{ color: p.ink }}>
            Bill to
          </div>
          <div className="h-1 w-2/3 rounded" style={{ background: `${p.ink}33` }} />
          <div className="mt-1 h-1 w-1/2 rounded" style={{ background: `${p.ink}22` }} />
        </div>
        <LineRows accent={p.accent} ink={p.ink} ruled />
        <TotalRow accent={p.accent} ink={p.ink} />
      </div>
    </div>
  )
}

function LineRows({
  accent,
  ink,
  ruled,
  bordered,
}: {
  accent: string
  ink: string
  ruled?: boolean
  bordered?: boolean
}) {
  return (
    <div className="mt-auto space-y-1">
      <div
        className={`mb-1 flex justify-between pb-0.5 text-[5px] font-bold uppercase ${ruled || bordered ? 'border-b-2' : ''}`}
        style={{ color: ink, borderColor: ruled ? ink : accent }}
      >
        <span>Desc</span>
        <span>Total</span>
      </div>
      {[88, 64, 76].map((w) => (
        <div key={w} className="flex items-center justify-between gap-2">
          <div className="h-1 rounded" style={{ width: `${w}%`, background: `${ink}22` }} />
          <div className="h-1 w-4 shrink-0 rounded" style={{ background: `${accent}44` }} />
        </div>
      ))}
    </div>
  )
}

function TotalRow({ accent, ink }: { accent: string; ink: string }) {
  return (
    <div className="mt-1 flex items-center justify-between border-t pt-1" style={{ borderColor: `${ink}18` }}>
      <span className="text-[6px] font-semibold" style={{ color: ink }}>
        Total
      </span>
      <div className="h-1.5 w-8 rounded" style={{ background: accent }} />
    </div>
  )
}
