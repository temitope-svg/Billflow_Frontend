import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profile'
import type { UserProfile } from '../types/database'
import { isDateFormatKey, type DateFormatKey } from '../utils/formatDate'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    getProfile(user.id).then(({ data }) => {
      setProfile((data as UserProfile | null) ?? null)
      setLoading(false)
    })
  }, [user])

  return { profile, loading, setProfile }
}

export function useDateFormat(): DateFormatKey {
  const { profile } = useProfile()
  const fmt = profile?.date_format
  return fmt && isDateFormatKey(fmt) ? fmt : 'DD/MM/YYYY'
}
