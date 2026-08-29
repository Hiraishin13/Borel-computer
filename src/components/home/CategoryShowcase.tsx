import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export function CategoryShowcase() {
  return (
    <section className="border-y border-white/10 bg-secondary/50">
      <div className="container-page grid gap-4 py-16 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="card group flex flex-col justify-between p-6 transition-colors hover:border-accent"
          >
            <span className="text-lg font-semibold">{c.label}</span>
            <span className="mt-6 text-sm text-muted group-hover:text-accent">Explorer →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
