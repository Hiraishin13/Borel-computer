'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loadOrderDraft, type OrderDraft } from '@/lib/order-draft'
import { buildWhatsappUrl } from '@/lib/whatsapp'
import { downloadInvoice } from '@/lib/invoice'
import { formatPrice } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'

function Confirmation() {
  const orderNumber = useSearchParams().get('order') ?? ''
  const { whatsappNumber } = useSettings()
  const [draft, setDraft] = useState<OrderDraft | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (orderNumber) setDraft(loadOrderDraft(orderNumber))
  }, [orderNumber])

  async function handleInvoice() {
    if (!draft) return
    setDownloading(true)
    try {
      await downloadInvoice(draft)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="container-page max-w-2xl py-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl text-success">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-bold">Commande enregistrée</h1>
        <p className="mt-2 text-muted">
          Commande{' '}
          {orderNumber && <strong className="text-light">{orderNumber}</strong>} — paiement en{' '}
          <strong className="text-light">espèces</strong> à la livraison.
        </p>
      </div>

      {draft ? (
        <>
          <div className="card mt-10 p-6">
            <h2 className="text-sm font-semibold">Récapitulatif</h2>
            <ul className="mt-4 divide-y divide-white/10 text-sm">
              {draft.items.map((i) => (
                <li key={i.name} className="flex justify-between py-2">
                  <span className="text-muted">
                    {i.name} <span className="text-xs">×{i.quantity}</span>
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
              <span>Total à payer</span>
              <span>{formatPrice(draft.totals.total)}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted">
              Dernière étape : téléchargez la facture, puis envoyez la commande sur WhatsApp et
              joignez le PDF à la conversation.
            </p>

            <button
              onClick={handleInvoice}
              disabled={downloading}
              className="btn-secondary w-full"
            >
              {downloading ? 'Génération…' : '📄 Télécharger la facture (PDF)'}
            </button>

            <a
              href={buildWhatsappUrl(draft, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              Envoyer la commande sur WhatsApp
            </a>
          </div>
        </>
      ) : (
        <p className="mt-10 rounded-md border border-white/10 bg-secondary p-6 text-center text-sm text-muted">
          Le détail de cette commande n&apos;est plus disponible sur cet appareil. Retrouvez-la dans{' '}
          <Link href="/account/orders" className="text-accent hover:underline">
            vos commandes
          </Link>
          .
        </p>
      )}

      <div className="mt-10 text-center">
        <Link href="/products" className="text-sm text-muted hover:text-light">
          ← Continuer mes achats
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
