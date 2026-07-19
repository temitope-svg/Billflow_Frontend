import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  /** Used when there is no in-app history to return to. */
  fallback: string
  className?: string
  label?: string
}

/** Navigates to the previous page when possible; otherwise `fallback`. */
export function BackButton({
  fallback,
  className = 'mb-4 inline-flex items-center gap-2 text-sm text-slate-500',
  label = 'Back',
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1)
      return
    }
    navigate(fallback)
  }

  return (
    <button type="button" onClick={handleBack} className={className}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
