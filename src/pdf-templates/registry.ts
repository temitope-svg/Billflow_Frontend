import type { DocumentType } from '../types/database'

import * as slateMinimalInvoice from './slateMinimal/invoice'
import * as slateMinimalEstimate from './slateMinimal/estimate'
import * as slateMinimalReceipt from './slateMinimal/receipt'
import * as slateMinimalFragments from './slateMinimal/fragments'

import * as emeraldPanelInvoice from './emeraldPanel/invoice'
import * as emeraldPanelEstimate from './emeraldPanel/estimate'
import * as emeraldPanelReceipt from './emeraldPanel/receipt'
import * as emeraldPanelFragments from './emeraldPanel/fragments'

import * as ivoryClassicInvoice from './ivoryClassic/invoice'
import * as ivoryClassicEstimate from './ivoryClassic/estimate'
import * as ivoryClassicReceipt from './ivoryClassic/receipt'
import * as ivoryClassicFragments from './ivoryClassic/fragments'

export interface LayoutConfig {
  accentColor: string
  secondaryColor: string
  backgroundColor: string
  fontFamily: string
  logoPosition: 'left' | 'right' | 'center'
  headerStyle: 'minimal' | 'banner' | 'split'
  showBorder: boolean
  borderColor: string
}

interface TemplateModule {
  html: string
  layoutConfig: Record<string, unknown>
}

interface TemplateFragments {
  signatureBlockHtml: string
  bankDetailsBlockHtml: string
}

const BY_DOC_TYPE = {
  slate_minimal: { invoice: slateMinimalInvoice, estimate: slateMinimalEstimate, receipt: slateMinimalReceipt },
  emerald_panel: { invoice: emeraldPanelInvoice, estimate: emeraldPanelEstimate, receipt: emeraldPanelReceipt },
  ivory_classic: { invoice: ivoryClassicInvoice, estimate: ivoryClassicEstimate, receipt: ivoryClassicReceipt },
} satisfies Record<string, Record<DocumentType, TemplateModule>>

const FRAGMENTS_BY_STYLE = {
  slate_minimal: slateMinimalFragments,
  emerald_panel: emeraldPanelFragments,
  ivory_classic: ivoryClassicFragments,
} satisfies Record<string, TemplateFragments>

export type StyleSlug = keyof typeof BY_DOC_TYPE

// Supabase `templates.name` is the human-readable label ("Slate Minimal").
// This normalizes it to the slug keys above ("slate_minimal").
export const slugifyTemplateName = (name: string): string =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

export const getTemplate = (
  templateName: string,
  documentType: DocumentType,
): { html: string; layoutConfig: LayoutConfig } | null => {
  const slug = slugifyTemplateName(templateName) as StyleSlug
  const found = BY_DOC_TYPE[slug]?.[documentType]
  return found ? { html: found.html, layoutConfig: found.layoutConfig as LayoutConfig } : null
}

export const getTemplateFragments = (templateName: string): TemplateFragments | null => {
  const slug = slugifyTemplateName(templateName) as StyleSlug
  return FRAGMENTS_BY_STYLE[slug] ?? null
}
