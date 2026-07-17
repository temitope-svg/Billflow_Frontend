import type { UserProfile } from '../types/database'

/**
 * Profile is complete only when both business_name and logo_url exist and are non-empty.
 */
export const isBusinessProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false
  return (
    profile.business_name != null &&
    profile.business_name.trim() !== '' &&
    profile.logo_url != null &&
    profile.logo_url.trim() !== ''
  )
}

const promptKey = (userId: string) => `bf_profile_prompt_shown_${userId}`

/** Whether the setup modal has already been shown for this login session. */
export const wasProfilePromptShownThisLogin = (userId: string): boolean => {
  try {
    return sessionStorage.getItem(promptKey(userId)) === '1'
  } catch {
    return false
  }
}

/** Mark that the modal was shown once this login — survives page switches and reloads. */
export const markProfilePromptShownThisLogin = (userId: string): void => {
  try {
    sessionStorage.setItem(promptKey(userId), '1')
  } catch {
    // Private mode etc. — fine to fail silently.
  }
}

/** Clear so the next login can prompt again. */
export const clearProfilePromptForLogin = (userId: string): void => {
  try {
    sessionStorage.removeItem(promptKey(userId))
  } catch {
    // ignore
  }
}
