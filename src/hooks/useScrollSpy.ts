import { useEffect, useState } from 'react'

/**
 * Tracks which section is currently in view so a table of contents can
 * highlight the active entry. Observes each element whose id is passed in.
 */
export function useScrollSpy(ids: string[], offset = 120): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    if (ids.length === 0) return

    const handler = () => {
      let current: string | null = ids[0] ?? null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        // The last section whose top has scrolled past the offset wins.
        if (el.getBoundingClientRect().top - offset <= 0) {
          current = id
        }
      }
      setActiveId(current)
    }

    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [ids, offset])

  return activeId
}
