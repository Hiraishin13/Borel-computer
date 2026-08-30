'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatPrice } from '@/lib/utils'
import { ImageManager } from '@/components/admin/ImageManager'
import { Loader } from '@/components/ui/Loader'
import type { Product } from '@/types'

type AdminProduct = Product & { cost: number }

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'product', params.id],
    queryFn: async () =>
      (await apiClient.get<AdminProduct>(`/admin/products/${params.id}`)).data,
  })

  useEffect(() => {
    if (!data) return
    setImages(data.images)
    setSpecs(Object.entries(data.specifications).map(([k, v]) => ({ k, v })))
  }, [data])

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient.patch(`/products/${params.id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'product', params.id] })
      setMsg('Modifications enregistrées.')
    },
    onError: (e) => setMsg(e instanceof Error ? e.message : 'Erreur'),
  })

  const del = useMutation({
    mutationFn: () => apiClient.delete(`/products/${params.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      router.push('/admin/products')
    },
  })

  if (isLoading || !data) return <Loader />

  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-sm text-muted hover:text-light">
        ← Produits
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <span
          className={
            data.published
              ? 'rounded bg-success/15 px-2 py-0.5 text-xs text-success'
              : 'rounded bg-white/10 px-2 py-0.5 text-xs text-muted'
          }
        >
          {data.published ? 'Publié' : 'Hors ligne'}
        </span>
        {data.published && (
          <Link
            href={`/products/${data.slug}`}
            target="_blank"
            className="text-xs text-accent hover:underline"
          >
            Voir la fiche ↗
          </Link>
        )}
      </div>
      <p className="text-sm text-muted">
        {data.sku} · marge actuelle{' '}
        {data.price > 0
          ? `${Math.round(((( data.discountPrice ?? data.price) - data.cost) / (data.discountPrice ?? data.price)) * 100)}%`
          : '—'}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (images.length === 0) {
            setMsg('Ajoutez au moins une image.')
            return
          }
          const f = new FormData(e.currentTarget)
          const num = (k: string) => {
            const v = f.get(k)
            return v === '' || v == null ? undefined : Number(v)
          }
          const specifications = Object.fromEntries(
            specs.filter((s) => s.k.trim()).map((s) => [s.k.trim(), s.v]),
          )
          save.mutate({
            name: f.get('name'),
            brand: f.get('brand') || undefined,
            category: f.get('category'),
            subcategory: f.get('subcategory'),
            description: f.get('description'),
            price: num('price'),
            discountPrice: num('discountPrice') ?? null,
            cost: num('cost'),
            stock: num('stock'),
            featured: f.get('featured') === 'on',
            published: f.get('published') === 'on',
            images,
            specifications,
          })
        }}
        className="mt-8 space-y-6"
      >
        <section className="card p-5">
          <h2 className="text-sm font-semibold">Images</h2>
          <p className="mt-1 text-xs text-muted">
            Importées depuis votre poste, affichées en diaporama sur la fiche produit.
          </p>
          <div className="mt-4">
            <ImageManager images={images} onChange={setImages} />
          </div>
        </section>

        <section className="card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-xs text-muted">
            Nom
            <input name="name" defaultValue={data.name} required className="input mt-1" />
          </label>
          <label className="text-xs text-muted">
            Marque
            <input name="brand" defaultValue={data.brand ?? ''} className="input mt-1" />
          </label>
          <label className="text-xs text-muted">
            Catégorie
            <input name="category" defaultValue={data.category} required className="input mt-1" />
          </label>
          <label className="text-xs text-muted">
            Sous-catégorie
            <input
              name="subcategory"
              defaultValue={data.subcategory}
              required
              className="input mt-1"
            />
          </label>
          <label className="text-xs text-muted sm:col-span-2">
            Description
            <textarea
              name="description"
              defaultValue={data.description}
              required
              rows={3}
              className="input mt-1"
            />
          </label>
        </section>

        <section className="card grid gap-3 p-5 sm:grid-cols-4">
          <label className="text-xs text-muted">
            Prix ({formatPrice(data.price)})
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={data.price}
              required
              className="input mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Prix remisé
            <input
              name="discountPrice"
              type="number"
              step="0.01"
              defaultValue={data.discountPrice ?? ''}
              className="input mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Coût d&apos;achat
            <input
              name="cost"
              type="number"
              step="0.01"
              defaultValue={data.cost}
              className="input mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Stock
            <input
              name="stock"
              type="number"
              defaultValue={data.stock}
              className="input mt-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="published" type="checkbox" defaultChecked={data.published} /> Publié
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="featured" type="checkbox" defaultChecked={data.featured} /> En vedette
          </label>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Spécifications</h2>
            <button
              type="button"
              onClick={() => setSpecs((s) => [...s, { k: '', v: '' }])}
              className="text-xs text-accent hover:underline"
            >
              Ajouter une ligne
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {specs.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={row.k}
                  onChange={(e) =>
                    setSpecs((s) => s.map((r, j) => (j === i ? { ...r, k: e.target.value } : r)))
                  }
                  placeholder="Intitulé"
                  className="input flex-1"
                />
                <input
                  value={row.v}
                  onChange={(e) =>
                    setSpecs((s) => s.map((r, j) => (j === i ? { ...r, v: e.target.value } : r)))
                  }
                  placeholder="Valeur"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setSpecs((s) => s.filter((_, j) => j !== i))}
                  className="text-muted hover:text-danger"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {msg && <p className="text-sm text-muted">{msg}</p>}

        <div className="flex items-center justify-between">
          <button type="submit" disabled={save.isPending} className="btn-primary">
            {save.isPending ? '…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Supprimer définitivement ce produit ?')) del.mutate()
            }}
            className="text-sm text-muted hover:text-danger"
          >
            Supprimer
          </button>
        </div>
      </form>
    </div>
  )
}
