import { formatDate } from './utils'
import { SITE } from './constants'
import type { OrderDraft } from './order-draft'

/**
 * Plain money formatter for the PDF. Avoids Intl's narrow no-break space (U+202F),
 * which jsPDF's built-in Helvetica renders as a missing glyph.
 */
function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Generates the single-page PDF invoice for an order and triggers a download.
 * jsPDF is imported dynamically so it stays out of the main bundle.
 */
export async function downloadInvoice(draft: OrderDraft): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const marginX = 48
  let y = 56

  const accent: [number, number, number] = [229, 9, 20]
  const grey: [number, number, number] = [120, 120, 120]

  // --- Header ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(SITE.name, marginX, y)
  doc.setTextColor(...accent)
  doc.setFontSize(22)
  doc.text('FACTURE', pageW - marginX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grey)
  doc.text('Boutique informatique haut de gamme', marginX, y)
  doc.text(`N° ${draft.orderNumber}`, pageW - marginX, y, { align: 'right' })
  y += 12
  doc.text(`Date : ${formatDate(draft.createdAt)}`, pageW - marginX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  // --- Parties ---
  y += 34
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Vendeur', marginX, y)
  doc.text('Client', pageW / 2, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  y += 14

  const seller = [SITE.name, 'contact@borelcomputer.com', SITE.url.replace(/^https?:\/\//, '')]
  const client = [
    `${draft.customer.firstName} ${draft.customer.lastName}`,
    draft.customer.phone,
    draft.customer.email,
    draft.shippingAddress.street,
    `${draft.shippingAddress.postalCode} ${draft.shippingAddress.city}`,
    draft.shippingAddress.country,
  ]
  const partyRows = Math.max(seller.length, client.length)
  for (let i = 0; i < partyRows; i++) {
    if (seller[i]) doc.text(seller[i], marginX, y + i * 12)
    if (client[i]) doc.text(client[i], pageW / 2, y + i * 12)
  }
  y += partyRows * 12 + 24

  // --- Tableau des articles ---
  const colDesc = marginX
  const colQty = pageW - marginX - 200
  const colUnit = pageW - marginX - 110
  const colTotal = pageW - marginX

  doc.setFillColor(20, 20, 20)
  doc.rect(marginX, y - 12, pageW - marginX * 2, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Désignation', colDesc + 6, y + 2)
  doc.text('Qté', colQty, y + 2, { align: 'right' })
  doc.text('P.U.', colUnit, y + 2, { align: 'right' })
  doc.text('Total', colTotal - 6, y + 2, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  y += 22

  draft.items.forEach((item) => {
    doc.text(item.name.slice(0, 60), colDesc + 6, y)
    doc.text(String(item.quantity), colQty, y, { align: 'right' })
    doc.text(formatPrice(item.price), colUnit, y, { align: 'right' })
    doc.text(formatPrice(item.price * item.quantity), colTotal - 6, y, { align: 'right' })
    y += 16
    doc.setDrawColor(230, 230, 230)
    doc.line(marginX, y - 6, pageW - marginX, y - 6)
  })

  // --- Totaux ---
  y += 12
  const totalsX = pageW - marginX - 200
  const line = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 11 : 9)
    doc.text(label, totalsX, y)
    doc.text(value, colTotal - 6, y, { align: 'right' })
    y += bold ? 18 : 14
  }
  line('Sous-total', formatPrice(draft.totals.subtotal))
  if (draft.totals.discount > 0) line('Remise', `-${formatPrice(draft.totals.discount)}`)
  line('TVA (20%)', formatPrice(draft.totals.tax))
  line('Livraison', draft.totals.shipping === 0 ? 'Offerte' : formatPrice(draft.totals.shipping))
  y += 4
  doc.setDrawColor(...accent)
  doc.line(totalsX, y - 4, colTotal - 6, y - 4)
  line('TOTAL À PAYER', formatPrice(draft.totals.total), true)

  // --- Paiement + pied de page ---
  y += 16
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Mode de paiement : espèces à la livraison / au retrait', marginX, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  doc.text(
    'Cette facture fait foi de commande. Le paiement s’effectue en espèces au moment de la remise des articles.',
    marginX,
    y + 18,
  )
  doc.text(
    `${SITE.name} — Facture générée le ${formatDate(new Date())} — Document unique n° ${draft.orderNumber}`,
    marginX,
    doc.internal.pageSize.getHeight() - 36,
  )

  doc.save(`facture-${draft.orderNumber}.pdf`)
}
