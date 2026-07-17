import type { StyleTag, Template } from '../../types/database'

export const STYLE_TAG_LABEL: Record<StyleTag, string> = {
  minimal: 'Minimal',
  bold: 'Bold',
  classic: 'Classic',
}

export const STYLE_TAG_COLORS: Record<StyleTag, { bg: string; fg: string }> = {
  minimal: { bg: '#EEF2FF', fg: '#3730A3' },
  bold: { bg: '#D3F4E4', fg: '#0E6E58' },
  classic: { bg: '#F3E9CE', fg: '#A67C3D' },
}

const DEFAULT_ACCENT = '#4F46E5'

export const getTemplateAccent = (template: Template): string => {
  const config = template.layout_config as { accentColor?: string } | null
  return config?.accentColor ?? DEFAULT_ACCENT
}

export type PreviewPalette = {
  accent: string
  page: string
  ink: string
  muted: string
  panel: string
}

export const previewPaletteFor = (template: Template): PreviewPalette => {
  const accent = getTemplateAccent(template)
  switch (template.style_tag) {
    case 'bold':
      return {
        accent,
        page: '#FFFFFF',
        ink: '#1F2937',
        muted: '#6B7280',
        panel: '#D3F4E4',
      }
    case 'classic':
      return {
        accent,
        page: '#FBF3DF',
        ink: '#2B2118',
        muted: '#6B5344',
        panel: '#F3E9CE',
      }
    default:
      return {
        accent,
        page: '#FFFFFF',
        ink: '#1E293B',
        muted: '#64748B',
        panel: '#F1F5F9',
      }
  }
}
