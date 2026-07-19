/** Readable message from Supabase / Auth errors (often empty when SMTP fails). */
export function authErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback

  if (typeof error === 'string' && error.trim() && error.trim() !== '{}') {
    return error.trim()
  }

  if (typeof error === 'object') {
    const e = error as {
      message?: unknown
      error_description?: unknown
      msg?: unknown
      code?: unknown
      status?: unknown
    }
    const candidates = [e.message, e.error_description, e.msg]
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() && c.trim() !== '{}') return c.trim()
    }
    if (e.code || e.status) {
      return `${fallback} (${String(e.code ?? e.status)})`
    }
  }

  return fallback
}
