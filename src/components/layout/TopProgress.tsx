'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Barre de progression fine en haut de page lors des navigations.
 * Démarre au clic sur un lien interne, se termine quand l'URL a changé.
 */
export function TopProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const start = () => {
    clear()
    setVisible(true)
    setWidth(12)
    timers.current.push(setTimeout(() => setWidth(60), 120))
    timers.current.push(setTimeout(() => setWidth(82), 420))
  }

  const done = () => {
    clear()
    setWidth(100)
    timers.current.push(
      setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 220),
    )
  }

  // Fin de navigation : l'URL a changé
  useEffect(() => {
    done()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Début de navigation : clic sur un lien interne
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('#') || a.target === '_blank') return
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return
      const dest = href.startsWith('http') ? new URL(href).pathname : href.split('?')[0]
      if (dest !== window.location.pathname) start()
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5">
      <div
        className="h-full bg-accent shadow-[0_0_8px_rgba(229,9,20,0.7)] transition-[width] duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
