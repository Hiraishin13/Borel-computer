'use client'

import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'
import { Button } from '@/components/ui/Button'

export function CartSummary({ showCheckout = true }: { showCheckout?: boolean }) {
  const cfg = useSettings()
  const totals = useCartStore((s) =>
    s.totals({
      taxRate: cfg.taxRate,
      freeShippingThreshold: cfg.freeShippingThreshold,
      standardShipping: cfg.standardShipping,
    }),
  )
  const couponCode = useCartStore((s) => s.couponCode)
  const taxPct = Math.round(cfg.taxRate * 100)

  const rows = [
    ['Sous-total', totals.subtotal],
    ...(totals.discount ? ([[`Remise ${couponCode ?? ''}`.trim(), -totals.discount]] as const) : []),
    [`Taxes (${taxPct}%)`, totals.tax],
    ['Livraison', totals.shipping],
  ] as const

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Récapitulatif</h2>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-muted">
            <dt>{label}</dt>
            <dd>
              {value === 0 && String(label) === 'Livraison'
                ? 'Offerte'
                : formatPrice(value as number)}
            </dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold text-light">
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {showCheckout && (
        <Button href="/checkout" fullWidth className="mt-6">
          Passer commande
        </Button>
      )}
    </div>
  )
}
