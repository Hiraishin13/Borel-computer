'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'

export function MobileNav() {
  const [open, setOpen] = useState(false)

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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
