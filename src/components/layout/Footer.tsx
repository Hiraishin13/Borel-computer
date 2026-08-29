import Link from 'next/link'
import { CATEGORIES, SITE } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-secondary">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-bold">
            {SITE.name.split(' ')[0]}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Catalogue</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-light">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Aide</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link href="/contact" className="hover:text-light">Contact</Link></li>
            <li><Link href="/about" className="hover:text-light">À propos</Link></li>
            <li><Link href="/blog" className="hover:text-light">Blog</Link></li>
            <li><Link href="/account/orders" className="hover:text-light">Suivi de commande</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Légal</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link href="/legal/mentions" className="hover:text-light">Mentions légales</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-light">Confidentialité</Link></li>
            <li><Link href="/legal/terms" className="hover:text-light">CGV</Link></li>
            <li><Link href="/legal/returns" className="hover:text-light">Retours</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
