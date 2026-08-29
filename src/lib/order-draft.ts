import type { CartTotals } from '@/types'

/**
 * Client-side snapshot of a placed order, used by the confirmation page to build
 * the WhatsApp message and the PDF invoice. Stored in sessionStorage keyed by
 * order number so a page refresh still shows the invoice.
 */
export interface OrderDraft {
  orderNumber: string
  createdAt: string
  paymentMethod: 'cash'
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    street: string
    postalCode: string
    city: string
    country: string
  }
  items: { name: string; quantity: number; price: number }[]
  totals: CartTotals
}

const key = (orderNumber: string) => `borel-order-${orderNumber}`

export function saveOrderDraft(draft: OrderDraft): void {
  try {
    sessionStorage.setItem(key(draft.orderNumber), JSON.stringify(draft))
  } catch {
    /* sessionStorage unavailable — confirmation page will fall back */
  }
}

export function loadOrderDraft(orderNumber: string): OrderDraft | null {
  try {
    const raw = sessionStorage.getItem(key(orderNumber))
    return raw ? (JSON.parse(raw) as OrderDraft) : null
  } catch {
    return null
  }
}
