'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function Confirmation() {
  const orderNumber = useSearchParams().get('order')

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl text-success">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-bold">Merci pour votre commande</h1>
      <p className="mt-2 text-muted">
        Votre commande {orderNumber && <strong className="text-light">{orderNumber}</strong>} a bien été
        enregistrée. Un email de confirmation vous a été envoyé.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/account/orders" className="btn-primary">
          Suivre ma commande
        </Link>
        <Link href="/products" className="btn-secondary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  )
}
