'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/hooks/useSettings'

export function AnnouncementBar() {
  const { announcement } = useSettings()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem('borel-annonce-dismiss') === announcement)
    } catch {
      setDismissed(false)
    }
  }, [announcement])

  if (!announcement || dismissed) return null

  return (
    <div className="relative bg-accent px-4 py-2 text-center text-sm font-medium text-light">
      {announcement}
      <button
        onClick={() => {
          setDismissed(true)
          try {
            sessionStorage.setItem('borel-annonce-dismiss', announcement)
          } catch {
            /* ignore */
          }
        }}
        aria-label="Fermer"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-light/80 hover:text-light"
      >
        ✕
      </button>
    </div>
  )
}
