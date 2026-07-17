import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { BusinessProfileSetupModal } from './BusinessProfileSetupModal'
import {
  isBusinessProfileComplete,
  markProfilePromptShownThisLogin,
  wasProfilePromptShownThisLogin,
} from '../../utils/profilePrompt'

/**
 * Shows the business profile setup modal once per login when name or logo is missing.
 * Survives page navigation and reloads; flag is cleared on logout (see signOut).
 */
export function ProfileSetupPrompt() {
  const { user } = useAuth()
  const { profile, loading } = useProfile()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (loading || !profile || !user) return

    if (isBusinessProfileComplete(profile)) {
      setOpen(false)
      return
    }

    // Already prompted this login — leave `open` alone.
    // Closing here would dismiss the modal mid-session when auth/profile re-renders.
    if (wasProfilePromptShownThisLogin(user.id)) return

    markProfilePromptShownThisLogin(user.id)
    setOpen(true)
  }, [profile, loading, user?.id])

  const handleSkip = () => setOpen(false)
  const handleClose = () => setOpen(false)

  return <BusinessProfileSetupModal open={open} onSkip={handleSkip} onClose={handleClose} />
}
