import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type ProfileUpdate = Database['public']['Tables']['users_profiles']['Update']

export const getProfile = (userId: string) =>
  supabase
    .from('users_profiles')
    .select('*')
    .eq('id', userId)
    .single()

export const updateProfile = (userId: string, updates: ProfileUpdate) =>
  supabase
    .from('users_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
