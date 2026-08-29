import { formatDate } from './utils'
import { SITE } from './constants'
import type { OrderDraft } from './order-draft'

/** Plain money formatter — évite l'espace insécable étroite (U+202F) mal rendue par jsPDF. */
function money(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export interface InvoiceData {
  orderNumber: string
  createdAt: string
  paymentMethod: 'cash' | 'stripe'
  customer: { firstName: string; lastName: string; email: string; phone: string }
  shippingAddress: { street: string; postalCode: string; city: string; country: string }
  items: { name: string; quantity: number; price: number }[]
  totals: { subtotal: number; discount: number; tax: number; shipping: number; total: number }
}

/** Personnalisation du bloc vendeur / mentions de la facture. */
export interface InvoiceConfig {
  sellerName: string
  sellerAddress: string
  sellerPhone: string
  sellerEmail: string
  sellerTaxId: string
  invoiceFooter: string
  taxRate: number
}

export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
  sellerName: SITE.name,
  sellerAddress: '',
  sellerPhone: '',
  sellerEmail: 'contact@borelcomputer.com',
  sellerTaxId: '',
  invoiceFooter:
    'Cette facture fait foi de commande. Le paiement s’effectue au moment de la remise des articles.',
  taxRate: 0.2,
}

export function invoiceFromDraft(draft: OrderDraft): InvoiceData {
  return draft
}

interface OrderLike {
  orderNumber: string
  createdAt: string
  paymentMethod?: string
  shippingAddress?: unknown
  items?: { name: string; quantity: number; price: number }[]
  subtotal?: number
  discount?: number
  tax?: number
  shipping?: number
  total?: number
}

/** Construit les données de facture depuis une commande enregistrée. */
export function invoiceFromOrder(order: OrderLike, email: string): InvoiceData {
  const addr = (order.shippingAddress ?? {}) as Record<string, string>
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod === 'stripe' ? 'stripe' : 'cash',
    customer: {
      firstName: addr.firstName ?? '',
      lastName: addr.lastName ?? '',
      email,
      phone: addr.phone ?? '',
    },
    shippingAddress: {
      street: addr.street ?? '',
      postalCode: addr.postalCode ?? '',
      city: addr.city ?? '',
      country: addr.country ?? '',
    },
    items: (order.items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    totals: {
      subtotal: order.subtotal ?? 0,
      discount: order.discount ?? 0,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      total: order.total ?? 0,
    },
  }
}

/** Construit le PDF de facture (jsPDF), utilisable côté navigateur ET côté serveur (Node). */
export async function buildInvoice(
  data: InvoiceData,
  cfg: InvoiceConfig = DEFAULT_INVOICE_CONFIG,
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const marginX = 48
  let y = 56

  const accent: [number, number, number] = [229, 9, 20]
  const grey: [number, number, number] = [120, 120, 120]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(cfg.sellerName || SITE.name, marginX, y)
  doc.setTextColor(...accent)
  doc.setFontSize(22)
  doc.text('FACTURE', pageW - marginX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grey)
  doc.text(`N° ${data.orderNumber}`, pageW - marginX, y, { align: 'right' })
  y += 12
  doc.text(`Date : ${formatDate(data.createdAt)}`, pageW - marginX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 34
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Vendeur', marginX, y)
  doc.text('Client', pageW / 2, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  y += 14

  const seller = [
    cfg.sellerName || SITE.name,
    ...cfg.sellerAddress.split('\n').filter(Boolean),
    cfg.sellerPhone,
    cfg.sellerEmail,
    cfg.sellerTaxId ? `N° ${cfg.sellerTaxId}` : '',
  ].filter(Boolean)
  const client = [
    `${data.customer.firstName} ${data.customer.lastName}`,
    data.customer.phone,
    data.customer.email,
    data.shippingAddress.street,
    `${data.shippingAddress.postalCode} ${data.shippingAddress.city}`,
    data.shippingAddress.country,
  ]
  const rows = Math.max(seller.length, client.length)
  for (let i = 0; i < rows; i++) {
    if (seller[i]) doc.text(seller[i], marginX, y + i * 12)
    if (client[i]) doc.text(client[i], pageW / 2, y + i * 12)
  }
  y += rows * 12 + 24

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

  data.items.forEach((item) => {
    doc.text(item.name.slice(0, 60), colDesc + 6, y)
    doc.text(String(item.quantity), colQty, y, { align: 'right' })
    doc.text(money(item.price), colUnit, y, { align: 'right' })
    doc.text(money(item.price * item.quantity), colTotal - 6, y, { align: 'right' })
    y += 16
    doc.setDrawColor(230, 230, 230)
    doc.line(marginX, y - 6, pageW - marginX, y - 6)
  })

  y += 12
  const totalsX = pageW - marginX - 200
  const line = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 11 : 9)
    doc.text(label, totalsX, y)
    doc.text(value, colTotal - 6, y, { align: 'right' })
    y += bold ? 18 : 14
  }
  line('Sous-total', money(data.totals.subtotal))
  if (data.totals.discount > 0) line('Remise', `-${money(data.totals.discount)}`)
  line(`Taxes (${Math.round(cfg.taxRate * 100)}%)`, money(data.totals.tax))
  line('Livraison', data.totals.shipping === 0 ? 'Offerte' : money(data.totals.shipping))
  y += 4
  doc.setDrawColor(...accent)
  doc.line(totalsX, y - 4, colTotal - 6, y - 4)
  line('TOTAL À PAYER', money(data.totals.total), true)

  y += 16
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(
    data.paymentMethod === 'cash'
      ? 'Mode de paiement : espèces à la livraison / au retrait'
      : 'Mode de paiement : carte bancaire',
    marginX,
    y,
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  if (cfg.invoiceFooter) {
    doc.text(doc.splitTextToSize(cfg.invoiceFooter, pageW - marginX * 2), marginX, y + 18)
  }
  doc.text(
    `${cfg.sellerName || SITE.name} — Facture générée le ${formatDate(new Date())} — Document n° ${data.orderNumber}`,
    marginX,
    doc.internal.pageSize.getHeight() - 36,
  )

  return doc
}

/** Navigateur : génère et télécharge la facture. */
export async function downloadInvoice(data: InvoiceData, cfg?: InvoiceConfig): Promise<void> {
  const doc = await buildInvoice(data, cfg)
  doc.save(`facture-${data.orderNumber}.pdf`)
}

/** Serveur : renvoie le PDF encodé en base64 (pour pièce jointe email). */
export async function invoicePdfBase64(data: InvoiceData, cfg?: InvoiceConfig): Promise<string> {
  const doc = await buildInvoice(data, cfg)
  return doc.output('datauristring').split(',')[1]
}
