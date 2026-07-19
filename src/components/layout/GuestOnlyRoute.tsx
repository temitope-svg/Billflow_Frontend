import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/Spinner'

/** Send already-logged-in users away from login/register/onboarding. */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <PageLoader />
  if (session) return <Navigate to="/dashboard" replace />
  return children
}
