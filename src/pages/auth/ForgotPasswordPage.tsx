import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAlertModal } from '../../hooks/useAlertModal'
import { resetPassword } from '../../services/auth'

export default function ForgotPasswordPage() {
  const { showSuccess, showError, AlertHost } = useAlertModal()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      showError('Could not send reset link', error.message)
      return
    }
    setSent(true)
    showSuccess('Check your inbox', 'We sent a password reset link to your email address.')
  }

  return (
    <AuthShell>
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
          <Lock className="h-6 w-6 text-brand" />
        </div>
        <h1 className="text-base font-semibold text-slate-900">Reset password</h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Enter your email and we&apos;ll send a reset link.
        </p>
        {sent ? (
          <p className="mt-4 text-xs text-slate-500">
            If you don&apos;t see the email, check your spam folder.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
            <Input
              label="Email address"
              type="email"
              placeholder="janesmith@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Remembered it? <Link to="/login" className="font-medium text-brand">Log in</Link>
        </p>
      </div>
      {AlertHost}
    </AuthShell>
  )
}
