'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const links = [
  { href: '/account/profile', label: 'Profil' },
  { href: '/account/orders', label: 'Mes commandes' },
  { href: '/account/wishlist', label: 'Favoris' },
  { href: '/account/settings', label: 'Paramètres' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    if (!useAuthStore.getState().token) router.replace('/login')
  }, [router])

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Mon compte</h1>
      {user && <p className="mt-1 text-muted">Bonjour {user.firstName}</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-2',
                pathname === l.href ? 'bg-secondary text-light' : 'text-muted hover:text-light',
              )}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="mt-2 rounded-md px-3 py-2 text-left text-muted hover:text-danger"
          >
            Déconnexion
          </button>
        </nav>
        <div>{children}</div>
      </div>
    </div>
  )
}
