import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { PageLoader } from '../../components/ui/Spinner'
import { useAlertModal } from '../../hooks/useAlertModal'
import { updatePassword } from '../../services/auth'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { showSuccess, showError, AlertHost } = useAlertModal()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    let settled = false

    const finish = (ok: boolean) => {
      if (cancelled || settled) return
      settled = true
      setReady(ok)
      setChecking(false)
    }

    // Supabase puts recovery tokens in the URL; detectSessionInUrl needs a moment.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY') {
        finish(true)
        return
      }
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        finish(true)
      }
    })

    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        finish(!!session)
      })
    }, 1200)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      showError('Password too short', 'Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      showError('Passwords do not match', 'Make sure both password fields are the same.')
      return
    }
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      showError('Could not update password', error.message)
      return
    }
    // Clear recovery tokens from the URL after success.
    window.history.replaceState({}, document.title, '/reset-password')
    showSuccess('Password updated', 'Your new password has been saved.', () => {
      navigate('/dashboard')
    })
  }

  if (checking) {
    return (
      <AuthShell>
        <div className="w-full max-w-sm space-y-3 text-center">
          <PageLoader />
          <p className="text-xs text-slate-500">Verifying your reset link…</p>
        </div>
      </AuthShell>
    )
  }

  if (!ready) {
    return (
      <AuthShell>
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-lg font-semibold">Link expired or invalid</h1>
          <p className="text-sm text-slate-500">
            This password reset link is no longer valid. Request a new one and open it directly
            (don&apos;t open it through a Google preview page).
          </p>
          <Link to="/forgot-password">
            <Button fullWidth>Request new link</Button>
          </Link>
          <Link to="/login" className="block text-sm text-brand hover:underline">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold">Set new password</h1>
          <p className="text-sm text-slate-500">Choose a strong password for your account</p>
        </div>
        <PasswordInput
          label="New password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Saving…' : 'Update password'}
        </Button>
      </form>
      {AlertHost}
    </AuthShell>
  )
}
