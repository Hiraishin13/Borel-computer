'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice, cn } from '@/lib/utils'
import { SearchIcon } from '@/components/ui/icons'
import type { Product } from '@/types'

export function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [debounced, setDebounced] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 250)
    return () => clearTimeout(t)
  }, [value])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Product[]; total: number }>('/search', {
        params: { q: debounced },
      })
      return data
    },
    enabled: open && debounced.length >= 2,
    staleTime: 30_000,
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    setOpen(false)
    router.push(`/products?search=${encodeURIComponent(q)}`)
  }

  const results = data?.data ?? []

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-muted transition-colors hover:text-light"
        aria-label="Rechercher"
        title="Rechercher"
        aria-expanded={open}
      >
        <SearchIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,26rem)] rounded-lg border border-white/10 bg-secondary p-3 shadow-2xl shadow-black/40">
          <form onSubmit={submit} className="flex items-center gap-2 rounded-md bg-primary px-3">
            <SearchIcon width={16} height={16} className="shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Rechercher un produit, une marque…"
              className="w-full bg-transparent py-2.5 text-sm text-light placeholder:text-muted focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue('')}
                className="text-muted hover:text-light"
                aria-label="Effacer"
              >
                ✕
              </button>
            )}
          </form>

          {debounced.length >= 2 && (
            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              {isFetching && results.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-muted">Recherche…</p>
              )}
              {!isFetching && results.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-muted">
                  Aucun résultat pour «&nbsp;{debounced}&nbsp;»
                </p>
              )}
              <ul>
                {results.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/5"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-primary">
                        <Image src={p.thumbnail} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-light">{p.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {p.brand ? `${p.brand} · ` : ''}
                          {p.subcategory}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-accent">
                        {formatPrice(p.discountPrice ?? p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {(data?.total ?? 0) > 0 && (
                <button
                  onClick={submit}
                  className={cn(
                    'mt-1 block w-full rounded-md px-2 py-2 text-center text-xs font-medium text-accent hover:bg-white/5',
                  )}
                >
                  Voir tous les résultats ({data?.total})
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
