import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useAlertModal } from '../../hooks/useAlertModal'
import { signIn, signInWithGoogle } from '../../services/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { showError, AlertHost } = useAlertModal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      const message =
        error.message.toLowerCase().includes('invalid login credentials')
          ? 'Invalid email or password'
          : error.message
      showError('Could not log in', message)
      return
    }
    navigate('/dashboard')
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Log in to your Billflow account</p>
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="janesmith@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <div>
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="mt-1 flex justify-end text-xs">
            <Link to="/forgot-password" className="font-medium text-brand">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" fullWidth disabled={loading} className="py-2.5">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <Button type="button" variant="outline" fullWidth onClick={() => signInWithGoogle()}>
          Continue with Google
        </Button>
        <p className="text-center text-xs text-slate-500">
          No account? <Link to="/register" className="font-medium text-brand">Create one free</Link>
        </p>
      </form>
      {AlertHost}
    </AuthShell>
  )
}
