'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/dashboard', label: 'Tableau de bord' },
  { href: '/admin/products', label: 'Produits' },
  { href: '/admin/orders', label: 'Commandes' },
  { href: '/admin/customers', label: 'Clients' },
  { href: '/admin/promos', label: 'Promotions' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const { token, user } = useAuthStore.getState()
    if (!token) router.replace('/login')
    else if (user?.role !== 'admin') router.replace('/')
  }, [router])

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-secondary p-4 md:block">
        <p className="mb-6 px-3 font-serif text-lg font-bold">
          Admin<span className="text-accent">.</span>
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-2',
                pathname.startsWith(l.href) ? 'bg-primary text-light' : 'text-muted hover:text-light',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6 lg:p-10">{children}</div>
    </div>
  )
}
