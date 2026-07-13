import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { signIn, signInWithGoogle } from '../../services/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
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
          <h1 className="text-lg font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Log in to your Billflow account</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="mt-1 flex justify-between text-xs">
            <button type="button" className="text-brand" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
            <Link to="/forgot-password" className="font-medium text-brand">Forgot password?</Link>
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
    </AuthShell>
  )
}
