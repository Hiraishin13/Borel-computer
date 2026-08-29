'use client'

import { useProducts } from '@/hooks/useProducts'
import { formatPrice } from '@/lib/utils'

export default function AdminProductsPage() {
  const { data, isLoading } = useProducts({ limit: 50 })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produits</h1>
        <button className="btn-primary">Nouveau produit</button>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-white/10 text-left text-muted">
            <tr>
              <th className="py-3">Nom</th>
              <th className="py-3">SKU</th>
              <th className="py-3">Prix</th>
              <th className="py-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-muted">
                  Chargement…
                </td>
              </tr>
            ) : (
              data?.data.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">{p.name}</td>
                  <td className="py-3 text-muted">{p.sku}</td>
                  <td className="py-3">{formatPrice(p.discountPrice ?? p.price)}</td>
                  <td className={p.stock === 0 ? 'py-3 text-danger' : p.stock < 5 ? 'py-3 text-warning' : 'py-3'}>
                    {p.stock}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
