'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const activeCategory = params.get('category') ?? ''
  const activeSort = params.get('sortBy') ?? 'createdAt'

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <aside className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-semibold">Catégories</p>
        <ul className="space-y-1.5 text-sm">
          <li>
            <button
              onClick={() => update('category', '')}
              className={!activeCategory ? 'text-accent' : 'text-muted hover:text-light'}
            >
              Tout le catalogue
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => update('category', c.slug)}
                className={activeCategory === c.slug ? 'text-accent' : 'text-muted hover:text-light'}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Trier par</p>
        <select
          value={activeSort}
          onChange={(e) => update('sortBy', e.target.value)}
          className="input"
        >
          <option value="createdAt">Nouveautés</option>
          <option value="price">Prix</option>
          <option value="rating">Meilleures notes</option>
          <option value="name">Nom (A-Z)</option>
        </select>
      </div>
    </aside>
  )
}
