import { useEffect, useRef, useState } from 'react'
import { Camera, ImageMinus, LogOut, Trash2, User } from 'lucide-react'
import type { User as AuthUser } from '@supabase/supabase-js'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'
import { Card, SectionHead } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { useAlertModal } from '../../hooks/useAlertModal'
import {
  deleteAccount,
  signIn,
  signOut,
  updateEmail,
  updatePassword,
  updateUserMetadata,
} from '../../services/auth'
import { deleteFile, uploadAvatar } from '../../services/storage'

interface AccountSettingsPanelProps {
  user: AuthUser
}

export function AccountSettingsPanel({ user }: AccountSettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { showSuccess, showError, askConfirm, AlertHost } = useAlertModal()
  const [hydrated, setHydrated] = useState(false)

  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingName, setSavingName] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const hasPasswordProvider =
    user.identities?.some((identity) => identity.provider === 'email') ?? Boolean(user.email)

  useEffect(() => {
    if (hydrated) return
    setFullName(user.user_metadata?.full_name ?? '')
    setAvatarUrl(user.user_metadata?.avatar_url ?? null)
    setNewEmail(user.email ?? '')
    setHydrated(true)
  }, [user, hydrated])

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadingAvatar(true)
    try {
      const { url, error: uploadError } = await uploadAvatar(
        user.id,
        await file.arrayBuffer(),
        file.type || 'image/jpeg',
      )
      if (uploadError) throw uploadError
      const { error: updateError } = await updateUserMetadata({ avatar_url: url })
      if (updateError) throw updateError
      setAvatarUrl(url)
      setAvatarLoadFailed(false)
      showSuccess('Photo updated', 'Your profile photo has been saved.')
    } catch (err) {
      showError('Upload failed', err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = () => {
    if (!avatarUrl) return
    askConfirm({
      tone: 'danger',
      title: 'Remove photo?',
      message: 'This will remove your profile photo from your account.',
      confirmLabel: 'Remove photo',
      icon: ImageMinus,
      onConfirm: async () => {
        try {
          await deleteFile('avatars', user.id, 'avatar.jpg')
          const { error: updateError } = await updateUserMetadata({ avatar_url: null })
          if (updateError) throw updateError
          setAvatarUrl(null)
          setAvatarLoadFailed(false)
          showSuccess('Photo removed', 'Your profile photo has been removed.')
        } catch (err) {
          showError(
            'Could not remove photo',
            err instanceof Error ? err.message : 'Please try again',
          )
        }
      },
    })
  }

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      showError('Name required', 'Enter your name to continue.')
      return
    }
    setSavingName(true)
    const { error: updateError } = await updateUserMetadata({ full_name: fullName.trim() })
    setSavingName(false)
    if (updateError) {
      showError('Could not save name', updateError.message)
      return
    }
    showSuccess('Name updated', 'Your name has been saved.')
  }

  const handleChangeEmail = async () => {
    const email = newEmail.trim()
    if (!email || email === user.email) return
    setSavingEmail(true)
    const { error: updateError } = await updateEmail(email)
    setSavingEmail(false)
    if (updateError) {
      showError('Could not update email', updateError.message)
      return
    }
    showSuccess(
      'Check your inbox',
      'A confirmation link was sent to your new email address. Your email updates after you confirm it.',
    )
  }

  const handleChangePassword = async () => {
    if (hasPasswordProvider && !currentPassword) {
      showError('Current password required', 'Enter your current password to continue.')
      return
    }
    if (!newPassword) {
      showError('Password required', 'Enter a new password.')
      return
    }
    if (newPassword.length < 8) {
      showError('Password too short', 'Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match', 'Make sure both password fields are the same.')
      return
    }
    if (hasPasswordProvider && newPassword === currentPassword) {
      showError('Choose a new password', 'Your new password must be different from the current one.')
      return
    }

    setSavingPassword(true)

    if (hasPasswordProvider && user.email) {
      const { error: authError } = await signIn(user.email, currentPassword)
      if (authError) {
        setSavingPassword(false)
        showError('Incorrect password', 'Your current password is incorrect.')
        return
      }
    }

    const { error: updateError } = await updatePassword(newPassword)
    setSavingPassword(false)
    if (updateError) {
      showError('Could not update password', updateError.message)
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showSuccess('Password updated', 'Your password has been changed successfully.')
  }

  const handleSignOut = () => {
    askConfirm({
      tone: 'info',
      title: 'Sign out?',
      message: 'You will need to sign in again to access your documents.',
      confirmLabel: 'Sign out',
      icon: LogOut,
      onConfirm: () => signOut(),
    })
  }

  const handleDeleteAccount = () => {
    askConfirm({
      tone: 'danger',
      title: 'Delete account?',
      message:
        'This will permanently delete your account and all documents. This cannot be undone.',
      confirmLabel: 'Delete account',
      icon: Trash2,
      onConfirm: async () => {
        const { error: deleteError } = await deleteAccount()
        if (deleteError) {
          showError('Could not delete account', deleteError.message)
          return
        }
        await signOut()
      },
    })
  }

  return (
    <>
      <div className="animate-fade-in">
        <h2 className="text-sm font-semibold">Account settings</h2>
        <p className="mb-4 text-xs text-slate-500">Manage your profile, email, and password</p>

        <div className="mb-6 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-indigo-200 bg-indigo-50 transition hover:border-brand hover:bg-indigo-100 disabled:opacity-50"
          >
            {uploadingAvatar ? (
              <Spinner className="h-6 w-6" />
            ) : avatarUrl && !avatarLoadFailed ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <User className="h-8 w-8 text-indigo-400 transition group-hover:scale-110" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/35">
              <Camera className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
            </span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadAvatar}
          />

          <div className="flex w-full max-w-xs items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-xs"
              disabled={uploadingAvatar}
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
              {avatarUrl ? 'Change photo' : 'Upload photo'}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={uploadingAvatar}
                onClick={handleRemoveAvatar}
              >
                <ImageMinus className="h-3.5 w-3.5" />
                Remove photo
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-3 space-y-3 transition hover:border-slate-300">
          <SectionHead>Profile</SectionHead>
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
          <Button disabled={savingName || !fullName.trim()} onClick={handleSaveName}>
            {savingName ? 'Saving…' : 'Save name'}
          </Button>
        </Card>

        <Card className="mb-3 space-y-3 transition hover:border-slate-300">
          <SectionHead>Email</SectionHead>
          <Input
            label="Email address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
          />
          <Button
            disabled={savingEmail || newEmail.trim() === (user.email ?? '')}
            onClick={handleChangeEmail}
          >
            {savingEmail ? 'Updating…' : 'Update email'}
          </Button>
        </Card>

        <Card className="mb-3 space-y-3 transition hover:border-slate-300">
          <SectionHead>Password</SectionHead>
          <p className="text-[11px] leading-relaxed text-slate-500">
            {hasPasswordProvider
              ? 'For security, confirm your current password before setting a new one.'
              : 'Set a password so you can also sign in with email.'}
          </p>
          {hasPasswordProvider && (
            <PasswordInput
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          )}
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
          <Button disabled={savingPassword} onClick={handleChangePassword}>
            {savingPassword ? 'Updating…' : 'Change password'}
          </Button>
        </Card>

        <Card className="space-y-3 border-slate-200 transition hover:border-slate-300">
          <SectionHead>Account actions</SectionHead>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Sign out of this session, or permanently delete your account and data.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete account
            </Button>
          </div>
        </Card>
      </div>

      {AlertHost}
    </>
  )
}
