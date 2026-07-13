import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { signUp } from '../../services/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError('Please agree to the Terms and Privacy Policy')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await signUp(email, password, fullName)
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
          <h1 className="text-lg font-semibold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Start managing your documents</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <label className="flex items-start gap-2 text-[10px] text-slate-500">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-brand" />
          <span>
            I agree to the <Link to="/terms" className="text-brand">Terms</Link> and{' '}
            <Link to="/privacy" className="text-brand">Privacy Policy</Link>
          </span>
        </label>
        <Button type="submit" fullWidth disabled={loading} className="py-2.5">
          {loading ? 'Creating…' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-brand">Log in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
