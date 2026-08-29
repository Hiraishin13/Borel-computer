import { formatPrice } from './utils'
import type { OrderDraft } from './order-draft'

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/[^0-9]/g, '')

/** Builds a wa.me deep link with the full order recap as pre-filled text. */
export function buildWhatsappUrl(draft: OrderDraft): string {
  const { customer, shippingAddress, items, totals } = draft

  const lines: (string | false)[] = [
    `*Commande ${draft.orderNumber}* — Borel Computer`,
    '',
    '*Articles*',
    ...items.map((i) => `• ${i.name}  ×${i.quantity}  —  ${formatPrice(i.price * i.quantity)}`),
    '',
    `Sous-total : ${formatPrice(totals.subtotal)}`,
    totals.discount > 0 && `Remise : -${formatPrice(totals.discount)}`,
    `TVA (20%) : ${formatPrice(totals.tax)}`,
    `Livraison : ${totals.shipping === 0 ? 'Offerte' : formatPrice(totals.shipping)}`,
    `*TOTAL : ${formatPrice(totals.total)}*`,
    '',
    '*Paiement* : espèces à la livraison / au retrait',
    '',
    '*Client*',
    `${customer.firstName} ${customer.lastName}`,
    customer.phone,
    customer.email,
    '',
    '*Adresse de livraison*',
    shippingAddress.street,
    `${shippingAddress.postalCode} ${shippingAddress.city}`,
    shippingAddress.country,
    '',
    '_Facture PDF jointe à ce message._',
  ]

  const text = lines.filter(Boolean).join('\n')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
