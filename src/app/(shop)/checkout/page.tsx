'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { CartSummary } from '@/components/cart/CartSummary'
import { apiClient } from '@/lib/api-client'
import { formatPrice } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'
import { saveOrderDraft, type OrderDraft } from '@/lib/order-draft'

export default function CheckoutPage() {
  const router = useRouter()
  const cfg = useSettings()
  const items = useCartStore((s) => s.items)
  const totals = useCartStore((s) =>
    s.totals({
      taxRate: cfg.taxRate,
      freeShippingThreshold: cfg.freeShippingThreshold,
      standardShipping: cfg.standardShipping,
    }),
  )
  const clear = useCartStore((s) => s.clear)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const get = (k: string) => String(form.get(k) ?? '')

    try {
      const { data } = await apiClient.post<{ orderNumber: string }>('/orders/checkout', {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variant: i.variant,
        })),
        shippingAddress: {
          firstName: get('firstName'),
          lastName: get('lastName'),
          phone: get('phone'),
          street: get('street'),
          postalCode: get('postalCode'),
          city: get('city'),
          country: get('country'),
        },
        shippingMethod: get('shippingMethod') || 'standard',
        paymentMethod: 'cash',
      })

      const draft: OrderDraft = {
        orderNumber: data.orderNumber,
        createdAt: new Date().toISOString(),
        paymentMethod: 'cash',
        customer: {
          firstName: get('firstName'),
          lastName: get('lastName'),
          email: user?.email ?? get('email'),
          phone: get('phone'),
        },
        shippingAddress: {
          street: get('street'),
          postalCode: get('postalCode'),
          city: get('city'),
          country: get('country'),
        },
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        totals,
      }
      saveOrderDraft(draft)
      clear()
      router.push(`/order-confirmation?order=${draft.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <div className="container-page py-20 text-center text-muted">Votre panier est vide.</div>
  }

  if (mounted && !token) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Connectez-vous pour commander</h1>
        <p className="mt-2 max-w-sm text-muted">
          La création d&apos;une commande nécessite un compte. Votre panier est conservé.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login?redirect=%2Fcheckout" className="btn-primary">
            Se connecter
          </Link>
          <Link href="/signup?redirect=%2Fcheckout" className="btn-secondary">
            Créer un compte
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Finaliser la commande</h1>
      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-sm font-semibold">Coordonnées</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="firstName" required placeholder="Prénom" className="input" />
              <input name="lastName" required placeholder="Nom" className="input" />
            </div>
            <input
              name="phone"
              type="tel"
              required
              placeholder="Téléphone (WhatsApp)"
              className="input"
            />
            {!user && (
              <input name="email" type="email" required placeholder="Email" className="input" />
            )}
          </fieldset>

          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-sm font-semibold">Adresse de livraison</legend>
            <input name="street" required placeholder="Adresse" className="input" />
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="postalCode" required placeholder="Code postal" className="input" />
              <input name="city" required placeholder="Ville" className="input sm:col-span-2" />
            </div>
            <input name="country" required defaultValue="Bénin" placeholder="Pays" className="input" />
          </fieldset>

          <fieldset className="card space-y-3 p-6">
            <legend className="px-2 text-sm font-semibold">Livraison</legend>
            <label className="flex items-center gap-3 text-sm">
              <input type="radio" name="shippingMethod" value="standard" defaultChecked /> Standard
              (3-5 jours)
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="radio" name="shippingMethod" value="express" /> Express (24-48h) —{' '}
              {formatPrice(cfg.expressSurcharge)}
            </label>
          </fieldset>

          <div className="card space-y-2 p-6 text-sm">
            <p className="font-semibold text-light">Paiement : espèces</p>
            <p className="text-muted">
              Le règlement se fait en espèces à la livraison ou au retrait. À la validation, votre
              commande et sa facture PDF sont envoyées sur WhatsApp
              {cfg.whatsappNumber ? ` au +${cfg.whatsappNumber}` : ''} pour confirmation.
            </p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="space-y-4">
          <CartSummary showCheckout={false} />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Traitement…' : 'Valider et envoyer sur WhatsApp'}
          </button>
        </div>
      </form>
    </div>
  )
}
