'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { HeartIcon, LogInIcon, UserIcon } from '@/components/ui/icons'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const user = useAuthStore((s) => s.user)

  useEffect(() => setMounted(true), [])

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-light"
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className="block h-0.5 w-6 bg-current" />
        <span className="mt-1.5 block h-0.5 w-6 bg-current" />
        <span className="mt-1.5 block h-0.5 w-6 bg-current" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-primary/98 backdrop-blur"
          >
            <nav className="container-page flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-medium text-muted hover:text-light"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-white/10 pt-2">
                {mounted && user ? (
                  <>
                    <Link
                      href="/account/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 py-3 text-sm font-medium text-light"
                    >
                      <UserIcon width={18} height={18} /> Mon compte
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 py-3 text-sm font-medium text-muted hover:text-light"
                    >
                      <HeartIcon width={18} height={18} /> Favoris
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-3 text-sm font-medium text-accent"
                  >
                    <LogInIcon width={18} height={18} /> Se connecter
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
