'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NAV_LINKS, SITE } from '@/lib/constants'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { MobileNav } from './MobileNav'
import { SearchBar } from './SearchBar'
import { CartIcon, HeartIcon, UserIcon } from '@/components/ui/icons'

const actionClass = 'flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-light'

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = useCartStore((s) => s.count())
  const user = useAuthStore((s) => s.user)
  const isAuthed = Boolean(user)
  const isAdmin = user?.role === 'admin'

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

        <div className="flex items-center gap-1">
          {mounted && isAdmin && (
            <Link
              href="/admin/dashboard"
              className="mr-1 hidden rounded border border-accent/40 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10 sm:block"
            >
              Admin
            </Link>
          )}

          <SearchBar triggerClassName={actionClass} />

          <Link
            href="/account/wishlist"
            className={cn(actionClass, 'hidden sm:flex')}
            aria-label="Favoris"
            title="Favoris"
          >
            <HeartIcon />
          </Link>

          <Link href="/cart" className={cn(actionClass, 'relative')} aria-label="Panier" title="Panier">
            <CartIcon />
            {mounted && count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-light">
                {count}
              </span>
            )}
          </Link>

          {mounted && isAuthed ? (
            <Link
              href="/account/profile"
              className={cn(actionClass, 'w-auto gap-1.5 px-2')}
              aria-label="Mon compte"
              title="Mon compte"
            >
              <UserIcon />
              <span className="hidden text-sm font-medium lg:inline">{user?.firstName}</span>
            </Link>
          ) : (
            <Link href="/login" className={actionClass} aria-label="Se connecter" title="Se connecter">
              <UserIcon />
            </Link>
          )}

          <MobileNav triggerClassName={actionClass} />
        </div>
      </div>
    </header>
  )
}
