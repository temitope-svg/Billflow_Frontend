import type { DocumentType, UserProfile } from '../types/database'

export const getDefaultTemplateId = (
  profile: UserProfile | null | undefined,
  documentType: DocumentType,
): string | null => {
  if (!profile) return null
  switch (documentType) {
    case 'estimate':
      return profile.default_estimate_template_id
    case 'invoice':
      return profile.default_invoice_template_id
    case 'receipt':
      return profile.default_receipt_template_id
  }
}

export const defaultTemplateFieldFor = (
  documentType: DocumentType,
): keyof Pick<
  UserProfile,
  'default_estimate_template_id' | 'default_invoice_template_id' | 'default_receipt_template_id'
> => {
  switch (documentType) {
    case 'estimate':
      return 'default_estimate_template_id'
    case 'invoice':
      return 'default_invoice_template_id'
    case 'receipt':
      return 'default_receipt_template_id'
  }
}
