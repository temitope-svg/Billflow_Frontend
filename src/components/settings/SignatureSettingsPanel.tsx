import { useEffect, useRef, useState } from 'react'
import { ImageUp, PenLine, Undo2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Spinner } from '../ui/Spinner'
import { SignaturePad, type SignaturePadHandle } from '../ui/SignaturePad'
import { useAlertModal } from '../../hooks/useAlertModal'
import { updateProfile } from '../../services/profile'
import { deleteFile, uploadSignature } from '../../services/storage'
import type { SignatureType, UserProfile } from '../../types/database'

interface SignatureSettingsPanelProps {
  userId: string
  profile: UserProfile
  setProfile: (profile: UserProfile) => void
}

export function SignatureSettingsPanel({ userId, profile, setProfile }: SignatureSettingsPanelProps) {
  const { showSuccess, showError, askConfirm, AlertHost } = useAlertModal()
  const fileRef = useRef<HTMLInputElement>(null)
  const padRef = useRef<SignaturePadHandle>(null)

  const [signatureUrl, setSignatureUrl] = useState<string | null>(profile.signature_url)
  const [signatureType, setSignatureType] = useState<SignatureType | null>(profile.signature_type)
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [savingDrawing, setSavingDrawing] = useState(false)

  useEffect(() => {
    setSignatureUrl(profile.signature_url)
    setSignatureType(profile.signature_type)
    setPreviewLoadFailed(false)
  }, [profile.signature_url, profile.signature_type])

  const persistSignature = async (data: ArrayBuffer, contentType: string, type: SignatureType) => {
    const { url, error } = await uploadSignature(userId, data, contentType)
    if (error) throw error
    const { data: updated, error: updateError } = await updateProfile(userId, {
      signature_url: url,
      signature_type: type,
    })
    if (updateError) throw updateError
    if (updated) setProfile(updated as UserProfile)
    setSignatureUrl(url)
    setSignatureType(type)
    setPreviewLoadFailed(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      await persistSignature(await file.arrayBuffer(), file.type || 'image/png', 'uploaded')
      showSuccess('Saved', 'Your signature has been updated.')
    } catch (err) {
      showError('Upload failed', err instanceof Error ? err.message : 'Failed to upload signature')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmDrawing = async () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      showError('Nothing to save', 'Draw your signature in the box first')
      return
    }
    setSavingDrawing(true)
    try {
      const dataUrl = padRef.current.toDataURL()
      const data = await (await fetch(dataUrl)).arrayBuffer()
      await persistSignature(data, 'image/png', 'drawn')
      setDrawerOpen(false)
      showSuccess('Saved', 'Your signature has been updated.')
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to save signature')
    } finally {
      setSavingDrawing(false)
    }
  }

  const handleClear = () => {
    askConfirm({
      tone: 'danger',
      title: 'Remove signature',
      message: 'Remove your signature from documents?',
      confirmLabel: 'Remove',
      onConfirm: async () => {
        const { data, error } = await updateProfile(userId, {
          signature_type: null,
          signature_url: null,
        })
        if (error) {
          showError('Could not remove', error.message)
          return
        }
        await deleteFile('signatures', userId, 'signature.png')
        if (data) setProfile(data as UserProfile)
        setSignatureUrl(null)
        setSignatureType(null)
        showSuccess('Removed', 'Your signature has been removed.')
      },
    })
  }

  const hasSignature = !!signatureUrl

  return (
    <>
      <h2 className="text-sm font-semibold">Signature</h2>
      <p className="mb-4 text-xs text-slate-500">Used on documents when signature is enabled</p>

      <div className="mb-4 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${hasSignature ? 'bg-emerald-500' : 'bg-slate-300'}`}
          aria-hidden
        />
        <p className="text-xs font-medium text-slate-500">
          {hasSignature
            ? `${signatureType === 'drawn' ? 'Drawn' : 'Uploaded'} signature active`
            : 'No signature set'}
        </p>
      </div>

      <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Preview</p>
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 items-end justify-center">
          {hasSignature && !previewLoadFailed ? (
            <img
              src={signatureUrl!}
              alt="Signature preview"
              className="max-h-full max-w-full object-contain"
              onError={() => setPreviewLoadFailed(true)}
            />
          ) : (
            <p className="mb-2 text-xs text-slate-300 italic">Your signature will appear here</p>
          )}
        </div>
        <div className="mt-2 h-px bg-slate-800" />
        <p className="mt-2 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
          Authorised signature
        </p>
      </div>

      <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Upload</p>
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="mb-5 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50 disabled:opacity-60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-brand">
          {uploading ? <Spinner className="h-5 w-5" /> : <ImageUp className="h-5 w-5" />}
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900">Upload from device</span>
          <span className="block text-xs text-slate-400">Choose an image of your signature</span>
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => void handleUpload(e)}
      />

      <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Draw</p>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="mb-5 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-brand">
          <PenLine className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900">Draw with mouse or finger</span>
          <span className="block text-xs text-slate-400">Sign directly on the screen</span>
        </span>
      </button>

      {hasSignature && (
        <>
          <p className="mb-2 text-[10px] font-bold tracking-wide text-red-400 uppercase">Remove</p>
          <button
            type="button"
            onClick={handleClear}
            className="flex h-12 w-full items-center justify-center rounded-xl border-[1.5px] border-red-300 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Remove signature
          </button>
        </>
      )}

      <Modal open={drawerOpen} onClose={() => !savingDrawing && setDrawerOpen(false)} className="max-w-lg">
        <div className="border-b border-slate-100 px-5 py-4 pr-12">
          <h2 className="text-sm font-semibold text-slate-900">Draw signature</h2>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-center text-xs text-slate-500">
            Sign in the box below, the way it&apos;ll appear on your documents
          </p>
          <div className="h-44 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {drawerOpen && <SignaturePad ref={padRef} className="h-full w-full" />}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={savingDrawing}
              onClick={() => padRef.current?.undo()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              aria-label="Undo"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <Button
              type="button"
              variant="outline"
              disabled={savingDrawing}
              onClick={() => padRef.current?.clear()}
              className="h-12 flex-1"
            >
              Clear
            </Button>
            <Button
              type="button"
              disabled={savingDrawing}
              onClick={() => void handleConfirmDrawing()}
              className="h-12 flex-[2]"
            >
              {savingDrawing ? 'Saving…' : 'Save signature'}
            </Button>
          </div>
        </div>
      </Modal>

      {AlertHost}
    </>
  )
}
