import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = { title: 'À propos' }

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-4xl font-bold">À propos de {SITE.name}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-muted">
        <p>
          {SITE.name} est une boutique informatique haut de gamme spécialisée dans les PC gaming, les
          composants premium et les configurations sur mesure.
        </p>
        <p>
          Chaque machine est assemblée, testée et optimisée par nos techniciens avant expédition.
          Notre équipe vous accompagne du choix des composants au support après-vente.
        </p>
      </div>
    </div>
  )
}
