import type { DocumentSender, DocumentWithDetails, UserProfile } from '../types/database'
import { getProfile } from '../services/profile'

const senderFromProfile = (
  profile: UserProfile,
  existing: DocumentSender | null,
): DocumentSender => ({
  id: existing?.id ?? 'profile-fallback',
  document_id: existing?.document_id ?? '',
  business_name: existing?.business_name ?? profile.business_name ?? '',
  logo_url: existing?.logo_url ?? profile.logo_url ?? null,
  address: existing?.address ?? profile.address ?? null,
  phone: existing?.phone ?? profile.phone ?? null,
  email: existing?.email ?? profile.email ?? '',
  tax_id: existing?.tax_id ?? profile.tax_id ?? null,
  signature_url: existing?.signature_url ?? profile.signature_url ?? null,
})

export const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export const resolveLogoUrl = (url: string | null | undefined): string => {
  const trimmed = url?.trim()
  return trimmed || TRANSPARENT_PIXEL
}

export const toDataUri = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export const enrichDocWithProfileLogo = async (
  doc: DocumentWithDetails,
  userId: string,
): Promise<DocumentWithDetails> => {
  const { data } = await getProfile(userId)
  const profile = data as UserProfile | null
  if (!profile && !doc.sender) return doc

  const sender = profile ? senderFromProfile(profile, doc.sender) : doc.sender!
  const profileLogo = profile?.logo_url?.trim()
  const logo = profileLogo || sender.logo_url?.trim()
  if (!logo) return { ...doc, sender }

  if (logo.startsWith('data:')) {
    return { ...doc, sender: { ...sender, logo_url: logo } }
  }

  const dataUri = await toDataUri(logo)
  return { ...doc, sender: { ...sender, logo_url: dataUri ?? logo } }
}
