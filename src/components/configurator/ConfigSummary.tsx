'use client'

import { formatPrice } from '@/lib/utils'
import { ASSEMBLY_FEE } from '@/lib/constants'
import type { CompatibilityReport } from '@/lib/configurator'

export interface SummaryLine {
  slot: string
  name: string
  color?: string
  price: number
}

export function ConfigSummary({
  lines,
  total,
  report,
  performance,
  missing,
  onAddToCart,
  onDownload,
  busy,
}: {
  lines: SummaryLine[]
  total: number
  report: CompatibilityReport
  performance: string
  missing: string[]
  onAddToCart: () => void
  onDownload: () => void
  busy?: boolean
}) {
  const blocked = report.errors.length > 0 || missing.length > 0

  return (
    <div className="card sticky top-20 p-6">
      <h2 className="text-lg font-semibold">Votre configuration</h2>

      <dl className="mt-4 space-y-1.5 text-sm">
        {lines.map((l) => (
          <div key={l.slot} className="flex justify-between gap-3">
            <dt className="text-muted">
              {l.slot}
              {l.color ? <span className="text-xs"> · {l.color}</span> : null}
            </dt>
            <dd className="shrink-0">{formatPrice(l.price)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 text-muted">
          <dt>Assemblage &amp; test 48h</dt>
          <dd className="shrink-0">{formatPrice(ASSEMBLY_FEE)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-base font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <dl className="mt-4 space-y-1 text-xs text-muted">
        <div className="flex justify-between">
          <dt>Consommation estimée</dt>
          <dd>{report.estimatedWatts} W</dd>
        </div>
        <div className="flex justify-between">
          <dt>Alim. recommandée</dt>
          <dd>{report.recommendedPsu} W</dd>
        </div>
        <div className="flex justify-between">
          <dt>Usage</dt>
          <dd>{performance}</dd>
        </div>
      </dl>

      {missing.length > 0 && (
        <p className="mt-4 rounded bg-white/5 p-3 text-xs text-muted">
          À compléter : {missing.join(', ')}.
        </p>
      )}

      {report.errors.map((e) => (
        <p key={e} className="mt-3 rounded bg-danger/10 p-3 text-xs text-danger">
          ⚠ {e}
        </p>
      ))}
      {report.warnings.map((w) => (
        <p key={w} className="mt-3 rounded bg-warning/10 p-3 text-xs text-warning">
          {w}
        </p>
      ))}

      <button
        onClick={onAddToCart}
        disabled={blocked || busy}
        className="btn-primary mt-6 w-full"
      >
        {busy ? '…' : 'Ajouter la configuration au panier'}
      </button>
      <button onClick={onDownload} disabled={lines.length === 0} className="btn-secondary mt-3 w-full">
        Télécharger le devis (PDF)
      </button>
    </div>
  )
}
