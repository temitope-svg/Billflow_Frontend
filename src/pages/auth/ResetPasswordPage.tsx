import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { updatePassword } from '../../services/auth'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/dashboard')
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold">Set new password</h1>
          <p className="text-sm text-slate-500">Choose a strong password for your account</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  )
}
