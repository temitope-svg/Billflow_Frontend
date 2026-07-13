import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/Spinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/login" replace />
  return children
}
