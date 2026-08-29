'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { CartSummary } from '@/components/cart/CartSummary'
import { apiClient } from '@/lib/api-client'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      const { data } = await apiClient.post<{ orderNumber: string }>('/orders/checkout', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
        shippingAddress: Object.fromEntries(form),
        shippingMethod: form.get('shippingMethod'),
        paymentMethod: 'stripe',
      })
      clear()
      router.push(`/order-confirmation?order=${data.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center text-muted">
        Votre panier est vide.
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Commande</h1>
      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-sm font-semibold">Adresse de livraison</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="firstName" required placeholder="Prénom" className="input" />
              <input name="lastName" required placeholder="Nom" className="input" />
            </div>
            <input name="street" required placeholder="Adresse" className="input" />
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="postalCode" required placeholder="Code postal" className="input" />
              <input name="city" required placeholder="Ville" className="input sm:col-span-2" />
            </div>
            <input name="country" required defaultValue="France" placeholder="Pays" className="input" />
          </fieldset>

          <fieldset className="card space-y-3 p-6">
            <legend className="px-2 text-sm font-semibold">Livraison</legend>
            <label className="flex items-center gap-3 text-sm">
              <input type="radio" name="shippingMethod" value="standard" defaultChecked /> Standard (3-5 jours)
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="radio" name="shippingMethod" value="express" /> Express (24-48h) — +15 €
            </label>
          </fieldset>

          <div className="card p-6 text-sm text-muted">
            Le paiement sécurisé par carte (Stripe) sera présenté à l&apos;étape suivante.
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="space-y-4">
          <CartSummary showCheckout={false} />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Traitement…' : 'Payer maintenant'}
          </button>
        </div>
      </form>
    </div>
  )
}
