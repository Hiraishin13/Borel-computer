'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { PC_USAGES } from '@/lib/constants'
import { BuildCard } from '@/components/builds/BuildCard'
import type { Build } from '@/types'

export default function ConfigurationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['builds'],
    queryFn: async () => (await apiClient.get<{ data: Build[] }>('/builds')).data.data,
  })

  const builds = data ?? []

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Nos PC configurés</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Des configurations assemblées et testées par nos techniciens, prêtes à jouer. Chacune reste
        personnalisable dans le configurateur.
      </p>

      {isLoading && <p className="mt-10 text-muted">Chargement…</p>}

      {!isLoading && builds.length === 0 && (
        <p className="mt-10 text-muted">Aucune configuration publiée pour le moment.</p>
      )}

      <div className="mt-10 space-y-14">
        {PC_USAGES.map((u) => {
          const group = builds.filter((b) => b.usage === u.slug)
          if (group.length === 0) return null
          return (
            <section key={u.slug}>
              <h2 className="text-xl font-bold">{u.label}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((b, i) => (
                  <BuildCard key={b.id} build={b} index={i} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
