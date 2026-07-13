import { supabase } from '../lib/supabase'

type Bucket = 'logos' | 'signatures' | 'pdfs' | 'avatars'

// Files are stored under {userId}/{filename} so RLS folder policy matches
const buildPath = (userId: string, filename: string) => `${userId}/${filename}`

export const uploadFile = async (
  bucket: Bucket,
  userId: string,
  filename: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string,
) => {
  const path = buildPath(userId, filename)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, { contentType, upsert: true })
  if (error) return { url: null, error }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  // Every re-upload overwrites the same path (upsert), so the URL never
  // changes — without a cache-busting param, <Image> (and any HTTP cache in
  // between) keeps serving the old bytes for that URL even after a new file
  // is saved, or after the file is deleted and a new one written back.
  return { url: `${publicUrl}?v=${Date.now()}`, error: null }
}

export const uploadLogo = (userId: string, data: ArrayBuffer, contentType: string) =>
  uploadFile('logos', userId, 'logo.png', data, contentType)

export const uploadAvatar = (userId: string, data: ArrayBuffer, contentType: string) =>
  uploadFile('avatars', userId, 'avatar.jpg', data, contentType)

export const uploadSignature = (userId: string, data: ArrayBuffer, contentType = 'image/png') =>
  uploadFile('signatures', userId, 'signature.png', data, contentType)

export const uploadPdf = (userId: string, documentNumber: string, data: ArrayBuffer) =>
  uploadFile('pdfs', userId, `${documentNumber}.pdf`, data, 'application/pdf')

export const getSignedUrl = async (bucket: Bucket, userId: string, filename: string, expiresIn = 604800) => {
  const path = buildPath(userId, filename)
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
}

export const deleteFile = (bucket: Bucket, userId: string, filename: string) =>
  supabase.storage.from(bucket).remove([buildPath(userId, filename)])
