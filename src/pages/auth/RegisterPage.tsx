import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { AuthShell } from '../../components/layout/AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useAlertModal } from '../../hooks/useAlertModal'
import { signInWithGoogle, signUp } from '../../services/auth'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { showError, AlertHost } = useAlertModal()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next: FieldErrors = {}
    if (!fullName.trim()) next.fullName = 'Full name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email address'
    if (password.length < 8) next.password = 'Password must be at least 8 characters'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match'
    if (!agreed) next.terms = 'You must accept the Terms and Privacy Policy'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error: signUpError } = await signUp(email.trim(), password, fullName.trim())
    setLoading(false)
    if (signUpError) {
      showError('Could not create account', signUpError.message)
      return
    }
    navigate('/dashboard')
  }

  const passwordsMismatch =
    confirmPassword.length > 0 && confirmPassword !== password && !errors.confirmPassword

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start managing your documents in minutes</p>
        </div>

        <Input
          label="Full name"
          placeholder="Jane Smith"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          autoComplete="name"
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="janesmith@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <div>
          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />
          {passwordsMismatch && (
            <p className="mt-1 text-xs text-slate-400">
              Both passwords must match exactly before you can proceed.
            </p>
          )}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition ${
                agreed
                  ? 'border-brand bg-brand text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {agreed && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <span className="text-xs leading-relaxed text-slate-500">
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-brand hover:text-brand-dark">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-brand hover:text-brand-dark">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms}</p>}
        </div>

        <Button type="submit" fullWidth disabled={loading} className="h-11 rounded-xl text-sm">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          fullWidth
          disabled={loading}
          className="h-11 rounded-xl text-sm"
          onClick={() => signInWithGoogle()}
        >
          Continue with Google
        </Button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:text-brand-dark">
            Log in
          </Link>
        </p>
      </form>
      {AlertHost}
    </AuthShell>
  )
}
