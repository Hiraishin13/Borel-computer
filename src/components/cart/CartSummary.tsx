'use client'

import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartSummary({ showCheckout = true }: { showCheckout?: boolean }) {
  const totals = useCartStore((s) => s.totals())
  const couponCode = useCartStore((s) => s.couponCode)

  const rows = [
    ['Sous-total', totals.subtotal],
    ...(totals.discount ? ([[`Remise ${couponCode ?? ''}`.trim(), -totals.discount]] as const) : []),
    ['TVA (20%)', totals.tax],
    ['Livraison', totals.shipping],
  ] as const

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Récapitulatif</h2>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-muted">
            <dt>{label}</dt>
            <dd>{value === 0 && label === 'Livraison' ? 'Offerte' : formatPrice(value as number)}</dd>
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
