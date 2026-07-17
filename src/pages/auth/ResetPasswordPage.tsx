import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useAlertModal } from '../../hooks/useAlertModal'
import { updatePassword } from '../../services/auth'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { showSuccess, showError, AlertHost } = useAlertModal()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    showSuccess('Password updated', 'Your new password has been saved.', () => {
      navigate('/dashboard')
    })
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
          minLength={6}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Saving…' : 'Update password'}
        </Button>
      </form>
      {AlertHost}
    </AuthShell>
  )
}
