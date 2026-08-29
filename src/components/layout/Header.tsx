'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NAV_LINKS, SITE } from '@/lib/constants'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'
import { MobileNav } from './MobileNav'

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = useCartStore((s) => s.count())

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-white/10 bg-primary/95 backdrop-blur' : 'border-transparent bg-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold tracking-tight">
          {SITE.name.split(' ')[0]}
          <span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative text-sm font-medium transition-colors',
                pathname === link.href ? 'text-light' : 'text-muted hover:text-light',
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/account/wishlist" className="hidden text-muted hover:text-light sm:block" aria-label="Favoris">
            ♥
          </Link>
          <Link href="/cart" className="relative text-muted hover:text-light" aria-label="Panier">
            <span className="text-lg">🛒</span>
            {mounted && count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-light">
                {count}
              </span>
            )}
          </Link>
          <Link href="/account/profile" className="hidden text-muted hover:text-light sm:block" aria-label="Compte">
            ◐
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
