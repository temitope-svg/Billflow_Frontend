export const buildPublicSlug = (documentNumber: string, documentId: string): string => {
  const base = documentNumber
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base}-${documentId.slice(0, 4)}`
}

export const publicDocumentUrl = (slug: string): string =>
  `${window.location.origin}/d/${slug}`
