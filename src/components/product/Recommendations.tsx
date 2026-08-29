'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useBehaviorStore } from '@/store/behavior'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Product } from '@/types'

interface RecoResponse {
  boughtTogether: Product[]
  complete: Product[]
  similar: Product[]
  personalized: boolean
}

export function Recommendations({ productId, slug }: { productId: string; slug: string }) {
  const topBrands = useBehaviorStore((s) => s.topBrands(3))
  const topSubs = useBehaviorStore((s) => s.topSubcategories(3))
  const recent = useBehaviorStore((s) => s.recentSlugs(12))

  const { data, isLoading } = useQuery({
    queryKey: ['reco', slug, topBrands.join(','), topSubs.join(',')],
    queryFn: async () => {
      const { data } = await apiClient.get<RecoResponse>(
        `/products/${productId}/recommendations`,
        {
          params: {
            brands: topBrands.join(','),
            subcategories: topSubs.join(','),
            exclude: recent.join(','),
          },
        },
      )
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="mt-16 space-y-4">
        <Skeleton className="h-6 w-56" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mt-16 space-y-14">
      <Section
        title="Souvent achetés ensemble"
        subtitle="D'après les commandes de nos clients"
        products={data.boughtTogether}
      />
      <Section
        title="Complétez votre configuration"
        subtitle="Composants compatibles et complémentaires"
        products={data.complete}
      />
      <Section
        title={data.personalized ? 'Recommandé pour vous' : 'Dans le même esprit'}
        subtitle={
          data.personalized
            ? "Sélectionné selon les produits que vous avez consultés"
            : 'Produits similaires'
        }
        products={data.similar}
      />
    </div>
  )
}

function Section({
  title,
  subtitle,
  products,
}: {
  title: string
  subtitle: string
  products: Product[]
}) {
  if (!products?.length) return null
  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}
