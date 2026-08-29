import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from './providers'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { SITE } from '@/lib/constants'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

function safeUrl(value: string): URL {
  try {
    return new URL(value)
  } catch {
    return new URL('http://localhost:3000')
  }
}

export const metadata: Metadata = {
  metadataBase: safeUrl(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.description },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
