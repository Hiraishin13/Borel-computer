'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { TopProgress } from './TopProgress'
import { PageTransition } from './PageTransition'

/**
 * Chrome public (header + footer). Masqué sur le back-office `/admin`, qui a son
 * propre shell (sidebar plein écran).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <>
      <Suspense fallback={null}>
        <TopProgress />
      </Suspense>

      {isAdmin ? (
        children
      ) : (
        <>
          <Header />
          <main className="min-h-screen pt-16">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </>
      )}
    </>
  )
}
