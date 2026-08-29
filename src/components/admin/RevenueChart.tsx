'use client'

import { formatPrice } from '@/lib/utils'

/** Bar chart des revenus mensuels — SVG inline, sans dépendance. */
export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue))

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold">Chiffre d&apos;affaires — 12 mois</h2>
      <div className="mt-4 flex h-40 items-end gap-1">
        {data.map((d) => {
          const h = (d.revenue / max) * 100
          const [, m] = d.month.split('-')
          return (
            <div key={d.month} className="group relative flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-accent/70 transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(h, 1.5)}%` }}
              />
              <span className="text-[10px] text-muted">{m}</span>
              <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-primary px-2 py-1 text-[11px] text-light shadow group-hover:block">
                {formatPrice(d.revenue)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
