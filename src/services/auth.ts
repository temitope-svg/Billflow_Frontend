import { supabase } from '../lib/supabase'

const authRedirect = () => `${window.location.origin}/reset-password`

export const signUp = (email: string, password: string, fullName?: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: authRedirect(),
    },
  })

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })

export const signOut = () => supabase.auth.signOut()

export const resetPassword = (email: string) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirect() })

export const updatePassword = (password: string) =>
  supabase.auth.updateUser({ password })

export const deleteAccount = () => supabase.rpc('delete_user_account')

export const getSession = () => supabase.auth.getSession()
