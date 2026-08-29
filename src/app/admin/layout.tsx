'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/dashboard', label: 'Tableau de bord' },
  { href: '/admin/orders', label: 'Commandes' },
  { href: '/admin/customers', label: 'Clients' },
  { href: '/admin/products', label: 'Produits' },
  { href: '/admin/builds', label: 'PC configurés' },
  { href: '/admin/promos', label: 'Promotions' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const s = useAuthStore.getState()
    if (!s.token) router.replace('/login')
    else if (s.user?.role !== 'admin') router.replace('/')
  }, [router])

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-white/10 bg-secondary transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center border-b border-white/10 px-5">
          <Link href="/admin/dashboard" className="font-serif text-lg font-bold">
            Borel<span className="text-accent">.</span> Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded-md px-3 py-2',
                pathname.startsWith(l.href) ? 'bg-primary text-light' : 'text-muted hover:text-light',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3 text-sm">
          <Link href="/" className="block rounded-md px-3 py-2 text-muted hover:text-light">
            ← Voir le site
          </Link>
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="w-full rounded-md px-3 py-2 text-left text-muted hover:text-danger"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/10 px-4 lg:px-8">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-light lg:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
          <span className="text-sm text-muted">
            {user ? `Connecté : ${user.firstName} (${user.email})` : ''}
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden
        />
      )}
    </div>
  )
}
